import test from "node:test";
import assert from "node:assert/strict";
import { CHARACTERS } from "../src/data/characters.js";
import { createGameState, createPlayer } from "../src/game/game-state.js";
import { dealDamage, heal } from "../src/game/rules-engine.js";
import { checkWinConditions } from "../src/game/victory.js";

const createTestState = () => createGameState({
  players: [
    createPlayer({ id: "player-1", name: "Alice", character: CHARACTERS.DOGE }),
    createPlayer({ id: "player-2", name: "Bob", character: CHARACTERS.PARKOUR_GUY })
  ],
  turnOrder: ["player-1", "player-2"]
});

test("players start at their character maximum HP", () => {
  const state = createTestState();

  assert.equal(state.players["player-1"].hp, 8);
  assert.equal(state.players["player-2"].hp, 10);
});

test("damage cannot reduce HP below zero and kills at zero", () => {
  const result = dealDamage(createTestState(), "player-1", 99, { source: "player-2" });
  const player = result.state.players["player-1"];

  assert.equal(result.ok, true);
  assert.equal(player.hp, 0);
  assert.equal(player.alive, false);
  assert.equal(player.revealed, true);
  assert.equal(result.state.bodyCount, 1);
});

test("a kill creates an equipment choice for the killer", () => {
  const state = createGameState({
    players: [
      { ...createPlayer({ id: "killer", name: "Alice", character: CHARACTERS.DOGE }), equipment: ["old-card"] },
      { ...createPlayer({ id: "victim", name: "Bob", character: CHARACTERS.PARKOUR_GUY }), equipment: ["lost-card"] }
    ]
  });
  const result = dealDamage(state, "victim", 99, { source: "killer", sourceType: "attack" });
  const reward = result.state.pendingActions[0];

  assert.equal(reward.type, "CHOOSE_EQUIPMENT_REWARD");
  assert.equal(reward.killerId, "killer");
  assert.deepEqual(reward.cardIds, ["lost-card"]);
  assert.deepEqual(result.state.players.killer.equipment, ["old-card"]);
});

test("Gods' Hand Spinner takes all equipment on a kill", () => {
  const state = createGameState({
    players: [
      { ...createPlayer({ id: "killer", name: "Alice", character: CHARACTERS.DOGE }), equipment: ["gods-hand-spinner"] },
      { ...createPlayer({ id: "victim", name: "Bob", character: CHARACTERS.PARKOUR_GUY }), equipment: ["lost-card"] }
    ]
  });
  const result = dealDamage(state, "victim", 99, { source: "killer", sourceType: "attack" });

  assert.deepEqual(result.state.players.killer.equipment, ["gods-hand-spinner", "lost-card"]);
  assert.equal(result.state.pendingActions.length, 0);
});

test("Press F reveals automatically when any character dies", () => {
  const state = createGameState({
    players: [
      createPlayer({ id: "press-f", name: "Alice", character: CHARACTERS.PRESS_F }),
      createPlayer({ id: "victim", name: "Bob", character: CHARACTERS.PARKOUR_GUY })
    ]
  });
  const result = dealDamage(state, "victim", 99);

  assert.equal(result.state.players["press-f"].revealed, true);
});

test("healing cannot exceed maximum HP", () => {
  const damaged = dealDamage(createTestState(), "player-1", 3).state;
  const result = heal(damaged, "player-1", 99);

  assert.equal(result.ok, true);
  assert.equal(result.state.players["player-1"].hp, 8);
});

test("invalid damage is rejected without changing state", () => {
  const state = createTestState();
  const result = dealDamage(state, "player-1", -1);

  assert.equal(result.ok, false);
  assert.equal(result.error, "INVALID_AMOUNT");
  assert.equal(result.state, state);
});

test("all Memers win when every Troller is dead", () => {
  const state = createGameState({
    players: [
      { ...createPlayer({ id: "memer", name: "Alice", character: CHARACTERS.PARKOUR_GUY }), alive: true },
      { ...createPlayer({ id: "troller", name: "Bob", character: CHARACTERS.POKER_FACE }), alive: false, hp: 0 }
    ]
  });
  const victory = checkWinConditions(state);

  assert.equal(victory.gameOver, true);
  assert.deepEqual(victory.winners, ["memer"]);
});

test("a Doge and another winner can win simultaneously", () => {
  const state = createGameState({
    players: [
      createPlayer({ id: "doge", name: "Alice", character: CHARACTERS.DOGE }),
      { ...createPlayer({ id: "pay-to-win", name: "Bob", character: CHARACTERS.PAY_TO_WIN }), equipment: ["a", "b", "c", "d", "e"] }
    ]
  });
  const victory = checkWinConditions(state);

  assert.equal(victory.gameOver, true);
  assert.deepEqual(victory.winners, ["pay-to-win", "doge"]);
});

test("faction victory includes defeated allies", () => {
  const state = createGameState({
    players: [
      { ...createPlayer({ id: "dead-memer", name: "Alice", character: CHARACTERS.PARKOUR_GUY }), alive: false, hp: 0 },
      createPlayer({ id: "living-memer", name: "Bob", character: CHARACTERS.DEATH_NOTE }),
      { ...createPlayer({ id: "troller", name: "Cara", character: CHARACTERS.POKER_FACE }), alive: false, hp: 0 }
    ]
  });
  const victory = checkWinConditions(state);

  assert.deepEqual(victory.winners, ["dead-memer", "living-memer"]);
});