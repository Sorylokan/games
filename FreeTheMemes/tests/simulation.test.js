import test from "node:test";
import assert from "node:assert/strict";
import { runLocalSimulation } from "../src/game/simulation.js";

test("a deterministic local match reaches a faction victory", () => {
  const state = runLocalSimulation();

  assert.equal(state.gameOver, true);
  assert.deepEqual(state.winners.sort(), ["memer-1", "memer-2"]);
  assert.equal(state.bodyCount, 2);
  assert.equal(state.players["troller-1"].alive, false);
  assert.equal(state.players["troller-2"].alive, false);
});