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

// Actions en attente dont le simple TYPE trahit le personnage (ou la faction) de leur
// propriétaire : seul un Doge peut esquiver, seul un Memer se voit proposer la lance...
// Tant que le propriétaire n'est pas révélé, les autres joueurs voient seulement
// « SECRET_REACTION » : ils savent qu'il réfléchit, pas à quoi.
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
  // Une Notification se lit en secret : seul celui qui la donne connaît la carte.
  if (action.type === "GIVE_NOTIFICATION") delete serialized.card;
  return serialized;
};

// Même logique pour le journal : on sait qu'une Notification a été piochée, pas laquelle.
// HP_SET contient la valeur absolue de PV : on ne la diffuse pas.
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
    // Version complète de SES actions en attente (masquées dans l'état public),
    // alignée sur pendingActions : null pour celles des autres joueurs.
    pendingActions: state.pendingActions.map((action) => (
      action.playerId === playerId ? serializePendingAction(action) : null
    ))
  };
};

export const serializeStateForPlayer = (state, playerId) => ({
  publicState: serializePublicState(state),
  privateState: serializePrivateState(state, playerId)
});
