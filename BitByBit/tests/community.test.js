import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COMMUNITY, communityMurals } from '../src/data/community.js';
import { decodeMural, encodeMural } from '../src/core/mural-code.js';
import { customLevel } from '../src/data/levels.js';

test('chaque fresque de la communauté a un auteur et un code valide', () => {
  for (const e of COMMUNITY) {
    assert.ok(typeof e.author === 'string' && e.author.trim(), `auteur manquant pour ${e.code?.slice(0, 20)}…`);
    assert.ok(decodeMural(e.code), `code abîmé (mal copié ?) pour ${e.author}`);
  }
  assert.equal(communityMurals().length, COMMUNITY.length);
});

test('une fresque de la communauté se joue comme une fresque perso, avec son auteur', () => {
  const mural = decodeMural(encodeMural({ name: 'Test', map: ['BBBB', 'BKKB', 'BKKB', 'BBBB'] }));
  const lvl = customLevel({ ...mural, author: 'Sorylokan' });
  assert.equal(lvl.custom, true);
  assert.equal(lvl.community, true);
  assert.equal(lvl.author, 'Sorylokan');
  assert.equal(customLevel(mural).community, false); // fresque perso ordinaire
});
