import test from "node:test";
import assert from "node:assert/strict";
import { createBoard } from "../src/board.js";
import { CHARACTERS } from "../src/data/characters.js";
import { createGameState, createPlayer } from "../src/game/game-state.js";
import { resolveMovementAction, resolveMovementDestination, resolveMovementRollChoice } from "../src/movement.js";

const createMovementState = () => {
  const board = createBoard(() => 0);
  return {
    ...createGameState({
      players: [createPlayer({ id: "player-1", name: "Alice", character: CHARACTERS.DOGE })]
    }),
    board,
    phase: "movement",
    currentPlayerId: "player-1"
  };
};

test("movement applies a non-seven roll to the fixed die-result area", () => {
  const state = createMovementState();
  const result = resolveMovementAction(state, "player-1", {
    rollDie: (sides) => sides === 6 ? 6 : 2
  });

  assert.equal(result.ok, true);
  assert.equal(result.areaId, "attic-hatch");
  assert.equal(result.state.players["player-1"].areaId, "attic-hatch");
});

test("movement creates a pending destination choice on seven", () => {
  const state = createMovementState();
  const result = resolveMovementAction(state, "player-1", {
    rollDie: (sides) => sides === 6 ? 3 : 4
  });

  assert.equal(result.roll.total, 7);
  assert.equal(result.pendingAction.type, "CHOOSE_MOVEMENT_DESTINATION");
  assert.equal(result.state.pendingActions.length, 1);
});

test("movement rejects staying in the same area after a seven", () => {
  const state = createMovementState();
  const currentArea = state.board.areaAtPosition[1];
  state.players["player-1"] = { ...state.players["player-1"], areaId: currentArea };
  const result = resolveMovementAction(state, "player-1", {
    rollDie: (sides) => sides === 6 ? 3 : 4,
    destinationAreaId: currentArea
  });

  assert.equal(result.ok, false);
  assert.equal(result.error, "INVALID_DESTINATION");
});

test("Google Maps creates a choice between two movement rolls", () => {
  const state = createMovementState();
  state.players["player-1"] = {
    ...state.players["player-1"],
    equipment: ["google-maps-medieval-edition"]
  };
  const result = resolveMovementAction(state, "player-1", {
    rollDie: (sides) => sides === 6 ? 4 : 2
  });

  assert.equal(result.ok, true);
  assert.equal(result.pendingAction.type, "CHOOSE_MOVEMENT_ROLL");
  assert.equal(result.pendingAction.rolls.length, 2);
});

test("a seven destination pending action can be resolved", () => {
  const state = createMovementState();
  const pending = resolveMovementAction(state, "player-1", {
    rollDie: (sides) => sides === 6 ? 3 : 4
  });
  const destination = state.board.areaAtPosition[1];
  const result = resolveMovementDestination(pending.state, pending.pendingAction, destination);

  assert.equal(result.ok, true);
  assert.equal(result.state.players["player-1"].areaId, destination);
  assert.equal(result.state.pendingActions.length, 0);
});

test("Google Maps resolves one of its two movement rolls", () => {
  const state = createMovementState();
  state.players["player-1"] = {
    ...state.players["player-1"],
    equipment: ["google-maps-medieval-edition"]
  };
  const pending = resolveMovementAction(state, "player-1", {
    rollDie: (sides) => sides === 6 ? 4 : 2
  });
  const result = resolveMovementRollChoice(pending.state, pending.pendingAction, 1);

  assert.equal(result.ok, true);
  assert.equal(result.areaId, "grandmas-new-bedroom");
  assert.equal(result.state.pendingActions.length, 0);
});
