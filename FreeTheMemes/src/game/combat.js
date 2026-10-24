import { canAttackFromPosition, getAreaPosition } from "../board.js";
import { dealDamage } from "./rules-engine.js";
import { GAME_PHASES } from "./game-state.js";

const ok = (state, result = {}) => ({ ok: true, state, ...result });
const failure = (state, error, message) => ({ ok: false, state, error, message });

const getEquipmentBonus = (attacker) => attacker.equipment.filter((cardId) => (
  ["shark-teeth", "free-circumcision", "plank-rusty-nails"].includes(cardId)
)).length;

const addPendingReaction = (state, pendingAction) => ({
  ...state,
  pendingActions: [...state.pendingActions, pendingAction]
});

export const rollAttackDice = (rollDie = (sides) => Math.floor(Math.random() * sides) + 1) => {
  const d6 = rollDie(6);
  const d4 = rollDie(4);

  return { d6, d4, damage: Math.abs(d6 - d4) };
};

export const rollForcedAttack = (rollDie = (sides) => Math.floor(Math.random() * sides) + 1) => {
  const d4 = rollDie(4);
  return { d6: null, d4, damage: d4 };
};

export const canTargetWithAttack = (state, attackerId, targetId) => {
  const attacker = state.players[attackerId];
  const target = state.players[targetId];

  if (!attacker || !target || !attacker.alive || !target.alive || attackerId === targetId) {
    return false;
  }

  const attackerPosition = getAreaPosition(state.board, attacker.areaId);
  const targetPosition = getAreaPosition(state.board, target.areaId);

  // Finger Bullet: portee etendue a toute zone SAUF celle de l'attaquant
  // ("every Area except your own") - on ne peut donc pas frapper quelqu'un
  // partageant sa propre zone.
  if (attacker.equipment.includes("finger-bullet")) {
    return attackerPosition !== null && targetPosition !== null && attackerPosition !== targetPosition;
  }

  return attackerPosition !== null && targetPosition !== null && (
    canAttackFromPosition(state.board, attackerPosition, targetPosition)
  );
};

const FORCED_ATTACK_CARDS = ["jesus-last-pajamas", "cursed-japanese-chopsticks"];

export const mustAttack = (state, playerId) => {
  const player = state.players[playerId];
  return Boolean(player?.alive) &&
    player.equipment.some((cardId) => FORCED_ATTACK_CARDS.includes(cardId)) &&
    Object.keys(state.players).some((targetId) => canTargetWithAttack(state, playerId, targetId));
};

export const attack = (
  state,
  attackerId,
  targetId,
  { rollDie, phase = GAME_PHASES.ATTACK, skipReaction = false } = {}
) => {
  if (phase !== GAME_PHASES.ATTACK) {
    return failure(state, "INVALID_PHASE", "Attacks can only be made during the attack phase.");
  }

  const attacker = state.players[attackerId];
  const target = state.players[targetId];

  if (!attacker || !target) {
    return failure(state, "UNKNOWN_PLAYER", "The attacker or target does not exist.");
  }

  if (!canTargetWithAttack(state, attackerId, targetId)) {
    return failure(state, "INVALID_TARGET", "The target is outside attack range or cannot be attacked.");
  }

  const doge = target.characterId === "doge" ? target : null;
  const dogeUses = doge?.abilityState["doge-dodge"] ?? 0;
  if (doge && dogeUses < 2 && !skipReaction) {
    const pendingAction = {
      type: "DOGE_ATTACK_REACTION",
      playerId: targetId,
      attackerId,
      targetId
    };
    return ok(addPendingReaction(state, pendingAction), { pendingAction });
  }

  const forcedAttack = attacker.equipment.includes("jesus-last-pajamas") ||
    attacker.equipment.includes("cursed-japanese-chopsticks");
  const roll = forcedAttack ? rollForcedAttack(rollDie) : rollAttackDice(rollDie);
  const bonus = getEquipmentBonus(attacker);
  const damage = roll.damage + bonus;
  const attackEvent = {
    type: "ATTACK_RESOLVED",
    attackerId,
    targetId,
    d6: roll.d6,
    d4: roll.d4,
    baseDamage: roll.damage,
    bonus,
    damage,
    successful: damage > 0
  };
  const stateWithEvent = {
    ...state,
    events: [...state.events, { type: "ATTACK_STARTED", attackerId, targetId }]
  };

  if (damage === 0) {
    return ok({
      ...stateWithEvent,
      events: [...stateWithEvent.events, attackEvent]
    }, { roll, damage });
  }

  if (attacker.characterId === "pay-to-win" && damage >= 2) {
    const pendingAction = {
      type: "PAY_TO_WIN_REACTION",
      playerId: attackerId,
      targetId,
      damage,
      attackEvent
    };
    return ok(addPendingReaction({
      ...stateWithEvent,
      events: [...stateWithEvent.events, attackEvent]
    }, pendingAction), { roll, damage, pendingAction });
  }

  if (attacker.faction === "memer" && attacker.equipment.includes("telescopic-lance") && damage > 0) {
    const pendingAction = {
      type: "TELESCOPIC_LANCE_REACTION",
      playerId: attackerId,
      targetId,
      damage,
      attackEvent
    };
    return ok(addPendingReaction({
      ...stateWithEvent,
      events: [...stateWithEvent.events, attackEvent]
    }, pendingAction), { roll, damage, pendingAction });
  }

  const result = dealDamage(stateWithEvent, targetId, damage, {
    source: attackerId,
    sourceType: "attack"
  });

  let resolvedState = {
    ...result.state,
    events: [...result.state.events, attackEvent]
  };

  const targetNow = resolvedState.players[targetId];

  if (damage > 0 && attacker.characterId === "life-stonks" && !attacker.abilityState["life-stonks-heal"]) {
    resolvedState = addPendingReaction(resolvedState, {
      type: "LIFE_STONKS_REACTION",
      playerId: attackerId,
      targetId
    });
  }

  if (targetNow.alive && targetNow.characterId === "surprise-mf" && !targetNow.abilityState["surprise-counterattack"]) {
    resolvedState = addPendingReaction(resolvedState, {
      type: "SURPRISE_COUNTERATTACK",
      playerId: targetId,
      attackerId,
      targetId: attackerId
    });
  }

  if (attacker.characterId === "john-wick" && damage > 0 && targetNow.alive) {
    resolvedState = addPendingReaction(resolvedState, {
      type: "JOHN_WICK_SECOND_ATTACK",
      playerId: attackerId,
      targetId
    });
  }

  return ok(resolvedState, { roll, damage });
};

// Most of these reactions are documented as optional ("may reveal", "may attack again"),
// so each branch below decides for itself whether a reveal is required instead of a single
// blanket gate - that previously made every optional ability mandatory and undeclineable.
export const resolveCombatPendingAction = (
  state,
  pendingAction,
  choice = {},
  { rollDie } = {}
) => {
  if (!state.pendingActions.includes(pendingAction)) {
    return failure(state, "UNKNOWN_PENDING_ACTION", "This combat reaction is no longer active.");
  }

  const player = state.players[pendingAction.playerId];
  if (!player?.alive) {
    return failure(state, "PLAYER_DEAD", "The reaction owner is no longer alive.");
  }

  const withoutAction = {
    ...state,
    pendingActions: state.pendingActions.filter((action) => action !== pendingAction)
  };

  // Reveals the reaction owner's identity (no-op if already revealed) and optionally
  // updates their ability-usage tracking at the same time.
  const applyReveal = (targetState, updateAbilityState = (abilityState) => abilityState) => {
    const current = targetState.players[player.id];
    const nextAbilityState = updateAbilityState(current.abilityState);
    if (current.revealed) {
      return {
        ...targetState,
        players: { ...targetState.players, [player.id]: { ...current, abilityState: nextAbilityState } }
      };
    }
    return {
      ...targetState,
      players: { ...targetState.players, [player.id]: { ...current, revealed: true, abilityState: nextAbilityState } },
      events: [...targetState.events, { type: "CHARACTER_REVEALED", playerId: player.id, reason: "REACTION_ACTIVATED" }]
    };
  };

  if (pendingAction.type === "DOGE_ATTACK_REACTION") {
    if (choice.decline === true) {
      return attack(withoutAction, pendingAction.attackerId, pendingAction.targetId, {
        rollDie, phase: GAME_PHASES.ATTACK, skipReaction: true
      });
    }
    if (choice.confirmReveal !== true) {
      return failure(state, "REVEAL_CONFIRMATION_REQUIRED", "Confirm the public identity reveal before dodging.");
    }

    const revealed = applyReveal(withoutAction, (abilityState) => ({
      ...abilityState,
      "doge-dodge": (abilityState["doge-dodge"] ?? 0) + 1
    }));
    const roll = (rollDie ?? ((sides) => Math.floor(Math.random() * sides) + 1))(6);
    if (roll % 2 === 0) {
      return ok({
        ...revealed,
        events: [...revealed.events, { type: "DAMAGE_PREVENTED", playerId: pendingAction.targetId, reason: "DOGE_DODGE", roll }]
      });
    }

    return attack(revealed, pendingAction.attackerId, pendingAction.targetId, {
      rollDie, phase: GAME_PHASES.ATTACK, skipReaction: true
    });
  }

  if (pendingAction.type === "LIFE_STONKS_REACTION") {
    if (choice.decline === true) {
      return ok(withoutAction);
    }
    if (choice.confirmReveal !== true) {
      return failure(state, "REVEAL_CONFIRMATION_REQUIRED", "Confirm the public identity reveal before healing.");
    }

    const revealed = applyReveal(withoutAction, (abilityState) => ({ ...abilityState, "life-stonks-heal": true }));
    const current = revealed.players[player.id];
    return ok({
      ...revealed,
      players: { ...revealed.players, [player.id]: { ...current, hp: Math.min(current.hp + 2, current.maxHp) } },
      events: [...revealed.events, { type: "HEAL_APPLIED", playerId: player.id, amount: Math.min(2, current.maxHp - current.hp) }]
    });
  }

  if (pendingAction.type === "PAY_TO_WIN_REACTION") {
    if (choice.action === "damage") {
      return ok(dealDamage(withoutAction, pendingAction.targetId, pendingAction.damage, {
        source: pendingAction.playerId,
        sourceType: "attack"
      }).state);
    }

    const target = withoutAction.players[pendingAction.targetId];
    if (choice.action !== "steal" || !target?.equipment.includes(choice.cardId)) {
      return failure(state, "INVALID_CHOICE", "Choose damage or select an available equipment card to steal.");
    }
    if (!player.revealed && choice.confirmReveal !== true) {
      return failure(state, "REVEAL_CONFIRMATION_REQUIRED", "Confirm the public identity reveal before stealing equipment.");
    }

    const revealed = applyReveal(withoutAction);
    const attacker = revealed.players[pendingAction.playerId];
    return ok({
      ...revealed,
      players: {
        ...revealed.players,
        [pendingAction.playerId]: { ...attacker, equipment: [...attacker.equipment, choice.cardId] },
        [pendingAction.targetId]: { ...target, equipment: target.equipment.filter((cardId) => cardId !== choice.cardId) }
      },
      events: [...revealed.events, {
        type: "EQUIPMENT_STOLEN",
        fromPlayerId: pendingAction.targetId,
        toPlayerId: pendingAction.playerId,
        cardId: choice.cardId,
        reason: "PAY_TO_WIN"
      }]
    });
  }

  if (pendingAction.type === "TELESCOPIC_LANCE_REACTION") {
    const useBonus = choice.confirmReveal === true;
    const finalDamage = pendingAction.damage + (useBonus ? 2 : 0);
    const base = useBonus ? applyReveal(withoutAction) : withoutAction;
    const result = dealDamage(base, pendingAction.targetId, finalDamage, {
      source: pendingAction.playerId,
      sourceType: "attack"
    });
    return ok({
      ...result.state,
      events: [...result.state.events, {
        type: "ATTACK_BONUS_APPLIED",
        playerId: pendingAction.playerId,
        targetId: pendingAction.targetId,
        cardId: "telescopic-lance",
        amount: finalDamage
      }]
    });
  }

  if (pendingAction.type === "JOHN_WICK_SECOND_ATTACK") {
    if (choice.decline === true) {
      return ok(withoutAction);
    }
    if (!player.revealed && choice.confirmReveal !== true) {
      return failure(state, "REVEAL_CONFIRMATION_REQUIRED", "Confirm the public identity reveal before attacking again.");
    }

    const revealed = applyReveal(withoutAction);
    const selfDamage = dealDamage(revealed, pendingAction.playerId, 2, {
      source: pendingAction.playerId,
      sourceType: "ability"
    });
    if (!selfDamage.ok) {
      return selfDamage;
    }

    return attack(selfDamage.state, pendingAction.playerId, pendingAction.targetId, {
      rollDie,
      phase: GAME_PHASES.ATTACK,
      skipReaction: true
    });
  }

  // SURPRISE_COUNTERATTACK
  if (choice.decline === true) {
    return ok(withoutAction);
  }
  if (choice.confirmReveal !== true) {
    return failure(state, "REVEAL_CONFIRMATION_REQUIRED", "Confirm the public identity reveal before counterattacking.");
  }

  const revealed = applyReveal(withoutAction, (abilityState) => ({ ...abilityState, "surprise-counterattack": true }));
  return attack(revealed, pendingAction.playerId, pendingAction.targetId, {
    rollDie,
    phase: GAME_PHASES.ATTACK
  });
};

export const getAttackTargets = (state, attackerId) => Object.keys(state.players)
  .filter((targetId) => targetId !== attackerId && canTargetWithAttack(state, attackerId, targetId));

export const areaAttack = (
  state,
  attackerId,
  { rollDie, phase = GAME_PHASES.ATTACK } = {}
) => {
  const attacker = state.players[attackerId];

  if (phase !== GAME_PHASES.ATTACK) {
    return failure(state, "INVALID_PHASE", "Attacks can only be made during the attack phase.");
  }

  if (!attacker) {
    return failure(state, "UNKNOWN_PLAYER", "The attacker does not exist.");
  }

  if (!attacker.equipment.includes("pfrt-tube")) {
    return failure(state, "MISSING_EQUIPMENT", "The attacker does not have the area-attack equipment.");
  }

  const targets = getAttackTargets(state, attackerId);
  const forcedAttack = attacker.equipment.includes("jesus-last-pajamas") ||
    attacker.equipment.includes("cursed-japanese-chopsticks");
  const roll = forcedAttack ? rollForcedAttack(rollDie) : rollAttackDice(rollDie);
  const damage = roll.damage + getEquipmentBonus(attacker);
  let nextState = state;

  for (const targetId of targets) {
    const result = dealDamage(nextState, targetId, damage, {
      source: attackerId,
      sourceType: "attack"
    });
    nextState = result.state;
  }

  return ok({
    ...nextState,
    events: [...nextState.events, {
      type: "AREA_ATTACK_RESOLVED",
      attackerId,
      targetIds: targets,
      d6: roll.d6,
      d4: roll.d4,
      damage
    }]
  }, { roll, damage, targetIds: targets });
};