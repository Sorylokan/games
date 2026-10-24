import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { MAPS } from '../src/data/maps.js';
import { SKINS } from '../src/data/skins.js';
import { createTranslator } from '../src/i18n.js';

const dir = new URL('../locales/', import.meta.url);
const locales = Object.fromEntries(
  readdirSync(dir).filter((f) => f.endsWith('.json'))
    .map((f) => [f.replace('.json', ''), JSON.parse(readFileSync(new URL(f, dir), 'utf8'))])
);

test('toutes les langues ont exactement les mêmes clés que le français', () => {
  const ref = Object.keys(locales.fr).sort();
  for (const [lang, msgs] of Object.entries(locales)) {
    assert.deepEqual(Object.keys(msgs).sort(), ref, `clés différentes dans ${lang}.json`);
  }
});

test('chaque thème, groupe, équipe et fresque a sa traduction', () => {
  const needed = new Set();
  for (const [key, s] of Object.entries(SKINS)) {
    needed.add(`skin.${key}`); needed.add(`group.${s.group}`); needed.add(`rules.${s.crew}`);
  }
  for (const m of MAPS) needed.add(`map.${m.id}`);
  for (const [lang, msgs] of Object.entries(locales)) {
    for (const k of needed) assert.ok(msgs[k], `${lang}.json : il manque « ${k} »`);
  }
});

test('les variables sont remplacées et une clé absente se voit', () => {
  const t = createTranslator({ locale: 'en', messages: locales });
  assert.equal(t('line.free', { n: 2 }), '2 free slots');
  assert.equal(t('nope.key'), '[nope.key]');
});
