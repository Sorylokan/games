// Builds a level's box queues: solvable with care, a trap when boxes are placed at random.
import { clone, remaining, reachable, collect, settle, entryCol, rand, pick, parseMap } from './grid.js';

const QUEUES = 3;
const PACKET = [4, 12]; // default pixels per box (see packetFor in data/levels.js)

// Total boxes: caps the play loop (at most one box placed per step).
const boxCount = (queues) => queues.reduce((s, q) => s + q.length, 0);

// One valid take-apart order, in single-color packets collected from `entry` (the first slot's: placed one at a time, the boxes replay it exactly).
export function buildSequence(target, N, rnd = Math.random, [lo, hi] = PACKET, entry = undefined) {
  const g = clone(target), seq = [];
  let guard = remaining(g) + 1; // each pass removes at least one pixel
  while (remaining(g) && guard-- > 0) {
    // Weighted by reachable pixels, so details get exposed whole before they're boxed (picking colors evenly made tiny boxes that clog big murals).
    const color = pick(reachable(g, N).map(([r, c]) => g[r][c]), rnd);
    const n = collect(g, N, color, rand(lo, hi, rnd), entry);
    if (n) seq.push({ color, count: n });
  }
  return seq;
}

// Solvable if either careful player wins. Carriers leave from their own slot, but at most `limit` boxes may sit on the line at once.
export function solvable(target, N, queues, slots, limit = slots) {
  return play(target, N, queues, slots, limit, mostUseful) || play(target, N, queues, slots, limit, inOrder);
}

// Win rate of a player placing boxes at random, over `runs` games. Lower = harder level.
export function randomWins(target, N, queues, slots, runs, rnd = Math.random) {
  let wins = 0;
  for (let k = 0; k < runs; k++) if (play(target, N, queues, slots, slots, atRandom(rnd))) wins++;
  return wins / runs;
}

const used = (line) => line.filter(Boolean).length;

// Careful player 1: places the box that unlocks the most.
function mostUseful(g, N, qs, line, free) {
  let best = null;
  qs.forEach((q, qi) => {
    if (!q.length) return;
    const gg = clone(g);
    const l2 = line.map((b) => b && { ...b });
    l2[free] = { color: q[0].color, rem: q[0].count };
    const before = remaining(gg), after = settle(gg, N, l2);
    const score = (before - remaining(gg)) * 10 - used(after) * 25;
    if (!best || score > best.score) best = { qi, score };
  });
  return best ? best.qi : -1;
}

// Careful player 2: follows the take-apart order (box.order). Wins where player 1 gets lost, e.g. a big one-color background with details inside.
function inOrder(g, N, qs) {
  let best = -1;
  qs.forEach((q, qi) => {
    if (q.length && q[0].order !== undefined && (best < 0 || q[0].order < qs[best][0].order)) best = qi;
  });
  return best;
}

function atRandom(rnd) {
  return (_g, _N, qs) => {
    const open = [...qs.keys()].filter((qi) => qs[qi].length);
    return open.length ? pick(open, rnd) : -1;
  };
}

// Boxes go on the first free slot, like session.place does.
function play(target, N, queues, slots, limit, choose) {
  const g = clone(target), qs = queues.map((q) => q.slice());
  let line = Array(slots).fill(null);
  for (let step = 0, max = boxCount(qs) + 1; step < max; step++) {
    line = settle(g, N, line);
    if (!remaining(g)) return true;
    const free = line.indexOf(null);
    if (free < 0 || used(line) >= limit) return false;
    const qi = choose(g, N, qs, line, free);
    if (qi < 0) return false;
    const a = qs[qi].shift();
    line[free] = { color: a.color, rem: a.count };
  }
  return false;
}

// No queue starts empty: it takes the last box of the longest one.
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

// Candidate queues: a valid order, slightly shuffled, dealt at random. Must stay solvable with `margin` slots to spare (default 1).
function candidate(target, N, lvl, nextId, rnd) {
  const attempts = N > 32 ? 4 : N > 16 ? 12 : 40; // each one costs more on a big grid
  for (let attempt = 0; attempt < attempts; attempt++) {
    const seq = buildSequence(target, N, rnd, lvl.packet, firstEntry(lvl, N));
    const mixed = seq
      .map((a, i) => ({ a: { ...a, order: i }, k: i + rnd() * lvl.mix }))
      .sort((x, y) => x.k - y.k)
      .map((x) => x.a);
    const qs = Array.from({ length: QUEUES }, () => []);
    mixed.forEach((a) => qs[rand(0, QUEUES - 1, rnd)].push({ id: nextId(), ...a }));
    fillEmptyQueues(qs);
    if (fairStart(target, N, qs) && solvable(target, N, qs, lvl.cap, Math.max(1, lvl.cap - (lvl.margin ?? 1)))) return qs;
  }
  return null;
}

const firstEntry = (lvl, N) => [N, entryCol(0, lvl.cap, N)];

// Full level: among `lvl.tries` candidates, the one whose random win rate is closest to `lvl.aim` (default 0 = hardest).
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
  if (!queues) { // fallback: the exact take-apart order, always solvable one box at a time
    queues = Array.from({ length: QUEUES }, () => []);
    buildSequence(target, N, rnd, lvl.packet, firstEntry(lvl, N)).forEach((a, i) => queues[i % QUEUES].push({ id: nextId(), ...a, order: i }));
  }
  return { N, target, queues };
}
