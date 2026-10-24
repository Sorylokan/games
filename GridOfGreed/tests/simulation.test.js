import test from 'node:test';
import assert from 'node:assert/strict';
import { randomGame } from '../src/game/simulation.js';

const cardCount = (s) => s.draw.length + s.discard.length +
  s.players.reduce((t, p) => t + p.grid.reduce((x, col) => x + (col ? col.length : 0), 0), 0) +
  (s.turn && s.turn.drawn != null ? 1 : 0);

test('simulation : 120 parties aléatoires de 2 à 8 joueurs vont à leur terme sans casser les règles', () => {
  for (let g = 0; g < 120; g++) {
    const n = 2 + (g % 7);
    const final = randomGame(n, 1000 + g, (s) => {
      // Les colonnes retirées vont sur la défausse : le total reste toujours à 150.
      assert.equal(cardCount(s), 150);
    });
    assert.ok(final.winners.length >= 1);
    assert.ok(final.players.some((p) => p.total >= 100));
  }
});
