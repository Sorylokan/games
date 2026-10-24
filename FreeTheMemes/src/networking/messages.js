export const MESSAGE_TYPES = Object.freeze({
  REQUEST_ACTION: "REQUEST_ACTION",
  STATE_UPDATE: "STATE_UPDATE",
  PRIVATE_STATE_UPDATE: "PRIVATE_STATE_UPDATE",
  PLAYER_JOINED: "PLAYER_JOINED",
  PLAYER_LEFT: "PLAYER_LEFT",
  GAME_STARTED: "GAME_STARTED",
  GAME_ENDED: "GAME_ENDED",
  ERROR: "ERROR",
  PLAYER_HELLO: "PLAYER_HELLO",
  PLAYER_ASSIGNED: "PLAYER_ASSIGNED",
  ROOM_REFUSED: "ROOM_REFUSED"
});

export const createActionRequest = (playerId, action, payload = {}) => ({
  type: MESSAGE_TYPES.REQUEST_ACTION,
  playerId,
  action,
  payload
});

export const cleanName = (name, fallback = "Player") =>
  String(name ?? "").replace(/[<>&"'`]/g, "").trim().slice(0, 24) || fallback;