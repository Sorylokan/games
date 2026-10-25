import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPS } from '../src/data/maps.js';
import { COLORS } from '../src/data/colors.js';
import { SKINS, pickCarrier } from '../src/data/skins.js';
import { createTranslator } from '../src/i18n.js';
import { readFileSync } from 'node:fs';

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

const en = JSON.parse(readFileSync(new URL('../locales/en.json', import.meta.url), 'utf8'));

test('chaque thème, groupe, équipe et fresque a sa traduction', () => {
  const needed = new Set();
  for (const [key, s] of Object.entries(SKINS)) {
    needed.add(`skin.${key}`); needed.add(`group.${s.group}`); needed.add(`rules.${s.crew}`);
  }
  for (const m of MAPS) needed.add(`map.${m.id}`);
  for (const k of needed) assert.ok(en[k], `en.json : il manque « ${k} »`);
});

test('les variables sont remplacées et une clé absente se voit', () => {
  const t = createTranslator({ locale: 'en', messages: { en } });
  assert.equal(t('line.free', { n: 2 }), '2 free slots');
  assert.equal(t('nope.key'), '[nope.key]');
});