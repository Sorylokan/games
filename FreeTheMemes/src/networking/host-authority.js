import { serializeStateForPlayer } from "./serialization.js";
import { areaAttack, attack, mustAttack, resolveCombatPendingAction } from "../game/combat.js";
import { resolveMovementAction, resolveMovementDestination, resolveMovementRollChoice } from "../movement.js";
import { completeAreaAction, completeAttack, completeMovement, beginTurn, endTurn, startGame } from "../game/turn-manager.js";
import { createLocalGame } from "../game/setup.js";
import { GAME_PHASES } from "../game/game-state.js";
import { resolveEquipmentReward } from "../game/rules-engine.js";
import { resolveAreaAction, resolveAreaPendingAction } from "../game/areas.js";
import { resolvePendingAction } from "../game/cards.js";
import { MESSAGE_TYPES, cleanName } from "./messages.js";
import { requestAbility, resolveAbility, ABILITY_BY_CHARACTER } from "../game/abilities.js";

const ACTIONS = Object.freeze({
  BEGIN_TURN: "BEGIN_TURN",
  MOVE: "MOVE",
  CHOOSE_MOVEMENT_DESTINATION: "CHOOSE_MOVEMENT_DESTINATION",
  CHOOSE_MOVEMENT_ROLL: "CHOOSE_MOVEMENT_ROLL",
  RESOLVE_AREA_ACTION: "RESOLVE_AREA_ACTION",
  RESOLVE_PENDING_ACTION: "RESOLVE_PENDING_ACTION",
  COMPLETE_AREA_ACTION: "COMPLETE_AREA_ACTION",
  ATTACK: "ATTACK",
  COMPLETE_ATTACK: "COMPLETE_ATTACK",
  RESOLVE_COMBAT_REACTION: "RESOLVE_COMBAT_REACTION",
  CHOOSE_EQUIPMENT_REWARD: "CHOOSE_EQUIPMENT_REWARD",
  END_TURN: "END_TURN",
  USE_ABILITY: "USE_ABILITY",
});

const MIN_SEATS = 4;
const MAX_SEATS = 8;

const rejected = (state, error, message) => ({
  ok: false,
  state,
  message: {
    type: MESSAGE_TYPES.ERROR,
    error,
    message
  }
});

export class HostAuthority {
  #state;
  #transport;
  #random;
  #peerPlayers = new Map();
  #seatTokens = new Map();   // seatToken -> playerId : survit aux coupures de connexion
  #seatLimit = MIN_SEATS;
  #onStateChange;

  constructor({ state, transport, random = Math.random, onStateChange = () => {} }) {
    this.#state = state;
    this.#transport = transport;
    this.#random = random;
    this.#onStateChange = onStateChange;
    this.#syncLobby();
  }

  get state() {
    return this.#state;
  }

  replaceState(state) {
    this.#state = state;
    this.#syncLobby();
    this.#broadcast();
  }

  broadcast() {
    this.#broadcast();
  }

    get seatLimit() {
    return this.#seatLimit;
  }

  // Sièges occupés : l'hôte (premier siège) + les pairs connectés, dans l'ordre des sièges.
  #occupiedIds() {
    const taken = new Set(this.#peerPlayers.values());
    taken.add(this.#state.turnOrder[0]);
    return Object.keys(this.#state.players).filter((id) => taken.has(id));
  }

  // Place dans l'état public l'info du salon (places max + sièges occupés).
  #syncLobby() {
    if (this.#state.phase !== GAME_PHASES.SETUP) return;
    this.#state = {
      ...this.#state,
      lobby: { seatLimit: this.#seatLimit, occupied: this.#occupiedIds() }
    };
  }

  setSeatLimit(value) {
    const occupied = this.#occupiedIds().length;
    this.#seatLimit = Math.min(MAX_SEATS, Math.max(MIN_SEATS, occupied, Number(value) || MIN_SEATS));
    this.#syncLobby();
    this.#broadcast();
  }

  #refuse(peerId, reason) {
    this.#transport.sendPrivate(peerId, { type: MESSAGE_TYPES.ROOM_REFUSED, reason });
    return null;
  }

  // Distribue les personnages avec les joueurs réellement présents, puis démarre.
  startMatch() {
    if (this.#state.phase !== GAME_PHASES.SETUP) {
      return { ok: false, state: this.#state, error: "GAME_ALREADY_STARTED", message: "The game has already started." };
    }
    const seats = this.#occupiedIds().map((id) => ({ id, name: this.#state.players[id].name }));
    if (seats.length < MIN_SEATS || seats.length > MAX_SEATS) {
      return { ok: false, state: this.#state, error: "PLAYER_COUNT", message: "Free the Memes needs 4 to 8 players." };
    }
    const started = startGame(createLocalGame(seats, { random: this.#random, startingPlayerIndex: 0 }));
    if (!started.ok) return started;
    this.#state = started.state;
    this.#broadcast();
    return started;
  }

  assignPeer(peerId, name, seatToken = null) {
    if (!peerId) return null;
    const existingPlayerId = this.#peerPlayers.get(peerId);
    if (existingPlayerId) return existingPlayerId;

    // Reconnexion : un jeton de siege connu reprend son ancienne place, peu
    // importe le nouveau peerId attribue par la couche WebRTC.
    const returningPlayerId = seatToken ? this.#seatTokens.get(seatToken) : null;
    const returningPlayer = returningPlayerId ? this.#state.players[returningPlayerId] : null;
    const returningAssigned = returningPlayerId && [...this.#peerPlayers.values()].includes(returningPlayerId);
    if (returningPlayer && !returningAssigned) {
      this.#peerPlayers.set(peerId, returningPlayerId);
      this.#state = {
        ...this.#state,
        players: {
          ...this.#state.players,
          [returningPlayerId]: { ...returningPlayer, name: cleanName(name, returningPlayer.name) }
        }
      };
      this.#transport.sendPrivate(peerId, {
        type: MESSAGE_TYPES.PLAYER_ASSIGNED,
        playerId: returningPlayerId,
        seatToken
      });
      this.#syncLobby();
      this.#broadcast();
      return returningPlayerId;
    }

    if (this.#state.phase !== GAME_PHASES.SETUP) return this.#refuse(peerId, "started");
    if (this.#occupiedIds().length >= this.#seatLimit) return this.#refuse(peerId, "full");
    const assignedIds = new Set(this.#peerPlayers.values());
    const player = Object.values(this.#state.players).find((candidate) => (
      candidate.id !== this.#state.turnOrder[0] && !assignedIds.has(candidate.id)
    ));
    if (!player) return null;

    this.#peerPlayers.set(peerId, player.id);
    if (seatToken) this.#seatTokens.set(seatToken, player.id);
    this.#state = {
      ...this.#state,
      players: {
        ...this.#state.players,
        [player.id]: { ...player, name: cleanName(name, player.name) }
      }
    };
    this.#transport.sendPrivate(peerId, {
      type: MESSAGE_TYPES.PLAYER_ASSIGNED,
      playerId: player.id,
      seatToken
    });
    this.#syncLobby();
    this.#broadcast();
    return player.id;
  }

  // Le pair part (coupure, onglet ferme) : on oublie le lien peerId -> joueur
  // pour qu'il puisse le reprendre avec son jeton, mais on garde #seatTokens.
  releasePeer(peerId) {
    this.#peerPlayers.delete(peerId);
    if (this.#state.phase === GAME_PHASES.SETUP) {
      this.#syncLobby();
      this.#broadcast();
    }
  }

  handleRequest(request, peerId = null) {
    if (request?.type !== MESSAGE_TYPES.REQUEST_ACTION) {
      return rejected(this.#state, "INVALID_MESSAGE", "Expected an action request.");
    }

    const player = this.#state.players[request.playerId];
    if (!player) {
      return rejected(this.#state, "UNKNOWN_PLAYER", "The requesting player does not exist.");
    }

    if (peerId && this.#peerPlayers.get(peerId) !== request.playerId) {
      return rejected(this.#state, "PLAYER_ASSIGNMENT_MISMATCH", "This peer is not assigned to that player slot.");
    }

    // Pending combat reactions (e.g. Doge, Surprise MF) belong to their reaction owner,
    // who is not necessarily the active player - only gate on active-player for everything else.
    const pendingReaction = this.#state.pendingActions[0];
    const isOwnPendingReaction = ([ACTIONS.RESOLVE_COMBAT_REACTION, ACTIONS.CHOOSE_EQUIPMENT_REWARD, ACTIONS.RESOLVE_PENDING_ACTION].includes(request.action)) &&
      pendingReaction?.playerId === request.playerId;

    if (!isOwnPendingReaction && request.playerId !== this.#state.currentPlayerId) {
      return rejected(this.#state, "NOT_CURRENT_PLAYER", "Only the active player can request this action.");
    }

    const result = this.#skipDeadTurn(this.#resolve(request.action, request.payload ?? {}, request.playerId));
    if (!result.ok) {
      return rejected(this.#state, result.error, result.message);
    }

    this.#state = result.state;
    this.#broadcast();
    return { ok: true, state: this.#state };
  }

  // A move/attack that didn't spawn a pending reaction must auto-advance the phase,
  // otherwise the requester is stuck resending the same action forever.
  #finishMovement(result, playerId) {
    if (!result.ok || result.reroll || result.pendingAction) return result;
    return completeMovement(result.state, playerId);
  }

  #finishAttack(result, playerId) {
    if (!result.ok || result.pendingAction || result.state.pendingActions.length > 0) return result;
    // Si l'attaque a terminé la partie (ou changé de phase), il n'y a plus rien à clore.
    if (result.state.gameOver || result.state.phase !== GAME_PHASES.ATTACK) return result;
    return completeAttack(result.state, playerId);
  }

  #finishAreaAction(result, playerId) {
    if (!result.ok || result.state.pendingActions.length > 0 || result.state.phase !== GAME_PHASES.AREA_ACTION) return result;
    if (!result.state.players[playerId]?.alive) return result;
    return completeAreaAction(result.state, playerId);
  }

  // Reactions may belong to a player other than the active one (Doge, Surprise MF...),
  // so completion is always attributed to whoever is active once the chain settles.
  #finishReaction(result) {
    if (!result.ok || result.state.gameOver || result.state.pendingActions.length > 0 || result.state.phase !== GAME_PHASES.ATTACK) {
      return result;
    }
    return completeAttack(result.state, result.state.currentPlayerId);
  }

  // Le joueur actif est mort en cours de tour : ses phases suivantes sont impossibles
  // (completeAreaAction refuse un joueur mort). On passe directement au tour suivant.
  #skipDeadTurn(result) {
    if (!result.ok || result.state.gameOver || result.state.pendingActions.length > 0) return result;
    const s = result.state;
    const dead = s.currentPlayerId && !s.players[s.currentPlayerId]?.alive;
    if (!dead || s.phase === GAME_PHASES.START_TURN || s.phase === GAME_PHASES.GAME_OVER) return result;
    return endTurn({ ...s, phase: GAME_PHASES.END_TURN }, s.currentPlayerId);
  }

  #resolve(action, payload, playerId) {
    const rollDie = (sides) => Math.floor(this.#random() * sides) + 1;

    switch (action) {
      case ACTIONS.BEGIN_TURN:
        return beginTurn(this.#state, playerId);
      case ACTIONS.MOVE: {
        let base = this.#state;
        if (base.phase === GAME_PHASES.START_TURN) {
          const begun = beginTurn(base, playerId);
          if (!begun.ok) return begun;
          base = begun.state;
        }
        return this.#finishMovement(resolveMovementAction(base, playerId, { ...payload, rollDie }), playerId);
      }
      case ACTIONS.USE_ABILITY: {
        if (this.#state.gameOver || this.#state.pendingActions.length > 0) {
          return { ok: false, state: this.#state, error: "INVALID_STATE", message: "Resolve the pending action first." };
        }
        const abilityId = ABILITY_BY_CHARACTER[this.#state.players[playerId]?.characterId];
        let base = this.#state;
        if (abilityId === "parkour-move") {
          if (![GAME_PHASES.START_TURN, GAME_PHASES.MOVEMENT].includes(base.phase)) {
            return { ok: false, state: base, error: "INVALID_PHASE", message: "Parkour only replaces your movement." };
          }
          if (base.phase === GAME_PHASES.START_TURN) {
            const begun = beginTurn(base, playerId);
            if (!begun.ok) return begun;
            base = begun.state;
          }
        } else if (base.phase === GAME_PHASES.START_TURN) {
          return { ok: false, state: base, error: "INVALID_PHASE", message: "Start your turn first." };
        }
        return requestAbility(base, playerId, {});
      }
      case ACTIONS.CHOOSE_MOVEMENT_DESTINATION:
        return this.#finishMovement(resolveMovementDestination(this.#state, this.#state.pendingActions[0], payload.areaId), playerId);
      case ACTIONS.CHOOSE_MOVEMENT_ROLL:
        return this.#finishMovement(resolveMovementRollChoice(this.#state, this.#state.pendingActions[0], payload.rollIndex), playerId);
      case ACTIONS.RESOLVE_AREA_ACTION:
        if (this.#state.phase !== GAME_PHASES.AREA_ACTION) {
          return { ok: false, state: this.#state, error: "INVALID_PHASE", message: "Area actions can only be resolved during the area-action phase." };
        }
        return this.#finishAreaAction(resolveAreaAction(this.#state, playerId, this.#state.players[playerId]?.areaId), playerId);
      case ACTIONS.RESOLVE_PENDING_ACTION: {
        const pendingAction = this.#state.pendingActions[0];
        if (pendingAction?.type === "ACTIVATE_ABILITY") {
          const result = resolveAbility(this.#state, pendingAction, payload.choice ?? {}, { rollDie });
          if (
            result.ok &&
            pendingAction.abilityId === "parkour-move" &&
            result.state.phase === GAME_PHASES.MOVEMENT &&
            result.state.pendingActions.length === 0
          ) {
            return completeMovement(result.state, this.#state.currentPlayerId);
          }
          return result;
        }
        const areaActionTypes = new Set([
          "CHOOSE_AREA_DECK", "GIVE_NOTIFICATION", "POKER_FACE_NOTIFICATION",
          "RESOLVE_DRAWN_CARD", "TOXIC_RELATIONSHIP_CHOICE", "PICKPOCKET_CHOICE"
        ]);
        const result = areaActionTypes.has(pendingAction?.type)
          ? resolveAreaPendingAction(this.#state, pendingAction, payload.choice)
          : resolvePendingAction(this.#state, pendingAction, payload.choice, { rollDie });
        return this.#finishAreaAction(result, this.#state.currentPlayerId);
      }
      case ACTIONS.COMPLETE_AREA_ACTION:
        return completeAreaAction(this.#state, playerId);
      case ACTIONS.ATTACK:
        return this.#finishAttack(
          this.#state.players[playerId].equipment.includes("pfrt-tube")
            ? areaAttack(this.#state, playerId, { rollDie })
            : attack(this.#state, playerId, payload.targetId, { rollDie }),
          playerId
        );
      case ACTIONS.COMPLETE_ATTACK:
        if (mustAttack(this.#state, playerId)) {
          return { ok: false, error: "MUST_ATTACK", message: "You must attack while you hold this equipment." };
        }
        return completeAttack(this.#state, playerId);
      case ACTIONS.RESOLVE_COMBAT_REACTION:
        return this.#finishReaction(resolveCombatPendingAction(this.#state, this.#state.pendingActions[0], payload.choice ?? {}, { rollDie }));
      case ACTIONS.CHOOSE_EQUIPMENT_REWARD: {
        const rewarded = resolveEquipmentReward(this.#state, this.#state.pendingActions[0], payload.cardId ?? null);
        return this.#state.phase === GAME_PHASES.AREA_ACTION
          ? this.#finishAreaAction(rewarded, this.#state.currentPlayerId)
          : this.#finishReaction(rewarded);
      }
      case ACTIONS.END_TURN:
        return endTurn(this.#state, playerId);
      default:
        return rejected(this.#state, "UNKNOWN_ACTION", "The requested action is not supported.");
    }
  }

  #broadcast() {
    this.#transport.sendPublic({
      type: MESSAGE_TYPES.STATE_UPDATE,
      state: serializeStateForPlayer(this.#state, "").publicState
    });

    for (const [peerId, playerId] of this.#peerPlayers.entries()) {
      this.#transport.sendPrivate(
        peerId,
        {
          type: MESSAGE_TYPES.PRIVATE_STATE_UPDATE,
          state: serializeStateForPlayer(this.#state, playerId).privateState
        }
      );
    }

    this.#onStateChange(this.#state);
  }
}

export { ACTIONS };