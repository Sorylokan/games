import test from "node:test";
import assert from "node:assert/strict";
import { CHARACTERS } from "../src/data/characters.js";
import { createGameState, createPlayer } from "../src/game/game-state.js";
import { createActionRequest, MESSAGE_TYPES } from "../src/networking/messages.js";
import { NetworkAdapter } from "../src/networking/network-adapter.js";
import { serializeStateForPlayer } from "../src/networking/serialization.js";

const createNetworkState = () => createGameState({
  players: [
    createPlayer({ id: "player-1", name: "Alice", character: CHARACTERS.DOGE }),
    createPlayer({ id: "player-2", name: "Bob", character: CHARACTERS.PARKOUR_GUY })
  ],
  turnOrder: ["player-1", "player-2"]
});

test("public state hides unrevealed Characters but keeps public equipment", () => {
  const state = createNetworkState();
  state.players["player-1"].equipment = ["luck-exe"];
  const snapshot = serializeStateForPlayer(state, "player-2");

  assert.equal(snapshot.publicState.players["player-1"].characterId, undefined);
  assert.equal(snapshot.publicState.players["player-1"].faction, undefined);
  assert.deepEqual(snapshot.publicState.players["player-1"].equipment, ["luck-exe"]);
  assert.equal(snapshot.privateState.characterId, "parkour-guy");
});

test("public state exposes a Character after revelation", () => {
  const state = createNetworkState();
  state.players["player-1"].revealed = true;
  const snapshot = serializeStateForPlayer(state, "player-2");

  assert.equal(snapshot.publicState.players["player-1"].characterId, "doge");
  assert.equal(snapshot.publicState.players["player-1"].faction, "user");
});

test("private revelations are scoped to the receiving player", () => {
  const state = createNetworkState();
  state.privateRevelations["player-1"] = ["player-2"];

  assert.deepEqual(serializeStateForPlayer(state, "player-1").privateState.revealedCharacters, ["player-2"]);
  assert.deepEqual(serializeStateForPlayer(state, "player-2").privateState.revealedCharacters, []);
});

test("action requests use explicit message types", () => {
  assert.deepEqual(createActionRequest("player-1", "ATTACK", { targetId: "player-2" }), {
    type: MESSAGE_TYPES.REQUEST_ACTION,
    playerId: "player-1",
    action: "ATTACK",
    payload: { targetId: "player-2" }
  });
});

test("adapter handlers can be registered and removed", () => {
  const adapter = new NetworkAdapter();
  let received = 0;
  const unsubscribe = adapter.on(MESSAGE_TYPES.PLAYER_JOINED, () => { received += 1; });

  adapter.emit(MESSAGE_TYPES.PLAYER_JOINED, { playerId: "player-2" });
  unsubscribe();
  adapter.emit(MESSAGE_TYPES.PLAYER_JOINED, { playerId: "player-3" });

  assert.equal(received, 1);
});