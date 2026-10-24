import test from 'node:test';
import assert from 'node:assert/strict';
import { dispatch } from '../src/game/rules-engine.js';
import { mk, play, setGrid, ok } from './helpers.js';

test('colonne identique par échange : la carte remplacée est défaussée AVANT les trois', () => {
  const s = play(mk(2)); s.discard = [3, 5];
  setGrid(s, 0, [5, 5, 9, 0, 1, 2, 3, 4, 6, 7, 8, 10], []);
  let r = ok(dispatch(s, 'p0', { type: 'drawDiscard' }));
  r = ok(dispatch(r, 'p0', { type: 'swap', col: 0, row: 2 }));
  assert.equal(r.players[0].grid[0], null);
  assert.deepEqual(r.discard, [3, 9, 5, 5, 5]);
});

test('colonne identique par retournement d\'une carte', () => {
  const s = play(mk(2)); s.draw = [1];
  setGrid(s, 0, [4, 4, 4, 0, 1, 2, 3, 5, 6, 7, 8, 9], [2]);
  let r = ok(dispatch(s, 'p0', { type: 'drawPile' }));
  r = ok(dispatch(r, 'p0', { type: 'discardFlip', col: 0, row: 2 }));
  assert.equal(r.players[0].grid[0], null);
  assert.deepEqual(r.discard.slice(-4), [1, 4, 4, 4]);
});

test('trois cartes identiques ne partent pas tant que toutes ne sont pas visibles', () => {
  const s = play(mk(2)); s.discard = [4];
  setGrid(s, 0, [4, 4, 9, 0, 1, 2, 3, 5, 6, 7, 8, 10], [1]);
  let r = ok(dispatch(s, 'p0', { type: 'drawDiscard' }));
  r = ok(dispatch(r, 'p0', { type: 'swap', col: 0, row: 2 }));
  assert.ok(r.players[0].grid[0]);
});
