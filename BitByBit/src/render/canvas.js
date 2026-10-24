// Le canvas du plateau, sa taille, et les petites primitives de dessin réutilisées partout.
import { $ } from '../dom.js';
import { app } from '../game/state.js';

export const cv = $('cv');
export const ctx = cv.getContext('2d');

// Recalcule la taille du canvas d'après la largeur du plateau.
// La hauteur suit (fresque + ligne de boîtes) : c'est pour ça qu'on n'observe que la largeur.
export function resize() {
  const st = app.st;
  if (!st) return;
  const w = cv.parentElement.clientWidth - 20;
  if (w <= 0) return;
  const u = w / (st.N + 2);                       // taille d'une case
  const lh = Math.max(1.9, Math.min(3.4, 96 / u)); // hauteur de la ligne de boîtes, en cases
  const h = u * (st.N + 2 + lh);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  cv.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  app.geo = { w, h, u, lh };
}

// Rectangle arrondi (chemin seulement : à remplir ou tracer ensuite).
export function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Un pixel de fresque (carré arrondi, léger reflet ; fin contour sur les thèmes clairs).
export function tile(px, py, size, color, alpha = 1) {
  const h = size / 2;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  rr(px - h, py - h, size, size, size * 0.16);
  ctx.fill();
  if (app.pal.light) { ctx.strokeStyle = 'rgba(60,45,25,.16)'; ctx.lineWidth = 1; ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.10)';
  ctx.fillRect(px - h + size * 0.18, py - h + size * 0.08, size * 0.64, Math.max(1, size * 0.05));
  ctx.globalAlpha = 1;
}

// Disque plein.
export function dot(x, y, r, c) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 7);
  ctx.fill();
}
