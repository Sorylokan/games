const ok = (state, result = {}) => ({ ok: true, state, ...result });
const failure = (state, error, message) => ({ ok: false, state, error, message });
import { dealDamage, heal, setHP } from "./rules-engine.js";
import { queueExtraTurn } from "./turn-manager.js";
import { getAreaForDieTotal } from "../data/areas.js";
import { rollMovementDice } from "../movement.js";
import { getCharacter } from "../data/characters.js";

const appendEvent = (state, event) => ({
  ...state,
  events: [...state.events, event]
});

const shuffle = (cards, random) => {
  const result = [...cards];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
};

export const createDeckState = (cards, random = Math.random) => ({
  draw: shuffle(cards, random),
  discard: []
});

export const drawCard = (state, deckId, playerId = null) => {
  const deck = state.decks?.[deckId];

  if (!deck) {
    return failure(state, "UNKNOWN_DECK", "The requested deck does not exist.");
  }

  let draw = [...deck.draw];
  let discard = [...deck.discard];

  if (draw.length === 0 && discard.length > 0) {
    draw = discard;
    discard = [];
  }

  if (draw.length === 0) {
    return failure(state, "EMPTY_DECK", "The requested deck has no cards.");
  }

  const [card, ...remainingDraw] = draw;
  const nextState = {
    ...state,
    decks: {
      ...state.decks,
      [deckId]: { draw: remainingDraw, discard }
    },
    events: [...state.events, { type: "CARD_DRAWN", playerId, deckId, cardId: card.id }]
  };

  return ok(nextState, { card });
};

export const discardCard = (state, deckId, card) => {
  const deck = state.decks?.[deckId];

  if (!deck) {
    return failure(state, "UNKNOWN_DECK", "The requested deck does not exist.");
  }

  return ok({
    ...state,
    decks: {
      ...state.decks,
      [deckId]: { ...deck, discard: [...deck.discard, card] }
    },
    events: [...state.events, { type: "CARD_DISCARDED", deckId, cardId: card.id }]
  });
};

export const addEquipment = (state, playerId, card) => {
  const player = state.players[playerId];

  if (!player) {
    return failure(state, "UNKNOWN_PLAYER", "The player does not exist.");
  }

  return ok({
    ...state,
    players: {
      ...state.players,
      [playerId]: { ...player, equipment: [...player.equipment, card.id] }
    },
    events: [...state.events, { type: "EQUIPMENT_ACQUIRED", playerId, cardId: card.id }]
  });
};

const PENDING_EFFECTS = new Set([
  "faction-heal-or-damage",
  "faction-or-equipment",
  "reveal-to-current-player",
  "damage-all-except-self-2",
  "set-hp-2",
  "target-heal-die-6",
  "conditional-reveal-v-or-w",
  "conditional-full-heal-a-e-u",
  "conditional-full-heal-memer",
  "damage-2-heal-self-1",
  "steal-one-equipment",
  "damage-2-self-2",
  "voodoo-die-6",
  "area-damage-3",
  "give-equipment-or-damage",
  "conditional-full-heal-troller"
]);

const resolveDamageToPlayers = (state, playerIds, amount, source, cardId = null) => playerIds.reduce(
  (currentState, targetId) => dealDamage(currentState, targetId, amount, {
    source,
    sourceType: "card",
    cardId
  }).state,
  state
);

const livingPlayerIdsExcept = (state, playerId) => Object.values(state.players)
  .filter((player) => player.alive && player.id !== playerId)
  .map((player) => player.id);

export const resolveCard = (state, playerId, card) => {
  const player = state.players[playerId];

  if (!player) {
    return failure(state, "UNKNOWN_PLAYER", "The player does not exist.");
  }

  if (card.type === "equipment") {
    return addEquipment(state, playerId, card);
  }

  if (card.effect === "heal-self-2") {
    return heal(state, playerId, 2);
  }

  if (card.effect === "extra-turn") {
    const queued = queueExtraTurn(state, playerId);
    return queued.ok ? queued : failure(state, queued.error, queued.message);
  }

  if (card.effect === "faction-heal-or-damage") {
    const factionByCard = {
      "grandpas-advice": "memer",
      "unsolicited-life-advice": "user",
      "get-over-here": "troller"
    };

    if (player.faction !== factionByCard[card.id]) {
      return ok(state);
    }

    return player.hp === player.maxHp
      ? dealDamage(state, playerId, 1, { source: "card", sourceType: "card", cardId: card.id })
      : heal(state, playerId, 1);
  }

  if (card.effect === "faction-damage" || card.effect === "faction-damage-2" || card.effect === "max-hp-damage" || card.effect === "max-hp-damage-2") {
    const amount = card.effect.endsWith("-2") ? 2 : 1;
    const factionByCard = {
      bonk: "memer",
      "bonk-2": "memer",
      "emotional-alt-f4": "troller",
      "rest-in-piss": "troller"
    };
    const applies = card.effect === "max-hp-damage"
      ? player.maxHp <= 11
      : card.effect === "max-hp-damage-2"
        ? player.maxHp >= 12
        : player.faction === factionByCard[card.id];

    if (!applies) {
      return ok(state);
    }

    return dealDamage(state, playerId, amount, { source: "card", sourceType: "card", cardId: card.id });
  }

  if (card.effect === "damage-all-except-self-2") {
    return ok(resolveDamageToPlayers(state, livingPlayerIdsExcept(state, playerId), 2, playerId, card.id));
  }

  if (card.effect === "attack-immunity") {
    return ok({
      ...state,
      temporaryEffects: [
        ...state.temporaryEffects,
        { type: "ATTACK_IMMUNITY", playerId, until: "START_NEXT_TURN" }
      ],
      events: [...state.events, { type: "TEMPORARY_EFFECT_APPLIED", playerId, effect: card.effect }]
    });
  }

  if (card.effect === "conditional-reveal-v-or-w") {
    return getCharacter(player.characterId).initial.match(/[vw]/)
      ? ok({
        ...state,
        players: { ...state.players, [playerId]: { ...player, revealed: true } },
        events: [...state.events, { type: "CHARACTER_REVEALED", playerId, reason: card.id }]
      })
      : ok(state);
  }

  if (card.effect === "conditional-full-heal-a-e-u" || card.effect === "conditional-full-heal-memer" || card.effect === "conditional-full-heal-troller") {
    const startsWith = ["a", "e", "u"];
    const matches = card.effect === "conditional-full-heal-a-e-u"
      ? startsWith.some((letter) => player.characterId.startsWith(letter))
      : card.effect.endsWith("memer") ? player.faction === "memer" : player.faction === "troller";

    return matches ? heal(state, playerId, player.maxHp) : ok(state);
  }

  if (card.effect === "reveal-to-current-player") {
    const viewerId = state.currentPlayerId;
    return ok(appendEvent({
      ...state,
      privateRevelations: {
        ...state.privateRevelations,
        [viewerId]: [...(state.privateRevelations[viewerId] ?? []), playerId]
      }
    }, {
      type: "CHARACTER_REVEALED_TO_PLAYER",
      playerId,
      viewerId,
      cardId: card.id
    }));
  }

  if (!PENDING_EFFECTS.has(card.effect)) {
    return failure(state, "UNSUPPORTED_CARD_EFFECT", "This card effect is not registered.");
  }

  // Carte de vol sans cible equipee : rien a voler, la carte ne fait rien au
  // lieu de bloquer la partie sur un choix impossible (cf. Pickpocket Boulevard).
  if (card.effect === "steal-one-equipment") {
    const hasStealableEquipment = Object.values(state.players).some((target) => (
      target.alive && target.id !== playerId && target.equipment.length > 0
    ));
    if (!hasStealableEquipment) return ok(state);
  }

  const pendingAction = {
    type: "RESOLVE_CARD_EFFECT",
    playerId,
    cardId: card.id,
    effect: card.effect,
    choices: []
  };

  return ok({
    ...state,
    pendingActions: [...state.pendingActions, pendingAction]
  }, { pendingAction });
};

const removePendingAction = (state, pendingAction) => ({
  ...state,
  pendingActions: state.pendingActions.filter((action) => action !== pendingAction)
});

const transferEquipment = (state, fromPlayerId, toPlayerId, cardId) => {
  const fromPlayer = state.players[fromPlayerId];
  const toPlayer = state.players[toPlayerId];

  if (!fromPlayer || !toPlayer || !fromPlayer.equipment.includes(cardId)) {
    return failure(state, "INVALID_EQUIPMENT", "The selected equipment cannot be transferred.");
  }

  return ok({
    ...state,
    players: {
      ...state.players,
      [fromPlayerId]: {
        ...fromPlayer,
        equipment: fromPlayer.equipment.filter((currentCardId) => currentCardId !== cardId)
      },
      [toPlayerId]: {
        ...toPlayer,
        equipment: [...toPlayer.equipment, cardId]
      }
    },
    events: [...state.events, {
      type: "EQUIPMENT_TRANSFERRED",
      fromPlayerId,
      toPlayerId,
      cardId
    }]
  });
};

export const resolvePendingAction = (state, pendingAction, choice, { rollDie } = {}) => {
  if (!state.pendingActions.includes(pendingAction)) {
    return failure(state, "UNKNOWN_PENDING_ACTION", "This pending action is no longer active.");
  }

  if (pendingAction.type === "QUEUE_EXTRA_TURN") {
    const queued = queueExtraTurn(removePendingAction(state, pendingAction), pendingAction.playerId);
    return queued.ok ? queued : failure(state, queued.error, queued.message);
  }

  if (pendingAction.type === "HEAL_TARGET") {
    if (choice !== pendingAction.playerId) {
      return failure(state, "INVALID_TARGET", "This card can only target its owner.");
    }

    const healed = heal(removePendingAction(state, pendingAction), pendingAction.playerId, pendingAction.amount);
    return healed.ok ? healed : failure(state, healed.error, healed.message);
  }

  if (pendingAction.type === "RESOLVE_CARD_EFFECT") {
    const actor = state.players[pendingAction.playerId];

    if (!actor) {
      return failure(state, "UNKNOWN_PLAYER", "The player does not exist.");
    }

    if (!choice || typeof choice !== "object") {
      return failure(state, "INVALID_CHOICE", "This card requires a structured choice.");
    }

    const remainingState = removePendingAction(state, pendingAction);

    if (pendingAction.effect === "faction-or-equipment") {
      if (choice.action === "damage") {
        return ok(dealDamage(remainingState, actor.id, 1, {
          source: "card",
          sourceType: "card",
          cardId: pendingAction.cardId
        }).state);
      }

      if (choice.action === "give" && remainingState.currentPlayerId && choice.cardId) {
        const transferred = transferEquipment(
          remainingState,
          actor.id,
          remainingState.currentPlayerId,
          choice.cardId
        );
        return transferred.ok ? transferred : failure(state, transferred.error, transferred.message);
      }

      return failure(state, "INVALID_CHOICE", "Choose damage or a valid equipment card.");
    }

    if (pendingAction.effect === "steal-one-equipment") {
      const anyStealable = Object.values(remainingState.players).some((target) => (
        target.alive && target.id !== actor.id && target.equipment.length > 0
      ));
      if (!anyStealable && (choice.targetId == null || choice.cardId == null)) {
        return ok(remainingState);   // plus rien a voler : la carte ne fait rien
      }
      const transferred = transferEquipment(remainingState, choice.targetId, actor.id, choice.cardId);
      return transferred.ok ? transferred : failure(state, transferred.error, transferred.message);
    }

    if (pendingAction.effect === "give-equipment-or-damage") {
      if (choice.action === "damage") {
        return ok(dealDamage(remainingState, actor.id, 1, {
          source: "card",
          sourceType: "card",
          cardId: pendingAction.cardId
        }).state);
      }

      if (choice.action === "give") {
        const transferred = transferEquipment(remainingState, actor.id, choice.targetId, choice.cardId);
        return transferred.ok ? transferred : failure(state, transferred.error, transferred.message);
      }

      return failure(state, "INVALID_CHOICE", "Choose damage or a valid equipment transfer.");
    }

    if (pendingAction.effect === "target-heal-die-6") {
      const target = remainingState.players[choice.targetId];
      if (!target?.alive || choice.targetId === actor.id) {
        return failure(state, "INVALID_TARGET", "Choose another living character.");
      }

      const roll = rollMovementDice(rollDie).d6;
      return ok(heal(remainingState, choice.targetId, roll).state);
    }

    if (pendingAction.effect === "voodoo-die-6") {
      const target = remainingState.players[choice.targetId];
      if (!target?.alive) {
        return failure(state, "INVALID_TARGET", "Choose a living character.");
      }

      const roll = rollMovementDice(rollDie).d6;
      const affectedPlayerId = roll <= 4 ? choice.targetId : actor.id;
      return ok(dealDamage(remainingState, affectedPlayerId, 3, {
        source: actor.id,
        sourceType: "card",
        cardId: pendingAction.cardId
      }).state);
    }

    if (pendingAction.effect === "area-damage-3") {
      const roll = rollMovementDice(rollDie);
      const areaId = getAreaForDieTotal(roll.total);
      if (!areaId) {
        return ok(remainingState);
      }

      const targetIds = Object.values(remainingState.players)
        .filter((target) => target.alive && target.areaId === areaId)
        .map((target) => target.id);
      return ok(resolveDamageToPlayers(remainingState, targetIds, 3, actor.id, pendingAction.cardId));
    }

    if (["set-hp-2", "damage-2-heal-self-1", "damage-2-self-2"].includes(pendingAction.effect)) {
      const targetId = choice.targetId;
      const target = remainingState.players[targetId];

      if (!target?.alive) {
        return failure(state, "INVALID_TARGET", "The selected target is not alive.");
      }

      if (pendingAction.effect === "set-hp-2") {
        return ok(removePendingAction(setHP(remainingState, targetId, 2).state, pendingAction));
      }

      const damaged = dealDamage(remainingState, targetId, 2, {
        source: actor.id,
        sourceType: "card",
        cardId: pendingAction.cardId
      });
      if (pendingAction.effect === "damage-2-self-2") {
        return ok(dealDamage(damaged.state, actor.id, 2, {
          source: actor.id,
          sourceType: "card",
          cardId: pendingAction.cardId
        }).state);
      }

      return ok(heal(damaged.state, actor.id, 1).state);
    }

    return failure(state, "UNSUPPORTED_PENDING_ACTION", "This card effect is not yet resolvable.");
  }

  return failure(state, "UNSUPPORTED_PENDING_ACTION", "This pending action is not registered.");
};