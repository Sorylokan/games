import test from 'node:test';
import assert from 'node:assert/strict';
import { A, finishScenario } from './helpers.js';

test('doublement : égalité avec un autre joueur = score du finisseur doublé', () => {
  const r = finishScenario(A, A);
  assert.deepEqual(r.roundScores.raw, [12, 12]);
  assert.deepEqual(r.roundScores.final, [24, 12]);
  assert.equal(r.roundScores.doubled, true);
});

test('pas de doublement si le finisseur a strictement le plus petit score', () => {
  const r = finishScenario(A, [3, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2]);
  assert.deepEqual(r.roundScores.final, [12, 15]);
  assert.equal(r.roundScores.doubled, false);
});

test('pas de doublement d\'un score négatif, même s\'il n\'est pas le plus bas', () => {
  const p0 = [-2, 1, 0, -1, 0, 1, -2, 1, 0, -1, 0, 1]; // -2
  const p1 = [-2, -1, 0, -2, -1, 0, -2, -1, 0, -2, -1, 0]; // -12
  const r = finishScenario(p0, p1);
  assert.deepEqual(r.roundScores.final, [-2, -12]);
  assert.equal(r.roundScores.doubled, false);
  assert.equal(r.players[0].total, -2); // un score négatif fait baisser le total
});

test('au décompte, les colonnes identiques révélées sont retirées avant de compter', () => {
  const p1 = [0, 1, 2, 0, 1, 2, 0, 1, 2, 9, 9, 9];
  const r = finishScenario(A, p1, [9, 10, 11]);
  assert.equal(r.roundScores.raw[1], 9);
  assert.equal(r.players[1].grid[3], null);
});
