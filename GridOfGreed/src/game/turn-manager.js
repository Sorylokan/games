// Fin de tour, dernier tour après qu'un joueur a tout révélé.
import { allUp } from './game-state.js';
import { scoreRound } from './scoring.js';
import { resolveRoundEnd } from './victory.js';

export function endTurn(s, pi, ev) {
  if (s.finisher === null && allUp(s.players[pi])) {
    s.finisher = pi;
    ev.push({ type: 'lastRound', player: pi });
  }
  const next = (pi + 1) % s.players.length;
  if (s.finisher !== null && next === s.finisher) {
    scoreRound(s, ev);
    resolveRoundEnd(s, ev);
    return;
  }
  s.current = next;
  s.turn = { step: 'draw' };
}
