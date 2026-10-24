// Forme de l'état et helpers de lecture.
// Une carte : { v, up }. Une grille : 4 colonnes ; une colonne = 3 cartes, ou null si retirée.

export const COLS = 4;
export const ROWS = 3;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;

export class RuleError extends Error {}
export const fail = (m) => { throw new RuleError(m); };

export function slotOf(p, a) {
  const { col, row } = a;
  if (!Number.isInteger(col) || !Number.isInteger(row) ||
      col < 0 || col >= COLS || row < 0 || row >= ROWS) fail('Emplacement invalide');
  const column = p.grid[col];
  if (!column) fail('Cette colonne a déjà été retirée');
  return column[row];
}

export const allUp = (p) => p.grid.every((col) => !col || col.every((c) => c.up));

export const visibleScore = (p) =>
  p.grid.reduce((t, col) => t + (col ? col.reduce((x, c) => x + (c.up ? c.v : 0), 0) : 0), 0);

export function hiddenSlots(p) {
  const out = [];
  p.grid.forEach((col, c) => col && col.forEach((card, r) => { if (!card.up) out.push({ col: c, row: r }); }));
  return out;
}

export function existingSlots(p) {
  const out = [];
  p.grid.forEach((col, c) => col && col.forEach((_, r) => out.push({ col: c, row: r })));
  return out;
}
