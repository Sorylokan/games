// Création de la partie, donne, révélation initiale, choix du premier joueur.
import { fullDeck, shuffle } from '../data/deck.js';
import { COLS, ROWS, MIN_PLAYERS, MAX_PLAYERS, fail, slotOf, visibleScore } from './game-state.js';

export function createGame({ players, targetScore = 100, rng = Math.random }) {
  if (players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) fail('2 à 8 joueurs');
  const s = {
    targetScore, round: 0, phase: 'reveal',
    players: players.map((p) => ({ id: p.id, name: p.name, total: 0, grid: [], ready: false })),
    draw: [], discard: [], current: null, turn: null,
    finisher: null, roundScores: null, winners: null, history: [],
  };
  dealRound(s, rng);
  return s;
}

export function dealRound(s, rng) {
  const deck = shuffle(fullDeck(), rng);
  s.round++; s.phase = 'reveal'; s.current = null; s.turn = null;
  s.finisher = null; s.roundScores = null;
  for (const p of s.players) {
    p.grid = Array.from({ length: COLS }, () =>
      Array.from({ length: ROWS }, () => ({ v: deck.pop(), up: false })));
    p.ready = false;
  }
  s.discard = [deck.pop()];
  s.draw = deck;
}

export function startNextRound(state, rng = Math.random) {
  if (state.phase !== 'roundOver') return { ok: false, error: 'La manche précédente n\'est pas terminée' };
  const s = structuredClone(state);
  dealRound(s, rng);
  return { ok: true, state: s, events: [{ type: 'roundDealt', round: s.round }] };
}

// { type:'initialReveal', slots:[{col,row},{col,row}] }
export function initialReveal(s, pi, me, a, rng, ev) {
  if (s.phase !== 'reveal') fail('Ce n\'est pas le moment de dévoiler');
  if (me.ready) fail('Tu as déjà dévoilé tes deux cartes');
  const slots = a.slots;
  if (!Array.isArray(slots) || slots.length !== 2) fail('Choisis exactement deux cartes');
  if (slots[0].col === slots[1].col && slots[0].row === slots[1].row) fail('Deux cartes différentes');
  const cards = slots.map((x) => slotOf(me, x));
  cards.forEach((c) => { c.up = true; });
  me.ready = true;
  ev.push({ type: 'initialReveal', player: pi, values: cards.map((c) => c.v) });

  if (s.players.every((p) => p.ready)) {
    const sums = s.players.map(visibleScore);
    const best = Math.max(...sums);
    const tied = sums.map((x, i) => (x === best ? i : -1)).filter((i) => i >= 0);
    s.current = tied[Math.floor(rng() * tied.length)]; // égalité : tirage au sort
    s.phase = 'playing';
    s.turn = { step: 'draw' };
    ev.push({ type: 'roundStart', first: s.current, sums });
  }
}
