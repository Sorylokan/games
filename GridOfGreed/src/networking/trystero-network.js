// Trystero/WebRTC transport (same as Free the Memes, own appId), loaded from the esm.sh CDN.
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
    throw new Error("Un identifiant de salle est requis.");
  }

  this.disconnect();
  this.#roomId = roomId;
  this.#room = joinRoom({ appId: "grid-of-greed" }, roomId);
  const messageAction = this.#room.makeAction("message");
  const privateMessageAction = this.#room.makeAction("private-message");
  this.#sendMessage = messageAction.send.bind(messageAction);
  this.#sendPrivateMessage = privateMessageAction.send.bind(privateMessageAction);

  messageAction.onMessage = (message, { peerId }) => {
    this.emit(message?.type ?? MESSAGE_TYPES.STATE_UPDATE, { message, peerId });
  };
  privateMessageAction.onMessage = (message, { peerId }) => {
    this.emit(message?.type ?? MESSAGE_TYPES.STATE_UPDATE, { message, peerId });
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
    throw new Error("Le réseau n'est pas connecté.");
  }

  this.#sendMessage(message);
  }

  sendPrivate(peerId, message) {
  if (!this.#sendPrivateMessage) {
    throw new Error("Le réseau n'est pas connecté.");
  }

  this.#sendPrivateMessage(message, { target: peerId });
  }

  sendActionRequest(request) {
  this.sendPublic(request);
  }

  // seatToken: stable local id per room, to recognize a player coming back with a new peerId.
  sendHello(name, seatToken) {
  this.sendPublic({ type: MESSAGE_TYPES.PLAYER_HELLO, name, seatToken });
  }
}
