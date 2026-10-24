import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toOklab, nearestColor, pixelsToMap, cleanIsolated, clearBackground } from '../src/core/image-to-map.js';
import { COLORS } from '../src/data/colors.js';

const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const px = (hex, a = 255) => [...rgb(hex), a];
const near = (a, b) => Math.abs(a - b) < 1e-3;

// Image carrée à partir d'une grille de couleurs hex (null = transparent).
const image = (rows) => new Uint8ClampedArray(rows.flat().flatMap((h) => (h ? px(h) : [0, 0, 0, 0])));

test('OKLab : blanc = (1, 0, 0), noir = (0, 0, 0)', () => {
  const [L, a, b] = toOklab(255, 255, 255);
  assert.ok(near(L, 1) && near(a, 0) && near(b, 0));
  assert.deepEqual(toOklab(0, 0, 0).map((v) => Math.round(v * 1000) / 1000), [0, 0, 0]);
});

test('une couleur exacte de la palette redonne sa lettre', () => {
  for (const [letter, hex] of Object.entries(COLORS)) {
    assert.equal(nearestColor(...rgb(hex), COLORS), letter, `couleur ${letter}`);
  }
});

test('une couleur proche est rattachée à la bonne lettre', () => {
  const palette = { R: '#ff0000', B: '#0000ff' };
  assert.equal(nearestColor(230, 20, 30, palette), 'R');
  assert.equal(nearestColor(10, 20, 220, palette), 'B');
});

test('un pixel transparent donne une case vide', () => {
  assert.deepEqual(pixelsToMap(new Uint8ClampedArray([...rgb(COLORS.R), 0]), 1, COLORS), ['.']);
});

test('une image 2×2 donne 2 chaînes de 2 cases', () => {
  const data = new Uint8ClampedArray([
    ...px(COLORS.R), ...px(COLORS.B),
    ...px(COLORS.G, 100), ...px(COLORS.H), // alpha 100 < 128 : vide
  ]);
  assert.deepEqual(pixelsToMap(data, 2, COLORS), ['RB', '.H']);
});

test('vote : la couleur majoritaire de la case l\'emporte', () => {
  const { R, B } = COLORS;
  // 1 case, 2×2 pixels d'échantillon : 3 rouges, 1 bleu
  assert.deepEqual(pixelsToMap(image([[R, R], [B, R]]), 1, COLORS), ['R']);
  // 3 transparents, 1 rouge : la case est vide
  assert.deepEqual(pixelsToMap(image([[null, null], [R, null]]), 1, COLORS), ['.']);
});

test('nombre de couleurs max : les couleurs rares rejoignent les plus utilisées', () => {
  const { R, B, J } = COLORS;
  const data = image([[R, R, R], [R, B, R], [R, R, J]]);
  assert.deepEqual(pixelsToMap(data, 3, COLORS), ['RRR', 'RBR', 'RRJ']);
  const two = pixelsToMap(data, 3, COLORS, { maxColors: 2 }).join('');
  assert.equal(new Set(two).size, 2);
  assert.ok(two.includes('R'));
});

test('saturation : une couleur terne bascule vers la teinte vive', () => {
  const palette = { A: '#808080', R: '#c0504a' };
  const data = new Uint8ClampedArray([150, 115, 112, 255]);
  assert.deepEqual(pixelsToMap(data, 1, palette), ['A']);
  assert.deepEqual(pixelsToMap(data, 1, palette, { saturation: 2 }), ['R']);
});

test('nettoyage : un pixel isolé prend la couleur de ses voisines', () => {
  const g = ['RRR', 'RBR', 'RRR'].map((r) => [...r]);
  assert.deepEqual(cleanIsolated(g).map((r) => r.join('')), ['RRR', 'RRR', 'RRR']);
  // 2 voisines seulement : on ne touche pas
  const h = ['RBB', 'RBB', 'RRR'].map((r) => [...r]);
  assert.deepEqual(cleanIsolated(h).map((r) => r.join('')), ['RBB', 'RBB', 'RRR']);
});

test('fond transparent : seulement la couleur des coins reliée aux bords', () => {
  const g = ['WWWWW', 'WKKKW', 'WKWKW', 'WKKKW', 'WWWWW'].map((r) => [...r]);
  // le W du centre est enfermé par le contour K : il reste
  assert.deepEqual(clearBackground(g).map((r) => r.join('')), ['.....', '.KKK.', '.KWK.', '.KKK.', '.....']);
});
