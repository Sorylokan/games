import { getAdjacentAreaIds } from "../movement.js";
import { dealDamage } from "./rules-engine.js";

const ok = (state, result = {}) => ({ ok: true, state, ...result });
const failure = (state, error, message) => ({ ok: false, state, error, message });

export const ABILITY_BY_CHARACTER = Object.freeze({
  "parkour-guy": "parkour-move",
  "death-note": "death-note-strike",
  hadouken: "hadouken-strike"
});

const ABILITY_DICE = Object.freeze({
  "death-note-strike": 6,
  "hadouken-strike": 4
});

const addPendingAction = (state, pendingAction) => ({
  ...state,
  pendingActions: [...state.pendingActions, pendingAction]
});

const ONCE_PER_GAME = new Set(["death-note-strike", "hadouken-strike"]);

const getPlayer = (state, playerId) => state.players[playerId];

export const requestAbility = (state, playerId, choice = {}) => {
  const player = getPlayer(state, playerId);

  if (!player) {
    return failure(state, "UNKNOWN_PLAYER", "The player does not exist.");
  }

  if (!player.alive) {
    return failure(state, "PLAYER_DEAD", "A dead player cannot use an ability.");
  }

  const abilityId = ABILITY_BY_CHARACTER[player.characterId];
  if (!abilityId) {
    return failure(state, "NO_ACTIVE_ABILITY", "This character has no ability in this activation group.");
  }

  if (player.abilityState[abilityId]) {
    return failure(state, "ABILITY_ALREADY_USED", "This ability has already been used.");
  }

  const pendingAction = {
    type: "ACTIVATE_ABILITY",
    abilityId,
    playerId,
    choice,
    requiresRevealConfirmation: !player.revealed
  };

  return ok(addPendingAction(state, pendingAction), { pendingAction });
};

export const resolveAbility = (state, pendingAction, choice = {}, { rollDie } = {}) => {
  if (!state.pendingActions.includes(pendingAction) || pendingAction.type !== "ACTIVATE_ABILITY") {
    return failure(state, "UNKNOWN_PENDING_ACTION", "This ability activation is no longer active.");
  }

  if (choice.cancel === true) {
    return ok({ ...state, pendingActions: state.pendingActions.filter((a) => a !== pendingAction) });
  }

  const player = getPlayer(state, pendingAction.playerId);
  if (!player || !player.alive) {
    return failure(state, "PLAYER_DEAD", "The ability owner is no longer alive.");
  }

  if (pendingAction.requiresRevealConfirmation && choice.confirmReveal !== true) {
    return failure(state, "REVEAL_CONFIRMATION_REQUIRED", "Confirm the public identity reveal before using this ability.");
  }

  let nextState = {
    ...state,
    pendingActions: state.pendingActions.filter((action) => action !== pendingAction),
    players: {
      ...state.players,
      [player.id]: {
        ...player,
        revealed: true,
        abilityState: ONCE_PER_GAME.has(pendingAction.abilityId)
          ? { ...player.abilityState, [pendingAction.abilityId]: true }
          : player.abilityState
      }
    },
    events: [...state.events, {
      type: "ABILITY_USED",
      playerId: player.id,
      abilityId: pendingAction.abilityId
    }, ...(player.revealed ? [] : [{
      type: "CHARACTER_REVEALED",
      playerId: player.id,
      reason: "ABILITY_ACTIVATED"
    }])]
  };

  if (pendingAction.abilityId === "parkour-move") {
    const destinations = player.areaId ? getAdjacentAreaIds(nextState.board, player.areaId) : Object.values(nextState.board.areaAtPosition);
    if (!destinations.includes(choice.areaId)) {
      return failure(state, "INVALID_DESTINATION", "Parkour Guy must move to an adjacent Area.");
    }

    nextState = {
      ...nextState,
      players: {
        ...nextState.players,
        [player.id]: { ...nextState.players[player.id], areaId: choice.areaId }
      },
      events: [...nextState.events, {
        type: "PLAYER_MOVED",
        playerId: player.id,
        areaId: choice.areaId,
        reason: "ABILITY"
      }]
    };
    return ok(nextState);
  }

  if (pendingAction.abilityId === "death-note-strike" || pendingAction.abilityId === "hadouken-strike") {
    const target = getPlayer(nextState, choice.targetId);
    if (!target || !target.alive) {
      return failure(state, "INVALID_TARGET", "Choose a living target.");
    }

    const sides = ABILITY_DICE[pendingAction.abilityId];
    const amount = (rollDie ?? ((dieSides) => Math.floor(Math.random() * dieSides) + 1))(sides);
    // Evenement de jet dedie : permet a l'UI d'animer l'odometre (d6 Death Note /
    // d4 Hadouken) avant de reveler les degats, comme pour les attaques normales.
    nextState = {
      ...nextState,
      events: [...nextState.events, {
        type: "ABILITY_ROLLED",
        playerId: player.id,
        abilityId: pendingAction.abilityId,
        sides,
        value: amount
      }]
    };
    const result = dealDamage(nextState, target.id, amount, {
      source: player.id,
      sourceType: "ability"
    });

    return ok({
      ...result.state,
      events: [...result.state.events, {
        type: "ABILITY_DAMAGE_RESOLVED",
        playerId: player.id,
        targetId: target.id,
        abilityId: pendingAction.abilityId,
        amount
      }]
    }, { amount });
  }

  return failure(state, "UNSUPPORTED_ABILITY", "This ability is not registered.");
};
