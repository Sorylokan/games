import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeMural, decodeMural, rle, unrle, toMapsSnippet, slugify, pixelCount } from '../src/core/mural-code.js';
import { MAPS } from '../src/data/maps.js';

test('rle et unrle sont inverses', () => {
  assert.equal(rle('BBBBKK.'), '4B2K1.');
  assert.equal(unrle('4B2K1.'), 'BBBBKK.');
  assert.equal(unrle('4B2'), null);         // abîmé
  assert.equal(unrle('99999B'), null);      // trop long
});

test('chaque fresque officielle survit à un aller-retour en code', () => {
  for (const { id, map } of MAPS) {
    const code = encodeMural({ name: `Fresque ${id} éèà`, map });
    assert.match(code, /^BB1-[A-Za-z0-9_-]+$/);
    assert.deepEqual(decodeMural(code), { name: `Fresque ${id} éèà`, map });
  }
});

test('un code invalide renvoie null', () => {
  assert.equal(decodeMural(''), null);
  assert.equal(decodeMural('BB1-!!!'), null);
  assert.equal(decodeMural('XX1-abc'), null);
  const bad = encodeMural({ name: 'x', map: ['ZZZZ', 'ZZZZ', 'ZZZZ', 'ZZZZ'] }); // couleur inconnue
  assert.equal(decodeMural(bad), null);
});

test('export pour maps.js', () => {
  assert.equal(slugify('Mon Chat Câlin !'), 'mon-chat-calin');
  const s = toMapsSnippet({ name: 'Mon Cœur', map: ['B.', 'KR'] });
  assert.match(s, /id: 'mon-coeur'/);
  assert.match(s, /'B\.',/);
  assert.equal(pixelCount(['B.', 'KR']), 3);
});
