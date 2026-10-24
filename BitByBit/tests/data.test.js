import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPS } from '../src/data/maps.js';
import { COLORS } from '../src/data/colors.js';
import { SKINS, pickCarrier } from '../src/data/skins.js';

test('les fresques sont carrées et n\'utilisent que des couleurs connues', () => {
  for (const { id: name, map } of MAPS) {
    for (const row of map) {
      assert.equal(row.length, map.length, `${name} doit être carrée`);
      for (const ch of row) assert.ok(ch === '.' || COLORS[ch], `${name} : couleur inconnue « ${ch} »`);
    }
  }
});

test('les probabilités des porteurs de chaque thème font 1', () => {
  for (const [key, s] of Object.entries(SKINS)) {
    const total = s.carriers.reduce((t, [, p]) => t + p, 0);
    assert.ok(Math.abs(total - 1) < 1e-9, `${key} : ${total}`);
  }
});

test('une espèce rare sort bien de temps en temps', () => {
  assert.equal(pickCarrier('beach', () => 0.5).kind, 'crab');
  assert.equal(pickCarrier('beach', () => 0.99).kind, 'hermit');
});
