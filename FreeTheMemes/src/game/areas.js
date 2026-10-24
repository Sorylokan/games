import { AREAS } from "../data/areas.js";
import { drawCard, discardCard, resolveCard } from "./cards.js";
import { dealDamage, heal } from "./rules-engine.js";

const ok = (state, result = {}) => ({ ok: true, state, ...result });
const failure = (state, error, message) => ({ ok: false, state, error, message });

const areaById = Object.fromEntries(Object.values(AREAS).map((area) => [area.id, area]));

export const resolveAreaAction = (state, playerId, areaId) => {
  const area = areaById[areaId];
  if (!area) {
    return failure(state, "UNKNOWN_AREA", "The area does not exist.");
  }

  const player = state.players[playerId];
  if (!player || !player.alive || player.areaId !== areaId) {
    return failure(state, "INVALID_AREA_ACTION", "The player cannot act on this area.");
  }

  if (area.effect === "draw-notification-and-give") {
    const drawn = drawCard(state, "notifications", playerId);
    if (!drawn.ok) {
      return drawn;
    }

    const pendingAction = {
      type: "GIVE_NOTIFICATION",
      playerId,
      card: drawn.card,
      deckId: "notifications"
    };
    return ok({
      ...drawn.state,
      pendingActions: [...drawn.state.pendingActions, pendingAction]
    }, { pendingAction });
  }

  if (area.effect === "draw-white" || area.effect === "draw-black") {
    const deckId = area.effect === "draw-white" ? "white" : "black";
    const drawn = drawCard(state, deckId, playerId);
    if (!drawn.ok) {
      return drawn;
    }

    const pendingAction = {
      type: "RESOLVE_DRAWN_CARD",
      playerId,
      card: drawn.card,
      deckId
    };
    return ok({
      ...drawn.state,
      pendingActions: [...drawn.state.pendingActions, pendingAction]
    }, { pendingAction });
  }

  if (area.effect === "choose-deck-and-draw") {
    const pendingAction = { type: "CHOOSE_AREA_DECK", playerId };
    return ok({
      ...state,
      pendingActions: [...state.pendingActions, pendingAction]
    }, { pendingAction });
  }

  if (area.effect === "damage-or-heal") {
    const pendingAction = { type: "TOXIC_RELATIONSHIP_CHOICE", playerId };
    return ok({
      ...state,
      pendingActions: [...state.pendingActions, pendingAction]
    }, { pendingAction });
  }

  if (area.effect === "steal-equipment") {
    const hasAvailableEquipment = Object.values(state.players).some((target) => (
      target.alive && target.id !== playerId && target.equipment.length > 0
    ));
    if (!hasAvailableEquipment) return ok(state);

    const pendingAction = { type: "PICKPOCKET_CHOICE", playerId };
    return ok({
      ...state,
      pendingActions: [...state.pendingActions, pendingAction]
    }, { pendingAction });
  }

  return failure(state, "UNSUPPORTED_AREA_EFFECT", "This area effect is not registered.");
};

export const resolveAreaPendingAction = (state, pendingAction, choice) => {
  if (!state.pendingActions.includes(pendingAction)) {
    return failure(state, "UNKNOWN_PENDING_ACTION", "This pending action is no longer active.");
  }

  if (pendingAction.type === "CHOOSE_AREA_DECK") {
    if (!["notifications", "white", "black"].includes(choice)) {
      return failure(state, "INVALID_DECK", "Choose a valid card deck.");
    }

    const drawn = drawCard({ ...state, pendingActions: state.pendingActions.filter((action) => action !== pendingAction) }, choice, pendingAction.playerId);
    if (!drawn.ok) {
      return drawn;
    }

    const nextAction = {
      type: "RESOLVE_DRAWN_CARD",
      playerId: pendingAction.playerId,
      card: drawn.card,
      deckId: choice
    };
    return ok({
      ...drawn.state,
      pendingActions: [...drawn.state.pendingActions, nextAction]
    }, { pendingAction: nextAction });
  }

  if (pendingAction.type === "RESOLVE_DRAWN_CARD") {
    const resolved = resolveCard(state, pendingAction.playerId, pendingAction.card);
    if (!resolved.ok) {
      return resolved;
    }

    const withoutAction = {
      ...resolved.state,
      pendingActions: resolved.state.pendingActions.filter((action) => action !== pendingAction)
    };
    const discarded = pendingAction.card.type === "single-use"
      ? discardCard(withoutAction, pendingAction.deckId, pendingAction.card)
      : ok(withoutAction);
    return discarded;
  }

  if (pendingAction.type === "GIVE_NOTIFICATION") {
    const target = state.players[choice];
    if (!target || !target.alive || choice === pendingAction.playerId) {
      return failure(state, "INVALID_TARGET", "Choose another living player.");
    }

    const withoutAction = {
      ...state,
      pendingActions: state.pendingActions.filter((action) => action !== pendingAction)
    };
    if (target.characterId === "poker-face") {
      const pokerAction = {
        type: "POKER_FACE_NOTIFICATION",
        playerId: choice,
        card: pendingAction.card,
        deckId: pendingAction.deckId
      };
      return ok({
        ...withoutAction,
        pendingActions: [...withoutAction.pendingActions, pokerAction]
      }, { pendingAction: pokerAction });
    }
    const resolved = resolveCard(withoutAction, choice, pendingAction.card);
    return discardCard(resolved.state, pendingAction.deckId, pendingAction.card);
  }

  if (pendingAction.type === "POKER_FACE_NOTIFICATION") {
    const withoutAction = {
      ...state,
      pendingActions: state.pendingActions.filter((action) => action !== pendingAction)
    };
    if (choice === "lie") {
      return discardCard(withoutAction, pendingAction.deckId, pendingAction.card);
    }
    if (choice !== "resolve") {
      return failure(state, "INVALID_CHOICE", "Choose whether to lie or resolve the Notification.");
    }
    const resolved = resolveCard(withoutAction, pendingAction.playerId, pendingAction.card);
    return discardCard(resolved.state, pendingAction.deckId, pendingAction.card);
  }

  if (pendingAction.type === "TOXIC_RELATIONSHIP_CHOICE") {
    const target = state.players[choice.targetId];
    if (!target?.alive || !["damage", "heal"].includes(choice.action)) {
      return failure(state, "INVALID_CHOICE", "Choose a living target and damage or heal.");
    }

    const withoutAction = { ...state, pendingActions: state.pendingActions.filter((action) => action !== pendingAction) };
    const result = choice.action === "damage"
      ? dealDamage(withoutAction, choice.targetId, 2, { source: pendingAction.playerId, sourceType: "area", cardId: "toxic-relationship" })
      : heal(withoutAction, choice.targetId, 1);
    return result;
  }

  if (pendingAction.type === "PICKPOCKET_CHOICE") {
    const target = state.players[choice.targetId];
    if (!target?.alive || target.id === pendingAction.playerId || !target.equipment.includes(choice.cardId)) {
      return failure(state, "INVALID_EQUIPMENT", "Choose equipment held by a living target.");
    }

    const withoutAction = { ...state, pendingActions: state.pendingActions.filter((action) => action !== pendingAction) };
    const from = withoutAction.players[choice.targetId];
    const to = withoutAction.players[pendingAction.playerId];
    return ok({
      ...withoutAction,
      players: {
        ...withoutAction.players,
        [choice.targetId]: { ...from, equipment: from.equipment.filter((cardId) => cardId !== choice.cardId) },
        [pendingAction.playerId]: { ...to, equipment: [...to.equipment, choice.cardId] }
      },
      events: [...withoutAction.events, {
        type: "EQUIPMENT_STOLEN",
        fromPlayerId: choice.targetId,
        toPlayerId: pendingAction.playerId,
        cardId: choice.cardId
      }]
    });
  }

  return failure(state, "UNSUPPORTED_PENDING_ACTION", "This area pending action is not registered.");
};