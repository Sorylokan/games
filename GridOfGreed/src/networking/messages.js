// Types de messages échangés sur le réseau (rôle identique à messages.js de FTM).
export const MESSAGE_TYPES = Object.freeze({
  REQUEST_ACTION: "REQUEST_ACTION",
  STATE_UPDATE: "STATE_UPDATE",     // vue masquée personnelle (viewFor)
  LOBBY_UPDATE: "LOBBY_UPDATE",     // salon avant le départ (pas encore d'état de jeu)
  PLAYER_JOINED: "PLAYER_JOINED",
  PLAYER_LEFT: "PLAYER_LEFT",
  PLAYER_HELLO: "PLAYER_HELLO",
  PLAYER_ASSIGNED: "PLAYER_ASSIGNED",
  ROOM_REFUSED: "ROOM_REFUSED",
  ERROR: "ERROR",
});

// Contrairement à FTM, l'action est l'objet brut du moteur GoG
// ({ type:'drawPile' }, { type:'swap', col, row }...) : dispatch valide tout.
export const createActionRequest = (playerId, action) => ({
  type: MESSAGE_TYPES.REQUEST_ACTION,
  playerId,
  action,
});

export const cleanName = (name, fallback = "Joueur") =>
  String(name ?? "").replace(/[<>&"'`]/g, "").trim().slice(0, 24) || fallback;
