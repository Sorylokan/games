import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMap, reachable, collect, settle, remaining } from '../src/core/grid.js';

// Un carré rouge entouré de bleu : le rouge est caché tant que le bleu n'est pas parti.
const MAP = [
  'BBBB',
  'BRRB',
  'BRRB',
  'BBBB',
];

test('seul le bord est atteignable au départ', () => {
  const g = parseMap(MAP);
  assert.equal(reachable(g, 4, 'R').length, 0);
  assert.equal(reachable(g, 4, 'B').length, 12);
});

test('un pixel caché devient atteignable quand on ouvre un passage', () => {
  const g = parseMap(MAP);
  g[0][1] = null; // on retire un bleu du haut
  assert.ok(reachable(g, 4, 'R').some(([r, c]) => r === 1 && c === 1));
});

test("collect ne prend pas plus que demandé et s'arrête quand rien n'est atteignable", () => {
  const g = parseMap(MAP);
  assert.equal(collect(g, 4, 'R', 4), 0);
  assert.equal(collect(g, 4, 'B', 5), 5);
  assert.equal(remaining(g), 11);
});

test('settle laisse les boîtes se débloquer mutuellement', () => {
  const g = parseMap(MAP);
  const left = settle(g, 4, [{ color: 'R', rem: 4 }, { color: 'B', rem: 12 }]);
  assert.equal(remaining(g), 0);
  assert.equal(left.length, 0);
});
