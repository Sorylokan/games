import test from "node:test";
import assert from "node:assert/strict";
import { createLocalGame, getCharacterAllocation } from "../src/game/setup.js";

const players = [
  { id: "player-1", name: "Alice" },
  { id: "player-2", name: "Bob" },
  { id: "player-3", name: "Cara" },
  { id: "player-4", name: "Dan" },
  { id: "player-5", name: "Eve" },
  { id: "player-6", name: "Finn" }
];

test("character allocation matches the documented player counts", () => {
  assert.deepEqual(getCharacterAllocation(4), { memer: 2, troller: 2, user: 0 });
  assert.deepEqual(getCharacterAllocation(8), { memer: 3, troller: 3, user: 2 });
  assert.equal(getCharacterAllocation(3), null);
});

test("local setup assigns one character per player and creates all decks", () => {
  const state = createLocalGame(players, { random: () => 0 });
  const assignedCharacters = Object.values(state.players).map((player) => player.characterId);

  assert.equal(assignedCharacters.length, 6);
  assert.equal(new Set(assignedCharacters).size, 6);
    assert.equal(Object.values(state.players).every((player) => player.areaId === null), true);
  assert.deepEqual(Object.keys(state.decks).sort(), ["black", "notifications", "white"]);
  assert.equal(state.board.attackRangePairs.length, 3);
});

test("local setup rejects unsupported player counts", () => {
  assert.throws(
    () => createLocalGame(players.slice(0, 3)),
    /supports 4 to 8 players/
  );
});