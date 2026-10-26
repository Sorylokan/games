// Builds a level's box queues: solvable with care, a trap when boxes are placed at random.
import { clone, remaining, reachable, collect, settle, rand, pick, parseMap } from './grid.js';

const QUEUES = 3;
const PACKET = [4, 12]; // default pixels per box (see packetFor in data/levels.js)

// Total boxes: bounds the loops below (at most one box placed per step).
const boxCount = (queues) => queues.reduce((s, q) => s + q.length, 0);

// One valid order to take the mural apart, in single-color packets of lo..hi pixels.
export function buildSequence(target, N, rnd = Math.random, [lo, hi] = PACKET) {
  const g = clone(target), seq = [];
  let guard = remaining(g) + 1; // each pass removes at least one pixel
  while (remaining(g) && guard-- > 0) {
    const colors = [...new Set(reachable(g, N).map(([r, c]) => g[r][c]))];
    const color = pick(colors, rnd);
    const n = collect(g, N, color, rand(lo, hi, rnd));
    if (n) seq.push({ color, count: n });
  }
  return seq;
}

// Simulated careful player: always places the box that unlocks the most. If it wins, the level is solvable.
export function solvable(target, N, queues, cap) {
  const g = clone(target), qs = queues.map((q) => q.slice());
  let line = [];
  for (let step = 0, max = boxCount(qs) + 1; step < max; step++) {
    line = settle(g, N, line);
    if (!remaining(g)) return true;
    if (line.length >= cap) return false;
    let best = null;
    qs.forEach((q, qi) => {
      if (!q.length) return;
      const gg = clone(g);
      const l2 = line.map((b) => ({ ...b })).concat({ color: q[0].color, rem: q[0].count });
      const before = remaining(gg), after = settle(gg, N, l2);
      const score = (before - remaining(gg)) * 10 - after.length * 25;
      if (!best || score > best.score) best = { qi, score };
    });
    if (!best) return false;
    const a = qs[best.qi].shift();
    line.push({ color: a.color, rem: a.count });
  }
  return false;
}

// Win rate of a player placing boxes at random over `runs` games. Lower = harder level.
export function randomWins(target, N, queues, cap, runs, rnd = Math.random) {
  let wins = 0;
  for (let k = 0; k < runs; k++) {
    const g = clone(target), qs = queues.map((q) => q.slice());
    let line = [];
    for (let step = 0, max = boxCount(qs) + 1; step < max; step++) {
      line = settle(g, N, line);
      if (!remaining(g)) { wins++; break; }
      const open = qs.filter((q) => q.length);
      if (line.length >= cap || !open.length) break;
      const a = pick(open, rnd).shift();
      line.push({ color: a.color, rem: a.count });
    }
  }
  return wins / runs;
}

// No queue may start empty: move the last box of the longest queue into it.
function fillEmptyQueues(qs) {
  for (const q of qs) {
    if (q.length) continue;
    const longest = qs.reduce((a, b) => (b.length > a.length ? b : a));
    if (longest.length > 1) q.push(longest.pop());
  }
}

// At least one queue starts with a box that can collect right away.
function fairStart(target, N, qs) {
  const colors = new Set(reachable(target, N).map(([r, c]) => target[r][c]));
  return qs.some((q) => q.length && colors.has(q[0].color));
}

// Candidate queues: a valid order, slightly shuffled, dealt at random between queues.
// Must be solvable with `margin` slots fewer than the player has (default 1: a spare slot).
function candidate(target, N, lvl, nextId, rnd) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const seq = buildSequence(target, N, rnd, lvl.packet);
    const mixed = seq
      .map((a, i) => ({ a, k: i + rnd() * lvl.mix }))
      .sort((x, y) => x.k - y.k)
      .map((x) => x.a);
    const qs = Array.from({ length: QUEUES }, () => []);
    mixed.forEach((a) => qs[rand(0, QUEUES - 1, rnd)].push({ id: nextId(), ...a }));
    fillEmptyQueues(qs);
    if (fairStart(target, N, qs) && solvable(target, N, qs, Math.max(1, lvl.cap - (lvl.margin ?? 1)))) return qs;
  }
  return null;
}

// Full level: the grid and the box queues, keeping the hardest of `lvl.tries` candidates.
// lvl comes from data/levels.js; nextId gives each box a unique id.
export function generate(lvl, nextId, rnd = Math.random) {
  const N = lvl.map.length;
  const target = parseMap(lvl.map);
  let queues = null, gap = 2;
  for (let t = 0; t < lvl.tries; t++) {
    const qs = candidate(target, N, lvl, nextId, rnd);
    if (!qs) continue;
    const r = randomWins(target, N, qs, lvl.cap, lvl.runs ?? 12, rnd);
    const d = Math.abs(r - (lvl.aim ?? 0));
    if (d < gap) { gap = d; queues = qs; }
  }
  if (!queues) { // fallback: the exact take-apart order, always solvable
    queues = Array.from({ length: QUEUES }, () => []);
    buildSequence(target, N, rnd, lvl.packet).forEach((a, i) => queues[i % QUEUES].push({ id: nextId(), ...a }));
  }
  return { N, target, queues };
}
