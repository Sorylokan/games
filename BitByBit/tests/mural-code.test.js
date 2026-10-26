import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeMural, decodeMural, rle, unrle, toMapsSnippet, slugify, pixelCount } from '../src/core/mural-code.js';
import { MAPS } from '../src/data/maps.js';
import { COLORS } from '../src/data/colors.js';

test('rle et unrle sont inverses', () => {
  assert.equal(rle('BBBBKK.'), '4B2K1.');
  assert.equal(unrle('4B2K1.'), 'BBBBKK.');
  assert.equal(unrle('4B2'), null);         // broken
  assert.equal(unrle('99999B'), null);      // too long
});

test('chaque fresque officielle survit à un aller-retour en code', () => {
  for (const [i, { id, map }] of MAPS.entries()) {
    const slots = 2 + (i % 4);
    const code = encodeMural({ name: `Fresque ${id} éèà`, map, slots });
    assert.match(code, /^BB2-[A-Za-z0-9_-]+$/);
    assert.deepEqual(decodeMural(code), { name: `Fresque ${id} éèà`, map, slots });
  }
});

test('les anciens codes BB1 se lisent toujours, avec 4 emplacements', () => {
  const v1 = 'BB1-' + Buffer.from('4|Vieux|16R').toString('base64url');
  assert.deepEqual(decodeMural(v1), { name: 'Vieux', map: Array(4).fill('RRRR'), slots: 4 });
  assert.equal(decodeMural(encodeMural({ name: '', map: Array(4).fill('RRRR') })).slots, 4);
});

test('nombre d\'emplacements hors limites : code refusé', () => {
  for (const slots of [1, 6, 'x']) {
    const bad = 'BB2-' + Buffer.from(`4|${slots}|x|16R`).toString('base64url');
    assert.equal(decodeMural(bad), null, String(slots));
  }
});

test('un code invalide renvoie null', () => {
  assert.equal(decodeMural(''), null);
  assert.equal(decodeMural('BB1-!!!'), null);
  assert.equal(decodeMural('XX1-abc'), null);
  // Unknown color: a letter the palette doesn't use (looked up, so adding colors won't break the test).
  const free = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].find((ch) => !COLORS[ch]);
  if (free) {
    const bad = encodeMural({ name: 'x', map: Array(4).fill(free.repeat(4)) });
    assert.equal(decodeMural(bad), null);
  }
});

test('export pour maps.js', () => {
  assert.equal(slugify('Mon Chat Câlin !'), 'mon-chat-calin');
  const s = toMapsSnippet({ name: 'Mon Cœur', map: ['B.', 'KR'] });
  assert.match(s, /id: 'mon-coeur'/);
  assert.match(s, /'B\.',/);
  assert.equal(pixelCount(['B.', 'KR']), 3);
});
