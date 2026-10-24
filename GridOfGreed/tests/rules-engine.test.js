import test from 'node:test';
import assert from 'node:assert/strict';
import { dispatch } from '../src/game/rules-engine.js';
import { mulberry32 } from '../src/game/simulation.js';
import { mk, play, setGrid, ok, A } from './helpers.js';

test('prendre la défausse puis échanger : la carte remplacée la remplace, la nouvelle est visible', () => {
  const s = play(mk(2)); s.discard = [3, 5]; setGrid(s, 0, A, [4]);
  let r = ok(dispatch(s, 'p0', { type: 'drawDiscard' }));
  assert.equal(r.turn.drawn, 5);
  r = ok(dispatch(r, 'p0', { type: 'swap', col: 1, row: 1 })); // carte cachée de valeur 1
  assert.equal(r.discard.at(-1), 1);
  assert.deepEqual(r.players[0].grid[1][1], { v: 5, up: true });
  assert.equal(r.current, 1);
});

test('pioche : on peut la défausser mais il faut retourner une carte cachée', () => {
  const s = play(mk(2)); s.draw = [9]; setGrid(s, 0, A, [0, 5]);
  let r = ok(dispatch(s, 'p0', { type: 'drawPile' }));
  assert.equal(dispatch(r, 'p0', { type: 'discardFlip', col: 0, row: 1 }).ok, false); // déjà visible
  r = ok(dispatch(r, 'p0', { type: 'discardFlip', col: 0, row: 0 }));
  assert.equal(r.discard.at(-1), 9);
  assert.equal(r.players[0].grid[0][0].up, true);
});

test('après la défausse, on ne peut pas redéfausser : il faut échanger', () => {
  const s = play(mk(2)); setGrid(s, 0, A, [0]);
  const r = ok(dispatch(s, 'p0', { type: 'drawDiscard' }));
  assert.equal(dispatch(r, 'p0', { type: 'discardFlip', col: 0, row: 0 }).ok, false);
});

test('mauvais joueur, mauvaise étape, colonne retirée : refusé', () => {
  const s = play(mk(2));
  assert.equal(dispatch(s, 'p1', { type: 'drawPile' }).ok, false);
  assert.equal(dispatch(s, 'p0', { type: 'swap', col: 0, row: 0 }).ok, false);
  const r = ok(dispatch(s, 'p0', { type: 'drawPile' }));
  assert.equal(dispatch(r, 'p0', { type: 'drawPile' }).ok, false);
  r.players[0].grid[2] = null;
  assert.equal(dispatch(r, 'p0', { type: 'swap', col: 2, row: 0 }).ok, false);
});

test('pioche vide : la défausse est remélangée sauf sa carte du dessus', () => {
  const s = play(mk(2)); s.draw = []; s.discard = [1, 2, 3, 4];
  const r = ok(dispatch(s, 'p0', { type: 'drawPile' }, mulberry32(3)));
  assert.equal(r.discard.length, 1); assert.equal(r.discard[0], 4);
  assert.equal(r.draw.length, 2);
  assert.ok([1, 2, 3].includes(r.turn.drawn));
});
