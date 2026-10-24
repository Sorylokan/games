import test from 'node:test';
import assert from 'node:assert/strict';
import { dispatch } from '../src/game/rules-engine.js';
import { viewFor } from '../src/game/view.js';
import { mk, play, ok } from './helpers.js';

test('viewFor masque les cartes cachées, la pioche et la carte piochée des autres', () => {
  const s = play(mk(3)); s.draw = [9, 8];
  const r = ok(dispatch(s, 'p0', { type: 'drawPile' }));
  const other = viewFor(r, 'p1'), self = viewFor(r, 'p0');
  assert.equal(other.draw, undefined);
  assert.equal(other.drawCount, r.draw.length);
  assert.ok(other.players.every((p) => p.grid.flat().every((c) => c.up || c.v === null)));
  // Correction voulue : la carte piochée est visible par tous (masquage retiré du test).
  assert.equal(other.turn.drawn, 8);
  assert.equal(self.turn.drawn, 8);
});

test('viewFor ne modifie pas l\'état d\'origine', () => {
  const s = mk(2);
  const before = JSON.stringify(s);
  viewFor(s, 'p0');
  assert.equal(JSON.stringify(s), before);
});
