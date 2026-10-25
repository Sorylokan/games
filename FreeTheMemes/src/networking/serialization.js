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

// Pending actions whose TYPE alone gives away the owner's character or faction (only Doge can
// dodge, only a Memer gets the lance…). Until the owner is revealed, others only see SECRET_REACTION.
const SECRET_PENDING_TYPES = new Set([
  "DOGE_ATTACK_REACTION",
  "LIFE_STONKS_REACTION",
  "SURPRISE_COUNTERATTACK",
  "JOHN_WICK_SECOND_ATTACK",
  "PAY_TO_WIN_REACTION",
  "TELESCOPIC_LANCE_REACTION",
  "POKER_FACE_NOTIFICATION",
  "ACTIVATE_ABILITY"
]);
export const SECRET_REACTION = "SECRET_REACTION";
export const isSecretPendingType = (type) => type === SECRET_REACTION || SECRET_PENDING_TYPES.has(type);

const serializePendingAction = ({ type, playerId, targetId, attackerId, damage, excludedAreaId, rolls, killerId, victimId, cardIds, cardId, effect, deckId, card, abilityId, requiresRevealConfirmation }) => ({
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
});

const publicPendingAction = (state, action) => {
  if (SECRET_PENDING_TYPES.has(action.type) && !state.players[action.playerId]?.revealed) {
    return { type: SECRET_REACTION, playerId: action.playerId };
  }
  const serialized = serializePendingAction(action);
  // Notifications are read in secret: only the giver knows the card.
  if (action.type === "GIVE_NOTIFICATION") delete serialized.card;
  return serialized;
};

// Same for the log: a Notification was drawn, not which one. HP_SET holds an absolute HP value: not shared.
const publicEvent = (event) => {
  if (event.type === "HP_SET") return { type: event.type, playerId: event.playerId };
  if ((event.type === "CARD_DRAWN" || event.type === "CARD_DISCARDED") && event.deckId === "notifications") {
    const { cardId, ...rest } = event;
    return rest;
  }
  return event;
};

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
  pendingActions: state.pendingActions.map((action) => publicPendingAction(state, action)),
  events: state.events.map(publicEvent)
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
    revealedCharacters: [...(state.privateRevelations[playerId] ?? [])],
    // Full version of this player's own pending actions (masked in the public state),
    // aligned with pendingActions: null for other players'.
    pendingActions: state.pendingActions.map((action) => (
      action.playerId === playerId ? serializePendingAction(action) : null
    ))
  };
};

export const serializeStateForPlayer = (state, playerId) => ({
  publicState: serializePublicState(state),
  privateState: serializePrivateState(state, playerId)
});
