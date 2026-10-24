// Point d'entrée des règles : valide et applique chaque action.
// Actions : initialReveal | drawPile | drawDiscard | swap | discardFlip
import { shuffle } from '../data/deck.js';
import { RuleError, fail, slotOf, hiddenSlots, existingSlots } from './game-state.js';
import { initialReveal } from './setup.js';
import { removeIfMatch } from './columns.js';
import { endTurn } from './turn-manager.js';

export function dispatch(state, playerId, action, rng = Math.random) {
  const s = structuredClone(state);
  const events = [];
  try {
    apply(s, playerId, action, rng, events);
  } catch (e) {
    if (e instanceof RuleError) return { ok: false, error: e.message };
    throw e;
  }
  return { ok: true, state: s, events };
}

function apply(s, pid, a, rng, ev) {
  const pi = s.players.findIndex((p) => p.id === pid);
  if (pi < 0) fail('Joueur inconnu');
  const me = s.players[pi];

  if (a.type === 'initialReveal') return initialReveal(s, pi, me, a, rng, ev);
  if (s.phase !== 'playing') fail('Aucune manche en cours');
  if (pi !== s.current) fail('Ce n\'est pas ton tour');
  const t = s.turn;

  switch (a.type) {
    case 'drawPile': {
      if (t.step !== 'draw') fail('Tu as déjà pioché');
      if (s.draw.length === 0) recycle(s, rng, ev);
      if (s.draw.length === 0) fail('Pioche vide : prends la défausse');
      const drawn = s.draw.pop();
      s.turn = { step: 'place', source: 'pile', drawn };
      ev.push({ type: 'drawPile', player: pi });
      return;
    }
    case 'drawDiscard': {
      if (t.step !== 'draw') fail('Tu as déjà pioché');
      const drawn = s.discard.pop();
      s.turn = { step: 'place', source: 'discard', drawn };
      ev.push({ type: 'drawDiscard', player: pi, value: drawn });
      return;
    }
    case 'swap': {
      if (t.step !== 'place') fail('Pioche d\'abord');
      // Vérifie d'abord si la colonne actuelle est identique : elle doit partir.
      removeIfMatch(s, pi, a.col, ev);
      const old = slotOf(me, a);
      s.discard.push(old.v); // la carte remplacée d'abord...
      me.grid[a.col][a.row] = { v: t.drawn, up: true };
      ev.push({ type: 'swap', player: pi, col: a.col, row: a.row,
        placed: t.drawn, replaced: old.v, wasHidden: !old.up });
      removeIfMatch(s, pi, a.col, ev); // ...puis les 3 cartes identiques
      return endTurn(s, pi, ev);
    }
    case 'discardFlip': {
      if (t.step !== 'place') fail('Pioche d\'abord');
      if (t.source !== 'pile') fail('Après avoir pris la défausse, tu dois échanger');
      const card = slotOf(me, a);
      if (card.up) fail('Cette carte est déjà visible');
      s.discard.push(t.drawn);
      card.up = true;
      ev.push({ type: 'discardFlip', player: pi, col: a.col, row: a.row,
        discarded: t.drawn, flipped: card.v });
      removeIfMatch(s, pi, a.col, ev);
      return endTurn(s, pi, ev);
    }
    default:
      fail('Action inconnue');
  }
}

// Pioche vide : on remélange la défausse, sauf sa carte du dessus.
function recycle(s, rng, ev) {
  const top = s.discard.pop();
  s.draw = shuffle(s.discard, rng);
  s.discard = [top];
  ev.push({ type: 'recycle', count: s.draw.length });
}

// Actions possibles pour le joueur dont c'est le tour.
export function legalActions(s, pid) {
  if (s.phase !== 'playing') return [];
  const pi = s.players.findIndex((p) => p.id === pid);
  if (pi !== s.current) return [];
  const me = s.players[pi];
  if (s.turn.step === 'draw') {
    const acts = [];
    if (s.draw.length > 0 || s.discard.length > 1) acts.push({ type: 'drawPile' });
    if (s.discard.length > 0) acts.push({ type: 'drawDiscard' });
    return acts;
  }
  const acts = existingSlots(me).map((x) => ({ type: 'swap', ...x }));
  if (s.turn.source === 'pile') hiddenSlots(me).forEach((x) => acts.push({ type: 'discardFlip', ...x }));
  return acts;
}
