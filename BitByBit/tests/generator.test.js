import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generate, solvable } from '../src/core/generator.js';
import { remaining, reachable } from '../src/core/grid.js';
import { levelAt, customLevel, packetFor } from '../src/data/levels.js';
import { MAPS } from '../src/data/maps.js';

let id = 0;
const nextId = () => ++id;

test('chaque niveau généré est faisable et compte exactement les pixels de la fresque', () => {
  for (let i = 0; i < MAPS.length; i++) {
    const lvl = { ...levelAt(i), tries: 2 }; // fewer tries keeps the test fast
    const { N, target, queues } = generate(lvl, nextId);
    const boxes = queues.flat();
    assert.equal(boxes.reduce((s, b) => s + b.count, 0), remaining(target), lvl.name);
    assert.ok(solvable(target, N, queues, lvl.cap), `${lvl.name} doit être faisable`);
    assert.ok(queues.every((q) => q.length > 0), `${lvl.name} : aucune file vide au départ`);
    const ids = new Set(boxes.map((b) => b.id));
    assert.equal(ids.size, boxes.length, 'identifiants de boîtes uniques');
  }
});

test('départ jamais bloqué : une boîte utile en tête de file, et la marge prévue (aucune pour un boss)', () => {
  for (let i = 0; i < 12; i++) {
    const lvl = { ...levelAt(i), tries: 2 };
    const { N, target, queues } = generate(lvl, nextId);
    const colors = new Set(reachable(target, N).map(([r, c]) => target[r][c]));
    assert.ok(queues.some((q) => colors.has(q[0].color)), `fresque ${i + 1} : aucune boîte utile au départ`);
    assert.ok(solvable(target, N, queues, lvl.cap - lvl.margin), `fresque ${i + 1} : pas de marge`);
  }
});

test('grande fresque perso (48×48) : faisable, complète, et pas plus de boîtes qu\'une 24×24', () => {
  const L = 'HXAWDRYGBN';
  const map = Array.from({ length: 48 }, (_, r) => Array.from({ length: 48 }, (_, c) => L[(Math.floor(r / 6) + Math.floor(c / 8)) % L.length]).join(''));
  const lvl = customLevel({ name: 'grand', map });
  const { N, target, queues } = generate(lvl, nextId);
  const boxes = queues.flat();
  assert.equal(boxes.reduce((s, b) => s + b.count, 0), remaining(target));
  assert.ok(solvable(target, N, queues, lvl.cap));
  assert.ok(boxes.length < 200, `${boxes.length} boîtes`);
});

test('taille des boîtes : inchangée jusqu\'à 24 de côté, puis proportionnelle à la surface', () => {
  assert.deepEqual(packetFor(12), [4, 12]);
  assert.deepEqual(packetFor(24), [4, 12]);
  assert.deepEqual(packetFor(48), [16, 48]);
});

test('la difficulté monte : moins de places après les premières fresques', () => {
  assert.equal(levelAt(0).cap, 4);
  assert.equal(levelAt(5).cap, 3);
  assert.ok(levelAt(MAPS.length).round === 1);
});

test('une fresque officielle peut imposer son nombre d\'emplacements (2 à 5)', () => {
  MAPS.forEach((m, i) => {
    if (m.slots === undefined) return;
    assert.ok(Number.isInteger(m.slots) && m.slots >= 2 && m.slots <= 5, `${m.id} : slots ${m.slots}`);
    assert.equal(levelAt(i).cap, m.slots);
  });
});

test('boss toutes les 10 fresques, sans marge', () => {
  assert.deepEqual([8, 9, 10, 19].map((i) => levelAt(i).boss), [false, true, false, true]);
  assert.equal(levelAt(9).margin, 0);
  assert.equal(levelAt(8).margin, 1);
});
