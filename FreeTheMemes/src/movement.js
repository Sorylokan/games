import { getAreaForDieTotal } from "./data/areas.js";
import { BOARD_POSITIONS, getAreaPosition } from "./board.js";

const withRollEvent = (state, playerId, roll) => ({
  ...state,
  events: [...state.events, { type: "MOVEMENT_ROLLED", playerId, d6: roll.d6, d4: roll.d4, total: roll.total }]
});

export const rollMovementDice = (rollDie = (sides) => Math.floor(Math.random() * sides) + 1) => {
  const d6 = rollDie(6);
  const d4 = rollDie(4);

  return { d6, d4, total: d6 + d4 };
};

export const resolveMovementRoll = (total, currentAreaId) => {
  if (!Number.isInteger(total) || total < 2 || total > 10) {
    return { ok: false, error: "INVALID_MOVEMENT_TOTAL" };
  }

  if (total === 7) {
    return { ok: true, requiresDestination: true, areaId: null };
  }

  const areaId = getAreaForDieTotal(total);

  if (areaId === currentAreaId) {
    return { ok: true, reroll: true, areaId: null };
  }

  return { ok: true, requiresDestination: false, areaId };
};

export const getAdjacentAreaIds = (board, currentAreaId) => {
  const currentPosition = getAreaPosition(board, currentAreaId);

  if (!currentPosition) {
    return [];
  }

  return board.adjacentPositions[currentPosition]
    .map((position) => board.areaAtPosition[position])
    .filter(Boolean);
};

export const isValidMovementDestination = (board, areaId) => (
  BOARD_POSITIONS.some((position) => board.areaAtPosition[position] === areaId)
);

export const resolveMovementAction = (
  state,
  playerId,
  { rollDie, destinationAreaId } = {}
) => {
  const player = state.players[playerId];

  if (state.phase !== "movement") {
    return { ok: false, state, error: "INVALID_PHASE" };
  }

  if (!player || !player.alive || state.currentPlayerId !== playerId) {
    return { ok: false, state, error: "INVALID_PLAYER" };
  }

  const firstRoll = rollMovementDice(rollDie);
  if (player.equipment.includes("google-maps-medieval-edition") && destinationAreaId === undefined) {
    const secondRoll = rollMovementDice(rollDie);
    const pendingAction = {
      type: "CHOOSE_MOVEMENT_ROLL",
      playerId,
      rolls: [firstRoll, secondRoll]
    };

    return {
      ok: true,
      state: {
        ...state,
        pendingActions: [...state.pendingActions, pendingAction]
      },
      pendingAction
    };
  }

    const roll = firstRoll;
  const resolution = resolveMovementRoll(roll.total, player.areaId);

  if (!resolution.ok) {
    return { ok: false, state, error: resolution.error };
  }

  const rolled = withRollEvent(state, playerId, roll);

  if (resolution.reroll) {
    return { ok: true, state: rolled, roll, reroll: true };
  }

  if (resolution.requiresDestination) {
    if (destinationAreaId === undefined) {
      const pendingAction = {
        type: "CHOOSE_MOVEMENT_DESTINATION",
        playerId,
        excludedAreaId: player.areaId
      };

      return {
        ok: true,
        state: { ...rolled, pendingActions: [...rolled.pendingActions, pendingAction] },
        roll,
        pendingAction
      };
    }

    if (!isValidMovementDestination(state.board, destinationAreaId) || destinationAreaId === player.areaId) {
      return { ok: false, state, error: "INVALID_DESTINATION" };
    }
  }

  const areaId = resolution.requiresDestination ? destinationAreaId : resolution.areaId;
  const nextState = {
    ...rolled,
    players: { ...rolled.players, [playerId]: { ...player, areaId } },
    events: [...rolled.events, {
      type: "PLAYER_MOVED",
      playerId,
      areaId,
      d6: roll.d6,
      d4: roll.d4,
      total: roll.total
    }]
  };

  return { ok: true, state: nextState, roll, areaId };
};

export const resolveMovementDestination = (state, pendingAction, areaId) => {
  if (!state.pendingActions.includes(pendingAction) || pendingAction.type !== "CHOOSE_MOVEMENT_DESTINATION") {
    return { ok: false, state, error: "UNKNOWN_PENDING_ACTION" };
  }

  const player = state.players[pendingAction.playerId];
  if (!player || !isValidMovementDestination(state.board, areaId) || areaId === pendingAction.excludedAreaId) {
    return { ok: false, state, error: "INVALID_DESTINATION" };
  }

  return {
    ok: true,
    state: {
      ...state,
      players: {
        ...state.players,
        [player.id]: { ...player, areaId }
      },
      pendingActions: state.pendingActions.filter((action) => action !== pendingAction),
      events: [...state.events, { type: "PLAYER_MOVED", playerId: player.id, areaId, total: 7 }]
    },
    areaId
  };
};

export const resolveMovementRollChoice = (state, pendingAction, rollIndex) => {
  if (!state.pendingActions.includes(pendingAction) || pendingAction.type !== "CHOOSE_MOVEMENT_ROLL") {
    return { ok: false, state, error: "UNKNOWN_PENDING_ACTION" };
  }

  if (!Number.isInteger(rollIndex) || !pendingAction.rolls[rollIndex]) {
    return { ok: false, state, error: "INVALID_CHOICE" };
  }

  const player = state.players[pendingAction.playerId];
  const roll = pendingAction.rolls[rollIndex];
  const resolution = resolveMovementRoll(roll.total, player.areaId);
  const baseState = withRollEvent({
    ...state,
    pendingActions: state.pendingActions.filter((action) => action !== pendingAction)
  }, pendingAction.playerId, roll);

  if (!resolution.ok) {
    return { ok: false, state, error: resolution.error };
  }

  if (resolution.reroll) {
    return { ok: true, state: baseState, roll, reroll: true };
  }

  if (resolution.requiresDestination) {
    const destinationAction = {
      type: "CHOOSE_MOVEMENT_DESTINATION",
      playerId: pendingAction.playerId,
      excludedAreaId: player.areaId
    };
    return {
      ok: true,
      state: { ...baseState, pendingActions: [...baseState.pendingActions, destinationAction] },
      roll,
      pendingAction: destinationAction
    };
  }

  return {
    ok: true,
    state: {
      ...baseState,
      players: {
        ...baseState.players,
        [player.id]: { ...player, areaId: resolution.areaId }
      },
      events: [...baseState.events, {
        type: "PLAYER_MOVED",
        playerId: player.id,
        areaId: resolution.areaId,
        d6: roll.d6,
        d4: roll.d4,
        total: roll.total
      }]
    },
    roll,
    areaId: resolution.areaId
  };
};