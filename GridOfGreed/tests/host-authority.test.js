// Tests de l'autorité hôte : salon, assignation, refus, reconnexion, diffusion des vues.
import test from "node:test";
import assert from "node:assert/strict";
import { HostAuthority } from "../src/networking/host-authority.js";
import { MESSAGE_TYPES, createActionRequest } from "../src/networking/messages.js";

// Transport factice qui enregistre tout.
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
  // La vue masque la pioche (compteur seulement) et les cartes cachées.
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

  // Ce n'est pas le moment de piocher (phase de révélation) + mauvais siège.
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
  assert.equal(view.players[1].grid[2][0].v, null); // toujours cachée
});

test("reconnexion : un jeton connu reprend son siège en pleine partie", () => {
  const { authority, privateMessages } = makeHost();
  authority.assignPeer("peerA", "Bob", "tokA");
  authority.startMatch();
  authority.releasePeer("peerA");

  // Inconnu sans jeton : refusé. Puis Bob revient avec un nouveau peerId.
  assert.equal(authority.assignPeer("peerB", "Intrus", null), null);
  assert.equal(privateMessages.at(-1).message.reason, "started");
  assert.equal(authority.assignPeer("peerB", "Bob", "tokA"), "p2");
  // PLAYER_ASSIGNED, puis aussitôt une vue d'état à jour sur le nouveau pair.
  assert.equal(privateMessages.at(-2).message.playerId, "p2");
  assert.equal(privateMessages.at(-1).message.type, MESSAGE_TYPES.STATE_UPDATE);
});
