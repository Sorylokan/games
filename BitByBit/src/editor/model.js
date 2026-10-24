// Atelier : la fresque en cours d'édition, ses outils et son historique (annuler).
// Pas de DOM ici. La grille est un tableau N×N de lettres de couleur, ou '.' pour une case vide.
import { MIN_SIZE, MAX_SIZE, cleanName } from '../core/mural-code.js';
import { DIRS } from '../core/grid.js';

export const ERASER = '.';
const HISTORY_MAX = 60;

export const ed = {
  N: 12,
  cells: [],          // cells[r][c]
  name: '',
  editingId: null,    // id dans la bibliothèque si on modifie une fresque enregistrée
  color: 'R',         // couleur du pinceau (ERASER = gomme)
  tool: 'brush',      // 'brush' | 'fill' | 'pick'
  history: [],
  dirty: false,       // modifié depuis le dernier enregistrement
};

const blank = (N) => Array.from({ length: N }, () => Array(N).fill(ERASER));

export function newMural(N = 12) {
  ed.N = N; ed.cells = blank(N); ed.name = ''; ed.editingId = null; ed.history = []; ed.dirty = false;
}

export function loadMural({ name, map }, editingId = null) {
  ed.N = map.length;
  ed.cells = map.map((row) => [...row]);
  ed.name = cleanName(name);
  ed.editingId = editingId;
  ed.history = [];
  ed.dirty = false;
}

export const toMap = () => ed.cells.map((r) => r.join(''));
export const toMural = () => ({ name: ed.name, map: toMap() });
export const isEmpty = () => ed.cells.every((r) => r.every((v) => v === ERASER));

// Photo de l'état avant une modification, pour pouvoir l'annuler.
export function snapshot() {
  ed.history.push({ N: ed.N, cells: ed.cells.map((r) => r.slice()) });
  if (ed.history.length > HISTORY_MAX) ed.history.shift();
}

export function undo() {
  const prev = ed.history.pop();
  if (!prev) return false;
  ed.N = prev.N; ed.cells = prev.cells; ed.dirty = true;
  return true;
}

export function paint(r, c, color = ed.color) {
  if (r < 0 || c < 0 || r >= ed.N || c >= ed.N || ed.cells[r][c] === color) return false;
  ed.cells[r][c] = color; ed.dirty = true;
  return true;
}

// Trace une ligne de cases entre deux points (pour un trait continu quand on glisse vite).
export function paintLine(r0, c0, r1, c1, color) {
  const steps = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0), 1);
  let changed = false;
  for (let i = 0; i <= steps; i++) {
    changed = paint(Math.round(r0 + (r1 - r0) * i / steps), Math.round(c0 + (c1 - c0) * i / steps), color) || changed;
  }
  return changed;
}

// Pot de peinture : remplit la zone de même couleur touchant la case.
export function fill(r, c, color = ed.color) {
  const from = ed.cells[r]?.[c];
  if (from === undefined || from === color) return false;
  const stack = [[r, c]];
  while (stack.length) {
    const [y, x] = stack.pop();
    if (y < 0 || x < 0 || y >= ed.N || x >= ed.N || ed.cells[y][x] !== from) continue;
    ed.cells[y][x] = color;
    for (const [dy, dx] of DIRS) stack.push([y + dy, x + dx]);
  }
  ed.dirty = true;
  return true;
}

// Change le nombre de pixels de côté en gardant le dessin centré.
export function resize(N) {
  N = Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.round(N)));
  if (N === ed.N) return false;
  const old = ed.cells, off = Math.floor((ed.N - N) / 2);
  ed.cells = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => old[r + off]?.[c + off] ?? ERASER));
  ed.N = N; ed.dirty = true;
  return true;
}

export const clear = () => { ed.cells = blank(ed.N); ed.dirty = true; };
