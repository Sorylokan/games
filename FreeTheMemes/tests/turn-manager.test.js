import test from "node:test";
import assert from "node:assert/strict";
import { CHARACTERS } from "../src/data/characters.js";
import { createGameState, createPlayer, GAME_PHASES } from "../src/game/game-state.js";
import {
  beginTurn,
  completeAreaAction,
  completeAttack,
  completeMovement,
  endTurn,
  queueExtraTurn,
  startGame
} from "../src/game/turn-manager.js";

const createTurnState = () => createGameState({
  players: [
    createPlayer({ id: "player-1", name: "Alice", character: CHARACTERS.DOGE }),
    createPlayer({ id: "player-2", name: "Bob", character: CHARACTERS.PARKOUR_GUY }),
    { ...createPlayer({ id: "player-3", name: "Cara", character: CHARACTERS.POKER_FACE }), alive: false, hp: 0 }
  ],
  turnOrder: ["player-1", "player-2", "player-3"]
});

test("a game starts with the first living player in START_TURN", () => {
  const result = startGame(createTurnState());

  assert.equal(result.ok, true);
  assert.equal(result.state.phase, GAME_PHASES.START_TURN);
  assert.equal(result.state.currentPlayerId, "player-1");
  assert.deepEqual(result.state.events, [{ type: "TURN_STARTED", playerId: "player-1" }]);
});

test("a turn advances through the documented phases", () => {
  let state = startGame(createTurnState()).state;
  state = beginTurn(state).state;
  state = completeMovement(state).state;
  state = completeAreaAction(state).state;
  state = completeAttack(state).state;

  assert.equal(state.phase, GAME_PHASES.END_TURN);
});

test("ending a turn skips dead players", () => {
  let state = startGame(createTurnState()).state;
  state = beginTurn(state).state;
  state = completeMovement(state).state;
  state = completeAreaAction(state).state;
  state = completeAttack(state).state;
  state = endTurn(state).state;

  assert.equal(state.currentPlayerId, "player-2");
  assert.equal(state.phase, GAME_PHASES.START_TURN);
  assert.equal(state.events.at(-2).type, "TURN_ENDED");
  assert.equal(state.events.at(-1).type, "TURN_STARTED");
});

test("an extra turn is taken before normal turn order resumes", () => {
  let state = startGame(createTurnState()).state;
  state = queueExtraTurn(state, "player-1").state;
  state = beginTurn(state).state;
  state = completeMovement(state).state;
  state = completeAreaAction(state).state;
  state = completeAttack(state).state;
  state = endTurn(state).state;

  assert.equal(state.currentPlayerId, "player-1");
  assert.deepEqual(state.queuedTurns, []);
});

test("actions from the wrong phase are rejected", () => {
  const state = startGame(createTurnState()).state;
  const result = completeMovement(state);

  assert.equal(result.ok, false);
  assert.equal(result.error, "INVALID_PHASE");
  assert.equal(result.state, state);
});