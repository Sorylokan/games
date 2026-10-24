src/data/areas.js
```
export const AREAS = Object.freeze({
  OTAKUS_PARADISE: Object.freeze({
    id: "otakus-paradise",
    nameKey: "areas.otakusParadise.name",
    dieTotals: [2, 3],
    effect: "draw-notification-and-give",
    effectKey: "areas.otakusParadise.effect"
  }),
  BED_OF_YOUR_DREAMS: Object.freeze({
    id: "bed-of-your-dreams",
    nameKey: "areas.bedOfYourDreams.name",
    dieTotals: [4, 5],
    effect: "draw-white",
    effectKey: "areas.bedOfYourDreams.effect"
  }),
  GRANDMAS_NEW_BEDROOM: Object.freeze({
    id: "grandmas-new-bedroom",
    nameKey: "areas.grandmasNewBedroom.name",
    dieTotals: [6],
    effect: "draw-black",
    effectKey: "areas.grandmasNewBedroom.effect"
  }),
  ATTIC_HATCH: Object.freeze({
    id: "attic-hatch",
    nameKey: "areas.atticHatch.name",
    dieTotals: [8],
    effect: "choose-deck-and-draw",
    effectKey: "areas.atticHatch.effect"
  }),
  TOXIC_RELATIONSHIP: Object.freeze({
    id: "toxic-relationship",
    nameKey: "areas.toxicRelationship.name",
    dieTotals: [9],
    effect: "damage-or-heal",
    effectKey: "areas.toxicRelationship.effect"
  }),
  PICKPOCKET_BOULEVARD: Object.freeze({
    id: "pickpocket-boulevard",
    nameKey: "areas.pickpocketBoulevard.name",
    dieTotals: [10],
    effect: "steal-equipment",
    effectKey: "areas.pickpocketBoulevard.effect"
  })
});

export const AREA_BY_DIE_TOTAL = Object.freeze(
  Object.fromEntries(
    Object.values(AREAS).flatMap((area) => area.dieTotals.map((total) => [total, area.id]))
  )
);

export const getAreaForDieTotal = (total) => AREA_BY_DIE_TOTAL[total] ?? null;
```

src/data/cards.js
```
const card = (id, deck, type, nameKey, textKey, effect) => Object.freeze({
  id,
  deck,
  type,
  nameKey,
  textKey,
  effect
});

export const CARDS = Object.freeze([
  card("grandpas-advice", "notifications", "single-use", "cards.notifications.grandpasAdvice.name", "cards.notifications.grandpasAdvice.text", "faction-heal-or-damage"),
  card("unsolicited-life-advice", "notifications", "single-use", "cards.notifications.unsolicitedLifeAdvice.name", "cards.notifications.unsolicitedLifeAdvice.text", "faction-heal-or-damage"),
  card("get-over-here", "notifications", "single-use", "cards.notifications.getOverHere.name", "cards.notifications.getOverHere.text", "faction-heal-or-damage"),
  card("pay-me-or-else", "notifications", "single-use", "cards.notifications.payMeOrElse.name", "cards.notifications.payMeOrElse.text", "faction-or-equipment"),
  card("pay-me-or-else-2", "notifications", "single-use", "cards.notifications.payMeOrElse.name", "cards.notifications.payMeOrElse.text", "faction-or-equipment"),
  card("unresolved-issues", "notifications", "single-use", "cards.notifications.unresolvedIssues.name", "cards.notifications.unresolvedIssues.text", "faction-or-equipment"),
  card("unresolved-issues-2", "notifications", "single-use", "cards.notifications.unresolvedIssues.name", "cards.notifications.unresolvedIssues.text", "faction-or-equipment"),
  card("tax-collection", "notifications", "single-use", "cards.notifications.taxCollection.name", "cards.notifications.taxCollection.text", "faction-or-equipment"),
  card("tax-collection-2", "notifications", "single-use", "cards.notifications.taxCollection.name", "cards.notifications.taxCollection.text", "faction-or-equipment"),
  card("bonk", "notifications", "single-use", "cards.notifications.bonk.name", "cards.notifications.bonk.text", "faction-damage"),
  card("bonk-2", "notifications", "single-use", "cards.notifications.bonk.name", "cards.notifications.bonk.text", "faction-damage"),
  card("emotional-alt-f4", "notifications", "single-use", "cards.notifications.emotionalAltF4.name", "cards.notifications.emotionalAltF4.text", "faction-damage"),
  card("rest-in-piss", "notifications", "single-use", "cards.notifications.restInPiss.name", "cards.notifications.restInPiss.text", "faction-damage-2"),
  card("skill-issue", "notifications", "single-use", "cards.notifications.skillIssue.name", "cards.notifications.skillIssue.text", "max-hp-damage"),
  card("character-development", "notifications", "single-use", "cards.notifications.characterDevelopment.name", "cards.notifications.characterDevelopment.text", "max-hp-damage-2"),
  card("spoiler-alert", "notifications", "single-use", "cards.notifications.spoilerAlert.name", "cards.notifications.spoilerAlert.text", "reveal-to-current-player"),
  card("judgement-beam", "white", "single-use", "cards.white.judgementBeam.name", "cards.white.judgementBeam.text", "damage-all-except-self-2"),
  card("emotional-damage", "white", "single-use", "cards.white.emotionalDamage.name", "cards.white.emotionalDamage.text", "set-hp-2"),
  card("forbidden-google-search", "white", "single-use", "cards.white.forbiddenGoogleSearch.name", "cards.white.forbiddenGoogleSearch.text", "extra-turn"),
  card("personal-bodyguard", "white", "single-use", "cards.white.personalBodyguard.name", "cards.white.personalBodyguard.text", "attack-immunity"),
  card("ctrl-z-enchantment", "white", "single-use", "cards.white.ctrlZEnchantment.name", "cards.white.ctrlZEnchantment.text", "conditional-reveal-v-or-w"),
  card("devine-juice", "white", "single-use", "cards.white.devineJuice.name", "cards.white.devineJuice.text", "heal-self-2"),
  card("devine-juice-2", "white", "single-use", "cards.white.devineJuice.name", "cards.white.devineJuice.text", "heal-self-2"),
  card("plus-one-from-god", "white", "single-use", "cards.white.plusOneFromGod.name", "cards.white.plusOneFromGod.text", "target-heal-die-6"),
  card("therapy-snack", "white", "single-use", "cards.white.therapySnack.name", "cards.white.therapySnack.text", "conditional-full-heal-a-e-u"),
  card("christmas-dlc", "white", "single-use", "cards.white.christmasDlc.name", "cards.white.christmasDlc.text", "conditional-full-heal-memer"),
  card("luck-exe", "white", "equipment", "cards.equipment.luckExe.name", "cards.equipment.luckExe.text", "immune-toxic-relationship"),
  card("suspicious-necklace", "white", "equipment", "cards.equipment.suspiciousNecklace.name", "cards.equipment.suspiciousNecklace.text", "immune-black-cards"),
  card("google-maps-medieval-edition", "white", "equipment", "cards.equipment.googleMapsMedievalEdition.name", "cards.equipment.googleMapsMedievalEdition.text", "optional-double-movement-roll"),
  card("gods-hand-spinner", "white", "equipment", "cards.equipment.godsHandSpinner.name", "cards.equipment.godsHandSpinner.text", "steal-all-equipment-on-kill"),
  card("telescopic-lance", "white", "equipment", "cards.equipment.telescopicLance.name", "cards.equipment.telescopicLance.text", "optional-memer-attack-bonus"),
  card("jesus-last-pajamas", "white", "equipment", "cards.equipment.jesusLastPajamas.name", "cards.equipment.jesusLastPajamas.text", "forced-four-sided-attack"),
  card("bloodthirsty-flying-rat", "black", "single-use", "cards.black.bloodthirstyFlyingRat.name", "cards.black.bloodthirstyFlyingRat.text", "damage-2-heal-self-1"),
  card("bloodthirsty-flying-rat-2", "black", "single-use", "cards.black.bloodthirstyFlyingRat.name", "cards.black.bloodthirstyFlyingRat.text", "damage-2-heal-self-1"),
  card("bloodthirsty-flying-rat-3", "black", "single-use", "cards.black.bloodthirstyFlyingRat.name", "cards.black.bloodthirstyFlyingRat.text", "damage-2-heal-self-1"),
  card("gimme-that", "black", "single-use", "cards.black.gimmeThat.name", "cards.black.gimmeThat.text", "steal-one-equipment"),
  card("borrowing-without-asking", "black", "single-use", "cards.black.borrowingWithoutAsking.name", "cards.black.borrowingWithoutAsking.text", "steal-one-equipment"),
  card("mischievous-spider", "black", "single-use", "cards.black.mischievousSpider.name", "cards.black.mischievousSpider.text", "damage-2-self-2"),
  card("authentic-voodoo-doll", "black", "single-use", "cards.black.authenticVoodooDoll.name", "cards.black.authenticVoodooDoll.text", "voodoo-die-6"),
  card("explosive-stick", "black", "single-use", "cards.black.explosiveStick.name", "cards.black.explosiveStick.text", "area-damage-3"),
  card("not-a-banana-peel", "black", "single-use", "cards.black.notABananaPeel.name", "cards.black.notABananaPeel.text", "give-equipment-or-damage"),
  card("questionable-life-choices", "black", "single-use", "cards.black.questionableLifeChoices.name", "cards.black.questionableLifeChoices.text", "conditional-full-heal-troller"),
  card("shark-teeth", "black", "equipment", "cards.equipment.sharkTeeth.name", "cards.equipment.sharkTeeth.text", "attack-bonus-1"),
  card("free-circumcision", "black", "equipment", "cards.equipment.freeCircumcision.name", "cards.equipment.freeCircumcision.text", "attack-bonus-1"),
  card("plank-rusty-nails", "black", "equipment", "cards.equipment.plankRustyNails.name", "cards.equipment.plankRustyNails.text", "attack-bonus-1"),
  card("pfrt-tube", "black", "equipment", "cards.equipment.pfrtTube.name", "cards.equipment.pfrtTube.text", "attack-all-in-range"),
  card("finger-bullet", "black", "equipment", "cards.equipment.fingerBullet.name", "cards.equipment.fingerBullet.text", "attack-all-other-areas"),
  card("cursed-japanese-chopsticks", "black", "equipment", "cards.equipment.cursedJapaneseChopsticks.name", "cards.equipment.cursedJapaneseChopsticks.text", "forced-four-sided-attack")
]);

export const getCardsByDeck = (deck) => CARDS.filter((currentCard) => currentCard.deck === deck);

export const getCard = (cardId) => CARDS.find((currentCard) => currentCard.id === cardId) ?? null;
```

src/data/character.js
```
export const CHARACTERS = Object.freeze({
  DOGE: Object.freeze({ id: "doge", initial: "d", nameKey: "characters.doge.name", abilityKey: "characters.doge.ability", winConditionKey: "characters.doge.winCondition", faction: "user", maxHp: 8 }),
  PAY_TO_WIN: Object.freeze({ id: "pay-to-win", initial: "p", nameKey: "characters.payToWin.name", abilityKey: "characters.payToWin.ability", winConditionKey: "characters.payToWin.winCondition", faction: "user", maxHp: 10 }),
  JOHN_WICK: Object.freeze({ id: "john-wick", initial: "j", nameKey: "characters.johnWick.name", abilityKey: "characters.johnWick.ability", winConditionKey: "characters.johnWick.winCondition", faction: "user", maxHp: 11 }),
  PRESS_F: Object.freeze({ id: "press-f", initial: "p", nameKey: "characters.pressF.name", abilityKey: "characters.pressF.ability", winConditionKey: "characters.pressF.winCondition", faction: "user", maxHp: 13 }),
  PARKOUR_GUY: Object.freeze({ id: "parkour-guy", initial: "p", nameKey: "characters.parkourGuy.name", abilityKey: "characters.parkourGuy.ability", winConditionKey: "characters.parkourGuy.winCondition", faction: "memer", maxHp: 10 }),
  DEATH_NOTE: Object.freeze({ id: "death-note", initial: "d", nameKey: "characters.deathNote.name", abilityKey: "characters.deathNote.ability", winConditionKey: "characters.deathNote.winCondition", faction: "memer", maxHp: 12 }),
  HADOUKEN: Object.freeze({ id: "hadouken", initial: "h", nameKey: "characters.hadouken.name", abilityKey: "characters.hadouken.ability", winConditionKey: "characters.hadouken.winCondition", faction: "memer", maxHp: 14 }),
  POKER_FACE: Object.freeze({ id: "poker-face", initial: "p", nameKey: "characters.pokerFace.name", abilityKey: "characters.pokerFace.ability", winConditionKey: "characters.pokerFace.winCondition", faction: "troller", maxHp: 11 }),
  LIFE_STONKS: Object.freeze({ id: "life-stonks", initial: "l", nameKey: "characters.lifeStonks.name", abilityKey: "characters.lifeStonks.ability", winConditionKey: "characters.lifeStonks.winCondition", faction: "troller", maxHp: 13 }),
  SURPRISE_MF: Object.freeze({ id: "surprise-mf", initial: "s", nameKey: "characters.surpriseMf.name", abilityKey: "characters.surpriseMf.ability", winConditionKey: "characters.surpriseMf.winCondition", faction: "troller", maxHp: 14 })
});

export const getCharacter = (characterId) => {
  const character = Object.values(CHARACTERS).find(({ id }) => id === characterId);

  if (!character) {
    throw new Error(`Unknown character: ${characterId}`);
  }

  return character;
};
```

src/game/abilities.js
```
import { getAdjacentAreaIds } from "../movement.js";
import { dealDamage } from "./rules-engine.js";

const ok = (state, result = {}) => ({ ok: true, state, ...result });
const failure = (state, error, message) => ({ ok: false, state, error, message });

const ABILITY_BY_CHARACTER = Object.freeze({
  "parkour-guy": "parkour-move",
  "death-note": "death-note-strike",
  hadouken: "hadouken-strike"
});

const ABILITY_DICE = Object.freeze({
  "death-note-strike": 6,
  "hadouken-strike": 4
});

const addPendingAction = (state, pendingAction) => ({
  ...state,
  pendingActions: [...state.pendingActions, pendingAction]
});

const getPlayer = (state, playerId) => state.players[playerId];

export const requestAbility = (state, playerId, choice = {}) => {
  const player = getPlayer(state, playerId);

  if (!player) {
    return failure(state, "UNKNOWN_PLAYER", "The player does not exist.");
  }

  if (!player.alive) {
    return failure(state, "PLAYER_DEAD", "A dead player cannot use an ability.");
  }

  const abilityId = ABILITY_BY_CHARACTER[player.characterId];
  if (!abilityId) {
    return failure(state, "NO_ACTIVE_ABILITY", "This character has no ability in this activation group.");
  }

  if (player.abilityState[abilityId]) {
    return failure(state, "ABILITY_ALREADY_USED", "This ability has already been used.");
  }

  const pendingAction = {
    type: "ACTIVATE_ABILITY",
    abilityId,
    playerId,
    choice,
    requiresRevealConfirmation: !player.revealed
  };

  return ok(addPendingAction(state, pendingAction), { pendingAction });
};

export const resolveAbility = (state, pendingAction, choice = {}, { rollDie } = {}) => {
  if (!state.pendingActions.includes(pendingAction) || pendingAction.type !== "ACTIVATE_ABILITY") {
    return failure(state, "UNKNOWN_PENDING_ACTION", "This ability activation is no longer active.");
  }

  const player = getPlayer(state, pendingAction.playerId);
  if (!player || !player.alive) {
    return failure(state, "PLAYER_DEAD", "The ability owner is no longer alive.");
  }

  if (pendingAction.requiresRevealConfirmation && choice.confirmReveal !== true) {
    return failure(state, "REVEAL_CONFIRMATION_REQUIRED", "Confirm the public identity reveal before using this ability.");
  }

  let nextState = {
    ...state,
    pendingActions: state.pendingActions.filter((action) => action !== pendingAction),
    players: {
      ...state.players,
      [player.id]: {
        ...player,
        revealed: true,
        abilityState: { ...player.abilityState, [pendingAction.abilityId]: true }
      }
    },
    events: [...state.events, {
      type: "ABILITY_USED",
      playerId: player.id,
      abilityId: pendingAction.abilityId
    }, ...(player.revealed ? [] : [{
      type: "CHARACTER_REVEALED",
      playerId: player.id,
      reason: "ABILITY_ACTIVATED"
    }])]
  };

  if (pendingAction.abilityId === "parkour-move") {
    const destinations = getAdjacentAreaIds(nextState.board, player.areaId);
    if (!destinations.includes(choice.areaId)) {
      return failure(state, "INVALID_DESTINATION", "Parkour Guy must move to an adjacent Area.");
    }

    nextState = {
      ...nextState,
      players: {
        ...nextState.players,
        [player.id]: { ...nextState.players[player.id], areaId: choice.areaId }
      },
      events: [...nextState.events, {
        type: "PLAYER_MOVED",
        playerId: player.id,
        areaId: choice.areaId,
        reason: "ABILITY"
      }]
    };
    return ok(nextState);
  }

  if (pendingAction.abilityId === "death-note-strike" || pendingAction.abilityId === "hadouken-strike") {
    const target = getPlayer(nextState, choice.targetId);
    if (!target || !target.alive) {
      return failure(state, "INVALID_TARGET", "Choose a living target.");
    }

    const sides = ABILITY_DICE[pendingAction.abilityId];
    const amount = (rollDie ?? ((dieSides) => Math.floor(Math.random() * dieSides) + 1))(sides);
    const result = dealDamage(nextState, target.id, amount, {
      source: player.id,
      sourceType: "ability"
    });

    return ok({
      ...result.state,
      events: [...result.state.events, {
        type: "ABILITY_DAMAGE_RESOLVED",
        playerId: player.id,
        targetId: target.id,
        abilityId: pendingAction.abilityId,
        amount
      }]
    }, { amount });
  }

  return failure(state, "UNSUPPORTED_ABILITY", "This ability is not registered.");
};
```

src/game/areas.js
```
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
    const drawn = drawCard(state, "notifications");
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
    const drawn = drawCard(state, deckId);
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

    const drawn = drawCard({ ...state, pendingActions: state.pendingActions.filter((action) => action !== pendingAction) }, choice);
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
```

src/game/cards.js
```
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

export const drawCard = (state, deckId) => {
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
    events: [...state.events, { type: "CARD_DRAWN", deckId, cardId: card.id }]
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
    const applies = card.effect.startsWith("max-hp")
      ? player.maxHp <= 11
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

  if (pendingAction.type === "CHOOSE_EQUIPMENT_REWARD") {
    const victim = state.players[pendingAction.victimId];
    const killer = state.players[pendingAction.killerId];

    if (!victim || !killer || !pendingAction.cardIds.includes(choice) || !victim.equipment.includes(choice)) {
      return failure(state, "INVALID_CHOICE", "The selected equipment is not available.");
    }

    const remainingVictimEquipment = victim.equipment.filter((cardId) => cardId !== choice);
    const nextState = removePendingAction({
      ...state,
      players: {
        ...state.players,
        [pendingAction.victimId]: { ...victim, equipment: [] },
        [pendingAction.killerId]: {
          ...killer,
          equipment: [...killer.equipment, choice]
        }
      },
      events: [...state.events, {
        type: "EQUIPMENT_REWARDED",
        killerId: pendingAction.killerId,
        victimId: pendingAction.victimId,
        cardId: choice,
        discardedCardIds: remainingVictimEquipment
      }]
    }, pendingAction);

    return ok(nextState);
  }

  return failure(state, "UNSUPPORTED_PENDING_ACTION", "This pending action is not registered.");
};
```

src/game/combat.js
```
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

  return attackerPosition !== null && targetPosition !== null && (
    canAttackFromPosition(state.board, attackerPosition, targetPosition) ||
    attacker.equipment.includes("finger-bullet")
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
```

src/game/event-resolver.js
```
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
```

src/game/game-state.js
```
export const GAME_PHASES = Object.freeze({
  SETUP: "setup",
  START_TURN: "start-turn",
  MOVEMENT: "movement",
  AREA_ACTION: "area-action",
  OPTIONAL_ACTIONS: "optional-actions",
  ATTACK: "attack",
  RESOLUTION: "resolution",
  VICTORY_CHECK: "victory-check",
  END_TURN: "end-turn",
  GAME_OVER: "game-over"
});

export const createPlayer = ({ id, name, character }) => ({
  id,
  name,
  characterId: character.id,
  faction: character.faction,
  areaId: null,
  maxHp: character.maxHp,
  hp: character.maxHp,
  equipment: [],
  alive: true,
  revealed: false,
  abilityState: {}
});

export const createGameState = ({ players = [], turnOrder = [] } = {}) => ({
  phase: GAME_PHASES.SETUP,
  currentPlayerId: null,
  queuedTurns: [],
  turnOrder,
  board: null,
  decks: {},
  players: Object.fromEntries(players.map((player) => [player.id, player])),
  bodyCount: 0,
  firstDeathPlayerId: null,
  winners: [],
  gameOver: false,
  temporaryEffects: [],
  privateRevelations: {},
  pendingActions: [],
  events: []
});
```

src/game/rules-engine.js
```
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
  const killer = context.source ? state.players[context.source] : null;
  const remainingEquipment = killer?.equipment.includes("gods-hand-spinner") ? [] : player.equipment;
  const rewardAction = killer && player.equipment.length > 0 && !killer.equipment.includes("gods-hand-spinner")
    ? [{
      type: "CHOOSE_EQUIPMENT_REWARD",
      playerId: killer.id,
      killerId: killer.id,
      victimId: playerId,
      cardIds: player.equipment
    }]
    : [];
  const transferredEquipment = killer?.equipment.includes("gods-hand-spinner")
    ? [...killer.equipment, ...player.equipment]
    : killer?.equipment;
  const nextPlayers = {
    ...revealedPlayers,
    [playerId]: { ...revealedPlayers[playerId], hp: 0, alive: false, revealed: true }
  };
  if (killer && transferredEquipment) {
    nextPlayers[killer.id] = { ...nextPlayers[killer.id], equipment: transferredEquipment };
  }
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
```

src/game/setup.js
```
import { createBoard } from "../board.js";
import { CARDS, getCardsByDeck } from "../data/cards.js";
import { CHARACTERS } from "../data/characters.js";
import { createGameState, createPlayer } from "./game-state.js";
import { createDeckState } from "./cards.js";

const PLAYER_COUNTS = Object.freeze({
  4: Object.freeze({ memer: 2, troller: 2, user: 0 }),
  5: Object.freeze({ memer: 2, troller: 2, user: 1 }),
  6: Object.freeze({ memer: 2, troller: 2, user: 2 }),
  7: Object.freeze({ memer: 2, troller: 2, user: 3 }),
  8: Object.freeze({ memer: 3, troller: 3, user: 2 })
});

const shuffle = (items, random) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

const getCharactersForFaction = (faction) => Object.values(CHARACTERS)
  .filter((character) => character.faction === faction);

export const getCharacterAllocation = (playerCount) => PLAYER_COUNTS[playerCount] ?? null;

export const createLocalGame = (
  playerInputs,
  { random = Math.random, startingPlayerIndex = 0 } = {}
) => {
  const allocation = getCharacterAllocation(playerInputs.length);

  if (!allocation) {
    throw new Error("Free the Memes supports 4 to 8 players.");
  }

  const factionCharacters = Object.entries(allocation).flatMap(([faction, count]) => (
    shuffle(getCharactersForFaction(faction), random).slice(0, count)
  ));
  const characters = shuffle(factionCharacters, random);
  const players = playerInputs.map((input, index) => (
    createPlayer({
      id: input.id,
      name: input.name,
      character: characters[index]
    })
  ));
  const turnOrder = players.map((player) => player.id);
  const decks = Object.fromEntries(
    ["notifications", "white", "black"].map((deckId) => [
      deckId,
      createDeckState(getCardsByDeck(deckId), random)
    ])
  );

  if (!Number.isInteger(startingPlayerIndex) || startingPlayerIndex < 0 || startingPlayerIndex >= players.length) {
    throw new Error("The starting player index is invalid.");
  }

  return {
    ...createGameState({ players, turnOrder }),
    board: createBoard(random),
    decks,
    currentPlayerId: turnOrder[startingPlayerIndex]
  };
};

export { PLAYER_COUNTS };
```

src/game/simulation.js
```
import { createBoard } from "../board.js";
import { CHARACTERS } from "../data/characters.js";
import { attack, resolveCombatPendingAction } from "./combat.js";
import { createGameState, createPlayer } from "./game-state.js";
import { resolveMovementAction } from "../movement.js";
import { beginTurn, completeAreaAction, completeAttack, completeMovement, endTurn, startGame } from "./turn-manager.js";

const players = [
  createPlayer({ id: "memer-1", name: "Alice", character: CHARACTERS.PARKOUR_GUY }),
  createPlayer({ id: "memer-2", name: "Bob", character: CHARACTERS.DEATH_NOTE }),
  createPlayer({ id: "troller-1", name: "Cara", character: CHARACTERS.POKER_FACE }),
  createPlayer({ id: "troller-2", name: "Dan", character: CHARACTERS.SURPRISE_MF })
];

const rollEight = (sides) => sides === 6 ? 6 : 2;
const rollFour = () => 4;

const requireSuccess = (result) => {
  if (!result.ok) {
    throw new Error(`${result.error}: ${result.message ?? "simulation action failed"}`);
  }

  return result.state;
};

const takeMovementAndReachAttack = (state, playerId) => {
  let nextState = requireSuccess(beginTurn(state, playerId));
  nextState = requireSuccess(resolveMovementAction(nextState, playerId, { rollDie: rollEight }));
  nextState = requireSuccess(completeMovement(nextState, playerId));
  nextState = requireSuccess(completeAreaAction(nextState, playerId));
  return nextState;
};

const attackUntilDead = (state, attackerId, targetId) => {
  let nextState = state;

  while (nextState.players[targetId].alive) {
    const result = attack(nextState, attackerId, targetId, {
      rollDie: rollEight
    });
    nextState = requireSuccess(result);

    const reaction = nextState.pendingActions.find((action) => (
      action.type === "SURPRISE_COUNTERATTACK" && action.playerId === targetId
    ));
    if (reaction) {
      nextState = requireSuccess(resolveCombatPendingAction(nextState, reaction, {
        confirmReveal: true
      }, { rollDie: rollFour }));
    }
  }

  return nextState;
};

export const runLocalSimulation = () => {
  const board = createBoard(() => 0);
  const startingArea = board.areaAtPosition[1];
  let state = {
    ...createGameState({ players, turnOrder: players.map((player) => player.id) }),
    board
  };

  state = requireSuccess(startGame(state));
  state = takeMovementAndReachAttack(state, "memer-1");
  state = { ...state, players: Object.fromEntries(Object.values(state.players).map((player) => [
    player.id,
    { ...player, areaId: startingArea }
  ])) };
  state = attackUntilDead(state, "memer-1", "troller-1");
  state = requireSuccess(completeAttack(state, "memer-1"));
  state = requireSuccess(endTurn(state, "memer-1"));

  state = takeMovementAndReachAttack(state, "memer-2");
  const secondAttackArea = state.players["memer-2"].areaId;
  state = {
    ...state,
    players: Object.fromEntries(Object.values(state.players).map((player) => [
      player.id,
      { ...player, areaId: secondAttackArea }
    ]))
  };
  state = attackUntilDead(state, "memer-2", "troller-2");

  return state;
};
```

src/game/turn-manager.js
```
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
  const livingPlayerIds = getLivingPlayerIds(state);
  const currentIndex = livingPlayerIds.indexOf(playerId);

  if (currentIndex < 0 || livingPlayerIds.length === 0) {
    return null;
  }

  return livingPlayerIds[(currentIndex + 1) % livingPlayerIds.length];
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
```

src/game/victory.js
```
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
```

src/networking/game-session.js
```
import { HostAuthority } from "./host-authority.js";
import { MESSAGE_TYPES } from "./messages.js";
import { serializeStateForPlayer } from "./serialization.js";

export const createHostSession = (state, transport, options = {}) => {
    const authority = new HostAuthority({ state, transport, random: options.random, onStateChange: options.onStateChange });
  const unsubscribeRequest = transport.on(MESSAGE_TYPES.REQUEST_ACTION, ({ message, peerId }) => {
    authority.handleRequest(message, peerId);
  });
  const unsubscribeHello = transport.on(MESSAGE_TYPES.PLAYER_HELLO, ({ message, peerId }) => {
    authority.assignPeer(peerId, message.name, message.seatToken);
  });
  const unsubscribeLeave = transport.on(MESSAGE_TYPES.PLAYER_LEFT, ({ peerId }) => {
    authority.releasePeer(peerId);
  });

  transport.sendPublic({
    type: MESSAGE_TYPES.STATE_UPDATE,
    state: serializeStateForPlayer(authority.state, "").publicState
  });

  return {
    authority,
    dispose: () => {
      unsubscribeRequest();
      unsubscribeHello();
      unsubscribeLeave();
    }
  };
};

export const createClientSession = (transport, onState, onAssigned = () => {}) => {
  const unsubscribePublic = transport.on(MESSAGE_TYPES.STATE_UPDATE, ({ message }) => {
    onState({ publicState: message.state, privateState: null });
  });
  const unsubscribePrivate = transport.on(MESSAGE_TYPES.PRIVATE_STATE_UPDATE, ({ message }) => {
    onState({ publicState: null, privateState: message.state });
  });
  const unsubscribeAssigned = transport.on(MESSAGE_TYPES.PLAYER_ASSIGNED, ({ message }) => {
    onAssigned(message.playerId);
  });

  return {
    requestAction: (request) => transport.sendActionRequest(request),
    dispose: () => {
      unsubscribePublic();
      unsubscribePrivate();
      unsubscribeAssigned();
    }
  };
};
```

src/networking/host-authority.js
```
import { MESSAGE_TYPES } from "./messages.js";
import { serializeStateForPlayer } from "./serialization.js";
import { areaAttack, attack, mustAttack, resolveCombatPendingAction } from "../game/combat.js";
import { resolveMovementAction, resolveMovementDestination, resolveMovementRollChoice } from "../movement.js";
import { completeAreaAction, completeAttack, completeMovement, beginTurn, endTurn } from "../game/turn-manager.js";
import { GAME_PHASES } from "../game/game-state.js";
import { resolveEquipmentReward } from "../game/rules-engine.js";
import { resolveAreaAction, resolveAreaPendingAction } from "../game/areas.js";
import { resolvePendingAction } from "../game/cards.js";

const ACTIONS = Object.freeze({
  BEGIN_TURN: "BEGIN_TURN",
  MOVE: "MOVE",
  CHOOSE_MOVEMENT_DESTINATION: "CHOOSE_MOVEMENT_DESTINATION",
  CHOOSE_MOVEMENT_ROLL: "CHOOSE_MOVEMENT_ROLL",
  RESOLVE_AREA_ACTION: "RESOLVE_AREA_ACTION",
  RESOLVE_PENDING_ACTION: "RESOLVE_PENDING_ACTION",
  COMPLETE_AREA_ACTION: "COMPLETE_AREA_ACTION",
  ATTACK: "ATTACK",
  COMPLETE_ATTACK: "COMPLETE_ATTACK",
  RESOLVE_COMBAT_REACTION: "RESOLVE_COMBAT_REACTION",
  CHOOSE_EQUIPMENT_REWARD: "CHOOSE_EQUIPMENT_REWARD",
  END_TURN: "END_TURN",
});

const rejected = (state, error, message) => ({
  ok: false,
  state,
  message: {
    type: MESSAGE_TYPES.ERROR,
    error,
    message
  }
});

export class HostAuthority {
  #state;
  #transport;
  #random;
  #peerPlayers = new Map();
  #seatTokens = new Map();   // seatToken -> playerId : survit aux coupures de connexion
  #onStateChange;

  constructor({ state, transport, random = Math.random, onStateChange = () => {} }) {
    this.#state = state;
    this.#transport = transport;
    this.#random = random;
    this.#onStateChange = onStateChange;
  }

  get state() {
    return this.#state;
  }

  replaceState(state) {
    this.#state = state;
    this.#broadcast();
  }

  broadcast() {
    this.#broadcast();
  }

  assignPeer(peerId, name, seatToken = null) {
    if (!peerId) return null;
    const existingPlayerId = this.#peerPlayers.get(peerId);
    if (existingPlayerId) return existingPlayerId;

    // Reconnexion : un jeton de siege connu reprend son ancienne place, peu
    // importe le nouveau peerId attribue par la couche WebRTC.
    const returningPlayerId = seatToken ? this.#seatTokens.get(seatToken) : null;
    const returningPlayer = returningPlayerId ? this.#state.players[returningPlayerId] : null;
    const returningAssigned = returningPlayerId && [...this.#peerPlayers.values()].includes(returningPlayerId);
    if (returningPlayer && !returningAssigned) {
      this.#peerPlayers.set(peerId, returningPlayerId);
      this.#state = {
        ...this.#state,
        players: {
          ...this.#state.players,
          [returningPlayerId]: { ...returningPlayer, name: name?.trim() || returningPlayer.name }
        }
      };
      this.#transport.sendPrivate(peerId, {
        type: MESSAGE_TYPES.PLAYER_ASSIGNED,
        playerId: returningPlayerId,
        seatToken
      });
      this.#broadcast();
      return returningPlayerId;
    }

    const assignedIds = new Set(this.#peerPlayers.values());
    const player = Object.values(this.#state.players).find((candidate) => (
      candidate.id !== this.#state.turnOrder[0] && !assignedIds.has(candidate.id)
    ));
    if (!player) return null;

    this.#peerPlayers.set(peerId, player.id);
    if (seatToken) this.#seatTokens.set(seatToken, player.id);
    this.#state = {
      ...this.#state,
      players: {
        ...this.#state.players,
        [player.id]: { ...player, name: name?.trim() || player.name }
      }
    };
    this.#transport.sendPrivate(peerId, {
      type: MESSAGE_TYPES.PLAYER_ASSIGNED,
      playerId: player.id,
      seatToken
    });
    this.#broadcast();
    return player.id;
  }

  // Le pair part (coupure, onglet ferme) : on oublie le lien peerId -> joueur
  // pour qu'il puisse le reprendre avec son jeton, mais on garde #seatTokens.
  releasePeer(peerId) {
    this.#peerPlayers.delete(peerId);
  }

  handleRequest(request, peerId = null) {
    if (request?.type !== MESSAGE_TYPES.REQUEST_ACTION) {
      return rejected(this.#state, "INVALID_MESSAGE", "Expected an action request.");
    }

    const player = this.#state.players[request.playerId];
    if (!player) {
      return rejected(this.#state, "UNKNOWN_PLAYER", "The requesting player does not exist.");
    }

    if (peerId && this.#peerPlayers.get(peerId) !== request.playerId) {
      return rejected(this.#state, "PLAYER_ASSIGNMENT_MISMATCH", "This peer is not assigned to that player slot.");
    }

    // Pending combat reactions (e.g. Doge, Surprise MF) belong to their reaction owner,
    // who is not necessarily the active player - only gate on active-player for everything else.
    const pendingReaction = this.#state.pendingActions[0];
    const isOwnPendingReaction = ([ACTIONS.RESOLVE_COMBAT_REACTION, ACTIONS.CHOOSE_EQUIPMENT_REWARD, ACTIONS.RESOLVE_PENDING_ACTION].includes(request.action)) &&
      pendingReaction?.playerId === request.playerId;

    if (!isOwnPendingReaction && request.playerId !== this.#state.currentPlayerId) {
      return rejected(this.#state, "NOT_CURRENT_PLAYER", "Only the active player can request this action.");
    }

    const result = this.#resolve(request.action, request.payload ?? {}, request.playerId);
    if (!result.ok) {
      return rejected(this.#state, result.error, result.message);
    }

    this.#state = result.state;
    this.#broadcast();
    return { ok: true, state: this.#state };
  }

  // A move/attack that didn't spawn a pending reaction must auto-advance the phase,
  // otherwise the requester is stuck resending the same action forever.
  #finishMovement(result, playerId) {
    if (!result.ok || result.reroll || result.pendingAction) return result;
    return completeMovement(result.state, playerId);
  }

  #finishAttack(result, playerId) {
    if (!result.ok || result.pendingAction || result.state.pendingActions.length > 0) return result;
    // Si l'attaque a terminé la partie (ou changé de phase), il n'y a plus rien à clore.
    if (result.state.gameOver || result.state.phase !== GAME_PHASES.ATTACK) return result;
    return completeAttack(result.state, playerId);
  }

  #finishAreaAction(result, playerId) {
    if (!result.ok || result.state.pendingActions.length > 0 || result.state.phase !== GAME_PHASES.AREA_ACTION) return result;
    if (!result.state.players[playerId]?.alive) return result;
    return completeAreaAction(result.state, playerId);
  }

  // Reactions may belong to a player other than the active one (Doge, Surprise MF...),
  // so completion is always attributed to whoever is active once the chain settles.
  #finishReaction(result) {
    if (!result.ok || result.state.gameOver || result.state.pendingActions.length > 0 || result.state.phase !== GAME_PHASES.ATTACK) {
      return result;
    }
    return completeAttack(result.state, result.state.currentPlayerId);
  }

  #resolve(action, payload, playerId) {
    const rollDie = (sides) => Math.floor(this.#random() * sides) + 1;

    switch (action) {
      case ACTIONS.BEGIN_TURN:
        return beginTurn(this.#state, playerId);
      case ACTIONS.MOVE:
        return this.#finishMovement(resolveMovementAction(this.#state, playerId, { ...payload, rollDie }), playerId);
      case ACTIONS.CHOOSE_MOVEMENT_DESTINATION:
        return this.#finishMovement(resolveMovementDestination(this.#state, this.#state.pendingActions[0], payload.areaId), playerId);
      case ACTIONS.CHOOSE_MOVEMENT_ROLL:
        return this.#finishMovement(resolveMovementRollChoice(this.#state, this.#state.pendingActions[0], payload.rollIndex), playerId);
      case ACTIONS.RESOLVE_AREA_ACTION:
        if (this.#state.phase !== GAME_PHASES.AREA_ACTION) {
          return { ok: false, state: this.#state, error: "INVALID_PHASE", message: "Area actions can only be resolved during the area-action phase." };
        }
        return this.#finishAreaAction(resolveAreaAction(this.#state, playerId, this.#state.players[playerId]?.areaId), playerId);
      case ACTIONS.RESOLVE_PENDING_ACTION: {
        const pendingAction = this.#state.pendingActions[0];
        const areaActionTypes = new Set([
          "CHOOSE_AREA_DECK", "GIVE_NOTIFICATION", "POKER_FACE_NOTIFICATION",
          "RESOLVE_DRAWN_CARD", "TOXIC_RELATIONSHIP_CHOICE", "PICKPOCKET_CHOICE"
        ]);
        const result = areaActionTypes.has(pendingAction?.type)
          ? resolveAreaPendingAction(this.#state, pendingAction, payload.choice)
          : resolvePendingAction(this.#state, pendingAction, payload.choice, { rollDie });
        return this.#finishAreaAction(result, this.#state.currentPlayerId);
      }
      case ACTIONS.COMPLETE_AREA_ACTION:
        return completeAreaAction(this.#state, playerId);
      case ACTIONS.ATTACK:
        return this.#finishAttack(
          this.#state.players[playerId].equipment.includes("pfrt-tube")
            ? areaAttack(this.#state, playerId, { rollDie })
            : attack(this.#state, playerId, payload.targetId, { rollDie }),
          playerId
        );
      case ACTIONS.COMPLETE_ATTACK:
        if (mustAttack(this.#state, playerId)) {
          return { ok: false, error: "MUST_ATTACK", message: "You must attack while you hold this equipment." };
        }
        return completeAttack(this.#state, playerId);
      case ACTIONS.RESOLVE_COMBAT_REACTION:
        return this.#finishReaction(resolveCombatPendingAction(this.#state, this.#state.pendingActions[0], payload.choice ?? {}, { rollDie }));
      case ACTIONS.CHOOSE_EQUIPMENT_REWARD:
        return this.#finishReaction(resolveEquipmentReward(this.#state, this.#state.pendingActions[0], payload.cardId ?? null));
      case ACTIONS.END_TURN:
        return endTurn(this.#state, playerId);
      default:
        return rejected(this.#state, "UNKNOWN_ACTION", "The requested action is not supported.");
    }
  }

  #broadcast() {
    this.#transport.sendPublic({
      type: MESSAGE_TYPES.STATE_UPDATE,
      state: serializeStateForPlayer(this.#state, "").publicState
    });

    for (const [peerId, playerId] of this.#peerPlayers.entries()) {
      this.#transport.sendPrivate(
        peerId,
        {
          type: MESSAGE_TYPES.PRIVATE_STATE_UPDATE,
          state: serializeStateForPlayer(this.#state, playerId).privateState
        }
      );
    }

    this.#onStateChange(this.#state);
  }
}

export { ACTIONS };
```

src/networking/messages.js
```
export const MESSAGE_TYPES = Object.freeze({
  REQUEST_ACTION: "REQUEST_ACTION",
  STATE_UPDATE: "STATE_UPDATE",
  PRIVATE_STATE_UPDATE: "PRIVATE_STATE_UPDATE",
  PLAYER_JOINED: "PLAYER_JOINED",
  PLAYER_LEFT: "PLAYER_LEFT",
  GAME_STARTED: "GAME_STARTED",
  GAME_ENDED: "GAME_ENDED",
  ERROR: "ERROR"
  ,PLAYER_HELLO: "PLAYER_HELLO"
  ,PLAYER_ASSIGNED: "PLAYER_ASSIGNED"
});

export const createActionRequest = (playerId, action, payload = {}) => ({
  type: MESSAGE_TYPES.REQUEST_ACTION,
  playerId,
  action,
  payload
});
```

src/networking/network-adapter.js
```
export class NetworkAdapter {
  #handlers = new Map();

  on(type, handler) {
    this.#handlers.set(type, handler);
    return () => this.#handlers.delete(type);
  }

  emit(type, payload) {
    this.#handlers.get(type)?.(payload);
  }

  connect() {
    throw new Error("NetworkAdapter.connect must be implemented by a transport.");
  }

  disconnect() {
    throw new Error("NetworkAdapter.disconnect must be implemented by a transport.");
  }

  sendPublic() {
    throw new Error("NetworkAdapter.sendPublic must be implemented by a transport.");
  }

  sendPrivate() {
    throw new Error("NetworkAdapter.sendPrivate must be implemented by a transport.");
  }

  sendActionRequest(request) {
    this.emit("REQUEST_ACTION", { message: request, peerId: null });
  }
}
```

src/networking/room.js
```
// Codes de salle lisibles a voix haute : 8 symboles sans ambiguite (ni 0/O,
// ni 1/I/L), groupes 4-4. L'appId Trystero isole deja ces salles des autres
// applications, et ~32^8 combinaisons suffisent pour des parties privees.
const ROOM_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const ROOM_CODE_LENGTH = 8;

const defaultRandom = () => {
  if (globalThis.crypto?.getRandomValues) {
    const values = globalThis.crypto.getRandomValues(new Uint32Array(ROOM_CODE_LENGTH));
    let index = 0;
    return () => values[index++] / 2 ** 32;
  }
  return Math.random;
};

export const createRoomId = (random = null) => {
  const roll = random ?? defaultRandom();
  const symbols = Array.from(
    { length: ROOM_CODE_LENGTH },
    () => ROOM_ALPHABET[Math.floor(roll() * ROOM_ALPHABET.length)]
  );
  return `${symbols.slice(0, 4).join("")}-${symbols.slice(4).join("")}`;
};

// Accepte une saisie souple : minuscules, espaces, tiret omis ou souligne.
export const normalizeRoomCode = (input) => {
  const clean = String(input ?? "").trim().toUpperCase().replaceAll(" ", "").replaceAll("_", "-");
  if (!clean.includes("-") && clean.length === ROOM_CODE_LENGTH) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  }
  return clean;
};

export const createRoomLink = (roomId, origin = globalThis.location?.origin ?? "") => {
  const isLocalRoot = ["localhost", "127.0.0.1"].includes(globalThis.location?.hostname) && globalThis.location?.pathname === "/";
  const roomPath = isLocalRoot ? "/" : "/games/FreeTheMemes/";
  const url = new URL(roomPath, origin || "http://localhost");
  url.searchParams.set("room", roomId);
  return url.toString();
};

export const getRoomIdFromLocation = (search = globalThis.location?.search ?? "") => (
  new URLSearchParams(search).get("room") || null
);
```

src/networking/serialization.js
```
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
  pendingActions: state.pendingActions.map(({ type, playerId, targetId, attackerId, damage, excludedAreaId, rolls, killerId, victimId, cardIds, cardId, effect, deckId, card }) => ({
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
```

src/networking/trystero-network.js
```
import { joinRoom } from "https://esm.sh/trystero@0.25.4/nostr";
import { NetworkAdapter } from "./network-adapter.js";
import { MESSAGE_TYPES } from "./messages.js";

export class TrysteroNetwork extends NetworkAdapter {
  #room = null;
  #roomId = null;
  #sendMessage = null;
  #sendPrivateMessage = null;

  async connect(roomId) {
    if (!roomId || typeof roomId !== "string") {
      throw new Error("A room ID is required.");
    }

    this.disconnect();
    this.#roomId = roomId;
    this.#room = joinRoom({ appId: "free-the-memes" }, roomId);
    const messageAction = this.#room.makeAction("message");
    const privateMessageAction = this.#room.makeAction("private-message");
    this.#sendMessage = messageAction.send.bind(messageAction);
    this.#sendPrivateMessage = privateMessageAction.send.bind(privateMessageAction);

    messageAction.onMessage = (message, { peerId }) => {
      this.emit(message?.type ?? MESSAGE_TYPES.STATE_UPDATE, { message, peerId });
    };
    privateMessageAction.onMessage = (message, { peerId }) => {
      this.emit(message?.type ?? MESSAGE_TYPES.PRIVATE_STATE_UPDATE, { message, peerId });
    };

    this.#room.onPeerJoin = (peerId) => this.emit(MESSAGE_TYPES.PLAYER_JOINED, { peerId });
    this.#room.onPeerLeave = (peerId) => this.emit(MESSAGE_TYPES.PLAYER_LEFT, { peerId });
    this.emit("connected", { roomId });

    return { roomId };
  }

  disconnect() {
    this.#room?.leave();
    this.#room = null;
    this.#roomId = null;
    this.#sendMessage = null;
    this.#sendPrivateMessage = null;
  }

  sendPublic(message) {
    if (!this.#sendMessage) {
      throw new Error("The network is not connected.");
    }

    this.#sendMessage(message);
  }

  sendPrivate(peerId, message) {
    if (!this.#sendPrivateMessage) {
      throw new Error("The network is not connected.");
    }

    this.#sendPrivateMessage(message, { target: peerId });
  }

  sendActionRequest(request) {
    this.sendPublic(request);
  }

  // seatToken : identifiant local stable par salle, pour reconnaitre un joueur
  // qui revient avec un nouveau peerId apres une coupure ou un rechargement.
  sendHello(name, seatToken) {
    this.sendPublic({ type: MESSAGE_TYPES.PLAYER_HELLO, name, seatToken });
  }
}
```

src/ui/app.js
```
import { DiceTray } from "./dice-tray.js";
import { createTranslator, loadLocale, getLocale } from "../i18n.js";
import { createLocalGame } from "../game/setup.js";
import { GAME_PHASES } from "../game/game-state.js";
import { startGame, beginTurn, completeAreaAction, completeAttack, completeMovement, endTurn } from "../game/turn-manager.js";
import { isValidMovementDestination, resolveMovementAction, resolveMovementDestination, resolveMovementRollChoice } from "../movement.js";
import { areaAttack, attack, canTargetWithAttack, mustAttack, resolveCombatPendingAction } from "../game/combat.js";
import { getCharacter } from "../data/characters.js";
import { AREAS } from "../data/areas.js";
import { getCard } from "../data/cards.js";
import { resolveAreaAction, resolveAreaPendingAction } from "../game/areas.js";
import { resolvePendingAction } from "../game/cards.js";
import { createRoomId, createRoomLink, getRoomIdFromLocation, normalizeRoomCode } from "../networking/room.js";
import { createHostSession, createClientSession } from "../networking/game-session.js";
import { createActionRequest } from "../networking/messages.js";
import { resolveEquipmentReward } from "../game/rules-engine.js";

import { tick, thunk, click, ping, isMuted, toggleMuted } from "./sound.js";

const diceHost = document.createElement("div");
const dice = new DiceTray(diceHost, [6, 4], { cell: 38, onTick: tick, onSettle: thunk });
let seenEvents = null;
// Evenements de des recus mais pas encore montres : l'odometre tourne, le
// journal et le plateau n'affichent la consequence qu'a l'arret des des.
const pendingDice = new Set();
const diceRolling = () => pendingDice.size > 0;
 
const syncDice = () => {
  const real = state.events.filter((e) => e.type !== "UI_LOG");
  if (seenEvents === null || real.length < seenEvents) { seenEvents = real.length; return; }
  const fresh = real.slice(seenEvents);
  seenEvents = real.length;
  const hit = fresh.findLast((e) => e.type === "ATTACK_RESOLVED" || e.type === "AREA_ATTACK_RESOLVED" || e.type === "MOVEMENT_ROLLED");
  if (!hit) return;
  const hitIndex = real.indexOf(hit);
  // Retenir le jet ET ses consequences (deplacement, degats...) jusqu'a
  // l'arret de l'odometre, sinon le journal devoile le resultat trop tot.
  const held = real.slice(hitIndex);
  held.forEach((e) => pendingDice.add(e));
  const rolling = hit.d6 == null ? dice.dice[1].roll(hit.d4) : dice.roll([hit.d6, hit.d4]);   // attaque forcee : d4 seul
  rolling.then(() => { held.forEach((e) => pendingDice.delete(e)); fillLog(); revealMovement(held); });
};

// Animation FLIP : quand les des s'arretent, on fait glisser les pions de
// leur ancienne zone vers la nouvelle au lieu de les teleporter.
const revealMovement = (held) => {
  const movedIds = new Set(held.filter((e) => e.type === "PLAYER_MOVED").map((e) => e.playerId));
  const before = new Map();
  for (const playerId of movedIds) {
    const el = app.querySelector(`[data-piece="${playerId}"]`);
    if (el) before.set(playerId, el.getBoundingClientRect());
  }
  render();
  if (!before.size) return;
  for (const [playerId, oldRect] of before) {
    const el = app.querySelector(`[data-piece="${playerId}"]`);
    if (!el) continue;
    const newRect = el.getBoundingClientRect();
    const dx = oldRect.left - newRect.left;
    const dy = oldRect.top - newRect.top;
    if (!dx && !dy) continue;
    el.style.transition = "none";
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    requestAnimationFrame(() => {
      el.style.transition = "transform .5s cubic-bezier(.25,.8,.3,1)";
      el.style.transform = "";
    });
  }
};


const app = document.querySelector("#app");
app.addEventListener("click", (e) => { if (e.target.closest(".action")) click(); });
let state;
let translate;
let localPlayerId = "player-1";
let network;
let roomId = getRoomIdFromLocation();
let roomStatus = "offline";
let peers = [];
let roomPlayers = [];
let isHost = false;
let hostSession;
let clientSession;
// Pseudo par defaut au premier lancement, localStorage des qu'il est choisi ou edite (handleNameChange).
const DEFAULT_NAMES = [
  "Pepe", "Nyan Cat", "Trollface", "Distracted BF", "Shrek",
  "Gigachad", "Keyboard Cat", "Grumpy Cat", "Bad Luck Brian", "Hide the Pain",
  "Woman Yelling", "Surprised Pikachu", "Raptor Jesus", "Rage Guy", "Dat Boi"
];
const randomPlayerName = () => DEFAULT_NAMES[Math.floor(Math.random() * DEFAULT_NAMES.length)];

let localPlayerName = localStorage.getItem("ftm-player-name") || randomPlayerName();
localStorage.setItem("ftm-player-name", localPlayerName);
let assignedPlayerId = "player-1";
let roomRole = roomId ? "client" : "local";
let privateState = null;
let wasMyTurn = false;

// Jeton de siege local : stable par salle et par navigateur, jamais secret.
// L'hote s'en sert pour rendre son siege a un joueur qui se reconnecte.
const loadSeatToken = (code) => {
  const key = `ftm-seat:${code}`;
  let token = null;
  try { token = localStorage.getItem(key); } catch { /* stockage indisponible */ }
  if (!token) {
    token = globalThis.crypto?.randomUUID?.() ?? `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    try { localStorage.setItem(key, token); } catch { /* ignore */ }
  }
  return token;
};

// Fusionne ce que seul CE joueur a le droit de savoir dans sa copie locale de l'état.
const withPrivate = (s) => {
  const me = privateState && s?.players?.[privateState.playerId];
  if (!me) return s;
  return {
    ...s,
    players: {
      ...s.players,
      [me.id]: {
        ...me,
        characterId: privateState.characterId,
        faction: privateState.faction,
        abilityState: privateState.abilityState,
        maxHp: privateState.maxHp,
        hp: privateState.maxHp - (me.damage ?? 0)
      }
    }
  };
};

let logOpen = false;
const logWin = document.createElement("div");
logWin.className = "term";
logWin.hidden = true;
logWin.innerHTML = `<div class="term-bar"><span>journal.ps1</span><button type="button" class="term-x" aria-label="Close">×</button></div><div class="term-body"></div>`;
document.body.append(logWin);
logWin.querySelector(".term-x").addEventListener("click", () => { logOpen = false; logWin.hidden = true; });
const termBar = logWin.querySelector(".term-bar");
const termBody = logWin.querySelector(".term-body");
termBody.addEventListener("scroll", () => {
  termBody.dataset.stick = termBody.scrollHeight - termBody.scrollTop - termBody.clientHeight < 40 ? "1" : "0";
});
termBar.addEventListener("pointerdown", (e) => {
  if (e.target.closest("button")) return;
  const r = logWin.getBoundingClientRect();
  const dx = e.clientX - r.left, dy = e.clientY - r.top;
  logWin.style.right = "auto"; logWin.style.bottom = "auto";
  termBar.setPointerCapture(e.pointerId);
  const move = (ev) => {
    logWin.style.left = `${Math.min(Math.max(0, ev.clientX - dx), innerWidth - 80)}px`;
    logWin.style.top = `${Math.min(Math.max(0, ev.clientY - dy), innerHeight - 40)}px`;
  };
  const up = () => { termBar.removeEventListener("pointermove", move); termBar.removeEventListener("pointerup", up); };
  termBar.addEventListener("pointermove", move);
  termBar.addEventListener("pointerup", up);
});
const fillLog = () => {
  termBody.innerHTML = state.events.slice(-80)
    .filter((e) => !pendingDice.has(e))
    .map((e) => `<div class="${e.type === "UI_LOG" ? "dbg" : ""}">${describeEvent(e)}</div>`).join("");
  if (termBody.dataset.stick !== "0") termBody.scrollTop = termBody.scrollHeight;
};

const players = [
  { id: "player-1", name: "Alice" },
  { id: "player-2", name: "Bob" },
  { id: "player-3", name: "Cara" },
  { id: "player-4", name: "Dan" }
];

const AREA_NAME_KEYS = Object.fromEntries(Object.values(AREAS).map((area) => [area.id, area.nameKey]));
const getAreaLabel = (areaId) => (areaId ? translate(AREA_NAME_KEYS[areaId] ?? areaId) : "Nowhere yet");
const getEquipmentLabel = (cardId) => {
  const card = getCard(cardId);
  return card ? translate(card.nameKey) : cardId.replaceAll("-", " ");
};
const T = (key, vars) => translate(key, vars);

// Messages d'état du salon : stockés comme clé + variables, donc retraduits au changement de langue.
let roomNotice = null;
const setNotice = (key, vars = {}) => { roomNotice = { key, vars }; };
let joinCodeDraft = "";   // code tapé dans l'accueil, conservé entre deux rendus

// ---- Langue ----
const SUPPORTED_LOCALES = [{ code: "en", label: "English" }, { code: "fr", label: "Français" }];
const isSupported = (code) => SUPPORTED_LOCALES.some((l) => l.code === code);
let locale = localStorage.getItem("ftm-locale");
if (!isSupported(locale)) locale = isSupported(getLocale()) ? getLocale() : "en";
let englishMessages = null;

const loadMessages = async (code) => {
  englishMessages ??= await loadLocale("en");
  const messages = { en: englishMessages };
  if (code !== "en") {
    try { messages[code] = await loadLocale(code); } catch { /* fichier absent : repli sur l'anglais */ }
  }
  translate = createTranslator({ locale: code, messages });
};
const setLocale = async (code) => {
  if (!isSupported(code)) return;
  locale = code;
  localStorage.setItem("ftm-locale", code);
  document.documentElement.lang = code;
  await loadMessages(code);
  render();
};
const renderLocaleSelect = () => `<select class="locale-select" data-locale aria-label="${escHtml(T("ui.language"))}">${
  SUPPORTED_LOCALES.map((l) => `<option value="${l.code}" ${l.code === locale ? "selected" : ""}>${l.label}</option>`).join("")
}</select>`;
app.addEventListener("change", (e) => {
  const select = e.target.closest?.("[data-locale]");
  if (select) setLocale(select.value);
});
const esc = (s) => String(s).replaceAll('"', "&quot;");
const AREA_BY_ID = Object.fromEntries(Object.values(AREAS).map((area) => [area.id, area]));
const diceLabel = (areaId) => {
  const totals = AREA_BY_ID[areaId]?.dieTotals ?? [];
  return totals.length > 1 ? `${totals[0]}–${totals.at(-1)}` : `${totals[0] ?? "?"}`;
};
const getEquipmentText = (cardId) => {
  const card = getCard(cardId);
  return card ? translate(card.textKey) : "";
};

// Purely decorative - not game data, just a visual identifier per Area so the board
// doesn't read as a grid of identical boxes.
const AREA_ICONS = Object.freeze({
  "otakus-paradise": "🎌",
  "bed-of-your-dreams": "🛏️",
  "grandmas-new-bedroom": "🕯️",
  "attic-hatch": "🪜",
  "toxic-relationship": "💔",
  "pickpocket-boulevard": "🧤"
});

// A player's board piece/token, colored by their fixed turn-order slot so the same
// player keeps the same color across the zone tokens and the character cards below.
const pieceIndexFor = (playerId) => {
  const index = state.turnOrder.indexOf(playerId);
  return index < 0 ? 0 : index % 8;
};

const renderPieceToken = (player, active) => `
  <span class="piece piece-${pieceIndexFor(player.id)} ${player.id === active.id ? "current" : ""} ${player.alive ? "" : "dead"}" data-piece="${player.id}" title="${player.alive ? player.name : `${player.name}, eliminated`}">
    <span class="piece-avatar">${player.name.slice(0, 1).toUpperCase()}</span>
    <span class="piece-name">${player.name}</span>
  </span>`;

// const renderCharacterCard = (player, active) => {
  // const character = player.characterId ? getCharacter(player.characterId) : null;
  // const revealed = player.revealed || player.id === localPlayerId;
  // const factionClass = revealed && character ? `faction-${character.faction}` : "faction-hidden";
  // const hpPercent = Math.max(0, Math.round((player.hp / player.maxHp) * 100));
// 
  // return `
    // <article class="char-card ${factionClass} piece-${pieceIndexFor(player.id)} ${player.id === active.id ? "active" : ""} ${player.alive ? "" : "dead"}">
      // <header class="char-card-head">
        // <span class="char-avatar">${player.name.slice(0, 1).toUpperCase()}</span>
        // <div class="char-card-identity">
          // <strong>${player.name}</strong>
          // <small>${revealed && character ? translate(character.nameKey) : "Hidden identity"}</small>
        // </div>
      // </header>
      // ${player.alive
        // ? `<div class="hp-bar"><div class="hp-fill" style="width:${hpPercent}%"></div></div>
          //  <p class="char-meta">${player.hp}/${player.maxHp} HP &middot; ${getAreaLabel(player.areaId)}</p>`
        // : `<p class="char-meta">Eliminated</p>`}
      // ${player.equipment.length ? `<div class="equip-row">${player.equipment.map((cardId) => `<span class="equip-chip">${cardId.replaceAll("-", " ")}</span>`).join("")}</div>` : ""}
    // </article>`;
// };

const randomRoll = (sides) => Math.floor(Math.random() * sides) + 1;
const actionForPhase = Object.freeze({
  [GAME_PHASES.MOVEMENT]: "MOVE",
  [GAME_PHASES.AREA_ACTION]: "RESOLVE_AREA_ACTION",
  [GAME_PHASES.ATTACK]: "COMPLETE_ATTACK",
  [GAME_PHASES.END_TURN]: "END_TURN"
});
const playerLabel = (playerId) => {
  const player = state?.players[playerId];
  if (!player) return playerId ?? "unknown player";

  if (!player.characterId) return player.name;
  const character = getCharacter(player.characterId);
  const mayRevealCharacter = player.id === localPlayerId || player.revealed;
  return mayRevealCharacter ? `${player.name} (${translate(character.nameKey)})` : player.name;
};

const describeEvent = (event) => {
  if (event.type === "UI_LOG") return event.message;
  if (event.type === "PLAYER_MOVED") return `${playerLabel(event.playerId)} moved to ${getAreaLabel(event.areaId)}${event.total ? ` (roll ${event.total})` : ""}.`;
  if (event.type === "ATTACK_STARTED") return `${playerLabel(event.attackerId)} attacked ${playerLabel(event.targetId)}.`;
  if (event.type === "ATTACK_RESOLVED") return `${playerLabel(event.attackerId)} dealt ${event.damage} damage to ${playerLabel(event.targetId)} (${event.d6 != null ? `d6 ${event.d6} − d4 ${event.d4} = ${Math.abs(event.d6 - event.d4)}` : `d4 ${event.d4}`}${event.bonus ? `, +${event.bonus} equipment` : ""}).`;
  if (event.type === "DAMAGE_DEALT") return `${playerLabel(event.playerId)} lost ${event.amount} HP.`;
  if (event.type === "DAMAGE_PREVENTED") return `Damage to ${playerLabel(event.playerId)} was prevented${event.reason ? ` (${event.reason})` : ""}.`;
  if (event.type === "HEAL_APPLIED") return `${playerLabel(event.playerId)} recovered ${event.amount} HP.`;
  if (event.type === "PLAYER_DIED") return `${playerLabel(event.playerId)} died. Body count: ${event.bodyCountAtDeath}.`;
  if (event.type === "ABILITY_USED") return `${playerLabel(event.playerId)} used ${event.abilityId}.`;
  if (event.type === "CHARACTER_REVEALED") return `${playerLabel(event.playerId)} revealed their Character.`;
  if (event.type === "EQUIPMENT_ACQUIRED") return `${playerLabel(event.playerId)} acquired ${getEquipmentLabel(event.cardId)}.`;
  if (event.type === "EQUIPMENT_STOLEN") return `${playerLabel(event.toPlayerId)} stole ${event.cardId ? getEquipmentLabel(event.cardId) : "Equipment"} from ${playerLabel(event.fromPlayerId)}.`;
  if (event.type === "MOVEMENT_ROLLED") return `${playerLabel(event.playerId)} rolled ${event.d6} + ${event.d4} = ${event.total}.`;
  if (event.type === "AREA_ATTACK_RESOLVED") return `${playerLabel(event.attackerId)} hit ${event.targetIds.length} player(s) for ${event.damage} damage each (d6 ${event.d6 ?? "–"}, d4 ${event.d4}).`;
  if (event.type === "EQUIPMENT_REWARDED") return `${playerLabel(event.killerId)} recovered ${getEquipmentLabel(event.cardId)} from ${playerLabel(event.victimId)}.`;
  if (event.type === "EQUIPMENT_TRANSFERRED") return `${playerLabel(event.toPlayerId)} received ${getEquipmentLabel(event.cardId)} from ${playerLabel(event.fromPlayerId)}.`;
  if (event.type === "TURN_STARTED") return `${playerLabel(event.playerId)}'s turn started.`;
  if (event.type === "TURN_ENDED") return `${playerLabel(event.playerId)}'s turn ended.`;
  if (event.type === "VICTORY_REACHED") return `Victory reached by ${event.playerId}.`;
  return `${event.type.replaceAll("_", " ")}${event.playerId ? ` - ${playerLabel(event.playerId)}` : ""}.`;
};

const addLog = (message) => {
  state = { ...state, events: [...state.events, { type: "UI_LOG", message }] };
};

const run = (result, label = "action") => {
  if (!result.ok) {
    addLog(`RESULT ${label}: REJECTED - ${result.error}: ${result.message ?? "Action rejected"}`);
    return false;
  }
  state = result.state;
  addLog(`RESULT ${label}: accepted; phase is now ${state.phase}.`);
  return true;
};

// Routes the host's own actions through HostAuthority too, so the resulting state is
// broadcast to connected peers instead of only updating the host's local view.
const runAsHost = (action, payload, label) => {
  const result = hostSession.authority.handleRequest(createActionRequest(assignedPlayerId, action, payload));
  if (!result.ok) {
    addLog(`RESULT ${label}: REJECTED - ${result.message.error}: ${result.message.message}`);
    return false;
  }
  state = result.state;
  addLog(`RESULT ${label}: accepted; phase is now ${state.phase}.`);
  return true;
};

const currentPlayer = () => state.players[state.currentPlayerId];
const phaseLabel = () => state.phase.replaceAll("-", " ");
const canControlCurrentPlayer = () => roomRole === "local" || state?.currentPlayerId === assignedPlayerId;

const handleStart = () => {
  if (!isHost || !hostSession || peers.length === 0) return;
  const lobbyState = hostSession.authority.state;
  const playerIds = lobbyState.turnOrder.slice(0, Math.min(4, peers.length + 1));
  const matchState = {
    ...lobbyState,
    players: Object.fromEntries(playerIds.map((playerId) => [playerId, lobbyState.players[playerId]])),
    turnOrder: playerIds
  };
  const started = startGame(matchState);
  if (!run(started, "start room match")) return;
  hostSession.authority.replaceState(state);
  render();
};

const connectToRoom = async (requestedRoomId) => {
  try {
    roomId = requestedRoomId;
    if (!network) {
      const { TrysteroNetwork } = await import("../networking/trystero-network.js");
      network = new TrysteroNetwork();
    }
    network.on("connected", () => { roomStatus = "connected"; roomNotice = null; render(); });
    network.on("PLAYER_JOINED", ({ peerId }) => {
      peers = [...new Set([...peers, peerId])];
      hostSession?.authority.broadcast();
      if (!isHost) network.sendHello(localPlayerName, loadSeatToken(roomId));
      render();
    });
    network.on("PLAYER_LEFT", ({ peerId }) => { peers = peers.filter((currentPeerId) => currentPeerId !== peerId); render(); });
    if (!isHost) {
      clientSession?.dispose();
      clientSession = createClientSession(network, ({ publicState, privateState: incomingPrivate }) => {
        if (incomingPrivate) privateState = incomingPrivate;
        if (publicState) {
          if (publicState.phase === GAME_PHASES.SETUP) {
            clearMarks();
            roomPlayers = Object.values(publicState.players ?? {});
            roomStatus = "connected"; roomNotice = null;
            render();
            return;
          }
          state = { ...state, ...publicState, players: publicState.players };
          roomStatus = "game synchronized";
        }
        if (state) state = withPrivate(state);
        render();
      }, (playerSlot) => {
        localPlayerId = playerSlot;
        assignedPlayerId = playerSlot;
        setNotice("lobby.assigned", { name: localPlayerName, slot: playerSlot });
        render();
      });
    }
    await network.connect(roomId);
    if (isHost && !hostSession) {
      const localPlayers = players.map((player, index) => (
        index === 0 ? { ...player, name: localPlayerName } : player
      ));
      const lobbyState = createLocalGame(localPlayers, { startingPlayerIndex: 0 });
      hostSession = createHostSession(lobbyState, network, {
        onStateChange: (next) => {
          if (state && next.phase !== GAME_PHASES.SETUP) { state = next; render(); }
        }
      });
      roomPlayers = Object.values(lobbyState.players);
    }
    roomStatus = "connected"; roomNotice = null;
    render();
  } catch (error) {
    roomStatus = "error"; setNotice("lobby.error", { message: error.message });
    render();
  }
};

const handleCreateRoom = () => {
  isHost = true;
  roomRole = "host";
  roomId = createRoomId();
  roomPlayers = [];
  roomStatus = "connecting"; setNotice("lobby.roomCreated", { code: roomId });
  render();
  connectToRoom(roomId);
};

const handleJoinRoom = () => {
  isHost = false;
  roomRole = "client";
  const input = app.querySelector("[data-room-input]");
  const requestedRoomId = normalizeRoomCode(input.value);
  if (!requestedRoomId) {
    setNotice("lobby.enterCode");
    render();
    return;
  }

  roomId = requestedRoomId;
  roomStatus = "connecting"; setNotice("lobby.joining", { code: requestedRoomId });
  render();
  connectToRoom(requestedRoomId);
};

const lobbyStatusLabel = () => {
  if (roomNotice) return T(roomNotice.key, roomNotice.vars);
  if (roomStatus === "connected") return isHost ? T("lobby.hostLobby", { n: peers.length }) : T("lobby.guestWaiting");
  return roomStatus === "connecting" ? T("lobby.connecting") : roomStatus;
};

const copyText = async (text, okKey, inputSelector) => {
  let copied = true;
  try { await navigator.clipboard.writeText(text); setNotice(okKey); }
  catch { copied = false; setNotice("lobby.copyManual"); }
  render();
  if (!copied) {
    const el = app.querySelector(inputSelector);   // sélectionné APRÈS le rendu, sinon la sélection disparaît
    el?.focus(); el?.select();
    return;
  }
  setTimeout(() => { if (roomNotice?.key === okKey) { roomNotice = null; render(); } }, 2500);
};
const handleCopyInvite = () => copyText(createRoomLink(roomId), "lobby.linkCopied", "[data-invite-link]");
const handleCopyCode = () => copyText(roomId, "lobby.codeCopied", "[data-room-code]");
const handleNameChange = (event) => {
  localPlayerName = event.target.value.trim() || "Player";
  localStorage.setItem("ftm-player-name", localPlayerName);
};

const handlePrimaryAction = () => {
  if (!canControlCurrentPlayer()) {
    addLog(`BLOCKED primary action: it is ${playerLabel(state.currentPlayerId)}'s turn.`);
    render();
    return;
  }

  if (state.pendingActions.length > 0) {
    addLog(`BLOCKED primary action: ${state.pendingActions[0].type} must be resolved first.`);
    render();
    return;
  }

  const playerId = roomRole === "local" ? state.currentPlayerId : assignedPlayerId;
  if (!isHost && clientSession) {
    addLog(`NETWORK REQUEST ${state.phase}.`);
    clientSession.requestAction(createActionRequest(playerId, actionForPhase[state.phase]));
    return;
  }
  const label = `${state.phase} primary button by ${playerLabel(playerId)}`;
  addLog(`CLICK ${label}.`);
  if (isHost && hostSession) {
    runAsHost(actionForPhase[state.phase], {}, label);
    render();
    return;
  }
  if (state.phase === GAME_PHASES.START_TURN) {
    // Pas de bouton "commencer" : le premier geste lance directement les dés.
    if (run(beginTurn(state, playerId), "begin turn")) {
      const movement = resolveMovementAction(state, playerId, { rollDie: randomRoll });
      if (run(movement, "roll and move") && !movement.reroll && !movement.pendingAction) {
        run(completeMovement(state, playerId), "complete movement");
      }
    }
  }
  else if (state.phase === GAME_PHASES.MOVEMENT) {
    const movement = resolveMovementAction(state, playerId, { rollDie: randomRoll });
    if (run(movement, "roll and move") && !movement.reroll && !movement.pendingAction) {
      run(completeMovement(state, playerId), "complete movement");
    }
  }
  else if (state.phase === GAME_PHASES.AREA_ACTION) {
    const result = resolveAreaAction(state, playerId, state.players[playerId].areaId);
    if (run(result, "resolve area") && state.pendingActions.length === 0) {
      run(completeAreaAction(state, playerId), "complete area action");
    }
  }
  else if (state.phase === GAME_PHASES.ATTACK) {
    if (mustAttack(state, playerId)) addLog("BLOCKED: you must attack.");
    else run(completeAttack(state, playerId), "skip attack");
  }
  else if (state.phase === GAME_PHASES.END_TURN) run(endTurn(state, playerId), "end turn");
  render();
};

const handleAttack = (targetId) => {
  if (!state || state.phase !== GAME_PHASES.ATTACK) return;
  if (!canControlCurrentPlayer()) {
    addLog(`BLOCKED attack: it is ${playerLabel(state.currentPlayerId)}'s turn.`);
    render();
    return;
  }
  addLog(`CLICK Attack ${playerLabel(targetId)} by ${playerLabel(state.currentPlayerId)}.`);
  if (!isHost && clientSession) {
    clientSession.requestAction(createActionRequest(state.currentPlayerId, "ATTACK", { targetId }));
    return;
  }
  if (isHost && hostSession) {
    runAsHost("ATTACK", { targetId }, `attack ${playerLabel(targetId)}`);
    render();
    return;
  }
  const attackerId = roomRole === "local" ? state.currentPlayerId : assignedPlayerId;
  const result = state.players[attackerId].equipment.includes("pfrt-tube")
    ? areaAttack(state, attackerId, { rollDie: randomRoll })
    : attack(state, attackerId, targetId, { rollDie: randomRoll });
  if (run(result) && !state.gameOver && state.pendingActions.length === 0) {
    run(completeAttack(state, state.currentPlayerId), "complete attack");
  }
  render();
};

const handlePendingReaction = (selectedDestination = null, selectedRollIndex = 0) => {
  const pendingAction = state?.pendingActions[0];
  if (!pendingAction) return;

  addLog(`CLICK Resolve pending reaction: ${pendingAction.type}.`);
  if (pendingAction.type === "CHOOSE_MOVEMENT_DESTINATION") {
    const destinationAreaId = selectedDestination ?? Object.values(state.board.areaAtPosition)
      .find((areaId) => isValidMovementDestination(state.board, areaId) && areaId !== pendingAction.excludedAreaId);

    if (!isHost && clientSession) {
      clientSession.requestAction(createActionRequest(pendingAction.playerId, "CHOOSE_MOVEMENT_DESTINATION", { areaId: destinationAreaId }));
      return;
    }

    if (isHost && hostSession) {
      runAsHost("CHOOSE_MOVEMENT_DESTINATION", { areaId: destinationAreaId }, "resolve movement destination");
      render();
      return;
    }

    const result = resolveMovementDestination(state, pendingAction, destinationAreaId);

    if (run(result, "resolve movement destination") && state.phase === GAME_PHASES.MOVEMENT && state.pendingActions.length === 0) {
      run(completeMovement(state, pendingAction.playerId), "complete movement after destination");
    }
    render();
    return;
  }

  if (pendingAction.type === "CHOOSE_MOVEMENT_ROLL") {
    if (!isHost && clientSession) {
      clientSession.requestAction(createActionRequest(pendingAction.playerId, "CHOOSE_MOVEMENT_ROLL", { rollIndex: selectedRollIndex }));
      return;
    }

    if (isHost && hostSession) {
      runAsHost("CHOOSE_MOVEMENT_ROLL", { rollIndex: selectedRollIndex }, "resolve movement roll");
      render();
      return;
    }

    const result = resolveMovementRollChoice(state, pendingAction, selectedRollIndex);
    if (run(result, "resolve movement roll") && state.phase === GAME_PHASES.MOVEMENT && state.pendingActions.length === 0) {
      run(completeMovement(state, pendingAction.playerId), "complete movement after roll choice");
    }
    render();
    return;
  }
};

// Combat reactions (Doge, Pay-to-Win, Life Stonks, Surprise MF, John Wick, Telescopic Lance)
// belong to whichever player the pendingAction names, which may not be the active player.
const resolveReaction = (choice, label) => {
  const pendingAction = state?.pendingActions[0];
  if (!pendingAction) return;

  addLog(`CLICK Resolve pending reaction: ${label}.`);

  if (!isHost && clientSession) {
    clientSession.requestAction(createActionRequest(pendingAction.playerId, "RESOLVE_COMBAT_REACTION", { choice }));
    return;
  }
  if (isHost && hostSession) {
    runAsHost("RESOLVE_COMBAT_REACTION", { choice }, label);
    render();
    return;
  }

  const result = resolveCombatPendingAction(state, pendingAction, choice, { rollDie: randomRoll });
  if (run(result, label) && !state.gameOver && state.pendingActions.length === 0 && state.phase === GAME_PHASES.ATTACK) {
    const reactionPlayerId = state.currentPlayerId;
    if (run(completeAttack(state, reactionPlayerId), "complete attack after reaction") && !state.players[reactionPlayerId].alive) {
      run(endTurn(state, reactionPlayerId), "skip dead player's turn");
    }
  }
  render();
};

const resolveReward = (cardId) => {
  const pendingAction = state?.pendingActions[0];
  if (!pendingAction) return;
  addLog(`CLICK Equipment reward: ${cardId ?? "none"}.`);
  if (!isHost && clientSession) {
    clientSession.requestAction(createActionRequest(pendingAction.playerId, "CHOOSE_EQUIPMENT_REWARD", { cardId }));
    return;
  }
  if (isHost && hostSession) {
    runAsHost("CHOOSE_EQUIPMENT_REWARD", { cardId }, "equipment reward");
    render();
    return;
  }
  const result = resolveEquipmentReward(state, pendingAction, cardId);
  if (run(result, "equipment reward") && !state.gameOver && state.pendingActions.length === 0 && state.phase === GAME_PHASES.ATTACK) {
    run(completeAttack(state, state.currentPlayerId), "complete attack after reward");
  }
  render();
};

const resolvePendingChoice = (choice = {}, label = "resolve pending effect") => {
  const pendingAction = state?.pendingActions[0];
  if (!pendingAction) return;

  if (!isHost && clientSession) {
    clientSession.requestAction(createActionRequest(pendingAction.playerId, "RESOLVE_PENDING_ACTION", { choice }));
    return;
  }
  if (isHost && hostSession) {
    runAsHost("RESOLVE_PENDING_ACTION", { choice }, label);
    render();
    return;
  }

  const areaPendingTypes = new Set([
    "CHOOSE_AREA_DECK", "GIVE_NOTIFICATION", "POKER_FACE_NOTIFICATION",
    "RESOLVE_DRAWN_CARD", "TOXIC_RELATIONSHIP_CHOICE", "PICKPOCKET_CHOICE"
  ]);
  const result = areaPendingTypes.has(pendingAction.type)
    ? resolveAreaPendingAction(state, pendingAction, choice)
    : resolvePendingAction(state, pendingAction, choice, { rollDie: randomRoll });
  if (run(result, label) && state.phase === GAME_PHASES.AREA_ACTION && state.pendingActions.length === 0 && state.players[state.currentPlayerId]?.alive) {
    run(completeAreaAction(state, state.currentPlayerId), "complete area action");
  }
  render();
};

// Reveal-gated reactions share the same "reveal & activate" / "decline" shape; only the
// wording changes per character. Pay-to-Win and Telescopic Lance have their own payloads.
const OPTIONAL_REACTION_PROMPTS = Object.freeze({
  DOGE_ATTACK_REACTION: { reveal: "Reveal & try to dodge (coin flip)", decline: "Take the hit" },
  LIFE_STONKS_REACTION: { reveal: "Reveal & heal 2 HP", decline: "Skip healing" },
  SURPRISE_COUNTERATTACK: { reveal: "Reveal & counterattack", decline: "Skip counterattack" },
  JOHN_WICK_SECOND_ATTACK: { reveal: "Reveal & attack again (-2 HP)", decline: "Skip second attack" }
});

const renderPendingReactionPanel = (pendingReaction, pendingMovementDestinations) => {
  if (!pendingReaction) return "";

  const ownerLabel = playerLabel(pendingReaction.playerId);
  const canResolve = roomRole === "local" || pendingReaction.playerId === assignedPlayerId;

  if (!canResolve) {
    return `<p class="pending-label" style="margin-top:8px">Waiting for ${ownerLabel} to resolve ${pendingReaction.type.replaceAll("_", " ").toLowerCase()}.</p>`;
  }

  const choiceButton = (label, choice, secondary = true) => (
    `<button class="action ${secondary ? "secondary" : ""}" data-pending-choice="${encodeURIComponent(JSON.stringify(choice))}">${label}</button>`
  );
  const cardForPending = pendingReaction.card ?? getCard(pendingReaction.cardId);
  const cardHeading = cardForPending
    ? `<strong>${translate(cardForPending.nameKey)}</strong><p>${translate(cardForPending.textKey)}</p>`
    : "";

  if (pendingReaction.type === "CHOOSE_AREA_DECK") {
    return `<div class="pending-choices"><p class="pending-label">Choose a deck to draw from</p>${[
      ["white", "White cards"], ["black", "Black cards"], ["notifications", "Notifications"]
    ].map(([deck, label]) => choiceButton(label, deck)).join("")}</div>`;
  }

  if (pendingReaction.type === "GIVE_NOTIFICATION") {
    const recipients = Object.values(state.players).filter((player) => player.alive && player.id !== pendingReaction.playerId);
    return `<div class="pending-choices"><p class="pending-label">Read this Notification, then give it to another player</p>${cardHeading}${recipients.map((player) => choiceButton(player.name, player.id)).join("")}</div>`;
  }

  if (pendingReaction.type === "POKER_FACE_NOTIFICATION") {
    return `<div class="pending-choices"><p class="pending-label">You received a Notification</p>${cardHeading}${choiceButton("Resolve the Notification", "resolve")}${choiceButton("Lie and discard it", "lie")}</div>`;
  }

  if (pendingReaction.type === "RESOLVE_DRAWN_CARD") {
    return `<div class="pending-choices"><p class="pending-label">Drawn card</p>${cardHeading}${choiceButton("Resolve card", {})}</div>`;
  }

  if (pendingReaction.type === "TOXIC_RELATIONSHIP_CHOICE") {
    const targets = Object.values(state.players).filter((player) => player.alive);
    return `<div class="pending-choices"><p class="pending-label">Choose a player: deal 2 damage or heal 1 HP</p>${targets.map((player) => `${choiceButton(`Deal 2 to ${player.name}`, { targetId: player.id, action: "damage" })}${choiceButton(`Heal ${player.name} by 1`, { targetId: player.id, action: "heal" })}`).join("")}</div>`;
  }

  if (pendingReaction.type === "PICKPOCKET_CHOICE") {
    const targets = Object.values(state.players).filter((player) => player.alive && player.id !== pendingReaction.playerId && player.equipment.length);
    return `<div class="pending-choices"><p class="pending-label">Choose equipment to take</p>${targets.flatMap((player) => player.equipment.map((cardId) => choiceButton(`${player.name}: ${getEquipmentLabel(cardId)}`, { targetId: player.id, cardId }))).join("")}</div>`;
  }

  if (pendingReaction.type === "RESOLVE_CARD_EFFECT") {
    const actor = state.players[pendingReaction.playerId];
    const living = Object.values(state.players).filter((player) => player.alive);
    const others = living.filter((player) => player.id !== actor.id);
    let choices = [];
    if (pendingReaction.effect === "faction-or-equipment") {
      choices = [choiceButton("Take 1 damage", { action: "damage" }), ...actor.equipment.map((cardId) => choiceButton(`Give ${getEquipmentLabel(cardId)} to ${state.players[state.currentPlayerId].name}`, { action: "give", cardId }))];
    } else if (pendingReaction.effect === "give-equipment-or-damage") {
      choices = [choiceButton("Take 1 damage", { action: "damage" }), ...actor.equipment.flatMap((cardId) => others.map((player) => choiceButton(`Give ${getEquipmentLabel(cardId)} to ${player.name}`, { action: "give", targetId: player.id, cardId })))];
    } else if (pendingReaction.effect === "steal-one-equipment") {
      choices = others.flatMap((player) => player.equipment.map((cardId) => choiceButton(`Take ${getEquipmentLabel(cardId)} from ${player.name}`, { targetId: player.id, cardId })));
      if (!choices.length) choices = [choiceButton("Nothing to steal", { targetId: null, cardId: null })];
    } else if (pendingReaction.effect === "target-heal-die-6") {
      choices = others.map((player) => choiceButton(`Heal ${player.name} (d6)`, { targetId: player.id }));
    } else if (pendingReaction.effect === "voodoo-die-6") {
      choices = living.map((player) => choiceButton(`Target ${player.name} (d6)`, { targetId: player.id }));
    } else if (["set-hp-2", "damage-2-heal-self-1", "damage-2-self-2"].includes(pendingReaction.effect)) {
      choices = living.map((player) => choiceButton(`${player.name} (${pendingReaction.effect === "set-hp-2" ? "set HP to 2" : "deal 2 damage"})`, { targetId: player.id }));
    } else {
      choices = [choiceButton("Resolve effect", {})];
    }
    return `<div class="pending-choices"><p class="pending-label">Resolve card effect</p>${cardHeading}${choices.join("")}</div>`;
  }

  if (pendingReaction.type === "CHOOSE_MOVEMENT_DESTINATION") {
    return `<div class="pending-choices"><p class="pending-label">Choose your destination</p>${pendingMovementDestinations.map((areaId) => `<button class="action secondary" data-destination="${areaId}">${getAreaLabel(areaId)}</button>`).join("")}</div>`;
  }

  if (pendingReaction.type === "CHOOSE_MOVEMENT_ROLL") {
    return `<div class="pending-choices"><p class="pending-label">Choose which movement roll to use</p>${pendingReaction.rolls.map((roll, index) => (
      `<button class="action secondary" data-roll-index="${index}">d6 ${roll.d6} + d4 ${roll.d4} = ${roll.total}</button>`
    )).join("")}</div>`;
  }

  if (pendingReaction.type === "CHOOSE_EQUIPMENT_REWARD") {
    return `<div class="pending-choices">
      <p class="pending-label">${ownerLabel} : choisis une carte d'équipement à récupérer</p>
      ${pendingReaction.cardIds.map((id) => `<button class="action secondary" data-reward="${id}">${getEquipmentLabel(id)}</button>`).join("")}
      <button class="action secondary" data-reward-none>Ne rien prendre</button>
    </div>`;
  }

  if (pendingReaction.type === "PAY_TO_WIN_REACTION") {
    const target = state.players[pendingReaction.targetId];
    return `<div class="pending-choices">
      <p class="pending-label">${ownerLabel}: deal ${pendingReaction.damage} damage, or steal an Equipment card instead?</p>
      <button class="action secondary" data-reaction="pay-to-win-damage">Deal ${pendingReaction.damage} damage</button>
      ${target.equipment.map((cardId) => `<button class="action secondary" data-reaction="pay-to-win-steal" data-card="${cardId}">Steal ${getEquipmentLabel(cardId)}</button>`).join("")}
    </div>`;
  }

  if (pendingReaction.type === "TELESCOPIC_LANCE_REACTION") {
    return `<div class="pending-choices">
      <p class="pending-label">${ownerLabel}: reveal your identity for +2 damage?</p>
      <button class="action secondary" data-reaction="lance-plain">Deal ${pendingReaction.damage} damage</button>
      <button class="action secondary" data-reaction="lance-bonus">Reveal & deal ${pendingReaction.damage + 2} damage</button>
    </div>`;
  }

  const prompt = OPTIONAL_REACTION_PROMPTS[pendingReaction.type];
  return `<div class="pending-choices">
    <p class="pending-label">${ownerLabel}'s optional reaction</p>
    <button class="action secondary" data-reaction="optional-reveal">${prompt.reveal}</button>
    <button class="action secondary" data-reaction="optional-decline">${prompt.decline}</button>
  </div>`;
};

const renderDock = ({ active, canAct, pendingReaction, isGameOver, otherPlayers }) => {
  if (isGameOver) return `<div class="dock-row"><span class="dock-title">Partie terminée</span></div>`;
  if (pendingReaction) return renderPendingReactionPanel(pendingReaction, pendingMovementDestinationsFor(pendingReaction));
  if (!canAct) return `<div class="dock-row"><span class="dock-title">${active.name} réfléchit…</span></div>`;
 
  const P = (label, cls = "") => `<button class="action ${cls}" data-action="primary">${label}</button>`;
  const phase = {
    [GAME_PHASES.START_TURN]: ["À toi de jouer", P("Lancer les dés")],
    [GAME_PHASES.MOVEMENT]: ["Déplacement", P("Lancer les dés")],
    [GAME_PHASES.AREA_ACTION]: [getAreaLabel(active.areaId), P("Résoudre la zone")],
    [GAME_PHASES.ATTACK]: ["Phase d'attaque",
      (active.equipment.includes("pfrt-tube") && otherPlayers.length
        ? `<button class="action secondary" data-area-attack>Attaquer tous les joueurs à portée (${otherPlayers.length})</button>`
        : otherPlayers.map((p) => `<button class="action secondary" data-target="${p.id}">Attaquer ${p.name}</button>`).join("")) +
      (mustAttack(state, active.id) ? "" : P("Passer"))],
    [GAME_PHASES.END_TURN]: ["Fin de ton tour", P("Terminer le tour")]
  }[state.phase];
  return phase ? `<div class="dock-row"><span class="dock-title">${phase[0]}</span>${phase[1]}</div>` : "";
};
const pendingMovementDestinationsFor = (pa) => pa?.type === "CHOOSE_MOVEMENT_DESTINATION"
  ? Object.values(state.board.areaAtPosition).filter((id) => id !== pa.excludedAreaId) : [];

// ---- Pastilles : notes privées, stockées dans CE navigateur, jamais envoyées au réseau ----
const DEFAULT_TAGS = [
  { id: "suspect", key: "ui.tag.suspect", color: 0 },
  { id: "trusted", key: "ui.tag.trusted", color: 1 },
  { id: "watch", key: "ui.tag.watch", color: 2 },
  { id: "ally", key: "ui.tag.ally", color: 3 }
];
const TAG_COLORS = 6;
const escHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const loadJson = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const saveJson = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* stockage indisponible */ } };

let customTags = loadJson("ftm-custom-tags", []);   // tes pastilles perso, valables pour toutes les parties
let marks = {};                                      // { playerId: [tagId, ...] } pour la salle courante
let marksKeyLoaded = null;
let selectedTag = null;
let newTagColor = 4;
let tagError = "";
let dragging = false;

const marksKey = () => `ftm-marks:${roomId ?? "local"}`;
const ensureMarks = () => {
  if (marksKeyLoaded !== marksKey()) { marksKeyLoaded = marksKey(); marks = loadJson(marksKeyLoaded, {}); }
};
const saveMarks = () => saveJson(marksKey(), marks);
const clearMarks = () => { marks = {}; marksKeyLoaded = marksKey(); saveMarks(); };
const allTags = () => [...DEFAULT_TAGS, ...customTags];
const findTag = (id) => allTags().find((t) => t.id === id);
const tagLabel = (t) => (t.key ? T(t.key) : t.label);

const addMark = (playerId, tagId) => {
  const list = (marks[playerId] ??= []);
  if (!list.includes(tagId)) list.push(tagId);
  saveMarks();
};
const removeMark = (playerId, tagId) => {
  marks[playerId] = (marks[playerId] ?? []).filter((id) => id !== tagId);
  saveMarks();
};
const createTag = (rawLabel) => {
  const label = rawLabel.trim().slice(0, 18);
  if (!label || allTags().some((t) => tagLabel(t).toLowerCase() === label.toLowerCase())) return false;
  customTags.push({ id: `c${Date.now().toString(36)}`, label, color: newTagColor });
  saveJson("ftm-custom-tags", customTags);
  return true;
};
const deleteTag = (id) => {
  customTags = customTags.filter((t) => t.id !== id);
  saveJson("ftm-custom-tags", customTags);
  for (const playerId of Object.keys(marks)) marks[playerId] = marks[playerId].filter((m) => m !== id);
  saveMarks();
  if (selectedTag === id) selectedTag = null;
};

const renderMarks = (playerId) => (marks[playerId] ?? []).map(findTag).filter(Boolean).map((t) => (
  `<span class="note n${t.color}">${escHtml(tagLabel(t))}<button type="button" data-mark-remove="${t.id}" aria-label="${escHtml(T("ui.removeTag"))}">×</button></span>`
)).join("");

const renderTagPalette = () => `
  <div class="tag-palette">${allTags().map((t) => (
    `<span class="note src n${t.color} ${selectedTag === t.id ? "sel" : ""}" draggable="true" data-tag="${t.id}">${escHtml(tagLabel(t))}${t.key ? "" : `<button type="button" data-tag-delete="${t.id}" aria-label="${escHtml(T("ui.removeTag"))}">×</button>`}</span>`
  )).join("")}</div>
  <div class="tag-new">
    <input data-tag-input maxlength="18" placeholder="${escHtml(T("ui.newTag"))}" aria-label="${escHtml(T("ui.newTag"))}">
    <button type="button" class="action secondary" data-tag-add>${T("ui.addTag")}</button>
    <div class="tag-colors">${Array.from({ length: TAG_COLORS }, (_, i) => (
      `<button type="button" class="tag-dot n${i} ${i === newTagColor ? "on" : ""}" data-tag-color="${i}" aria-label="${i + 1}"></button>`
    )).join("")}</div>
  </div>
  ${tagError ? `<p class="tag-err">${escHtml(tagError)}</p>` : ""}
  <p class="tag-hint">${T("ui.tagHint")} <button type="button" class="tag-clear" data-tag-clear>${T("ui.clearTags")}</button></p>`;

const submitTag = () => {
  const input = app.querySelector("[data-tag-input]");
  if (!input) return;
  if (createTag(input.value)) { tagError = ""; input.value = ""; } else { tagError = T("ui.tagInvalid"); }
  render();
};
const endDrag = () => {
  if (!dragging) return;
  dragging = false;
  render();
};

// Écouteurs délégués sur #app : posés UNE fois, ils survivent aux re-rendus.
app.addEventListener("dragstart", (e) => {
  const chip = e.target.closest?.("[data-tag]");
  if (!chip) return;
  dragging = true;
  e.dataTransfer.setData("text/plain", chip.dataset.tag);
  e.dataTransfer.effectAllowed = "copy";
});
app.addEventListener("dragover", (e) => {
  const row = e.target.closest?.("[data-player]");
  if (!dragging || !row) return;
  e.preventDefault();
  app.querySelectorAll(".pl.over").forEach((r) => r.classList.remove("over"));
  row.classList.add("over");
});
app.addEventListener("drop", (e) => {
  const row = e.target.closest?.("[data-player]");
  const tagId = e.dataTransfer.getData("text/plain");
  if (row && findTag(tagId)) { e.preventDefault(); addMark(row.dataset.player, tagId); }
  endDrag();
});
document.addEventListener("dragend", endDrag);
// Un nouveau clic/toucher prouve qu'aucun glissé n'est en cours.
document.addEventListener("pointerdown", () => { dragging = false; });
app.addEventListener("input", (e) => {
  if (e.target.matches?.("[data-tag-input]")) tagError = "";
  if (e.target.matches?.("[data-room-input]")) joinCodeDraft = e.target.value;
});
app.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.matches?.("[data-tag-input]")) submitTag(); });
app.addEventListener("click", (e) => {
  const t = e.target;
  const del = t.closest("[data-tag-delete]");
  if (del) { deleteTag(del.dataset.tagDelete); render(); return; }
  const rm = t.closest("[data-mark-remove]");
  if (rm) { removeMark(rm.closest("[data-player]").dataset.player, rm.dataset.markRemove); render(); return; }
  const dot = t.closest("[data-tag-color]");
  if (dot) { newTagColor = Number(dot.dataset.tagColor); render(); return; }
  if (t.closest("[data-tag-add]")) { submitTag(); return; }
  if (t.closest("[data-tag-clear]")) { clearMarks(); render(); return; }
  const chip = t.closest("[data-tag]");
  if (chip) { selectedTag = selectedTag === chip.dataset.tag ? null : chip.dataset.tag; render(); return; }
  const row = t.closest("[data-player]");
  if (row && selectedTag) { addMark(row.dataset.player, selectedTag); render(); }
});

const render = () => {
  if (dragging) return;
  logWin.hidden = !(state && logOpen);
  if (!state) {
    if (roomId && roomRole !== "local") {
      const knownPlayers = roomRole === "host" && hostSession
        ? Object.values(hostSession.authority.state.players)
        : roomPlayers;
      const connectedSeatCount = Math.min(4, peers.length + 1);
      const playersInRoom = knownPlayers.slice(0, connectedSeatCount);
      const occupiedSlots = new Set(playersInRoom.map((player) => player.id));
      const roomRoster = playersInRoom.length
        ? playersInRoom.map((player) => `<li class="room-player"><span class="room-player-mark">${player.name.slice(0, 1).toUpperCase()}</span><span>${player.name}</span><small>${player.id === "player-1" ? T("lobby.hostTag") : T("lobby.seatTag")}</small></li>`).join("")
        : `<li class="room-player room-player-waiting"><span class="room-player-mark">+</span><span>${T("lobby.waitingPlayers")}</span></li>`;
      const waitingSlots = Math.max(0, 4 - occupiedSlots.size);
      app.innerHTML = `
        <main class="room-screen">
          <header class="room-topbar"><a class="wordmark" href="./">FREE THE MEMES</a>
            <div class="topbar-right">${renderLocaleSelect()}<span class="connection-state"><i></i>${isHost ? T("lobby.roomOpen") : peers.length > 0 ? T("lobby.hostFound") : T("lobby.searching")}</span></div></header>
          <div class="room-content">
            <section class="room-main">
              <p class="eyebrow">${T("lobby.onlineRoom")} / ${isHost ? T("lobby.host") : T("lobby.guest")}</p>
              <h1>${isHost ? T("lobby.hostTitle") : T("lobby.guestTitle")}</h1>
              <p class="room-intro">${isHost ? T("lobby.hostIntro") : T("lobby.guestIntro")}</p>
              <div class="invite-block" data-title="${T("lobby.win.invite")}">
                <div><label for="room-code">${T("lobby.roomCode")}</label>
                  <div class="invite-field"><input id="room-code" data-room-code readonly value="${escHtml(roomId)}"><button class="action" data-action="copy-code">${T("lobby.copy")}</button></div></div>
                <div><label for="invite-link">${T("lobby.inviteLink")}</label>
                  <div class="invite-field"><input id="invite-link" data-invite-link readonly value="${createRoomLink(roomId)}"><button class="action" data-action="copy-invite">${T("lobby.copy")}</button></div></div>
              </div>
              ${isHost
                ? `<button type="button" class="action start-room-action" data-action="start" ${roomStatus === "connected" && peers.length > 0 ? "" : "disabled"}>${peers.length > 0 ? T("lobby.startMatch") : T("lobby.waitingOne")} <span aria-hidden="true">${peers.length > 0 ? "→" : "···"}</span></button>`
                : `<p class="waiting-note"><span class="waiting-pulse"></span>${T("lobby.waitingHostStart")}</p>`}
              <p class="room-status">${lobbyStatusLabel()}</p>
            </section>
            <aside class="room-roster" data-title="${T("lobby.win.seats")}"><div class="roster-heading"><h2>${T("lobby.seats")}</h2><span>${playersInRoom.length}/4</span></div><ul>${roomRoster}${Array.from({ length: waitingSlots }, () => `<li class="room-player room-player-open"><span class="room-player-mark">·</span><span>${T("lobby.openSeat")}</span></li>`).join("")}</ul><p class="roster-foot">${T("lobby.upToFour")}</p></aside>
          </div>
        </main>`;
      app.querySelector("[data-action=start]")?.addEventListener("click", handleStart);
      app.querySelector("[data-action=copy-invite]")?.addEventListener("click", handleCopyInvite);
      app.querySelector("[data-action=copy-code]")?.addEventListener("click", handleCopyCode);
      return;
    }

    app.innerHTML = `
      <main class="home-screen">
        <header class="home-topbar"><span class="top-chip">${T("lobby.tagline")}</span>
          <div class="topbar-right">${renderLocaleSelect()}</div></header>
        <section class="home-content">
          <div class="home-copy"><p class="eyebrow">${T("lobby.homeEyebrow")}</p><h1>${T("lobby.homeTitle1")}<br><em>${T("lobby.homeTitle2")}</em></h1><p class="home-intro">${T("lobby.homeIntro")}</p><label class="name-field">${T("lobby.playerName")}<input data-player-name value="${escHtml(localPlayerName)}" maxlength="24" aria-label="${escHtml(T("lobby.playerName"))}"></label></div>
          <div class="online-actions" data-title="${T("lobby.win.join")}"><button type="button" class="action create-room-action" data-action="create-room"><span>${T("lobby.createRoom")}</span><span aria-hidden="true">↗</span></button><div class="join-room-block"><label for="room-code-input">${T("lobby.haveCode")}</label><div class="room-join"><input id="room-code-input" data-room-input placeholder="${escHtml(T("lobby.codePlaceholder"))}" value="${escHtml(joinCodeDraft || roomId || "")}" aria-label="${escHtml(T("lobby.haveCode"))}"><button type="button" class="action secondary" data-action="join-room">${T("lobby.joinRoom")} <span aria-hidden="true">→</span></button></div></div><p class="room-status">${roomStatus === "offline" && !roomNotice ? T("lobby.privateNote") : lobbyStatusLabel()}</p></div>
        </section>
        <footer class="home-footer"><span>01 / ${T("lobby.footer1")}</span><span>02 / ${T("lobby.footer2")}</span><span>03 / ${T("lobby.footer3")}</span></footer>
      </main>`;
    app.querySelector("[data-action=create-room]").addEventListener("click", handleCreateRoom);
    app.querySelector("[data-action=join-room]").addEventListener("click", handleJoinRoom);
    app.querySelector("[data-player-name]").addEventListener("input", handleNameChange);
    return;
  }

  const active = currentPlayer();
  const boardAreas = Object.entries(state.board.areaAtPosition);
  const otherPlayers = Object.values(state.players).filter((p) => (
    p.id !== state.currentPlayerId && p.alive && canTargetWithAttack(state, state.currentPlayerId, p.id)));
  const pendingReaction = state.pendingActions[0];
  const canAct = canControlCurrentPlayer();
  const isGameOver = state.gameOver || state.phase === GAME_PHASES.GAME_OVER;
    if (canAct && !isGameOver && !wasMyTurn && roomRole !== "local") ping();
    wasMyTurn = canAct;
  const winnerNames = state.winners.map((id) => state.players[id]?.name ?? id);
  const me = state.players[localPlayerId] ?? active;
  const myCharacter = me.characterId ? getCharacter(me.characterId) : null;
  const pct = (p) => Math.max(0, Math.round((p.hp / p.maxHp) * 100));
  const myHasHp = Number.isFinite(me.maxHp) && Number.isFinite(me.hp);
  ensureMarks();
  const tagInput = app.querySelector("[data-tag-input]");
  const tagDraft = tagInput ? { value: tagInput.value, focused: document.activeElement === tagInput, pos: tagInput.selectionStart } : null;
  // Position visible : tant que le de du joueur tourne, son pion reste sur la
  // derniere zone revelee ; a l'arret, pendingDice se vide et le rendu saute.
  const shownAreaOf = (p) => {
    if (!diceRolling()) return p.areaId;
    const revealedMoves = state.events.filter((e) => e.type === "PLAYER_MOVED" && e.playerId === p.id && !pendingDice.has(e));
    const pendingMove = state.events.some((e) => pendingDice.has(e) && ((e.type === "MOVEMENT_ROLLED" && e.playerId === p.id) || (e.type === "PLAYER_MOVED" && e.playerId === p.id)));
    return pendingMove ? (revealedMoves.at(-1)?.areaId ?? null) : p.areaId;
  };
  const occupantsOf = (areaId) => Object.values(state.players).filter((p) => shownAreaOf(p) === areaId);

  app.innerHTML = `
  <main class="game-screen">
    <header class="bar">
      <a class="wordmark" href="./">Free the Memes</a>
      <div class="bar-right">${renderLocaleSelect()}<span class="chip">${roomId ?? "local"}</span><span class="chip">${phaseLabel()}</span>
        <button class="action secondary" data-action="mute" aria-label="Son">${isMuted() ? "🔇" : "🔊"}</button>
        <button class="action secondary" data-action="toggle-log">${T("ui.log")}</button>
        <button class="action secondary" data-action="reset">${T("ui.quit")}</button>
      </div>
    </header>
  
    <section class="stage">
      <div class="turnline ${canAct ? "mine" : ""}">${isGameOver ? "Partie terminée" : canAct ? "C'est ton tour" : `Tour de <b>${active.name}</b>`}</div>
      ${isGameOver ? `<div class="victory"><h2>${winnerNames.length > 1 ? "Victoires" : "Victoire"}</h2>${winnerNames.join(", ")} · ${state.bodyCount} éliminé(s)</div>` : ""}
      <div class="board">
        <svg class="tri" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="6,18 94,18 50,94"/></svg>
        ${boardAreas.map(([pos, areaId], i) => `
          <article class="zone win z${i} ${areaId === active.areaId ? "here" : ""}">
            <div class="win-title"><span>${AREA_ICONS[areaId] ?? "📍"} ${getAreaLabel(areaId)}</span><span class="zone-dice">🎲 ${diceLabel(areaId)}</span></div>
            <div class="win-body">
              <p class="zone-effect">${T(AREA_BY_ID[areaId].effectKey)}</p>
              <div class="zone-tokens">${occupantsOf(areaId)
                .map((p) => renderPieceToken(p, active)).join("") || '<span class="empty">·</span>'}</div>
            </div>
          </article>`).join("")}
        <div class="dice-slot win"><div class="win-title">dés.exe</div><div class="dice-body"></div></div>
      </div>
      <div class="dock">${renderDock({ active, canAct, pendingReaction, isGameOver, otherPlayers })}</div>
    </section>

    <aside class="side">
      <section class="win"><div class="win-title">${T("ui.yourCharacter")}</div><div class="win-body">
        ${myCharacter ? `
          <div class="me-name"><span class="pl-avatar piece-${pieceIndexFor(me.id)}">${me.name[0].toUpperCase()}</span>
            <b>${T(myCharacter.nameKey)}</b>
            <span class="badge f-${myCharacter.faction}">${T(`factions.${myCharacter.faction}`)}</span>
            <span class="badge">${me.revealed ? T("ui.revealed") : T("ui.secret")}</span></div>
          <div class="hp"><span>HP</span><div class="hp-bar"><div class="hp-fill" style="width:${myHasHp ? pct(me) : 100}%"></div></div><span>${myHasHp ? `${me.hp}/${me.maxHp}` : "?"}</span></div>
          <dl class="sheet">
            <dt>${T("ui.ability")}</dt><dd>${T(myCharacter.abilityKey)}</dd>
            <dt>${T("ui.winCondition")}</dt><dd>${T(myCharacter.winConditionKey)}</dd>
          </dl>` : `<div class="me-name">${T("ui.hiddenIdentity")}</div>`}
      </div></section>

      <section class="win"><div class="win-title">${T("ui.equipment")}</div><div class="win-body">
        ${me.equipment.map((id) => `<div class="eq"><b>${getEquipmentLabel(id)}</b><small>${getEquipmentText(id)}</small></div>`).join("") || `<small>${T("ui.nothingYet")}</small>`}
      </div></section>

      <section class="win"><div class="win-title">${T("ui.players")}</div><div class="win-body">
        ${state.turnOrder.map((id) => state.players[id]).filter((p) => p && p.id !== me.id).map((p) => {
          const ch = p.revealed && p.characterId ? getCharacter(p.characterId) : null;
          const taggable = p.id !== me.id;
          return `
          <div class="pl piece-${pieceIndexFor(p.id)} ${p.id === active.id ? "active" : ""} ${p.alive ? "" : "dead"} ${ch ? "revealed" : ""} ${taggable && selectedTag ? "droppable" : ""}"
               ${taggable ? `data-player="${p.id}"` : ""} ${ch ? `title="${esc(T(ch.abilityKey))}"` : ""}>
            <span class="pl-avatar">${p.name[0].toUpperCase()}</span>
            <span><b>${p.name}</b>
              ${ch ? `<em class="pl-id"><i class="badge f-${ch.faction}">${T(`factions.${ch.faction}`)}</i> ${T(ch.nameKey)}</em>` : ""}
              <small>${p.alive ? getAreaLabel(p.areaId) : T("ui.eliminated")}</small>
              <small>${p.equipment.length ? p.equipment.map(getEquipmentLabel).join(", ") : "–"}</small></span>
            <span>${p.alive ? "" : "×"}</span>
            ${taggable ? `<div class="pl-tags">${renderMarks(p.id)}</div>` : ""}
          </div>`;
        }).join("")}
        <div class="tags-box">${renderTagPalette()}</div>
      </div></section>
    </aside>
  </main>`;

  if (tagDraft) {
    const el = app.querySelector("[data-tag-input]");
    el.value = tagDraft.value;
    if (tagDraft.focused) { el.focus(); el.setSelectionRange(tagDraft.pos, tagDraft.pos); }
  }

  fillLog();
  app.querySelector("[data-action=toggle-log]")?.addEventListener("click", () => {
    logOpen = !logOpen;
    logWin.hidden = !logOpen;
    if (logOpen) fillLog();
  });
  app.querySelector(".dice-body").append(diceHost);
  syncDice();

  app.querySelector("[data-action=primary]")?.addEventListener("click", handlePrimaryAction);
  app.querySelector("[data-action=pending]")?.addEventListener("click", handlePendingReaction);
  app.querySelectorAll("[data-destination]").forEach((button) => button.addEventListener("click", () => handlePendingReaction(button.dataset.destination)));
  app.querySelectorAll("[data-roll-index]").forEach((button) => button.addEventListener("click", () => handlePendingReaction(null, Number(button.dataset.rollIndex))));
  app.querySelectorAll("[data-pending-choice]").forEach((button) => button.addEventListener("click", () => {
    resolvePendingChoice(JSON.parse(decodeURIComponent(button.dataset.pendingChoice)));
  }));
  app.querySelector("[data-action=reset]").addEventListener("click", () => {
    if (isHost && hostSession) {
      const currentPlayers = hostSession.authority.state.players;
      const lobbyPlayers = players.map((player, index) => ({
        ...player,
        name: index === 0 ? localPlayerName : currentPlayers[player.id]?.name ?? player.name
      }));
      const lobbyState = createLocalGame(lobbyPlayers, { startingPlayerIndex: 0 });
      hostSession.authority.replaceState(lobbyState);
      roomPlayers = Object.values(lobbyState.players);
    }
    state = null;
    seenEvents = null;
    clearMarks();
    privateState = null;
    wasMyTurn = false;
    render();
  });
  app.querySelector("[data-action=mute]").addEventListener("click", (e) => {
    toggleMuted();
    e.currentTarget.textContent = isMuted() ? "🔇" : "🔊";
  });
  app.querySelectorAll("[data-reward]").forEach((b) => b.addEventListener("click", () => resolveReward(b.dataset.reward)));
  app.querySelector("[data-reward-none]")?.addEventListener("click", () => resolveReward(null));
  app.querySelectorAll("[data-target]").forEach((button) => button.addEventListener("click", () => handleAttack(button.dataset.target)));
  app.querySelector("[data-area-attack]")?.addEventListener("click", () => handleAttack(otherPlayers[0]?.id));
  app.querySelector("[data-reaction=pay-to-win-damage]")?.addEventListener("click", () => resolveReaction({ action: "damage" }, "Pay-to-Win: deal damage"));
  app.querySelectorAll("[data-reaction=pay-to-win-steal]").forEach((button) => button.addEventListener("click", () => (
    resolveReaction({ action: "steal", cardId: button.dataset.card, confirmReveal: true }, `Pay-to-Win: steal ${button.dataset.card}`)
  )));
  app.querySelector("[data-reaction=lance-plain]")?.addEventListener("click", () => resolveReaction({}, "Telescopic Lance: plain damage"));
  app.querySelector("[data-reaction=lance-bonus]")?.addEventListener("click", () => resolveReaction({ confirmReveal: true }, "Telescopic Lance: bonus damage"));
  app.querySelector("[data-reaction=optional-reveal]")?.addEventListener("click", () => resolveReaction({ confirmReveal: true }, "reveal & activate reaction"));
  app.querySelector("[data-reaction=optional-decline]")?.addEventListener("click", () => resolveReaction({ decline: true }, "decline reaction"));
};

document.documentElement.lang = locale;
loadMessages(locale).then(() => {
  render();
  if (roomId) connectToRoom(roomId);
});
```

src/ui/dice-tray.css
```
/* Odomètre de dés. Tout est piloté par --cell, posé par le JS.
   Police optionnelle : Barlow Condensed (sinon repli sur Arial Narrow). */

.dice-tray {
    --gold: 238, 229, 139;
    --die-bg: #0b100d;
    --stroke: max(2px, calc(var(--cell) * .035));

    --fade: linear-gradient(to bottom,
        transparent 0,
        rgba(var(--gold), .08) calc(var(--T) * .20),
        rgba(var(--gold), .28) calc(var(--T) * .44),
        rgba(var(--gold), .62) calc(var(--T) * .68),
        rgb(var(--gold)) var(--T),
        rgb(var(--gold)) calc(var(--T) + var(--cell)),
        rgba(var(--gold), .62) calc(var(--T) + var(--cell) + var(--B) * .32),
        rgba(var(--gold), .28) calc(var(--T) + var(--cell) + var(--B) * .56),
        rgba(var(--gold), .08) calc(var(--T) + var(--cell) + var(--B) * .79),
        transparent calc(var(--T) + var(--cell) + var(--B)));

    --ext: calc(var(--cell) * .9);

    position: relative;
    display: inline-flex;
    align-items: flex-start;
    gap: calc(var(--cell) * .45);
    height: calc(var(--T) + var(--cell) + var(--B));
    font-family: "Barlow Condensed", "Arial Narrow", "Roboto Condensed", Arial, sans-serif;
}

.dice-tray .center-line {
    position: absolute;
    left: calc(var(--ext) * -1);
    right: calc(var(--ext) * -1);
    top: calc(var(--T) + var(--cell) / 2);
    height: max(2px, calc(var(--cell) * .025));
    transform: translateY(-50%);
    background: linear-gradient(to right,
        transparent 0,
        rgba(var(--gold), .9) var(--ext),
        rgba(var(--gold), .9) calc(100% - var(--ext)),
        transparent 100%);
    z-index: 0;
}
.dice-tray .center-line::before,
.dice-tray .center-line::after {
    content: "";
    position: absolute;
    top: 50%;
    width: max(5px, calc(var(--cell) * .08));
    aspect-ratio: 1;
    background: rgb(var(--gold));
    transform: translate(-50%, -50%) rotate(45deg);
}
.dice-tray .center-line::before { left: calc(var(--ext) - var(--cell) * .14); }
.dice-tray .center-line::after  { left: calc(100% - var(--ext) + var(--cell) * .14); }

.dice-tray .die {
    position: relative;
    width: calc(var(--cell) * .8);
    height: calc(var(--T) + var(--cell) + var(--B));
    overflow: hidden;
    z-index: 1;
    user-select: none;
    -webkit-user-select: none;
    background:
        linear-gradient(to bottom,
            transparent var(--T),
            rgba(var(--gold), .07) var(--T),
            rgba(var(--gold), .02) calc(var(--T) + var(--cell) / 2),
            rgba(var(--gold), .07) calc(var(--T) + var(--cell)),
            transparent calc(var(--T) + var(--cell))),
        var(--die-bg);
}

/* Traits verticaux droits */
.dice-tray .die::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border: calc(var(--stroke) * 1.5) solid transparent;
    z-index: 20;
    background:
        var(--fade) left top  / var(--stroke) 100% no-repeat,
        var(--fade) right top / var(--stroke) 100% no-repeat;
}

.dice-tray .window {
    position: absolute;
    inset: 0;
    overflow: hidden;
    -webkit-mask-image: var(--fade);
    mask-image: var(--fade);
}
.dice-tray .roller { position: absolute; inset: 0; }

.dice-tray .number {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: var(--cell);
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgb(var(--gold));
    font-size: calc(var(--cell) * .77);
    font-weight: 300;
    line-height: 1;
    will-change: transform;
}

.dice-tray .separator {
    position: absolute;
    left: 0;
    right: 0;
    height: var(--stroke);
    background: rgb(var(--gold));
    box-shadow: 0 0 calc(var(--cell) * .07) rgba(var(--gold), .35);
    z-index: 5;
    pointer-events: none;
}
.dice-tray .separator.top    { top: calc(var(--T) - var(--stroke) / 2); }
.dice-tray .separator.bottom { top: calc(var(--T) + var(--cell) - var(--stroke) / 2); }

.dice-tray .die.settled .separator { animation: dice-flash .6s ease-out; }
@keyframes dice-flash {
    0%   { filter: brightness(1.6); box-shadow: 0 0 calc(var(--cell) * .2) rgba(var(--gold), .9); }
    100% { filter: brightness(1); }
}
```

src/ui/sounds.js
```
// sound.js - sons synthétisés avec WebAudio (aucun fichier audio).
//
//   Dés :       tick(die)  thunk(die, value)        -> onTick / onSettle du DiceTray
//   Interface : click()  ping()  bonk()
//   Événements: hit(amount)  heal()  death()  tada()
//   Sourdine :  toggleMuted() / isMuted() / setMuted(v)   (mémorisé)

const KEY = "ftm-muted";

let ctx = null;
let master = null;
let noise = null;

let muted = false;
try { muted = localStorage.getItem(KEY) === "1"; } catch { /* stockage indisponible */ }


/* ---------------------------------------------------------
   Initialisation (débloquée par le premier clic / première touche)
   --------------------------------------------------------- */

function ensure() {
    if (ctx) {
        if (ctx.state === "suspended") ctx.resume();
        return;
    }

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    ctx = new AC();

    const comp = ctx.createDynamicsCompressor();   // évite la saturation
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(comp);
    comp.connect(ctx.destination);

    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
}

["pointerdown", "keydown"].forEach((type) =>
    window.addEventListener(type, ensure, { passive: true })
);

const ready = () => ctx && !muted;


/* ---------------------------------------------------------
   Utilitaires
   --------------------------------------------------------- */

// vary(0.1) -> nombre aléatoire entre 0.9 et 1.1
const vary = (amount) => 1 + (Math.random() * 2 - 1) * amount;

const clamp01 = (x) => Math.min(1, Math.max(0, x));

// Sortie stéréo : le D6 à gauche, le D4 à droite
function dest(die) {
    if (!die || !ctx.createStereoPanner) return master;
    const p = ctx.createStereoPanner();
    p.pan.value = die.sides === 4 ? 0.3 : -0.3;
    p.connect(master);
    return p;
}

function envelope(gain, t, peak, duration) {
    gain.gain.setValueAtTime(peak, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
}

function note(type, freq, t, peak, duration, freqEnd, out = master) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t + duration * 0.8);
    envelope(g, t, peak, duration);
    o.connect(g);
    g.connect(out);
    o.start(t);
    o.stop(t + duration + 0.02);
}

// Petite salve de bruit filtré : base des "tic" et des impacts
function burst(t, freq, q, peak, duration, out = master) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    envelope(g, t, peak, duration);
    src.connect(f);
    f.connect(g);
    g.connect(out);
    src.start(t);
}


/* ---------------------------------------------------------
   DÉS
   --------------------------------------------------------- */

const lastTickAt = new WeakMap();

/* Un chiffre passe. Le son dépend de la vitesse, déduite du temps écoulé
   depuis le tic précédent du même dé : rapide = sec et aigu ; en ralentissant,
   le tic devient plus grave, plus fort, avec un petit "corps" de bois. */
export function tick(die) {
    if (!ready()) return;

    const t = ctx.currentTime;
    const now = performance.now();

    const dt = die ? now - (lastTickAt.get(die) ?? 0) : 40;
    if (die) lastTickAt.set(die, now);

    // 0 = vitesse maximale (~40 ms entre deux tics), 1 = presque arrêté (~180 ms)
    const slow = dt > 400 ? 0.6 : clamp01((dt - 40) / 140);

    const base  = (die && die.sides === 4 ? 2300 : 1700) * (1 - 0.35 * slow);
    const out   = dest(die);

    burst(t, (base + Math.random() * 1000) * vary(0.1), 3.5 + 3 * slow,
          (0.09 + 0.10 * slow) * vary(0.3), 0.028 + 0.02 * slow, out);

    if (slow > 0.35) {
        note("sine", 280 * (1 - 0.3 * slow) * vary(0.08), t, 0.05 * slow, 0.05, 150, out);
    }
}

/* Le dé s'arrête : "clunk" + claque d'impact.
   Plus la valeur est haute, plus le son est clair. */
export function thunk(die, value) {
    if (!ready()) return;

    const t = ctx.currentTime;
    const sides = die ? die.sides : 6;
    const bright = value && sides > 1 ? (value - 1) / (sides - 1) : 0.5;

    const start = (sides === 4 ? 190 : 150) * (0.92 + 0.16 * bright) * vary(0.06);
    const out = dest(die);

    note("sine", start, t, 0.16 * vary(0.25), 0.11, 55 * vary(0.1), out);
    burst(t, 900 * vary(0.2), 1.2, 0.07 * vary(0.3), 0.03, out);
}


/* ---------------------------------------------------------
   INTERFACE
   --------------------------------------------------------- */

export function click() {
    if (!ready()) return;
    note("triangle", 520 * vary(0.1), ctx.currentTime, 0.07 * vary(0.3), 0.05, 260 * vary(0.1));
}

/* À toi de jouer */
export function ping() {
    if (!ready()) return;
    const t = ctx.currentTime;
    note("sine", 784,  t,        0.10, 0.30);
    note("sine", 1175, t + 0.09, 0.10, 0.38);
}

/* Action refusée : deux "bonk" descendants, façon boîte d'erreur */
export function bonk() {
    if (!ready()) return;
    const t = ctx.currentTime;
    note("square", 311, t,        0.04, 0.12);
    note("square", 233, t + 0.10, 0.04, 0.22);
}


/* ---------------------------------------------------------
   ÉVÉNEMENTS DE JEU
   --------------------------------------------------------- */

/* Dégâts : plus le montant est élevé, plus l'impact est lourd. */
export function hit(amount = 1) {
    if (!ready()) return;

    const t = ctx.currentTime;
    const p = clamp01(amount / 6);

    note("sine", (150 - 40 * p) * vary(0.05), t, 0.12 + 0.08 * p, 0.14 + 0.08 * p, 45);
    burst(t, 700 * vary(0.2), 1, 0.10 + 0.08 * p, 0.05);

    if (amount >= 4) {                      // gros coup : deuxième choc
        note("sine", 110, t + 0.07, 0.12, 0.2, 40);
    }
}

/* Soin : petit arpège doux montant */
export function heal() {
    if (!ready()) return;
    const t = ctx.currentTime;
    [523, 659, 784].forEach((f, i) => note("sine", f, t + i * 0.06, 0.06, 0.28));
}

/* Mort d'un joueur : chute grave */
export function death() {
    if (!ready()) return;
    const t = ctx.currentTime;
    note("triangle", 260, t, 0.14, 0.7, 45);
    note("sine", 130, t, 0.12, 0.8, 35);
}

/* Victoire : arpège + accord final */
export function tada() {
    if (!ready()) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => note("triangle", f, t + i * 0.07, 0.09, 0.5));
    [523, 659, 784, 1047].forEach((f) => note("sine", f, t + 0.32, 0.05, 1.2));
}


/* ---------------------------------------------------------
   Sourdine
   --------------------------------------------------------- */

export function isMuted() { return muted; }

export function setMuted(value) {
    muted = Boolean(value);
    try { localStorage.setItem(KEY, muted ? "1" : "0"); } catch { /* ignoré */ }
}

export function toggleMuted() {
    setMuted(!muted);
    return muted;
}
```

src/ui/styles.css
```
/* FREE THE MEMES - "Bureau" : le jeu est un bureau d'ordinateur de 2004.
   Chaque zone, joueur et panneau est une fenetre avec sa barre de titre. */
:root {
  --desk: #2a3fd8; --ink: #101020; --paper: #fff; --chrome: #dcdcec; --muted: #5a5a78;
  --pink: #ff5fa2; --lemon: #ffe44d; --mint: #35e0a1; --sky: #8ad0ff;
  --pc0: #ff5fa2; --pc1: #ffe44d; --pc2: #35e0a1; --pc3: #8ad0ff;
  --pc4: #ff9a4d; --pc5: #b69cff; --pc6: #d6ff5f; --pc7: #ff7a7a;
  --shadow: 4px 4px 0 var(--ink);
  font-family: Tahoma, Verdana, "Segoe UI", sans-serif;
}
* { box-sizing: border-box; }
body {
  margin: 0; min-width: 320px; color: var(--ink);
  background:
    linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px) 0 0 / 24px 24px,
    linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px) 0 0 / 24px 24px,
    var(--desk);
}
h1, h2, h3, p { margin-top: 0; }
button, input { font: inherit; }
:focus-visible { outline: 3px solid var(--lemon); outline-offset: 2px; }
#app.app-shell { min-height: 100svh; }

/* ---- Fenetre generique ---- */
.win { background: var(--paper); border: 2px solid var(--ink); box-shadow: var(--shadow); }
.win-title {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 4px 8px; background: var(--ink); color: var(--paper);
  font-size: 12px; font-weight: 700; letter-spacing: .02em;
}
.win-title::after { content: "\25A1  \00D7"; opacity: .6; letter-spacing: .2em; }
.win-body { padding: 10px; }

/* ---- Boutons ---- */
.action {
  min-height: 40px; padding: 8px 14px; color: var(--ink); background: var(--lemon);
  border: 2px solid var(--ink); border-radius: 2px; box-shadow: 3px 3px 0 var(--ink);
  font-size: 13px; font-weight: 700; cursor: pointer;
  transition: transform .08s, box-shadow .08s;
}
.action:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 var(--ink); }
.action:active { transform: translate(3px, 3px); box-shadow: 0 0 0 var(--ink); }
.action.secondary { background: var(--chrome); }
.action:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: 3px 3px 0 var(--ink); }

/* ---- Pieces (pions) ---- */
.piece { display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px 2px 2px; background: var(--paper); border: 2px solid var(--ink); border-radius: 99px; font-size: 11px; font-weight: 700; will-change: transform; }
.piece-avatar, .pl-avatar { display: grid; place-items: center; width: 22px; height: 22px; border: 2px solid var(--ink); border-radius: 50%; background: var(--pc, var(--pink)); font-size: 11px; font-weight: 800; }
.piece.current { background: var(--lemon); }
.piece.dead { opacity: .45; text-decoration: line-through; }
.piece-0 { --pc: var(--pc0); } .piece-1 { --pc: var(--pc1); } .piece-2 { --pc: var(--pc2); } .piece-3 { --pc: var(--pc3); }
.piece-4 { --pc: var(--pc4); } .piece-5 { --pc: var(--pc5); } .piece-6 { --pc: var(--pc6); } .piece-7 { --pc: var(--pc7); }

/* ---- Accueil + salon : fenetres sur le bureau ---- */
.home-screen, .room-screen { min-height: 100svh; display: grid; grid-template-rows: auto 1fr auto; padding: 0 5vw 20px; color: var(--paper); }
.home-topbar, .room-topbar, .bar { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 14px 0; }
.wordmark { color: var(--paper); font: 900 20px Impact, "Arial Black", sans-serif; letter-spacing: .03em; text-decoration: none; text-transform: uppercase; }
.home-topbar > span, .connection-state { padding: 3px 10px; background: var(--ink); color: var(--lemon); font-size: 11px; font-weight: 700; }
.connection-state i { display: inline-block; width: 8px; height: 8px; margin-right: 6px; border-radius: 50%; background: var(--mint); }
.home-content, .room-content { width: min(1000px, 100%); margin: auto; display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; align-items: center; padding: 30px 0; }
.eyebrow { display: inline-block; margin: 0 0 12px; padding: 3px 8px; background: var(--pink); color: var(--ink); font-size: 12px; font-weight: 800; }
.home-copy h1, .room-main h1 { margin: 0 0 14px; font: 900 clamp(2.6rem, 7vw, 4.6rem)/.95 Impact, "Arial Black", sans-serif; text-transform: uppercase; }
.home-copy h1 em { font-style: normal; color: var(--lemon); }
.home-intro, .room-intro { max-width: 440px; font-size: 16px; line-height: 1.5; }
.name-field { display: grid; gap: 6px; max-width: 340px; margin-top: 26px; font-size: 12px; font-weight: 700; }
input { min-height: 42px; padding: 8px 10px; color: var(--ink); background: var(--paper); border: 2px solid var(--ink); border-radius: 2px; }
.online-actions, .invite-block, .room-roster { position: relative; display: grid; gap: 16px; padding: 44px 16px 16px; color: var(--ink); background: var(--paper); border: 2px solid var(--ink); box-shadow: var(--shadow); }
.online-actions::before, .invite-block::before, .room-roster::before {
  content: "salon.exe"; position: absolute; inset: 0 0 auto 0; padding: 5px 10px; background: var(--ink); color: var(--paper); font-size: 12px; font-weight: 700;
}
.create-room-action { display: flex; justify-content: space-between; align-items: center; width: 100%; min-height: 58px; background: var(--pink); font-size: 16px; }
.join-room-block > label, .invite-block > label { display: block; margin-bottom: 6px; font-size: 12px; font-weight: 700; }
.room-join, .invite-field { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
.room-status { margin: 0; font-size: 12px; font-weight: 700; color: var(--muted); }
.room-main .room-status { color: var(--paper); }
.start-room-action { display: flex; justify-content: space-between; width: min(320px, 100%); margin-top: 20px; }
.waiting-note { display: flex; align-items: center; gap: 10px; font-weight: 700; }
.waiting-pulse { width: 10px; height: 10px; background: var(--lemon); animation: blink 1.2s steps(2) infinite; }
@keyframes blink { 50% { opacity: 0; } }
.roster-heading { display: flex; justify-content: space-between; align-items: baseline; }
.roster-heading h2 { margin: 0; font-size: 16px; }
.room-roster ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; }
.room-player { display: grid; grid-template-columns: 30px 1fr auto; align-items: center; gap: 10px; padding: 6px; border: 2px solid var(--ink); background: var(--chrome); font-weight: 700; font-size: 13px; }
.room-player small { background: var(--ink); color: var(--lemon); padding: 1px 6px; font-size: 10px; }
.room-player-mark { display: grid; place-items: center; width: 26px; height: 26px; border: 2px solid var(--ink); background: var(--mint); font-weight: 800; }
.room-player-open { background: transparent; border-style: dashed; opacity: .6; }
.roster-foot { margin: 0; font-size: 11px; color: var(--muted); }
.home-footer { display: flex; justify-content: space-between; gap: 10px; font-size: 11px; font-weight: 700; opacity: .8; }

/* ---- Partie ---- */
.game-screen { height: 100svh; min-height: 600px; display: grid; grid-template-columns: minmax(0, 1fr) 290px; grid-template-rows: auto minmax(0, 1fr); gap: 0 20px; padding: 0 20px 16px; overflow: hidden; }
.bar { grid-column: 1 / -1; }
.bar .chip { padding: 3px 10px; background: var(--ink); color: var(--lemon); font-size: 11px; font-weight: 700; }
.bar-right { display: flex; gap: 8px; align-items: center; }
.bar .action { min-height: 30px; padding: 3px 10px; font-size: 12px; }
.stage { display: flex; flex-direction: column; gap: 12px; min-height: 0; }
.turnline { align-self: flex-start; padding: 5px 12px; background: var(--chrome); border: 2px solid var(--ink); box-shadow: 3px 3px 0 var(--ink); font-size: 13px; }
.turnline.mine { background: var(--lemon); }
.board { position: relative; flex: 1; min-height: 0; width: min(100%, 700px, calc((100svh - 230px) * 1.25)); aspect-ratio: 5 / 4; margin: 0 auto; }
.tri { position: absolute; inset: 0; width: 100%; height: 100%; }
.tri polygon { fill: rgba(255,255,255,.1); stroke: var(--paper); stroke-width: 3; stroke-dasharray: 8 7; vector-effect: non-scaling-stroke; }
.zone { position: absolute; width: 25%; min-width: 120px; transform: translate(-50%, -50%); }
.zone.z0 { left: 24%; top: 13%; } .zone.z1 { left: 76%; top: 13%; }
.zone.z2 { left: 81%; top: 42%; } .zone.z3 { left: 65%; top: 72%; }
.zone.z4 { left: 35%; top: 72%; } .zone.z5 { left: 19%; top: 42%; }
.zone .win-title { font-size: 11px; background: var(--zc, var(--pink)); color: var(--ink); }
.zone.z0, .zone.z1 { --zc: var(--pink); } .zone.z2, .zone.z3 { --zc: var(--mint); } .zone.z4, .zone.z5 { --zc: var(--sky); }
.zone .win-title::after { content: "\00D7"; opacity: 1; }
.zone .win-body { display: flex; flex-wrap: wrap; gap: 4px; min-height: 40px; padding: 7px; }
.zone .empty { color: var(--muted); font-size: 11px; }
.zone.here { box-shadow: 0 0 0 4px var(--lemon), var(--shadow); z-index: 2; }
.dice-slot { position: absolute; left: 50%; top: 41%; transform: translate(-50%, -50%); z-index: 3; }
.dice-slot .win-title { background: var(--pink); color: var(--ink); font-size: 11px; }
.dice-slot .win-title::after { content: "\00D7"; opacity: 1; }
.dice-body { display: flex; justify-content: center; padding: 6px 38px 8px; background: var(--ink); }
.dice-slot .dice-tray { --gold: 255, 228, 77; --die-bg: #101020; }

.dock { padding: 10px; background: var(--chrome); border: 2px solid var(--ink); box-shadow: var(--shadow); }
.dock-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.dock-title { margin-right: auto; font-size: 14px; font-weight: 700; }
.pending-choices { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 8px; }
.pending-label { width: 100%; margin: 6px 0 0; font-size: 12px; font-weight: 700; }
.victory { padding: 12px; background: var(--lemon); border: 2px solid var(--ink); box-shadow: var(--shadow); font-weight: 700; }
.victory h2 { margin: 0 0 4px; font: 900 26px Impact, sans-serif; text-transform: uppercase; }

.side { display: flex; flex-direction: column; gap: 14px; min-height: 0; overflow: auto; padding: 0 6px 6px 0; }
.hp { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; }
.hp-bar { flex: 1; height: 14px; border: 2px solid var(--ink); background: var(--paper); }
.hp-fill { height: 100%; background: var(--mint); background-image: repeating-linear-gradient(90deg, transparent 0 8px, var(--ink) 8px 10px); }
.me-name { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 700; }
.chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
.chip-eq { padding: 2px 7px; background: var(--lemon); border: 2px solid var(--ink); font-size: 11px; font-weight: 700; text-transform: capitalize; }
.pl { display: grid; grid-template-columns: 26px 1fr auto; gap: 8px; align-items: center; padding: 5px 0; border-bottom: 1px dashed var(--muted); font-size: 12px; }
.pl:last-child { border: 0; }
.pl.active b::after { content: " \25C0"; }
.pl.dead { opacity: .45; }
.pl small { display: block; color: var(--muted); }
.pl-avatar { background: var(--pc, var(--pink)); }

@media (max-width: 860px) {
  .game-screen { height: auto; overflow: visible; grid-template-columns: 1fr; padding: 0 12px 16px; }
  .board { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; aspect-ratio: auto; }
  .tri { display: none; }
  .zone { position: static; width: auto; transform: none; }
  .dice-slot { position: static; grid-column: 1 / -1; order: -1; justify-self: center; transform: none; }
  .home-content, .room-content { grid-template-columns: 1fr; gap: 24px; }
}
@media (prefers-reduced-motion: reduce) { .action, .waiting-pulse, .piece { transition: none; animation: none; } }

/* Plateau : boîte au ratio fixe 5:4. Le triangle et les zones sont en % de CETTE boîte.
   Les centres des cartes sont posés sur les arêtes du triangle (6,18) (94,18) (50,94). */
.stage { overflow-y: auto; }
.board { flex: none; width: min(100%, 780px, max(520px, calc((100svh - 230px) * 1.25))); aspect-ratio: 5 / 4; margin: 0 auto; }
.zone { width: 32%; min-width: 170px; }
.zone.z0 { left: 26%;   top: 18%; }
.zone.z1 { left: 74%;   top: 18%; }
.zone.z2 { left: 81.7%; top: 39.3%; }
.zone.z3 { left: 66.7%; top: 65.1%; }
.zone.z4 { left: 33.3%; top: 65.1%; }
.zone.z5 { left: 18.3%; top: 39.3%; }
.dice-slot { top: 44%; }

@media (max-width: 860px) {
  .board { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; aspect-ratio: auto; }
  .zone { position: static; width: auto; min-width: 0; transform: none; }
  .dice-slot { position: static; grid-column: 1 / -1; order: -1; justify-self: center; transform: none; }
}

/* Fiche personnage, équipement, identités révélées */
.badge { display: inline-block; padding: 0 6px; border: 2px solid var(--ink); background: var(--chrome); font: 800 10px/1.5 Tahoma, sans-serif; font-style: normal; }
.f-user { background: var(--sky); } .f-memer { background: var(--mint); } .f-troller { background: var(--pink); }
.me-name { flex-wrap: wrap; }
.sheet { margin: 10px 0 0; font-size: 12px; }
.sheet dt { margin-top: 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--muted); }
.sheet dd { margin: 2px 0 0; line-height: 1.4; }
.eq { padding: 6px 0; border-bottom: 1px dashed var(--muted); }
.eq:last-child { border: 0; }
.eq b { display: block; font-size: 12px; }
.eq small { color: var(--muted); font-size: 11px; line-height: 1.35; }
.pl.revealed { padding-left: 6px; border-left: 4px solid var(--ink); }
.pl-id { display: block; font-style: normal; font-size: 11px; font-weight: 700; }

/* Journal : fenêtre flottante, déplaçable (barre de titre) et redimensionnable (coin) */
.term { position: fixed; right: 20px; bottom: 20px; z-index: 50; width: 420px; height: 260px; min-width: 240px; min-height: 120px; display: flex; flex-direction: column; resize: both; overflow: hidden; background: #012456; color: #eeedf0; border: 2px solid var(--ink); box-shadow: var(--shadow); font: 12px/1.45 Consolas, "Lucida Console", monospace; }
.term[hidden] { display: none; }
.term-bar { display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; background: var(--ink); color: #fff; cursor: grab; touch-action: none; user-select: none; }
.term-x { width: 22px; padding: 0; background: var(--pink); color: var(--ink); border: 2px solid var(--ink); font-weight: 800; line-height: 1; cursor: pointer; }
.term-body { flex: 1; overflow: auto; padding: 8px; }
.term-body div::before { content: "PS> "; color: var(--lemon); }
.term-body .dbg { opacity: .5; }
@media (max-width: 860px) { .term { width: calc(100vw - 24px); right: 12px; } }

/* Pastilles = post-it */
.pl-tags { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 5px; }
.pl-tags:empty { display: none; }
.pl.droppable { cursor: copy; }
.pl.droppable:hover, .pl.over { background: #fff7c2; }
.pl.over { outline: 3px dashed var(--ink); outline-offset: 2px; }
.note { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border: 2px solid var(--ink); box-shadow: 2px 2px 0 var(--ink); font-size: 11px; font-weight: 800; transform: rotate(-1.5deg); user-select: none; }
.note:nth-child(even) { transform: rotate(1.2deg); }
.note button { all: unset; cursor: pointer; font-size: 12px; line-height: 1; opacity: .7; }
.note button:hover { opacity: 1; }
.n0 { background: var(--pink); } .n1 { background: var(--mint); } .n2 { background: var(--lemon); }
.n3 { background: var(--sky); } .n4 { background: var(--pc5); } .n5 { background: var(--paper); }
.note.src { cursor: grab; margin: 0 4px 6px 0; }
.note.src.sel { outline: 3px solid var(--ink); outline-offset: 2px; }
.tags-box { margin-top: 10px; padding-top: 10px; border-top: 2px dashed var(--ink); }
.tag-palette { display: flex; flex-wrap: wrap; }
.tag-new { display: grid; grid-template-columns: 1fr auto; gap: 6px; margin-top: 4px; }
.tag-new input { min-height: 32px; padding: 4px 8px; font-size: 12px; }
.tag-new .action { min-height: 32px; padding: 2px 10px; font-size: 12px; }
.tag-colors { grid-column: 1 / -1; display: flex; gap: 6px; }
.tag-dot { width: 20px; height: 20px; padding: 0; border: 2px solid var(--ink); border-radius: 50%; cursor: pointer; }
.tag-dot.on { outline: 3px solid var(--ink); outline-offset: 2px; }
.tag-hint { margin: 8px 0 0; font-size: 11px; line-height: 1.4; color: var(--muted); }
.tag-err { margin: 4px 0 0; font-size: 11px; font-weight: 700; color: #b00020; }
.tag-clear { all: unset; cursor: pointer; text-decoration: underline; }
.home-copy h1 { font-size: clamp(3.4rem, 10vw, 7rem); line-height: .9; text-shadow: 4px 4px 0 var(--ink); }
.home-copy h1 em { text-shadow: 4px 4px 0 var(--ink); }
```

src/board.js
```
import { AREAS } from "./data/areas.js";

export const BOARD_POSITIONS = Object.freeze([1, 2, 3, 4, 5, 6]);

export const ATTACK_RANGE_PAIRS = Object.freeze([
  Object.freeze([1, 2]),
  Object.freeze([3, 4]),
  Object.freeze([5, 6])
]);

export const ADJACENT_POSITIONS = Object.freeze({
  1: Object.freeze([2, 6]),
  2: Object.freeze([1, 3]),
  3: Object.freeze([4, 2]),
  4: Object.freeze([3, 5]),
  5: Object.freeze([6, 4]),
  6: Object.freeze([5, 1])
});

const shuffle = (items, random) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

export const createBoard = (random = Math.random) => {
  const areaIds = shuffle(Object.values(AREAS).map((area) => area.id), random);

  return {
    areaAtPosition: Object.fromEntries(
      BOARD_POSITIONS.map((position, index) => [position, areaIds[index]])
    ),
    attackRangePairs: ATTACK_RANGE_PAIRS,
    adjacentPositions: ADJACENT_POSITIONS
  };
};

export const getAreaPosition = (board, areaId) => (
  BOARD_POSITIONS.find((position) => board.areaAtPosition[position] === areaId) ?? null
);

export const canAttackFromPosition = (board, attackerPosition, targetPosition) => (
  attackerPosition === targetPosition || ATTACK_RANGE_PAIRS.some(([first, second]) => (
    (first === attackerPosition && second === targetPosition) ||
    (second === attackerPosition && first === targetPosition)
  ))
);
```

src/i18n.js
```
const DEFAULT_LOCALE = "en";

const replaceVariables = (text, variables) => text.replace(
  /\{([^}]+)\}/g,
  (_, key) => variables[key] === undefined ? `{${key}}` : String(variables[key])
);

export const createTranslator = ({ locale, fallbackLocale = DEFAULT_LOCALE, messages }) => {
  const activeMessages = messages[locale] ?? {};
  const fallbackMessages = messages[fallbackLocale] ?? {};

  return (key, variables = {}) => {
    const text = activeMessages[key] ?? fallbackMessages[key];

    if (text === undefined) {
      return replaceVariables(
        fallbackMessages["errors.missingTranslation"] ?? key,
        { key, ...variables }
      );
    }

    return replaceVariables(text, variables);
  };
};

export const loadLocale = async (locale, { baseUrl = "./locales", fetcher = fetch } = {}) => {
  const response = await fetcher(`${baseUrl}/${locale}.json`);

  if (!response.ok) {
    throw new Error(`Unable to load locale: ${locale}`);
  }

  return response.json();
};

export const getLocale = () => {
  if (typeof navigator === "undefined") {
    return DEFAULT_LOCALE;
  }

  return navigator.language.split("-")[0] || DEFAULT_LOCALE;
};

export { DEFAULT_LOCALE };
```

src/mouvement.js
```
import { getAreaForDieTotal } from "./data/areas.js";
import { BOARD_POSITIONS, getAreaPosition } from "./board.js";

const withRollEvent = (state, playerId, roll) => ({
  ...state,
  events: [...state.events, { type: "MOVEMENT_ROLLED", playerId, d6: roll.d6, d4: roll.d4, total: roll.total }]
});

export const rollMovementDice = (rollDie = (sides) => Math.floor(Math.random() * sides) + 1) => {
  const d6 = rollDie(6);
  const d4 = rollDie(4);

  return { d6, d4, total: d6 + d4 };
};

export const resolveMovementRoll = (total, currentAreaId) => {
  if (!Number.isInteger(total) || total < 2 || total > 10) {
    return { ok: false, error: "INVALID_MOVEMENT_TOTAL" };
  }

  if (total === 7) {
    return { ok: true, requiresDestination: true, areaId: null };
  }

  const areaId = getAreaForDieTotal(total);

  if (areaId === currentAreaId) {
    return { ok: true, reroll: true, areaId: null };
  }

  return { ok: true, requiresDestination: false, areaId };
};

export const getAdjacentAreaIds = (board, currentAreaId) => {
  const currentPosition = getAreaPosition(board, currentAreaId);

  if (!currentPosition) {
    return [];
  }

  return board.adjacentPositions[currentPosition]
    .map((position) => board.areaAtPosition[position])
    .filter(Boolean);
};

export const isValidMovementDestination = (board, areaId) => (
  BOARD_POSITIONS.some((position) => board.areaAtPosition[position] === areaId)
);

export const resolveMovementAction = (
  state,
  playerId,
  { rollDie, destinationAreaId } = {}
) => {
  const player = state.players[playerId];

  if (state.phase !== "movement") {
    return { ok: false, state, error: "INVALID_PHASE" };
  }

  if (!player || !player.alive || state.currentPlayerId !== playerId) {
    return { ok: false, state, error: "INVALID_PLAYER" };
  }

  const firstRoll = rollMovementDice(rollDie);
  if (player.equipment.includes("google-maps-medieval-edition") && destinationAreaId === undefined) {
    const secondRoll = rollMovementDice(rollDie);
    const pendingAction = {
      type: "CHOOSE_MOVEMENT_ROLL",
      playerId,
      rolls: [firstRoll, secondRoll]
    };

    return {
      ok: true,
      state: {
        ...state,
        pendingActions: [...state.pendingActions, pendingAction]
      },
      pendingAction
    };
  }

    const roll = firstRoll;
  const resolution = resolveMovementRoll(roll.total, player.areaId);

  if (!resolution.ok) {
    return { ok: false, state, error: resolution.error };
  }

  const rolled = withRollEvent(state, playerId, roll);

  if (resolution.reroll) {
    return { ok: true, state: rolled, roll, reroll: true };
  }

  if (resolution.requiresDestination) {
    if (destinationAreaId === undefined) {
      const pendingAction = {
        type: "CHOOSE_MOVEMENT_DESTINATION",
        playerId,
        excludedAreaId: player.areaId
      };

      return {
        ok: true,
        state: { ...rolled, pendingActions: [...rolled.pendingActions, pendingAction] },
        roll,
        pendingAction
      };
    }

    if (!isValidMovementDestination(state.board, destinationAreaId) || destinationAreaId === player.areaId) {
      return { ok: false, state, error: "INVALID_DESTINATION" };
    }
  }

  const areaId = resolution.requiresDestination ? destinationAreaId : resolution.areaId;
  const nextState = {
    ...rolled,
    players: { ...rolled.players, [playerId]: { ...player, areaId } },
    events: [...rolled.events, {
      type: "PLAYER_MOVED",
      playerId,
      areaId,
      d6: roll.d6,
      d4: roll.d4,
      total: roll.total
    }]
  };

  return { ok: true, state: nextState, roll, areaId };
};

export const resolveMovementDestination = (state, pendingAction, areaId) => {
  if (!state.pendingActions.includes(pendingAction) || pendingAction.type !== "CHOOSE_MOVEMENT_DESTINATION") {
    return { ok: false, state, error: "UNKNOWN_PENDING_ACTION" };
  }

  const player = state.players[pendingAction.playerId];
  if (!player || !isValidMovementDestination(state.board, areaId) || areaId === pendingAction.excludedAreaId) {
    return { ok: false, state, error: "INVALID_DESTINATION" };
  }

  return {
    ok: true,
    state: {
      ...state,
      players: {
        ...state.players,
        [player.id]: { ...player, areaId }
      },
      pendingActions: state.pendingActions.filter((action) => action !== pendingAction),
      events: [...state.events, { type: "PLAYER_MOVED", playerId: player.id, areaId, total: 7 }]
    },
    areaId
  };
};

export const resolveMovementRollChoice = (state, pendingAction, rollIndex) => {
  if (!state.pendingActions.includes(pendingAction) || pendingAction.type !== "CHOOSE_MOVEMENT_ROLL") {
    return { ok: false, state, error: "UNKNOWN_PENDING_ACTION" };
  }

  if (!Number.isInteger(rollIndex) || !pendingAction.rolls[rollIndex]) {
    return { ok: false, state, error: "INVALID_CHOICE" };
  }

  const player = state.players[pendingAction.playerId];
  const roll = pendingAction.rolls[rollIndex];
  const resolution = resolveMovementRoll(roll.total, player.areaId);
  const baseState = withRollEvent({
    ...state,
    pendingActions: state.pendingActions.filter((action) => action !== pendingAction)
  }, pendingAction.playerId, roll);

  if (!resolution.ok) {
    return { ok: false, state, error: resolution.error };
  }

  if (resolution.reroll) {
    return { ok: true, state: baseState, roll, reroll: true };
  }

  if (resolution.requiresDestination) {
    const destinationAction = {
      type: "CHOOSE_MOVEMENT_DESTINATION",
      playerId: pendingAction.playerId,
      excludedAreaId: player.areaId
    };
    return {
      ok: true,
      state: { ...baseState, pendingActions: [...baseState.pendingActions, destinationAction] },
      roll,
      pendingAction: destinationAction
    };
  }

  return {
    ok: true,
    state: {
      ...baseState,
      players: {
        ...baseState.players,
        [player.id]: { ...player, areaId: resolution.areaId }
      },
      events: [...baseState.events, {
        type: "PLAYER_MOVED",
        playerId: player.id,
        areaId: resolution.areaId,
        d6: roll.d6,
        d4: roll.d4,
        total: roll.total
      }]
    },
    roll,
    areaId: resolution.areaId
  };
};
```

sev-server.mjs
```
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT ?? 4173);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

createServer(async (request, response) => {
  const requestPath = decodeURIComponent((request.url ?? "/").split("?")[0]);
  const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  const filePath = normalize(join(root, relativePath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}).listen(port, () => {
  console.log(`Free the Memes running at http://localhost:${port}`);
});
```

index.html
```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#111318">
    <title>Free the Memes</title>
    <link rel="stylesheet" href="./src/ui/styles.css">
    <link rel="stylesheet" href="./src/ui/dice-tray.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300&display=swap" rel="stylesheet">
  </head>
  <body>
    <main id="app" class="app-shell" aria-live="polite"></main>
    <script type="module" src="./src/ui/app.js"></script>
  </body>
</html>
```

package-lock.json
```
{
  "name": "free-the-memes",
  "version": "0.1.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "free-the-memes",
      "version": "0.1.0",
      "dependencies": {
        "trystero": "^0.25.4"
      }
    },
    "node_modules/@noble/secp256k1": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/@noble/secp256k1/-/secp256k1-3.2.0.tgz",
      "integrity": "sha512-Z3ZAWOTxJ0EuTuZTi7Y69iK7GgrLHh8sgm45lVDhg/b3Nk1TpAiKhick2KkZisHuupeepSkyIydN/J459SdX1w==",
      "license": "MIT",
      "funding": {
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/@trystero-p2p/core": {
      "version": "0.25.4",
      "resolved": "https://registry.npmjs.org/@trystero-p2p/core/-/core-0.25.4.tgz",
      "integrity": "sha512-ehvSL1FqW962XyEctXngeDF/IOM1bWmfCKBNR4vwmVa0JGfM0+dlY4TEzSEGghYp3qqGCrpFIVTxdvlBUGVO6Q==",
      "license": "MIT"
    },
    "node_modules/@trystero-p2p/nostr": {
      "version": "0.25.4",
      "resolved": "https://registry.npmjs.org/@trystero-p2p/nostr/-/nostr-0.25.4.tgz",
      "integrity": "sha512-QDox1VVHl0ro/CLfQVUtMS9EQbtJhQM7CCsO4SGv9KrPBT+x3bmOqQ4Y6iugsLzQ6sW+a2cwUTxjDRz/BywqMg==",
      "license": "MIT",
      "dependencies": {
        "@noble/secp256k1": "^3.1.0",
        "@trystero-p2p/core": "0.25.4"
      }
    },
    "node_modules/trystero": {
      "version": "0.25.4",
      "resolved": "https://registry.npmjs.org/trystero/-/trystero-0.25.4.tgz",
      "integrity": "sha512-tFYn/fO1kBeSKLUxRPKHH2n5jIuz9zlPPF9SmCVrGBiPNDGtFZyHuQONMUwftnCclTWlVsLoTus5/6eHhVEg+Q==",
      "license": "MIT",
      "dependencies": {
        "@trystero-p2p/nostr": "0.25.4"
      }
    }
  }
}
```

package.json
```
{
  "name": "free-the-memes",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Free the Memes game engine and browser client.",
  "scripts": {
    "dev": "node dev-server.mjs",
    "test": "node --test tests/*.test.js"
  },
  "dependencies": {
    "trystero": "^0.25.4"
  }
}
```