import test from "node:test";
import assert from "node:assert/strict";
import { CHARACTERS } from "../src/data/characters.js";
import { createGameState, createPlayer } from "../src/game/game-state.js";
import { resolveEvents } from "../src/game/event-resolver.js";

test("a character death triggers Press F through the event resolver", () => {
  const state = createGameState({
    players: [
      createPlayer({ id: "press-f", name: "Alice", character: CHARACTERS.PRESS_F }),
      createPlayer({ id: "victim", name: "Bob", character: CHARACTERS.PARKOUR_GUY })
    ]
  });
  const resolved = resolveEvents(state, [{ type: "PLAYER_DIED", playerId: "victim" }]);

  assert.equal(resolved.players["press-f"].revealed, true);
  assert.deepEqual(resolved.events, [{
    type: "CHARACTER_REVEALED",
    playerId: "press-f",
    reason: "CHARACTER_DIED"
  }]);
});

test("event resolution checks victory after triggers", () => {
  const state = createGameState({
    players: [
      createPlayer({ id: "press-f", name: "Alice", character: CHARACTERS.PRESS_F }),
      { ...createPlayer({ id: "troller", name: "Bob", character: CHARACTERS.POKER_FACE }), alive: false, hp: 0 }
    ]
  });
  const resolved = resolveEvents(state, [{ type: "PLAYER_DIED", playerId: "troller" }]);

  assert.equal(resolved.gameOver, true);
  assert.deepEqual(resolved.winners, ["press-f"]);
});