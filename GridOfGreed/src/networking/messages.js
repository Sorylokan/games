// Network message types (same role as in Free the Memes).
export const MESSAGE_TYPES = Object.freeze({
  REQUEST_ACTION: "REQUEST_ACTION",
  STATE_UPDATE: "STATE_UPDATE",     // personal masked view (viewFor)
  LOBBY_UPDATE: "LOBBY_UPDATE",     // lobby before the start (no game state yet)
  PLAYER_JOINED: "PLAYER_JOINED",
  PLAYER_LEFT: "PLAYER_LEFT",
  PLAYER_HELLO: "PLAYER_HELLO",
  PLAYER_ASSIGNED: "PLAYER_ASSIGNED",
  ROOM_REFUSED: "ROOM_REFUSED",
  ERROR: "ERROR",
});

// The action is the raw engine object ({ type: 'drawPile' }, { type: 'swap', col, row }…); dispatch validates it.
export const createActionRequest = (playerId, action) => ({
  type: MESSAGE_TYPES.REQUEST_ACTION,
  playerId,
  action,
});

export const cleanName = (name, fallback = "Joueur") =>
  String(name ?? "").replace(/[<>&"'`]/g, "").trim().slice(0, 24) || fallback;
