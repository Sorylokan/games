import { HostAuthority } from "./host-authority.js";
import { MESSAGE_TYPES } from "./messages.js";
import { serializeStateForPlayer } from "./serialization.js";

export const createHostSession = (state, transport, options = {}) => {
    const authority = new HostAuthority({ state, transport, random: options.random, onStateChange: options.onStateChange });
  const unsubscribeRequest = transport.on(MESSAGE_TYPES.REQUEST_ACTION, ({ message, peerId }) => {
    authority.handleRequest(message, peerId);
  });
  const unsubscribeHello = transport.on(MESSAGE_TYPES.PLAYER_HELLO, ({ message, peerId }) => {
    authority.assignPeer(peerId, message.name, message.seatToken);
  });
  const unsubscribeLeave = transport.on(MESSAGE_TYPES.PLAYER_LEFT, ({ peerId }) => {
    authority.releasePeer(peerId);
  });

  transport.sendPublic({
    type: MESSAGE_TYPES.STATE_UPDATE,
    state: serializeStateForPlayer(authority.state, "").publicState
  });

  return {
    authority,
    dispose: () => {
      unsubscribeRequest();
      unsubscribeHello();
      unsubscribeLeave();
    }
  };
};

export const createClientSession = (transport, onState, onAssigned = () => {}) => {
  const unsubscribePublic = transport.on(MESSAGE_TYPES.STATE_UPDATE, ({ message }) => {
    onState({ publicState: message.state, privateState: null });
  });
  const unsubscribePrivate = transport.on(MESSAGE_TYPES.PRIVATE_STATE_UPDATE, ({ message }) => {
    onState({ publicState: null, privateState: message.state });
  });
  const unsubscribeAssigned = transport.on(MESSAGE_TYPES.PLAYER_ASSIGNED, ({ message }) => {
    onAssigned(message.playerId);
  });

  return {
    requestAction: (request) => transport.sendActionRequest(request),
    dispose: () => {
      unsubscribePublic();
      unsubscribePrivate();
      unsubscribeAssigned();
    }
  };
};