// Pixel grid rules (no browser APIs, testable with node).
// A grid g is an N×N array of color letters, null for an empty cell.
import { MAX_OUT } from '../config.js';

export const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export const rand = (a, b, rnd = Math.random) => a + Math.floor(rnd() * (b - a + 1));
export const pick = (arr, rnd = Math.random) => arr[Math.floor(rnd() * arr.length)];
export const clone = (g) => g.map((r) => r.slice());
export const remaining = (g) => g.reduce((s, r) => s + r.filter(Boolean).length, 0);

// Mural (rows of letters) → grid.
export const parseMap = (map) => map.map((row) => [...row].map((ch) => (ch === '.' ? null : ch)));

// Free cells connected to the outside. The grid has a 1-cell border (coordinates -1 and N),
// hence an (N+2)×(N+2) array.
export function outsideMap(g, N) {
  const W = N + 2, seen = new Uint8Array(W * W), stack = [[-1, -1]];
  const free = (r, c) => r < 0 || c < 0 || r >= N || c >= N || !g[r][c];
  seen[0] = 1;
  while (stack.length) {
    const [r, c] = stack.pop();
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < -1 || nc < -1 || nr > N || nc > N) continue;
      const i = (nr + 1) * W + (nc + 1);
      if (seen[i] || !free(nr, nc)) continue;
      seen[i] = 1;
      stack.push([nr, nc]);
    }
  }
  return seen;
}

// Pixels a carrier can reach: filled, with a neighbor in the outside area. Optional color filter.
export function reachable(g, N, color) {
  const W = N + 2, out = outsideMap(g, N), res = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const v = g[r][c];
    if (!v || (color && v !== color)) continue;
    if (DIRS.some(([dr, dc]) => out[(r + dr + 1) * W + (c + dc + 1)])) res.push([r, c]);
  }
  return res;
}

// Column of the path cell (row N, under the mural) where carriers from slot i of `slots` enter.
// Shared with the game (game/geometry.js) so the generator picks pixels like the real carriers.
export const entryCol = (i, slots, N) => Math.max(-1, Math.min(N, Math.floor(-1 + (i + 0.5) * (N + 2) / slots)));

// Walking distance from an entry cell to every free cell (the 1-cell border counts as free).
// Returns d(r, c) for a pixel: steps to stand next to it, or -1 if out of reach.
export function distancesFrom(g, N, entry) {
  const W = N + 2, d = new Int32Array(W * W).fill(-1), q = [entry];
  const free = (r, c) => r < 0 || c < 0 || r >= N || c >= N || !g[r][c];
  d[(entry[0] + 1) * W + entry[1] + 1] = 0;
  for (let h = 0; h < q.length; h++) {
    const [r, c] = q[h];
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < -1 || nc < -1 || nr > N || nc > N || !free(nr, nc)) continue;
      const j = (nr + 1) * W + nc + 1;
      if (d[j] >= 0) continue;
      d[j] = d[(r + 1) * W + c + 1] + 1;
      q.push([nr, nc]);
    }
  }
  return (r, c) => {
    let best = -1;
    for (const [dr, dc] of DIRS) {
      const v = d[(r + dr + 1) * W + c + dc + 1];
      if (v >= 0 && (best < 0 || v < best)) best = v;
    }
    return best;
  };
}

// A box picks up pixels of its color, up to k, like the carriers: the nearest to its entry cell,
// MAX_OUT at a time. Mutates g, returns the count.
export function collect(g, N, color, k, entry = [N, Math.floor(N / 2)]) {
  let n = 0;
  while (n < k) {
    const d = distancesFrom(g, N, entry), found = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (g[r][c] !== color) continue;
      const v = d(r, c);
      if (v >= 0) found.push([v, r, c]);
    }
    if (!found.length) break;
    found.sort((a, b) => a[0] - b[0]);
    for (const [, r, c] of found.slice(0, Math.min(MAX_OUT, k - n))) { g[r][c] = null; n++; }
  }
  return n;
}

// Lets every box on the line collect until nothing moves. line: one entry per slot, null or { color, rem }.
// Returns the line with full boxes removed (their slot becomes null).
export function settle(g, N, line) {
  let changed = true;
  while (changed) {
    changed = false;
    line.forEach((b, i) => {
      if (!b || b.rem <= 0) return;
      const n = collect(g, N, b.color, b.rem, [N, entryCol(i, line.length, N)]);
      if (n) { b.rem -= n; changed = true; }
    });
  }
  return line.map((b) => (b && b.rem > 0 ? b : null));
}
