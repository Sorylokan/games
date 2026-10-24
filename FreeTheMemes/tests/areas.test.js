import test from "node:test";
import assert from "node:assert/strict";
import { createBoard } from "../src/board.js";
import { AREAS } from "../src/data/areas.js";
import { getCardsByDeck } from "../src/data/cards.js";
import { resolveAreaAction, resolveAreaPendingAction } from "../src/game/areas.js";
import { createDeckState } from "../src/game/cards.js";
import { createGameState, createPlayer } from "../src/game/game-state.js";
import { CHARACTERS } from "../src/data/characters.js";

const createAreaState = (areaId = AREAS.TOXIC_RELATIONSHIP.id) => {
  const board = createBoard(() => 0);
  return {
    ...createGameState({
      players: [
        { ...createPlayer({ id: "actor", name: "Alice", character: CHARACTERS.DOGE }), areaId },
        { ...createPlayer({ id: "target", name: "Bob", character: CHARACTERS.PARKOUR_GUY }), areaId }
      ]
    }),
    board,
    decks: Object.fromEntries(["notifications", "white", "black"].map((deckId) => [
      deckId,
      createDeckState(getCardsByDeck(deckId), () => 0)
    ]))
  };
};

test("Toxic Relationship creates and resolves a damage choice", () => {
  const state = createAreaState();
  const created = resolveAreaAction(state, "actor", AREAS.TOXIC_RELATIONSHIP.id);
  const result = resolveAreaPendingAction(created.state, created.pendingAction, {
    targetId: "target",
    action: "damage"
  });

  assert.equal(result.ok, true);
  assert.equal(result.state.players.target.hp, 8);
});

test("Attic Hatch lets the player choose a deck before resolving its card", () => {
  const state = createAreaState(AREAS.ATTIC_HATCH.id);
  const created = resolveAreaAction(state, "actor", AREAS.ATTIC_HATCH.id);
  const result = resolveAreaPendingAction(created.state, created.pendingAction, "white");

  assert.equal(result.ok, true);
  assert.equal(result.pendingAction.type, "RESOLVE_DRAWN_CARD");
  assert.equal(result.pendingAction.deckId, "white");
});

test("Poker Face can lie when receiving a Notification", () => {
  const state = createAreaState(AREAS.OTAKUS_PARADISE.id);
  state.players.target = { ...state.players.target, characterId: "poker-face" };
  const created = resolveAreaAction(state, "actor", AREAS.OTAKUS_PARADISE.id);
  const given = resolveAreaPendingAction(created.state, created.pendingAction, "target");
  const result = resolveAreaPendingAction(given.state, given.pendingAction, "lie");

  assert.equal(result.ok, true);
  assert.equal(result.state.players.target.revealed, false);
});