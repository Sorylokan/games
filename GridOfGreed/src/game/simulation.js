// Parties jouées au hasard : tests d'invariants, et base pour de futurs bots.
import { createGame, startNextRound } from './setup.js';
import { dispatch, legalActions } from './rules-engine.js';
import { hiddenSlots } from './game-state.js';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Joue une partie complète ; onStep(state) est appelé après chaque coup.
export function randomGame(n, seed, onStep = () => {}) {
  const rng = mulberry32(seed);
  const pick = (a) => a[Math.floor(rng() * a.length)];
  let s = createGame({ players: Array.from({ length: n }, (_, i) => ({ id: 'p' + i, name: 'P' + i })), rng });
  let steps = 0;
  while (s.phase !== 'gameOver') {
    if (++steps > 60000) throw new Error('partie sans fin');
    let r;
    if (s.phase === 'reveal') {
      const p = s.players.find((x) => !x.ready);
      const a = pick(hiddenSlots(p));
      const rest = hiddenSlots(p).filter((x) => x.col !== a.col || x.row !== a.row);
      r = dispatch(s, p.id, { type: 'initialReveal', slots: [a, pick(rest)] }, rng);
    } else if (s.phase === 'roundOver') {
      r = startNextRound(s, rng);
    } else {
      const pid = s.players[s.current].id;
      r = dispatch(s, pid, pick(legalActions(s, pid)), rng);
    }
    if (!r.ok) throw new Error(r.error);
    s = r.state;
    onStep(s);
  }
  return s;
}
