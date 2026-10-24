const publicPlayer = (player) => ({
  id: player.id,
  name: player.name,
  areaId: player.areaId,
  damage: player.maxHp - player.hp,
  equipment: [...player.equipment],
  alive: player.alive,
  revealed: player.revealed,
  ...(player.revealed ? { characterId: player.characterId, faction: player.faction, hp: player.hp, maxHp: player.maxHp } : {})
});

export const serializePublicState = (state) => ({
  phase: state.phase,
  currentPlayerId: state.currentPlayerId,
  turnOrder: [...state.turnOrder],
  board: state.board,
  players: Object.fromEntries(
    Object.values(state.players).map((player) => [player.id, publicPlayer(player)])
  ),
  bodyCount: state.bodyCount,
  firstDeathPlayerId: state.firstDeathPlayerId,
  winners: [...state.winners],
  gameOver: state.gameOver,
    lobby: state.lobby ?? null,
    pendingActions: state.pendingActions.map(({ type, playerId, targetId, attackerId, damage, excludedAreaId, rolls, killerId, victimId, cardIds, cardId, effect, deckId, card, abilityId, requiresRevealConfirmation }) => ({
    type,
    playerId,
    targetId,
    attackerId,
    damage,
    excludedAreaId,
    rolls,
    killerId,
    victimId,
    cardIds,
    cardId,
    effect,
    deckId,
    abilityId,
    requiresRevealConfirmation,
    ...(card ? { card: { id: card.id, type: card.type, nameKey: card.nameKey, textKey: card.textKey, effect: card.effect } } : {})
  })),
  // HP_SET contient la valeur absolue de PV : on ne la diffuse pas.
  events: state.events.map((e) => (e.type === "HP_SET" ? { type: e.type, playerId: e.playerId } : e))
});

export const serializePrivateState = (state, playerId) => {
  const player = state.players[playerId];

  if (!player) {
    return null;
  }

  return {
    playerId,
    characterId: player.characterId,
    faction: player.faction,
    maxHp: player.maxHp,
    abilityState: { ...player.abilityState },
    revealedCharacters: [...(state.privateRevelations[playerId] ?? [])]
  };
};

export const serializeStateForPlayer = (state, playerId) => ({
  publicState: serializePublicState(state),
  privateState: serializePrivateState(state, playerId)
});