import test from "node:test";
import assert from "node:assert/strict";
import { createBoard } from "../src/board.js";
import { CHARACTERS } from "../src/data/characters.js";
import { createGameState, createPlayer, GAME_PHASES } from "../src/game/game-state.js";
import { ACTIONS, HostAuthority } from "../src/networking/host-authority.js";
import { MESSAGE_TYPES, createActionRequest } from "../src/networking/messages.js";

const createAuthority = () => {
  const state = {
    ...createGameState({
      players: [
        createPlayer({ id: "player-1", name: "Alice", character: CHARACTERS.DOGE }),
        createPlayer({ id: "player-2", name: "Bob", character: CHARACTERS.PARKOUR_GUY })
      ],
      turnOrder: ["player-1", "player-2"]
    }),
    board: createBoard(() => 0),
    phase: GAME_PHASES.START_TURN,
    currentPlayerId: "player-1"
  };
  const publicMessages = [];
  const privateMessages = [];
  const transport = {
    sendPublic: (message) => publicMessages.push(message),
    sendPrivate: (playerId, message) => privateMessages.push({ playerId, message })
  };

  return { authority: new HostAuthority({ state, transport, random: () => 0 }), publicMessages, privateMessages };
};

test("host accepts the active player's action and broadcasts public/private snapshots", () => {
  const { authority, publicMessages, privateMessages } = createAuthority();
  const result = authority.handleRequest(createActionRequest("player-1", ACTIONS.BEGIN_TURN));

  assert.equal(result.ok, true);
  assert.equal(result.state.phase, GAME_PHASES.MOVEMENT);
  assert.equal(publicMessages.at(-1).type, MESSAGE_TYPES.STATE_UPDATE);
  assert.equal(privateMessages.length, 0);
});

test("host rejects an action from a non-active player without broadcasting", () => {
  const { authority, publicMessages } = createAuthority();
  const result = authority.handleRequest(createActionRequest("player-2", ACTIONS.BEGIN_TURN));

  assert.equal(result.ok, false);
  assert.equal(result.message.type, MESSAGE_TYPES.ERROR);
  assert.equal(publicMessages.length, 0);
});

test("a MOVE request auto-advances the phase instead of looping in movement", () => {
  const { authority } = createAuthority();
  authority.handleRequest(createActionRequest("player-1", ACTIONS.BEGIN_TURN));

  const result = authority.handleRequest(createActionRequest("player-1", ACTIONS.MOVE));

  assert.equal(result.ok, true);
  assert.equal(result.state.phase, GAME_PHASES.AREA_ACTION);
});

test("a pending combat reaction can be resolved by its owner even when it is not their turn", () => {
  const board = createBoard(() => 0);
  const areas = Object.values(board.areaAtPosition);
  const state = {
    ...createGameState({
      players: [
        { ...createPlayer({ id: "player-1", name: "Alice", character: CHARACTERS.PARKOUR_GUY }), areaId: areas[0] },
        { ...createPlayer({ id: "player-2", name: "Bob", character: CHARACTERS.DOGE }), areaId: areas[1] }
      ],
      turnOrder: ["player-1", "player-2"]
    }),
    board,
    phase: GAME_PHASES.ATTACK,
    currentPlayerId: "player-1"
  };
  const transport = { sendPublic: () => {}, sendPrivate: () => {} };
  const authority = new HostAuthority({ state, transport, random: () => 0.7 });

  const attackResult = authority.handleRequest(createActionRequest("player-1", ACTIONS.ATTACK, { targetId: "player-2" }));
  assert.equal(attackResult.ok, true);
  assert.equal(attackResult.state.pendingActions[0].type, "DOGE_ATTACK_REACTION");

  // player-2 (Doge) is not the active player but still owns this reaction.
  const reactionResult = authority.handleRequest(createActionRequest("player-2", ACTIONS.RESOLVE_COMBAT_REACTION, { choice: { decline: true } }));

  assert.equal(reactionResult.ok, true);
  assert.equal(reactionResult.state.players["player-2"].revealed, false);
  assert.equal(reactionResult.state.phase, GAME_PHASES.END_TURN);
});
