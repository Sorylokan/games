// Image → mural conversion. No browser APIs: takes RGBA pixels already read.
// Colors are compared in OKLab, which matches human perception.
import { DIRS } from './grid.js';

const EMPTY = '.';

// sRGB 0..255 → linear, as a lookup table (avoids a Math.pow per pixel).
const LIN = Float32Array.from({ length: 256 }, (_, i) => {
  const c = i / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
});

// sRGB (0..255 integers) → OKLab [L, a, b] (Björn Ottosson's matrices). L: 0 black → 1 white.
export function toOklab(r, g, b) {
  const lr = LIN[Math.round(r)], lg = LIN[Math.round(g)], lb = LIN[Math.round(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}

// Palette ({ letter: '#rrggbb' }) in OKLab, computed once per palette.
const cache = new WeakMap();
function paletteLab(palette) {
  let p = cache.get(palette);
  if (!p) {
    const entries = Object.entries(palette);
    p = { letters: entries.map(([k]) => k), lab: entries.map(([, hex]) => {
      const n = parseInt(hex.slice(1), 16);
      return toOklab(n >> 16, (n >> 8) & 255, n & 255);
    }) };
    cache.set(palette, p);
  }
  return p;
}

// Index of the closest color among `allowed` (palette indices).
function nearestIndex(L, A, B, lab, allowed) {
  let best = allowed[0], bestD = Infinity;
  for (const i of allowed) {
    const [l2, a2, b2] = lab[i];
    const d = (L - l2) ** 2 + (A - a2) ** 2 + (B - b2) ** 2;
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

// Letter of the palette color closest to an sRGB color.
export function nearestColor(r, g, b, palette) {
  const p = paletteLab(palette);
  return p.letters[nearestIndex(...toOklab(r, g, b), p.lab, [...p.lab.keys()])];
}

// A cell takes the color shared by at least 3 of its 4 neighbors (single pass).
export function cleanIsolated(grid) {
  const src = grid.map((row) => row.slice()), N = grid.length;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const seen = {};
    for (const [dr, dc] of DIRS) {
      const v = src[r + dr]?.[c + dc];
      if (v === undefined || v === src[r][c]) continue;
      if ((seen[v] = (seen[v] ?? 0) + 1) >= 3) { grid[r][c] = v; break; }
    }
  }
  return grid;
}

// Clears the most common corner color, flood-filling from the edges only:
// the same color inside the drawing is kept.
export function clearBackground(grid) {
  const N = grid.length;
  const corners = [grid[0][0], grid[0][N - 1], grid[N - 1][0], grid[N - 1][N - 1]].filter((v) => v !== EMPTY);
  if (!corners.length) return grid;
  const bg = corners.reduce((best, v) =>
    corners.filter((x) => x === v).length > corners.filter((x) => x === best).length ? v : best);
  const stack = [];
  for (let i = 0; i < N; i++) stack.push([0, i], [N - 1, i], [i, 0], [i, N - 1]);
  while (stack.length) {
    const [r, c] = stack.pop();
    if (grid[r]?.[c] !== bg) continue;
    grid[r][c] = EMPTY;
    for (const [dr, dc] of DIRS) stack.push([r + dr, c + dc]);
  }
  return grid;
}

// RGBA pixels of a square (N×S)² image → mural (N strings, same format as data/maps.js).
// Each cell is voted by its S×S pixels: each votes for its closest palette color ('.' if alpha < 128),
// the majority wins.
// Options: saturation and contrast (1 = unchanged), maxColors (keep the K most used colors),
// cleanup (cleanIsolated), transparentBg (clearBackground).
export function pixelsToMap(data, N, palette, { saturation = 1, contrast = 1, maxColors = Infinity, cleanup = false, transparentBg = false } = {}) {
  const W = Math.round(Math.sqrt(data.length / 4)), S = W / N;
  const { letters, lab } = paletteLab(palette), n = letters.length;

  // 1) every pixel to OKLab, with settings applied once (there may be two votes)
  const px = new Float32Array(W * W * 3), clear = new Uint8Array(W * W);
  for (let p = 0; p < W * W; p++) {
    if (data[p * 4 + 3] < 128) { clear[p] = 1; continue; }
    const [L, A, B] = toOklab(data[p * 4], data[p * 4 + 1], data[p * 4 + 2]);
    px[p * 3] = Math.min(1, Math.max(0, (L - 0.5) * contrast + 0.5));
    px[p * 3 + 1] = A * saturation;
    px[p * 3 + 2] = B * saturation;
  }

  // 2) vote cell by cell; usage = votes per color over the whole image
  const vote = (allowed) => {
    const usage = new Float64Array(n), grid = [];
    const tally = new Uint16Array(n + 1); // last slot = empty cell
    for (let r = 0; r < N; r++) {
      const row = [];
      for (let c = 0; c < N; c++) {
        tally.fill(0);
        for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
          const p = (r * S + y) * W + c * S + x;
          tally[clear[p] ? n : nearestIndex(px[p * 3], px[p * 3 + 1], px[p * 3 + 2], lab, allowed)]++;
        }
        let best = 0;
        for (let i = 1; i <= n; i++) if (tally[i] > tally[best]) best = i; // ties: a color beats empty
        for (let i = 0; i < n; i++) usage[i] += tally[i];
        row.push(best === n ? EMPTY : letters[best]);
      }
      grid.push(row);
    }
    return { grid, usage };
  };

  let { grid, usage } = vote([...lab.keys()]);

  // 3) too many colors: keep the K most used and vote again
  const used = [...usage.keys()].filter((i) => usage[i] > 0).sort((a, b) => usage[b] - usage[a]);
  if (used.length > maxColors) grid = vote(used.slice(0, Math.max(1, maxColors))).grid;

  if (cleanup) cleanIsolated(grid);
  if (transparentBg) clearBackground(grid);
  return grid.map((row) => row.join(''));
}
