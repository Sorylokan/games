// Host authority (same role as in Free the Memes). Differences:
// - no game state before startMatch(): only a lobby roster;
// - dispatch() already validates turn, phase and action;
// - no public/private split: each player gets their own masked view (game/view.js).
import { createGame, startNextRound, rematch } from "../game/setup.js";
import { dispatch } from "../game/rules-engine.js";
import { viewFor } from "../game/view.js";
import { MIN_PLAYERS, MAX_PLAYERS } from "../game/game-state.js";
import { MESSAGE_TYPES, cleanName } from "./messages.js";

const rejected = (error, message) => ({
  ok: false,
  message: { type: MESSAGE_TYPES.ERROR, error, message },
});

export class HostAuthority {
  #state = null; // null until the game starts (lobby)
  #transport;
  #random;
  #roster; // [{ id, name }], the host is always roster[0]
  #peerPlayers = new Map(); // peerId -> playerId
  #seatTokens = new Map(); // seatToken -> playerId, survives disconnections
  #onStateChange;
  #onLobby;
  #nextSeat = 2;
  #settings = { maxPlayers: 4, targetScore: 100 }; // lobby settings (host only)

  constructor({ transport, random = Math.random, hostName = "Hôte", onStateChange = () => {}, onLobby = () => {} }) {
  this.#transport = transport;
  this.#random = random;
  this.#roster = [{ id: "p1", name: cleanName(hostName, "Hôte") }];
  this.#onStateChange = onStateChange;
  this.#onLobby = onLobby;
  }

  get state() {
  return this.#state;
  }

  get hostId() {
  return this.#roster[0].id;
  }

  #lobbyInfo() {
  return {
    players: this.#roster.map((p) => ({ id: p.id, name: p.name })),
    hostId: this.hostId,
    minPlayers: MIN_PLAYERS,
    seatLimit: MAX_PLAYERS,
    settings: { ...this.#settings },
  };
  }

  // Broadcasts the lobby (before the start) or one masked view per player (in game).
  // events: latest engine events, for sounds and animations.
  #broadcast(events = []) {
  if (!this.#state) {
    const lobby = this.#lobbyInfo();
    this.#transport.sendPublic({ type: MESSAGE_TYPES.LOBBY_UPDATE, lobby });
    this.#onLobby(lobby);
    return;
  }
  for (const [peerId, playerId] of this.#peerPlayers.entries()) {
    this.#transport.sendPrivate(peerId, {
    type: MESSAGE_TYPES.STATE_UPDATE,
    view: viewFor(this.#state, playerId),
    events,
    });
  }
  // The host gets a masked view too: one format for the UI, no hidden cards in the console.
  this.#onStateChange(viewFor(this.#state, this.hostId), events);
  }

  broadcast() {
  this.#broadcast();
  }

  #refuse(peerId, reason) {
  this.#transport.sendPrivate(peerId, { type: MESSAGE_TYPES.ROOM_REFUSED, reason });
  return null;
  }

  assignPeer(peerId, name, seatToken = null) {
  if (!peerId) return null;
  const existing = this.#peerPlayers.get(peerId);
  if (existing) return existing;

  // Reconnection: a known seat token takes its seat back, whatever the new peerId.
  const returningId = seatToken ? this.#seatTokens.get(seatToken) : null;
  if (returningId && ![...this.#peerPlayers.values()].includes(returningId)) {
    const returning = this.#roster.find((p) => p.id === returningId);
    if (returning) {
    this.#peerPlayers.set(peerId, returningId);
    returning.name = cleanName(name, returning.name);
    this.#transport.sendPrivate(peerId, { type: MESSAGE_TYPES.PLAYER_ASSIGNED, playerId: returningId, seatToken });
    this.#broadcast();
    return returningId;
    }
  }

  if (this.#state) return this.#refuse(peerId, "started");
  if (this.#roster.length >= this.#settings.maxPlayers) return this.#refuse(peerId, "full");

  const player = { id: "p" + this.#nextSeat++, name: cleanName(name) };
  this.#roster.push(player);
  this.#peerPlayers.set(peerId, player.id);
  if (seatToken) this.#seatTokens.set(seatToken, player.id);
  this.#transport.sendPrivate(peerId, { type: MESSAGE_TYPES.PLAYER_ASSIGNED, playerId: player.id, seatToken });
  this.#broadcast();
  return player.id;
  }

  // A peer left. In the lobby: remove it and forget its token. In game: keep both so it can come back.
  releasePeer(peerId) {
  const playerId = this.#peerPlayers.get(peerId);
  this.#peerPlayers.delete(peerId);
  if (!this.#state && playerId) {
    this.#roster = this.#roster.filter((p) => p.id !== playerId);
    for (const [token, id] of this.#seatTokens) {
    if (id === playerId) this.#seatTokens.delete(token);
    }
    this.#broadcast();
  }
  }

  // Lobby settings (before the start only). Seats can't go below the players already there.
  setSettings({ maxPlayers, targetScore } = {}) {
  if (this.#state) return;
  if (Number.isInteger(maxPlayers) && maxPlayers <= MAX_PLAYERS &&
      maxPlayers >= Math.max(MIN_PLAYERS, this.#roster.length)) {
    this.#settings.maxPlayers = maxPlayers;
  }
  if ([50, 100, 150, 200].includes(targetScore)) this.#settings.targetScore = targetScore;
  this.#broadcast();
  }

  startMatch() {
  if (this.#state) return rejected("PARTIE_DEJA_LANCEE", "La partie a déjà commencé.");
  if (this.#roster.length < MIN_PLAYERS) {
    return rejected("PAS_ASSEZ_DE_JOUEURS", `Il faut au moins ${MIN_PLAYERS} joueurs.`);
  }
  this.#state = createGame({ players: this.#roster, targetScore: this.#settings.targetScore, rng: this.#random });
  this.#broadcast();
  return { ok: true, state: this.#state };
  }

  handleRequest(request, peerId = null) {
  if (request?.type !== MESSAGE_TYPES.REQUEST_ACTION) {
    return rejected("MESSAGE_INVALIDE", "Une demande d'action était attendue.");
  }
  if (!this.#state) return rejected("PARTIE_NON_LANCEE", "La partie n'a pas commencé.");

  const player = this.#state.players.find((p) => p.id === request.playerId);
  if (!player) return rejected("JOUEUR_INCONNU", "Ce joueur n'existe pas.");
  if (peerId && this.#peerPlayers.get(peerId) !== request.playerId) {
    return rejected("JOUEUR_NON_ASSIGNE", "Ce pair n'est pas assigné à ce siège.");
  }

  const action = request.action ?? {};
  // Only the host starts the next round or a rematch.
  if (action.type === "startNextRound" || action.type === "rematch") {
    if (request.playerId !== this.hostId) return rejected("RESERVE_A_L_HOTE", "Seul l'hôte relance la partie.");
    const next = action.type === "rematch"
      ? rematch(this.#state, this.#random)
      : startNextRound(this.#state, this.#random);
    if (!next.ok) return rejected("RELANCE_IMPOSSIBLE", next.error);
    this.#state = next.state;
    this.#broadcast(next.events);
    return { ok: true, state: this.#state };
  }

  // dispatch validates everything; a refused action returns { ok: false } and isn't broadcast.
  const result = dispatch(this.#state, request.playerId, action, this.#random);
  if (!result.ok) return rejected("ACTION_REFUSEE", result.error);

  this.#state = result.state;
  this.#broadcast(result.events);
  return { ok: true, state: this.#state };
  }
}
