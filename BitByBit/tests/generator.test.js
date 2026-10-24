import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generate, solvable } from '../src/core/generator.js';
import { remaining } from '../src/core/grid.js';
import { levelAt } from '../src/data/levels.js';
import { MAPS } from '../src/data/maps.js';

let id = 0;
const nextId = () => ++id;

test('chaque niveau généré est faisable et compte exactement les pixels de la fresque', () => {
  for (let i = 0; i < MAPS.length; i++) {
    const lvl = { ...levelAt(i), tries: 2 }; // moins d'essais : le test reste rapide
    const { N, target, queues } = generate(lvl, nextId);
    const boxes = queues.flat();
    assert.equal(boxes.reduce((s, b) => s + b.count, 0), remaining(target), lvl.name);
    assert.ok(solvable(target, N, queues, lvl.cap), `${lvl.name} doit être faisable`);
    assert.ok(queues.every((q) => q.length > 0), `${lvl.name} : aucune file vide au départ`);
    const ids = new Set(boxes.map((b) => b.id));
    assert.equal(ids.size, boxes.length, 'identifiants de boîtes uniques');
  }
});

test('la difficulté monte : moins de places après les premières fresques', () => {
  assert.equal(levelAt(0).cap, 4);
  assert.equal(levelAt(5).cap, 3);
  assert.ok(levelAt(MAPS.length).round === 1);
});
