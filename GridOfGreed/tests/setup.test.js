import test from 'node:test';
import assert from 'node:assert/strict';
import { fullDeck } from '../src/data/deck.js';
import { startNextRound, rematch } from '../src/game/setup.js';
import { dispatch } from '../src/game/rules-engine.js';
import { visibleScore } from '../src/game/game-state.js';
import { mulberry32 } from '../src/game/simulation.js';
import { mk, ok, A, finishScenario } from './helpers.js';

test('le paquet fait 150 cartes bien réparties', () => {
  const d = fullDeck(); const n = (v) => d.filter((x) => x === v).length;
  assert.equal(d.length, 150);
  assert.equal(n(-2), 5); assert.equal(n(0), 15); assert.equal(n(-1), 10);
  for (let v = 1; v <= 12; v++) assert.equal(n(v), 10);
});

test('distribution : 12 cartes cachées par joueur, 1 carte de défausse', () => {
  const s = mk(5);
  s.players.forEach((p) => { assert.equal(p.grid.flat().length, 12); assert.ok(p.grid.flat().every((c) => !c.up)); });
  assert.equal(s.discard.length, 1);
  assert.equal(s.draw.length, 150 - 60 - 1);
});

test('révélation initiale puis premier joueur = somme la plus haute', () => {
  let s = mk(3, 7);
  const picks = [[0, 0, 1, 1], [0, 1, 1, 0], [2, 2, 3, 1]];
  s.players.forEach((p, i) => {
    const [c1, r1, c2, r2] = picks[i];
    s = ok(dispatch(s, p.id, { type: 'initialReveal', slots: [{ col: c1, row: r1 }, { col: c2, row: r2 }] }));
  });
  assert.equal(s.phase, 'playing');
  const sums = s.players.map(visibleScore);
  assert.equal(sums[s.current], Math.max(...sums));
  assert.equal(dispatch(s, 'p0', { type: 'initialReveal', slots: [] }).ok, false);
});

test('révélation initiale : refus d\'un doublon ou d\'un second essai', () => {
  const s = mk(2);
  assert.equal(dispatch(s, 'p0', { type: 'initialReveal', slots: [{ col: 0, row: 0 }, { col: 0, row: 0 }] }).ok, false);
  const r = ok(dispatch(s, 'p0', { type: 'initialReveal', slots: [{ col: 0, row: 0 }, { col: 1, row: 1 }] }));
  assert.equal(dispatch(r, 'p0', { type: 'initialReveal', slots: [{ col: 2, row: 0 }, { col: 3, row: 1 }] }).ok, false);
});

test('manche suivante : totaux conservés, nouvelle donne', () => {
  const r = finishScenario(A, A);
  const n = ok(startNextRound(r, mulberry32(9)));
  assert.equal(n.round, 2); assert.equal(n.phase, 'reveal');
  assert.equal(n.players[0].total, 24);
  assert.equal(n.players[1].grid.flat().length, 12);
  assert.equal(startNextRound(n).ok, false);
});

test('revanche : seulement en fin de partie, mêmes joueurs, totaux remis à zéro', () => {
  assert.equal(rematch(finishScenario(A, A)).ok, false); // manche finie, pas la partie
  const over = finishScenario(A, A, [11], [95, 95]);
  assert.equal(over.phase, 'gameOver');
  const n = ok(rematch(over, mulberry32(3)));
  assert.equal(n.phase, 'reveal'); assert.equal(n.round, 1);
  assert.deepEqual(n.players.map((p) => [p.id, p.name, p.total]), [['p0', 'P0', 0], ['p1', 'P1', 0]]);
  assert.equal(n.targetScore, over.targetScore);
  assert.deepEqual(n.history, []);
});
