// Host authority tests: lobby, seats, refusals, reconnection, view broadcast.
import test from "node:test";
import assert from "node:assert/strict";
import { HostAuthority } from "../src/networking/host-authority.js";
import { MESSAGE_TYPES, createActionRequest } from "../src/networking/messages.js";

// Fake transport that records everything.
const makeHost = () => {
  const publicMessages = [];
  const privateMessages = [];
  const transport = {
    sendPublic: (m) => publicMessages.push(m),
    sendPrivate: (peerId, m) => privateMessages.push({ peerId, message: m }),
  };
  const stateChanges = [];
  const authority = new HostAuthority({
    transport,
    random: () => 0,
    hostName: "Hôte",
    onStateChange: (s, ev) => stateChanges.push({ s, ev }),
  });
  return { authority, publicMessages, privateMessages, stateChanges };
};

test("un pair qui rejoint le salon est assigné et le salon est diffusé", () => {
  const { authority, publicMessages, privateMessages } = makeHost();
  const playerId = authority.assignPeer("peerA", "Bob", "tokA");

  assert.equal(playerId, "p2");
  assert.deepEqual(privateMessages.at(-1).message, {
    type: MESSAGE_TYPES.PLAYER_ASSIGNED, playerId: "p2", seatToken: "tokA",
  });
  const lobby = publicMessages.at(-1);
  assert.equal(lobby.type, MESSAGE_TYPES.LOBBY_UPDATE);
  assert.deepEqual(lobby.lobby.players.map((p) => p.name), ["Hôte", "Bob"]);
});

test("salon plein : le 9e pair est refusé", () => {
  const { authority, privateMessages } = makeHost();
  for (let i = 0; i < 7; i++) authority.assignPeer("peer" + i, "J" + i);

  assert.equal(authority.assignPeer("peerX", "Trop", null), null);
  assert.equal(privateMessages.at(-1).message.reason, "full");
});

test("startMatch refuse de lancer à un seul joueur", () => {
  const { authority } = makeHost();
  const result = authority.startMatch();
  assert.equal(result.ok, false);
  assert.equal(result.message.error, "PAS_ASSEZ_DE_JOUEURS");
});

test("startMatch lance la partie et chaque pair reçoit sa vue masquée", () => {
  const { authority, privateMessages, stateChanges } = makeHost();
  authority.assignPeer("peerA", "Bob", "tokA");
  const result = authority.startMatch();

  assert.equal(result.ok, true);
  const update = privateMessages.at(-1);
  assert.equal(update.message.type, MESSAGE_TYPES.STATE_UPDATE);
  // The view masks the draw pile (count only) and hidden cards.
  assert.equal(update.message.view.draw, undefined);
  assert.equal(typeof update.message.view.drawCount, "number");
  assert.equal(update.message.view.players[1].grid[0][0].v, null);
  assert.equal(stateChanges.length, 1);
});

test("une action illégale est refusée sans diffusion", () => {
  const { authority, privateMessages } = makeHost();
  authority.assignPeer("peerA", "Bob", "tokA");
  authority.startMatch();
  const before = privateMessages.length;

  // Not the time to draw (reveal phase), and wrong seat.
  const wrongPeer = authority.handleRequest(createActionRequest("p2", { type: "drawPile" }), "peerB");
  assert.equal(wrongPeer.ok, false);
  assert.equal(wrongPeer.message.error, "JOUEUR_NON_ASSIGNE");

  const badTiming = authority.handleRequest(createActionRequest("p2", { type: "drawPile" }), "peerA");
  assert.equal(badTiming.ok, false);
  assert.equal(badTiming.message.error, "ACTION_REFUSEE");
  assert.equal(privateMessages.length, before);
});

test("initialReveal passe par l'hôte même hors tour, et diffuse les vues", () => {
  const { authority, privateMessages } = makeHost();
  authority.assignPeer("peerA", "Bob", "tokA");
  authority.startMatch();

  const result = authority.handleRequest(
    createActionRequest("p2", { type: "initialReveal", slots: [{ col: 0, row: 0 }, { col: 1, row: 0 }] }),
    "peerA"
  );

  assert.equal(result.ok, true);
  const view = privateMessages.at(-1).message.view;
  assert.equal(view.players[1].grid[0][0].up, true);
  assert.notEqual(view.players[1].grid[0][0].v, null);
  assert.equal(view.players[1].grid[2][0].v, null); // still hidden
});

test("revanche : réservée à l'hôte, et seulement une fois la partie terminée", () => {
  const { authority } = makeHost();
  authority.assignPeer("peerA", "Bob", "tokA");
  authority.startMatch();

  const tooEarly = authority.handleRequest(createActionRequest("p1", { type: "rematch" }));
  assert.equal(tooEarly.ok, false);

  // Force a game over to test the rematch.
  authority.state.phase = "gameOver";
  authority.state.players.forEach((p) => { p.total = 120; });
  const notHost = authority.handleRequest(createActionRequest("p2", { type: "rematch" }), "peerA");
  assert.equal(notHost.message.error, "RESERVE_A_L_HOTE");

  const result = authority.handleRequest(createActionRequest("p1", { type: "rematch" }));
  assert.equal(result.ok, true);
  assert.equal(result.state.phase, "reveal");
  assert.deepEqual(result.state.players.map((p) => [p.id, p.total]), [["p1", 0], ["p2", 0]]);
});

test("reconnexion : un jeton connu reprend son siège en pleine partie", () => {
  const { authority, privateMessages } = makeHost();
  authority.assignPeer("peerA", "Bob", "tokA");
  authority.startMatch();
  authority.releasePeer("peerA");

  // Unknown peer without a token: refused. Then Bob comes back with a new peerId.
  assert.equal(authority.assignPeer("peerB", "Intrus", null), null);
  assert.equal(privateMessages.at(-1).message.reason, "started");
  assert.equal(authority.assignPeer("peerB", "Bob", "tokA"), "p2");
  // PLAYER_ASSIGNED, then right away an up-to-date view for the new peer.
  assert.equal(privateMessages.at(-2).message.playerId, "p2");
  assert.equal(privateMessages.at(-1).message.type, MESSAGE_TYPES.STATE_UPDATE);
});
