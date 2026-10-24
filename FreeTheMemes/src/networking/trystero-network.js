import { joinRoom } from "https://esm.sh/trystero@0.25.4/nostr";
import { NetworkAdapter } from "./network-adapter.js";
import { MESSAGE_TYPES } from "./messages.js";

export class TrysteroNetwork extends NetworkAdapter {
  #room = null;
  #roomId = null;
  #sendMessage = null;
  #sendPrivateMessage = null;

  async connect(roomId) {
    if (!roomId || typeof roomId !== "string") {
      throw new Error("A room ID is required.");
    }

    this.disconnect();
    this.#roomId = roomId;
    this.#room = joinRoom({ appId: "free-the-memes" }, roomId);
    const messageAction = this.#room.makeAction("message");
    const privateMessageAction = this.#room.makeAction("private-message");
    this.#sendMessage = messageAction.send.bind(messageAction);
    this.#sendPrivateMessage = privateMessageAction.send.bind(privateMessageAction);

    messageAction.onMessage = (message, { peerId }) => {
      this.emit(message?.type ?? MESSAGE_TYPES.STATE_UPDATE, { message, peerId });
    };
    privateMessageAction.onMessage = (message, { peerId }) => {
      this.emit(message?.type ?? MESSAGE_TYPES.PRIVATE_STATE_UPDATE, { message, peerId });
    };

    this.#room.onPeerJoin = (peerId) => this.emit(MESSAGE_TYPES.PLAYER_JOINED, { peerId });
    this.#room.onPeerLeave = (peerId) => this.emit(MESSAGE_TYPES.PLAYER_LEFT, { peerId });
    this.emit("connected", { roomId });

    return { roomId };
  }

  disconnect() {
    this.#room?.leave();
    this.#room = null;
    this.#roomId = null;
    this.#sendMessage = null;
    this.#sendPrivateMessage = null;
  }

  sendPublic(message) {
    if (!this.#sendMessage) {
      throw new Error("The network is not connected.");
    }

    this.#sendMessage(message);
  }

  sendPrivate(peerId, message) {
    if (!this.#sendPrivateMessage) {
      throw new Error("The network is not connected.");
    }

    this.#sendPrivateMessage(message, { target: peerId });
  }

  sendActionRequest(request) {
    this.sendPublic(request);
  }

  // seatToken : identifiant local stable par salle, pour reconnaitre un joueur
  // qui revient avec un nouveau peerId apres une coupure ou un rechargement.
  sendHello(name, seatToken) {
    this.sendPublic({ type: MESSAGE_TYPES.PLAYER_HELLO, name, seatToken });
  }
}
