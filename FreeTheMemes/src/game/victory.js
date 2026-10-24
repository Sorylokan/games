const getPlayers = (state) => Object.values(state.players);

const factionIsEliminated = (state, faction) => {
  const factionPlayers = getPlayers(state).filter((player) => player.faction === faction);
  return factionPlayers.length > 0 && factionPlayers.every((player) => !player.alive);
};

const hasJohnWickAttackKill = (state, playerId) => state.events.some((event) => (
  event.type === "PLAYER_DIED" &&
  event.killerId === playerId &&
  event.sourceType === "attack" &&
  event.bodyCountAtDeath >= 3
));

export const checkWinConditions = (state) => {
  const players = getPlayers(state);
  const memersWon = factionIsEliminated(state, "troller");
  const trollersWon = (
    factionIsEliminated(state, "memer") ||
    players.filter((player) => player.faction === "user" && !player.alive).length >= 3
  );
  const directWinners = new Set();

  for (const player of players) {
    if (player.characterId === "pay-to-win" && player.equipment.length >= 5) {
      directWinners.add(player.id);
    }

    if (player.characterId === "john-wick" && hasJohnWickAttackKill(state, player.id)) {
      directWinners.add(player.id);
    }

    if (player.faction === "memer" && memersWon) {
      directWinners.add(player.id);
    }

    if (player.faction === "troller" && trollersWon) {
      directWinners.add(player.id);
    }

    if (
      player.characterId === "press-f" &&
      (state.firstDeathPlayerId === player.id || (player.alive && memersWon))
    ) {
      directWinners.add(player.id);
    }
  }

  for (const player of players) {
    if (player.characterId === "doge" && player.alive && directWinners.size > 0) {
      directWinners.add(player.id);
    }
  }

  return {
    gameOver: directWinners.size > 0,
    winners: [...directWinners]
  };
};

export const applyVictoryState = (state) => {
  const victory = checkWinConditions(state);

  if (!victory.gameOver) {
    return state;
  }

  return {
    ...state,
    ...victory,
    phase: "game-over"
  };
};