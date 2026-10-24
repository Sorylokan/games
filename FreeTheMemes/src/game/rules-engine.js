import { applyVictoryState } from "./victory.js";
import { resolveEvents } from "./event-resolver.js";

const ok = (state, result = {}) => ({ ok: true, state, ...result });
const failure = (state, error, message) => ({ ok: false, state, error, message });

const getPlayer = (state, playerId) => state.players[playerId];

const appendEvent = (state, event) => ({
  ...state,
  events: [...state.events, event]
});

export const dealDamage = (state, playerId, amount, context = {}) => {
  const player = getPlayer(state, playerId);

  if (!player) {
    return failure(state, "UNKNOWN_PLAYER", "The target player does not exist.");
  }

  if (!Number.isInteger(amount) || amount < 0) {
    return failure(state, "INVALID_AMOUNT", "Damage must be a non-negative integer.");
  }

  if (!player.alive) {
    return failure(state, "PLAYER_DEAD", "A dead player cannot receive damage.");
  }

  const attackBlocked = context.sourceType === "attack" && state.temporaryEffects?.some((effect) => (
    effect.type === "ATTACK_IMMUNITY" && effect.playerId === playerId
  ));
  const cardBlocked = context.sourceType === "card" && state.temporaryEffects?.some((effect) => (
    effect.type === "BLACK_CARD_IMMUNITY" && effect.playerId === playerId && effect.cardId === context.cardId
  ));
  const equipmentBlocked = (
    context.cardId === "toxic-relationship" && player.equipment.includes("luck-exe")
  ) || (
    (context.cardId === "mischievous-spider" || context.cardId === "explosive-stick" || context.cardId?.startsWith("bloodthirsty-flying-rat")) &&
    player.equipment.includes("suspicious-necklace")
  );
  if (attackBlocked || cardBlocked || equipmentBlocked) {
    return ok(appendEvent(state, {
      type: "DAMAGE_PREVENTED",
      playerId,
      amount,
      source: context.source ?? null
    }), { amountApplied: 0 });
  }

  const nextHp = Math.max(player.hp - amount, 0);
  const nextPlayer = { ...player, hp: nextHp };
  let nextState = {
    ...state,
    players: { ...state.players, [playerId]: nextPlayer }
  };

  nextState = appendEvent(nextState, {
    type: "DAMAGE_DEALT",
    playerId,
    amount,
    source: context.source ?? null
  });

  if (nextHp === 0) {
    nextState = killPlayer(nextState, playerId, context).state;
  }

  return ok(applyVictoryState(nextState), { amountApplied: player.hp - nextHp });
};

export const heal = (state, playerId, amount) => {
  const player = getPlayer(state, playerId);

  if (!player) {
    return failure(state, "UNKNOWN_PLAYER", "The target player does not exist.");
  }

  if (!Number.isInteger(amount) || amount < 0) {
    return failure(state, "INVALID_AMOUNT", "Healing must be a non-negative integer.");
  }

  if (!player.alive) {
    return failure(state, "PLAYER_DEAD", "A dead player cannot be healed.");
  }

  const nextHp = Math.min(player.hp + amount, player.maxHp);
  const nextState = appendEvent({
    ...state,
    players: {
      ...state.players,
      [playerId]: { ...player, hp: nextHp }
    }
  }, {
    type: "HEAL_APPLIED",
    playerId,
    amount: nextHp - player.hp
  });

  return ok(applyVictoryState(nextState), { amountApplied: nextHp - player.hp });
};

export const killPlayer = (state, playerId, context = {}) => {
  const player = getPlayer(state, playerId);

  if (!player) {
    return failure(state, "UNKNOWN_PLAYER", "The target player does not exist.");
  }

  if (!player.alive) {
    return failure(state, "PLAYER_DEAD", "The player is already dead.");
  }

  const revealedPlayers = Object.fromEntries(
    Object.values(state.players).map((candidate) => [
      candidate.id,
      candidate
    ])
  );
  const bodyCountAtDeath = state.bodyCount + 1;
  const deathEvent = {
    type: "PLAYER_DIED",
    playerId,
    killerId: context.source ?? null,
    sourceType: context.sourceType ?? null,
    bodyCountAtDeath
  };
  const rawKiller = context.source ? state.players[context.source] : null;
  // Pas de récompense si on se tue soi-même ou si le tueur est déjà mort.
  const killer = rawKiller && rawKiller.id !== playerId && rawKiller.alive ? rawKiller : null;
  const hasSpinner = Boolean(killer?.equipment.includes("gods-hand-spinner"));
  const rewardAction = killer && !hasSpinner && player.equipment.length > 0
    ? [{
      type: "CHOOSE_EQUIPMENT_REWARD",
      playerId: killer.id,
      killerId: killer.id,
      victimId: playerId,
      cardIds: player.equipment
    }]
    : [];
  const nextPlayers = {
    ...revealedPlayers,
    [playerId]: {
      ...revealedPlayers[playerId],
      hp: 0,
      alive: false,
      revealed: true,
      equipment: hasSpinner ? [] : revealedPlayers[playerId].equipment
    }
  };
  if (hasSpinner && player.equipment.length > 0) {
    nextPlayers[killer.id] = { ...nextPlayers[killer.id], equipment: [...killer.equipment, ...player.equipment] };
  }
  // if (killer && transferredEquipment) {
  //   nextPlayers[killer.id] = { ...nextPlayers[killer.id], equipment: transferredEquipment };
  // }
  const nextState = appendEvent({
    ...state,
    bodyCount: bodyCountAtDeath,
    firstDeathPlayerId: state.firstDeathPlayerId ?? playerId,
    players: nextPlayers,
    pendingActions: [...state.pendingActions, ...rewardAction]
  }, deathEvent);

  return ok(resolveEvents(nextState, [deathEvent]));
};

export const setHP = (state, playerId, value) => {
  const player = getPlayer(state, playerId);

  if (!player) {
    return failure(state, "UNKNOWN_PLAYER", "The target player does not exist.");
  }

  if (!Number.isInteger(value) || value < 0) {
    return failure(state, "INVALID_AMOUNT", "HP must be a non-negative integer.");
  }

  if (!player.alive && value > 0) {
    return failure(state, "PLAYER_DEAD", "A dead player cannot have HP set by this operation.");
  }

  let nextState = appendEvent({
    ...state,
    players: {
      ...state.players,
      [playerId]: { ...player, hp: Math.min(value, player.maxHp) }
    }
  }, {
    type: "HP_SET",
    playerId,
    value: Math.min(value, player.maxHp)
  });

  if (value === 0 && player.alive) {
    nextState = killPlayer(nextState, playerId).state;
  }

  return ok(applyVictoryState(nextState), { amountApplied: player.hp - nextState.players[playerId].hp });
};

export const resolveEquipmentReward = (state, pendingAction, cardId) => {
  if (!state.pendingActions.includes(pendingAction) || pendingAction.type !== "CHOOSE_EQUIPMENT_REWARD") {
    return failure(state, "UNKNOWN_PENDING_ACTION", "This reward is no longer active.");
  }
  const withoutAction = { ...state, pendingActions: state.pendingActions.filter((a) => a !== pendingAction) };
  const killer = state.players[pendingAction.killerId];
  const victim = state.players[pendingAction.victimId];
  if (cardId == null || !killer?.alive) return ok(withoutAction);
  if (!pendingAction.cardIds.includes(cardId) || !victim.equipment.includes(cardId)) {
    return failure(state, "INVALID_CHOICE", "Choose one of the victim's equipment cards.");
  }
  return ok(appendEvent({
    ...withoutAction,
    players: {
      ...withoutAction.players,
      [killer.id]: { ...killer, equipment: [...killer.equipment, cardId] },
      [victim.id]: { ...victim, equipment: victim.equipment.filter((c) => c !== cardId) }
    }
  }, { type: "EQUIPMENT_STOLEN", fromPlayerId: victim.id, toPlayerId: killer.id, cardId, reason: "KILL_REWARD" }));
};