// Décompte de fin de manche.
import { COLS } from './game-state.js';
import { removeIfMatch } from './columns.js';

export function scoreRound(s, ev) {
  s.current = null; s.turn = null;
  // 1) tout le monde retourne ses cartes, 2) les colonnes identiques partent, 3) on compte.
  const raw = s.players.map((p, i) => {
    p.grid.forEach((col) => col && col.forEach((c) => { c.up = true; }));
    for (let c = 0; c < COLS; c++) removeIfMatch(s, i, c, ev);
    return p.grid.reduce((t, col) => t + (col ? col.reduce((x, c) => x + c.v, 0) : 0), 0);
  });
  const final = raw.slice();
  let doubled = false;
  if (s.finisher !== null) {
    const f = raw[s.finisher];
    // Doublé si score positif ET pas strictement le plus bas (égalité = doublé).
    if (f > 0 && raw.some((x, i) => i !== s.finisher && x <= f)) {
      final[s.finisher] = f * 2;
      doubled = true;
    }
  }
  s.players.forEach((p, i) => { p.total += final[i]; }); // un score négatif fait baisser le total
  s.roundScores = { raw, final, doubled, finisher: s.finisher };
  (s.history ??= []).push({ round: s.round, final: final.slice(), doubled, finisher: s.finisher });
  ev.push({ type: 'roundEnd', raw, final, doubled, finisher: s.finisher });
}
