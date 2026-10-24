// Atelier : dessin du canevas (image de fond, grille, pixels) et saisie souris / doigt.
import { COLORS } from '../data/colors.js';
import { $ } from '../dom.js';
import { app } from '../game/state.js';
import { ed, ERASER, snapshot, paint, paintLine, fill } from './model.js';

const cv = $('ed');
const ctx = cv.getContext('2d');
const bg = { img: null, opacity: 0.5, visible: true };
let size = 0, hover = null;
let onChange = () => {}, onPick = () => {};

export function initView({ changed, picked }) {
  onChange = changed; onPick = picked;
  bindPointer();
}

export function setBackground(img) { bg.img = img; draw(); }
export function setBackgroundOpacity(v) { bg.opacity = v; draw(); }
export function setBackgroundVisible(v) { bg.visible = v; draw(); }
export const hasBackground = () => !!bg.img;

export function resizeView() {
  const w = cv.parentElement.clientWidth - 20;
  if (w <= 0) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  size = w;
  cv.width = Math.round(w * dpr); cv.height = Math.round(w * dpr);
  cv.style.height = w + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function rr(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

export function draw() {
  if (!size) return;
  const pal = app.pal, N = ed.N, cell = size / N;
  ctx.clearRect(0, 0, size, size);

  // image de fond, entière et centrée, sous la grille
  if (bg.img && bg.visible) {
    const k = Math.min(size / bg.img.width, size / bg.img.height);
    const w = bg.img.width * k, h = bg.img.height * k;
    ctx.globalAlpha = bg.opacity;
    ctx.imageSmoothingEnabled = k < 1; // un petit pixel art agrandi reste net
    ctx.drawImage(bg.img, (size - w) / 2, (size - h) / 2, w, h);
    ctx.globalAlpha = 1;
  }

  // grille fine
  ctx.strokeStyle = pal.line; ctx.lineWidth = 1; ctx.globalAlpha = 0.7;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const p = Math.round(i * cell) + 0.5;
    ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.moveTo(0, p); ctx.lineTo(size, p);
  }
  ctx.stroke(); ctx.globalAlpha = 1;

  // pixels, avec le même rendu que dans le jeu
  const g = cell * 0.06;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const v = ed.cells[r][c];
    if (v === ERASER) continue;
    ctx.fillStyle = COLORS[v];
    rr(c * cell + g, r * cell + g, cell - 2 * g, cell - 2 * g, cell * 0.16); ctx.fill();
    if (pal.light) { ctx.strokeStyle = 'rgba(60,45,25,.16)'; ctx.stroke(); }
  }

  // case survolée : aperçu de l'outil
  if (hover) {
    const [r, c] = hover;
    ctx.strokeStyle = ed.color === ERASER ? pal.txt : COLORS[ed.color];
    ctx.lineWidth = 2;
    rr(c * cell + 1, r * cell + 1, cell - 2, cell - 2, cell * 0.18); ctx.stroke();
  }
}

function cellAt(e) {
  const rect = cv.getBoundingClientRect(), cell = rect.width / ed.N;
  const c = Math.floor((e.clientX - rect.left) / cell), r = Math.floor((e.clientY - rect.top) / cell);
  return r >= 0 && c >= 0 && r < ed.N && c < ed.N ? [r, c] : null;
}

function bindPointer() {
  let last = null, stroke = null; // stroke : couleur du trait en cours (clic droit = gomme)

  cv.addEventListener('contextmenu', (e) => e.preventDefault());
  cv.addEventListener('pointerdown', (e) => {
    const at = cellAt(e);
    if (!at) return;
    const color = e.button === 2 ? ERASER : ed.color;
    if (ed.tool === 'pick' && e.button !== 2) { onPick(ed.cells[at[0]][at[1]]); return; }
    snapshot();
    if (ed.tool === 'fill' && e.button !== 2) {
      if (fill(at[0], at[1], color)) onChange(); else ed.history.pop();
      return;
    }
    cv.setPointerCapture(e.pointerId);
    stroke = color; last = at;
    if (paint(at[0], at[1], color)) onChange();
  });
  cv.addEventListener('pointermove', (e) => {
    const at = cellAt(e);
    if (String(at) !== String(hover)) { hover = at; if (!stroke) draw(); }
    if (!stroke || !at) return;
    if (paintLine(last[0], last[1], at[0], at[1], stroke)) onChange();
    last = at;
  });
  const end = () => { stroke = null; last = null; };
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', end);
  cv.addEventListener('pointerleave', () => { hover = null; draw(); });
}
