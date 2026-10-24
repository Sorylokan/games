import { GAME_PHASES } from "./game-state.js";

const ok = (state) => ({ ok: true, state });
const failure = (state, error, message) => ({ ok: false, state, error, message });

const appendEvent = (state, event) => ({
  ...state,
  events: [...state.events, event]
});

const getLivingPlayerIds = (state) => state.turnOrder.filter((playerId) => (
  state.players[playerId]?.alive
));

const getNextLivingPlayerId = (state, playerId) => {
  const { turnOrder } = state;
  const start = turnOrder.indexOf(playerId);
  if (start < 0) return null;
  for (let i = 1; i <= turnOrder.length; i += 1) {
    const candidate = turnOrder[(start + i) % turnOrder.length];
    if (state.players[candidate]?.alive) return candidate;
  }
  return null;
};

const requirePhase = (state, expectedPhase) => {
  if (state.phase !== expectedPhase) {
    return failure(
      state,
      "INVALID_PHASE",
      `This action requires phase ${expectedPhase}.`
    );
  }

  return null;
};

const requireCurrentPlayer = (state, playerId) => {
  if (state.currentPlayerId !== playerId) {
    return failure(state, "NOT_CURRENT_PLAYER", "This player is not the active player.");
  }

  if (!state.players[playerId]?.alive) {
    return failure(state, "PLAYER_DEAD", "A dead player cannot take a turn.");
  }

  return null;
};

export const startGame = (state) => {
  if (state.phase !== GAME_PHASES.SETUP) {
    return failure(state, "GAME_ALREADY_STARTED", "The game has already started.");
  }

  const firstPlayerId = getLivingPlayerIds(state)[0];

  if (!firstPlayerId) {
    return failure(state, "NO_LIVING_PLAYERS", "The game needs at least one living player.");
  }

  const nextState = appendEvent({
    ...state,
    phase: GAME_PHASES.START_TURN,
    currentPlayerId: firstPlayerId
  }, {
    type: "TURN_STARTED",
    playerId: firstPlayerId
  });

  return ok(nextState);
};

export const beginTurn = (state, playerId = state.currentPlayerId) => {
  const phaseError = requirePhase(state, GAME_PHASES.START_TURN);
  const playerError = requireCurrentPlayer(state, playerId);

  if (phaseError) {
    return phaseError;
  }

  if (playerError) {
    return playerError;
  }

  return ok({
    ...state,
    phase: GAME_PHASES.MOVEMENT,
    temporaryEffects: state.temporaryEffects.filter((effect) => (
      !(effect.playerId === playerId && effect.until === "START_NEXT_TURN")
    ))
  });
};

export const completeMovement = (state, playerId = state.currentPlayerId) => {
  const phaseError = requirePhase(state, GAME_PHASES.MOVEMENT);
  const playerError = requireCurrentPlayer(state, playerId);

  if (phaseError) {
    return phaseError;
  }

  if (playerError) {
    return playerError;
  }

  return ok({ ...state, phase: GAME_PHASES.AREA_ACTION });
};

export const completeAreaAction = (state, playerId = state.currentPlayerId) => {
  const phaseError = requirePhase(state, GAME_PHASES.AREA_ACTION);
  const playerError = requireCurrentPlayer(state, playerId);

  if (phaseError) {
    return phaseError;
  }

  if (playerError) {
    return playerError;
  }

  return ok({ ...state, phase: GAME_PHASES.ATTACK });
};

export const completeAttack = (state, playerId = state.currentPlayerId) => {
  const phaseError = requirePhase(state, GAME_PHASES.ATTACK);

  if (phaseError) {
    return phaseError;
  }

  if (state.currentPlayerId !== playerId) {
    return failure(state, "NOT_CURRENT_PLAYER", "This player is not the active player.");
  }

  return ok({ ...state, phase: GAME_PHASES.END_TURN });
};

export const queueExtraTurn = (state, playerId) => {
  const player = state.players[playerId];

  if (!player) {
    return failure(state, "UNKNOWN_PLAYER", "The player does not exist.");
  }

  if (!player.alive) {
    return failure(state, "PLAYER_DEAD", "A dead player cannot receive an extra turn.");
  }

  return ok({
    ...state,
    queuedTurns: [...state.queuedTurns, playerId]
  });
};

export const endTurn = (state, playerId = state.currentPlayerId) => {
  const phaseError = requirePhase(state, GAME_PHASES.END_TURN);

  if (phaseError) {
    return phaseError;
  }

  if (state.currentPlayerId !== playerId) {
    return failure(state, "NOT_CURRENT_PLAYER", "This player is not the active player.");
  }

  if (!state.players[playerId]) {
    return failure(state, "UNKNOWN_PLAYER", "The player does not exist.");
  }

  const queuedTurns = [...state.queuedTurns];
  let nextPlayerId = queuedTurns.shift();

  if (!nextPlayerId || !state.players[nextPlayerId]?.alive) {
    nextPlayerId = getNextLivingPlayerId(state, playerId);
  }

  if (!nextPlayerId) {
    return ok({
      ...state,
      phase: GAME_PHASES.GAME_OVER,
      queuedTurns,
      currentPlayerId: null
    });
  }

  const endedState = appendEvent({
    ...state,
    phase: GAME_PHASES.START_TURN,
    queuedTurns,
    currentPlayerId: nextPlayerId
  }, {
    type: "TURN_ENDED",
    playerId
  });
  const nextState = appendEvent(endedState, {
    type: "TURN_STARTED",
    playerId: nextPlayerId
  });

  return ok(nextState);
};