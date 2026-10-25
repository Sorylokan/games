// Mimiri engine: pure rules, no DOM (testable with `node --test`).
// Each cell is 1 (to fix) or 0 (solved). A click flips the cell and its neighbors (PATTERN);
// the game is won when everything is 0. Themes never change the rules, only how 1 and 0 look.

export const SIZES = [3, 4, 5, 6];
export const DAILY_SIZE = 5;

// Click pattern: a cross. Pass another pattern to the functions below for variants.
export const PATTERN = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];

// --- Seeded random (daily challenge) ---
export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Local date as YYYY-MM-DD: seed and key of the daily challenge.
export function dayKey(date = new Date()) {
  const p = (x) => String(x).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

// --- Rules ---

// Indices of the in-grid cells affected by a click on cell i.
export function touchedBy(n, i, pattern = PATTERN) {
  const r = Math.floor(i / n), c = i % n;
  const out = [];
  for (const [dr, dc] of pattern) {
    const rr = r + dr, cc = c + dc;
    if (rr >= 0 && rr < n && cc >= 0 && cc < n) out.push(rr * n + cc);
  }
  return out;
}

// Applies a click in place.
export function applyPress(cells, n, i, pattern = PATTERN) {
  for (const j of touchedBy(n, i, pattern)) cells[j] ^= 1;
  return cells;
}

export const isSolved = (cells) => cells.every((v) => v === 0);
export const countOn = (cells) => cells.filter((v) => v === 1).length;

// Always solvable: start from a solved grid and simulate clicks.
// Returns the grid and a solution (the simulated clicks), handy for tests.
export function scramble(n, rand = Math.random, pattern = PATTERN) {
  const total = n * n;
  const clicks = Math.max(3, Math.round(total * 0.45));
  for (let attempt = 0; attempt < 50; attempt++) {
    const cells = new Array(total).fill(0);
    const order = [...Array(total).keys()];
    for (let i = order.length - 1; i > 0; i--) { // Fisher-Yates shuffle
      const j = Math.floor(rand() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const solution = order.slice(0, clicks);
    for (const k of solution) applyPress(cells, n, k, pattern);
    if (!isSolved(cells)) return { cells, solution };
  }
  // Fallback (almost never reached): one click always gives an unsolved grid.
  const cells = new Array(total).fill(0);
  applyPress(cells, n, 0, pattern);
  return { cells, solution: [0] };
}

export const generate = (n, rand, pattern) => scramble(n, rand, pattern).cells;

// Daily grid: same seed, so the same grid for everyone that day.
export const dailyGrid = (day = dayKey(), n = DAILY_SIZE) =>
  generate(n, mulberry32(hashStr("mimiri-" + day)));
