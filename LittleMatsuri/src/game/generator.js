// Endless grids: lanterns placed first, districts grown around them, then the lanterns are taken away. Every grid can be solved, since the starting layout is a solution.
import { mulberry32, hashStr, dayKey, shuffle } from "./random.js";
import { eachSolution } from "./rules.js";

export const DAILY_SIZE = 7;

// One lantern per row and per column, never touching: lantern of row r in column cols[r], so rows next to each other need columns at least 2 apart.
export function placeLanterns(n, rand = Math.random) {
  const cols = [], used = new Set();
  const place = (r) => {
    if (r === n) return true;
    for (const c of shuffle([...Array(n).keys()], rand)) {
      if (used.has(c) || (r > 0 && Math.abs(cols[r - 1] - c) < 2)) continue;
      cols[r] = c; used.add(c);
      if (place(r + 1)) return true;
      used.delete(c);
    }
    return false;
  };
  place(0);
  return cols.map((c, r) => r * n + c);
}

// Each district starts on its lantern and takes a random neighbouring free cell, until the grid is full: districts stay in one piece.
export function growRegions(n, lanterns, rand = Math.random) {
  const regions = new Array(n * n).fill(-1);
  lanterns.forEach((i, k) => { regions[i] = k; });
  const sides = (i) => {
    const r = Math.floor(i / n), c = i % n, out = [];
    if (r > 0) out.push(i - n);
    if (r < n - 1) out.push(i + n);
    if (c > 0) out.push(i - 1);
    if (c < n - 1) out.push(i + 1);
    return out;
  };
  let edge = [];
  for (const i of lanterns) for (const j of sides(i)) if (regions[j] === -1) edge.push([i, j]);
  while (edge.length) {
    const k = Math.floor(rand() * edge.length);
    const [from, to] = edge[k];
    edge[k] = edge[edge.length - 1];
    edge.pop();
    if (regions[to] !== -1) continue;
    regions[to] = regions[from];
    for (const j of sides(to)) if (regions[j] === -1) edge.push([to, j]);
  }
  return regions;
}

// Grown districts often leave room for other layouts (two lanterns swapping rows…), up to ~1500 solutions on a 10×10, which makes it a guessing game. Among CANDIDATES grids the one with the fewest solutions is kept: 6×6 and 7×7 almost always unique, ~24 left on a 10×10, ~0.2 s.
export const CANDIDATES = 300;

// Stops counting at `cap`: past the best candidate so far, the exact number doesn't matter.
export function countSolutions(n, regions, cap = Infinity) {
  let count = 0;
  eachSolution(n, regions, () => ++count >= cap);
  return count;
}

// `solution` is only the layout the grid was built from; the player may find another one, which wins too.
export function generate(n, rand = Math.random, candidates = CANDIDATES) {
  let best = null;
  for (let k = 0; k < candidates && best?.solutions !== 1; k++) {
    const solution = placeLanterns(n, rand);
    const regions = growRegions(n, solution, rand);
    const solutions = countSolutions(n, regions, best ? best.solutions : Infinity);
    if (!best || solutions < best.solutions) best = { n, regions, solution, solutions };
  }
  return best;
}

export const dailyGrid = (day = dayKey(), n = DAILY_SIZE) => generate(n, mulberry32(hashStr(`matsuri-${day}`)));
