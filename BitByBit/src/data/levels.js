// Level i (0, 1, 2…): which mural, and how tight. After the last mural, the series restarts harder.
import { MAPS } from './maps.js';
import { DEFAULT_SLOTS } from '../core/mural-code.js';

// Every 10th level (10, 20…) is a boss: no spare slot, no rescue slot, tense music.
export const BOSS_EVERY = 10;
export const isBoss = (i) => (i + 1) % BOSS_EVERY === 0;

export function levelAt(i) {
  const m = MAPS[i % MAPS.length];
  const round = Math.floor(i / MAPS.length);
  const boss = isBoss(i);
  return {
    id: m.id,
    map: m.map,
    round,
    boss,
    cap: i < 3 ? 4 : 3,                          // slots on the line
    margin: boss ? 0 : 1,                        // slots to spare in the generated solution
    mix: Math.min(16, 3 + i * 1.5),              // queue shuffling
    tries: Math.min(24, 4 + i * 3 + round * 4),  // candidates generated, the hardest is kept
  };
}

// Pixels per box: 4–12 up to 24×24. Beyond, boxes grow with the area so a big mural needs about
// as many boxes as a 24×24 one (and generates fast).
export function packetFor(N) {
  const k = Math.max(1, (N / 24) ** 2);
  return [Math.round(4 * k), Math.round(12 * k)];
}

// Level for a custom or community mural (`author` set for community ones). Medium difficulty,
// with the slot count chosen in the editor. Bigger grids get fewer tries/runs: generation runs
// on launch and must stay fast on phones.
export function customLevel({ name, map, slots = DEFAULT_SLOTS, author = null }) {
  const N = map.length;
  return {
    id: null, name, map, slots, author, community: !!author, round: 0, custom: true, cap: slots, mix: 8,
    tries: N > 32 ? 2 : N > 16 ? 4 : N > 12 ? 6 : 8,
    runs: N > 32 ? 6 : 12,
    packet: packetFor(N),
  };
}

// True after the last mural of the series.
export const isEndOfSeries = (i) => (i + 1) % MAPS.length === 0;
