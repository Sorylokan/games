// Sessions hôte / client (rôle identique à game-session.js de FTM).
import { HostAuthority } from "./host-authority.js";
import { MESSAGE_TYPES } from "./messages.js";

export const createHostSession = (transport, options = {}) => {
  const authority = new HostAuthority({
  transport,
  random: options.random,
  hostName: options.hostName,
  onStateChange: options.onStateChange,
  onLobby: options.onLobby,
  });

  const unsubscribeRequest = transport.on(MESSAGE_TYPES.REQUEST_ACTION, ({ message, peerId }) => {
  authority.handleRequest(message, peerId);
  });
  const unsubscribeHello = transport.on(MESSAGE_TYPES.PLAYER_HELLO, ({ message, peerId }) => {
  authority.assignPeer(peerId, message.name, message.seatToken);
  });
  const unsubscribeLeave = transport.on(MESSAGE_TYPES.PLAYER_LEFT, ({ peerId }) => {
  authority.releasePeer(peerId);
  });

  // Annonce le salon aux pairs déjà connectés.
  authority.broadcast();

  return {
  authority,
  dispose: () => {
    unsubscribeRequest();
    unsubscribeHello();
    unsubscribeLeave();
  },
  };
};

export const createClientSession = (transport, { onView = () => {}, onLobby = () => {}, onAssigned = () => {}, onRefused = () => {} } = {}) => {
  const unsubscribeView = transport.on(MESSAGE_TYPES.STATE_UPDATE, ({ message }) => {
  onView(message.view, message.events ?? []);
  });
  const unsubscribeLobby = transport.on(MESSAGE_TYPES.LOBBY_UPDATE, ({ message }) => {
  onLobby(message.lobby);
  });
  const unsubscribeAssigned = transport.on(MESSAGE_TYPES.PLAYER_ASSIGNED, ({ message }) => {
  onAssigned(message.playerId, message.seatToken);
  });
  const unsubscribeRefused = transport.on(MESSAGE_TYPES.ROOM_REFUSED, ({ message }) => {
  onRefused(message.reason);
  });

  return {
  requestAction: (request) => transport.sendActionRequest(request),
  dispose: () => {
    unsubscribeView();
    unsubscribeLobby();
    unsubscribeAssigned();
    unsubscribeRefused();
  },
  };
};
