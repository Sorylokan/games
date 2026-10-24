import { applyVictoryState } from "./victory.js";

const appendEvent = (state, event) => ({
  ...state,
  events: [...state.events, event]
});

const revealPressF = (state) => {
  const pressFPlayers = Object.values(state.players).filter((player) => (
    player.characterId === "press-f" && !player.revealed
  ));

  return pressFPlayers.reduce((currentState, player) => {
    const nextState = {
      ...currentState,
      players: {
        ...currentState.players,
        [player.id]: { ...player, revealed: true }
      }
    };

    return appendEvent(nextState, {
      type: "CHARACTER_REVEALED",
      playerId: player.id,
      reason: "CHARACTER_DIED"
    });
  }, state);
};

const resolveTrigger = (state, event) => {
  if (event.type === "PLAYER_DIED") {
    return {
      state: revealPressF(state),
      events: []
    };
  }

  return { state, events: [] };
};

export const resolveEvents = (state, initialEvents) => {
  let nextState = state;
  const queue = [...initialEvents];

  while (queue.length > 0) {
    const event = queue.shift();
    const result = resolveTrigger(nextState, event);

    nextState = applyVictoryState(result.state);
    queue.push(...result.events);
  }

  return nextState;
};