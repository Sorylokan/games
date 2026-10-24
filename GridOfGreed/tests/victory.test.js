import test from 'node:test';
import assert from 'node:assert/strict';
import { A, finishScenario } from './helpers.js';

test('fin de partie à 100 : le plus petit total gagne', () => {
  let r = finishScenario(A, A, [11], [0, 95]);
  assert.equal(r.phase, 'gameOver'); assert.deepEqual(r.winners, ['p0']);
  r = finishScenario(A, A, [11], [80, 95]); // 80+24 = 104, 95+12 = 107
  assert.deepEqual(r.winners, ['p0']);
});

test('égalité à la fin de partie : victoire partagée', () => {
  const r = finishScenario(A, A, [11], [80, 92]); // 80+24 = 104 et 92+12 = 104
  assert.deepEqual(r.winners.sort(), ['p0', 'p1']);
});

test('sous 100, la partie continue avec une manche terminée', () => {
  const r = finishScenario(A, A);
  assert.equal(r.phase, 'roundOver'); assert.equal(r.winners, null);
});
