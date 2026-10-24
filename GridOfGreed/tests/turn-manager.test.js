import test from 'node:test';
import assert from 'node:assert/strict';
import { dispatch } from '../src/game/rules-engine.js';
import { mk, play, setGrid, ok, A } from './helpers.js';

test('fin de manche : le finisseur joue son dernier tour, les autres en jouent un de plus', () => {
  const s = play(mk(3)); s.draw = [0, 0, 0, 0];
  setGrid(s, 0, A, [0]); setGrid(s, 1, A, [11]); setGrid(s, 2, A, [11]);
  let r = ok(dispatch(s, 'p0', { type: 'drawPile' }));
  r = ok(dispatch(r, 'p0', { type: 'discardFlip', col: 0, row: 0 }));
  assert.equal(r.finisher, 0); assert.equal(r.phase, 'playing'); assert.equal(r.current, 1);
  r = ok(dispatch(r, 'p1', { type: 'drawPile' }));
  r = ok(dispatch(r, 'p1', { type: 'discardFlip', col: 3, row: 2 }));
  assert.equal(r.phase, 'playing'); assert.equal(r.current, 2);
  r = ok(dispatch(r, 'p2', { type: 'drawPile' }));
  r = ok(dispatch(r, 'p2', { type: 'discardFlip', col: 3, row: 2 }));
  assert.equal(r.phase, 'roundOver');
});

test('l\'ordre de jeu suit les joueurs dans l\'ordre, puis reboucle', () => {
  let s = play(mk(3), 2); s.draw = [0, 0];
  setGrid(s, 2, [9, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12], [0]);
  s = ok(dispatch(s, 'p2', { type: 'drawPile' }));
  s = ok(dispatch(s, 'p2', { type: 'discardFlip', col: 0, row: 0 }));
  assert.equal(s.current, 0);
});
