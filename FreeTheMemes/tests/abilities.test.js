import test from "node:test";
import assert from "node:assert/strict";
import { createBoard } from "../src/board.js";
import { CHARACTERS } from "../src/data/characters.js";
import { createGameState, createPlayer } from "../src/game/game-state.js";
import { requestAbility, resolveAbility } from "../src/game/abilities.js";

const createAbilityState = (character, playerArea = null) => {
  const board = createBoard(() => 0);
  const player = { ...createPlayer({ id: "actor", name: "Alice", character }), areaId: playerArea };
  const target = { ...createPlayer({ id: "target", name: "Bob", character: CHARACTERS.PARKOUR_GUY }), areaId: board.areaAtPosition[2] };

  return { ...createGameState({ players: [player, target] }), board };
};

test("active abilities require confirmation before revealing identity", () => {
  const state = createAbilityState(CHARACTERS.DEATH_NOTE);
  const requested = requestAbility(state, "actor", { targetId: "target" });
  const rejected = resolveAbility(requested.state, requested.pendingAction, { targetId: "target" });

  assert.equal(rejected.ok, false);
  assert.equal(rejected.error, "REVEAL_CONFIRMATION_REQUIRED");
  assert.equal(state.players.actor.revealed, false);
});

test("DEATH NOTE reveals, marks usage and deals its die result", () => {
  const state = createAbilityState(CHARACTERS.DEATH_NOTE);
  const requested = requestAbility(state, "actor", { targetId: "target" });
  const result = resolveAbility(requested.state, requested.pendingAction, {
    confirmReveal: true,
    targetId: "target"
  }, { rollDie: () => 6 });

  assert.equal(result.ok, true);
  assert.equal(result.state.players.actor.revealed, true);
  assert.equal(result.state.players.actor.abilityState["death-note-strike"], true);
  assert.equal(result.state.players.target.hp, 4);
});

test("an ability cannot be used twice", () => {
  const state = createAbilityState(CHARACTERS.HADOUKEN);
  const requested = requestAbility(state, "actor");
  const used = resolveAbility(requested.state, requested.pendingAction, { confirmReveal: true, targetId: "target" }, { rollDie: () => 2 });
  const second = requestAbility(used.state, "actor");

  assert.equal(second.ok, false);
  assert.equal(second.error, "ABILITY_ALREADY_USED");
});

test("Parkour Guy moves to a valid adjacent area", () => {
  const board = createBoard(() => 0);
  const currentArea = board.areaAtPosition[1];
  const adjacentArea = board.areaAtPosition[2];
  const state = createAbilityState(CHARACTERS.PARKOUR_GUY, currentArea);
  const requested = requestAbility(state, "actor");
  const result = resolveAbility(requested.state, requested.pendingAction, {
    confirmReveal: true,
    areaId: adjacentArea
  });

  assert.equal(result.ok, true);
  assert.equal(result.state.players.actor.areaId, adjacentArea);
});