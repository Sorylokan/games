import test from "node:test";
import assert from "node:assert/strict";
import { CARDS, getCardsByDeck } from "../src/data/cards.js";
import { addEquipment, createDeckState, discardCard, drawCard, resolveCard, resolvePendingAction } from "../src/game/cards.js";
import { CHARACTERS } from "../src/data/characters.js";
import { createGameState, createPlayer } from "../src/game/game-state.js";

test("all documented cards have stable ids and translation keys", () => {
  assert.equal(CARDS.length, 48);

  for (const card of CARDS) {
    assert.equal(typeof card.id, "string");
    assert.equal(typeof card.nameKey, "string");
    assert.equal(typeof card.textKey, "string");
    assert.equal(typeof card.effect, "string");
  }
});

test("cards are grouped into the three runtime decks", () => {
  assert.equal(getCardsByDeck("notifications").length, 16);
  assert.equal(getCardsByDeck("white").length, 16);
  assert.equal(getCardsByDeck("black").length, 16);
});

test("drawing and discarding cards recycles the discard pile", () => {
  const firstCard = CARDS[0];
  const state = { decks: { test: createDeckState([firstCard], () => 0) }, events: [] };
  const drawn = drawCard(state, "test");
  const discarded = discardCard(drawn.state, "test", drawn.card).state;
  const recycled = drawCard(discarded, "test");

  assert.equal(recycled.card.id, firstCard.id);
  assert.equal(recycled.state.decks.test.draw.length, 0);
});

test("equipment is stored on the player and emits an event", () => {
  const state = createGameState({
    players: [createPlayer({ id: "player-1", name: "Alice", character: CHARACTERS.DOGE })]
  });
  const equipment = CARDS.find((card) => card.type === "equipment");
  const result = addEquipment(state, "player-1", equipment);

  assert.deepEqual(result.state.players["player-1"].equipment, [equipment.id]);
  assert.equal(result.state.events.at(-1).type, "EQUIPMENT_ACQUIRED");
});

test("cards requiring choices create pending actions", () => {
  const state = createGameState({
    players: [createPlayer({ id: "player-1", name: "Alice", character: CHARACTERS.DOGE })]
  });
  const card = CARDS.find((currentCard) => currentCard.effect === "set-hp-2");
  const result = resolveCard(state, "player-1", card);

  assert.equal(result.ok, true);
  assert.equal(result.pendingAction.type, "RESOLVE_CARD_EFFECT");
  assert.equal(result.state.pendingActions.length, 1);
});

test("unsupported card effects are rejected", () => {
  const state = createGameState({
    players: [createPlayer({ id: "player-1", name: "Alice", character: CHARACTERS.DOGE })]
  });
  const result = resolveCard(state, "player-1", {
    id: "unknown-card",
    type: "single-use",
    effect: "not-registered"
  });

  assert.equal(result.ok, false);
  assert.equal(result.error, "UNSUPPORTED_CARD_EFFECT");
});

test("self-heal cards resolve immediately and stay within maximum HP", () => {
  const player = { ...createPlayer({ id: "player-1", name: "Alice", character: CHARACTERS.DOGE }), hp: 4 };
  const state = createGameState({ players: [player] });
  const card = CARDS.find((currentCard) => currentCard.effect === "heal-self-2");
  const result = resolveCard(state, "player-1", card);

  assert.equal(result.ok, true);
  assert.equal(result.state.players["player-1"].hp, 6);
  assert.equal(result.state.pendingActions.length, 0);
});

test("equipment rewards require choosing an available card", () => {
  const state = createGameState({
    players: [
      { ...createPlayer({ id: "killer", name: "Alice", character: CHARACTERS.DOGE }), equipment: [] },
      { ...createPlayer({ id: "victim", name: "Bob", character: CHARACTERS.PARKOUR_GUY }), equipment: ["card-a", "card-b"] }
    ],
  });
  const pendingAction = {
    type: "CHOOSE_EQUIPMENT_REWARD",
    killerId: "killer",
    victimId: "victim",
    cardIds: ["card-a"]
  };
  const stateWithAction = { ...state, pendingActions: [pendingAction] };
  const result = resolvePendingAction(stateWithAction, pendingAction, "card-a");

  assert.equal(result.ok, true);
  assert.deepEqual(result.state.players.killer.equipment, ["card-a"]);
  assert.equal(result.state.pendingActions.length, 0);
});

test("targeted HP-setting cards resolve through pending actions", () => {
  const state = createGameState({
    players: [
      { ...createPlayer({ id: "actor", name: "Alice", character: CHARACTERS.DOGE }), hp: 8 },
      { ...createPlayer({ id: "target", name: "Bob", character: CHARACTERS.PARKOUR_GUY }), hp: 10 }
    ]
  });
  const card = CARDS.find((currentCard) => currentCard.effect === "set-hp-2");
  const created = resolveCard(state, "actor", card);
  const result = resolvePendingAction(created.state, created.pendingAction, { targetId: "target" });

  assert.equal(result.ok, true);
  assert.equal(result.state.players.target.hp, 2);
  assert.equal(result.state.pendingActions.length, 0);
});

test("Notification faction-or-equipment cards offer damage or transfer", () => {
  const state = {
    ...createGameState({
      players: [
        { ...createPlayer({ id: "recipient", name: "Alice", character: CHARACTERS.DOGE }), equipment: ["card-a"] },
        createPlayer({ id: "current", name: "Bob", character: CHARACTERS.PARKOUR_GUY })
      ]
    }),
    currentPlayerId: "current"
  };
  const card = CARDS.find((currentCard) => currentCard.effect === "faction-or-equipment");
  const created = resolveCard(state, "recipient", card);
  const result = resolvePendingAction(created.state, created.pendingAction, {
    action: "give",
    cardId: "card-a"
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.state.players.recipient.equipment, []);
  assert.deepEqual(result.state.players.current.equipment, ["card-a"]);
});

test("Personal Bodyguard prevents attacks until the next turn", () => {
  const state = createGameState({
    players: [createPlayer({ id: "player-1", name: "Alice", character: CHARACTERS.DOGE })]
  });
  const card = CARDS.find((currentCard) => currentCard.effect === "attack-immunity");
  const result = resolveCard(state, "player-1", card);

  assert.equal(result.ok, true);
  assert.equal(result.state.temporaryEffects[0].type, "ATTACK_IMMUNITY");
});

test("every documented card enters a supported resolution path", () => {
  const state = createGameState({
    players: [createPlayer({ id: "player-1", name: "Alice", character: CHARACTERS.DOGE })]
  });

  for (const card of CARDS) {
    const result = resolveCard(state, "player-1", card);
    assert.equal(result.ok, true, `${card.id} should be supported`);
    assert.notEqual(result.error, "UNSUPPORTED_CARD_EFFECT", `${card.id} should not be unsupported`);
  }
});

test("name-initial cards use stable character data", () => {
  const state = createGameState({
    players: [createPlayer({ id: "player-1", name: "Alice", character: CHARACTERS.DOGE })]
  });
  const card = CARDS.find((currentCard) => currentCard.effect === "conditional-reveal-v-or-w");
  const result = resolveCard(state, "player-1", card);

  assert.equal(result.ok, true);
  assert.equal(result.state.players["player-1"].revealed, false);
});