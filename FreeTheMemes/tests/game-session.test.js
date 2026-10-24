import test from "node:test";
import assert from "node:assert/strict";
import { createBoard } from "../src/board.js";
import { CHARACTERS } from "../src/data/characters.js";
import { createGameState, createPlayer, GAME_PHASES } from "../src/game/game-state.js";
import { createHostSession, createClientSession } from "../src/networking/game-session.js";
import { createActionRequest, MESSAGE_TYPES } from "../src/networking/messages.js";
import { NetworkAdapter } from "../src/networking/network-adapter.js";

test("host session resolves a client action and publishes a snapshot", () => {
  const transport = new NetworkAdapter();
  transport.sendPublic = (message) => transport.emit(MESSAGE_TYPES.STATE_UPDATE, { message });
  transport.sendPrivate = (playerId, message) => transport.emit(MESSAGE_TYPES.PRIVATE_STATE_UPDATE, { playerId, message });
  const state = {
    ...createGameState({
      players: [createPlayer({ id: "player-1", name: "Alice", character: CHARACTERS.DOGE })],
      turnOrder: ["player-1"]
    }),
    board: createBoard(() => 0),
    phase: GAME_PHASES.START_TURN,
    currentPlayerId: "player-1"
  };
  const session = createHostSession(state, transport);
  let snapshot;
  const client = createClientSession(transport, (nextSnapshot) => {
    if (nextSnapshot.publicState) snapshot = nextSnapshot.publicState;
  });

  client.requestAction(createActionRequest("player-1", "BEGIN_TURN"));

  assert.equal(session.authority.state.phase, GAME_PHASES.MOVEMENT);
  assert.equal(snapshot.phase, GAME_PHASES.MOVEMENT);
  client.dispose();
  session.dispose();
});

test("client session does not apply state locally", () => {
  const transport = new NetworkAdapter();
  let updates = 0;
  const client = createClientSession(transport, () => { updates += 1; });

  transport.emit(MESSAGE_TYPES.STATE_UPDATE, { message: { type: MESSAGE_TYPES.STATE_UPDATE, state: { phase: "movement" } } });

  assert.equal(updates, 1);
  client.dispose();
});