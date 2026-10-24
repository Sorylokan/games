// Aides communes aux tests (pas un test elle-même).
import assert from 'node:assert/strict';
import { createGame } from '../src/game/setup.js';
import { dispatch } from '../src/game/rules-engine.js';
import { mulberry32 } from '../src/game/simulation.js';
import { COLS, ROWS } from '../src/game/game-state.js';

export const mk = (n = 3, seed = 1) =>
  createGame({ players: Array.from({ length: n }, (_, i) => ({ id: 'p' + i, name: 'P' + i })), rng: mulberry32(seed) });

// Passe directement en phase de jeu (on saute la révélation initiale).
export function play(s, first = 0) {
  s.players.forEach((p) => { p.ready = true; });
  s.phase = 'playing'; s.current = first; s.turn = { step: 'draw' };
  return s;
}

// Pose les cartes d'un joueur : valeurs colonne par colonne, `hidden` = index cachés.
export function setGrid(s, pi, vals, hidden = []) {
  s.players[pi].grid = Array.from({ length: COLS }, (_, c) =>
    Array.from({ length: ROWS }, (_, r) => ({ v: vals[c * ROWS + r], up: !hidden.includes(c * ROWS + r) })));
}

export const ok = (r) => { assert.equal(r.ok, true, r.error); return r.state; };

export const A = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2]; // somme 12, aucune colonne identique

// Deux joueurs : p0 finit en révélant [0][0], p1 révèle [3][2], puis la manche est comptée.
export function finishScenario(p0, p1, p1Hidden = [11], totals = [0, 0]) {
  const s = play(mk(2));
  setGrid(s, 0, p0, [0]); setGrid(s, 1, p1, p1Hidden);
  s.draw = [0, 0]; s.discard = [7];
  s.players[0].total = totals[0]; s.players[1].total = totals[1];
  let r = ok(dispatch(s, 'p0', { type: 'drawPile' }));
  r = ok(dispatch(r, 'p0', { type: 'discardFlip', col: 0, row: 0 }));
  assert.equal(r.finisher, 0);
  r = ok(dispatch(r, 'p1', { type: 'drawPile' }));
  return ok(dispatch(r, 'p1', { type: 'discardFlip', col: 3, row: 2 }));
}
