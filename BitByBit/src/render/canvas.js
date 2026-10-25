// Board canvas: sizing and shared drawing primitives.
import { $ } from '../dom.js';
import { app } from '../game/state.js';

export const cv = $('cv');
export const ctx = cv.getContext('2d');

// Sizes the canvas from the board width; height follows (mural + box line).
export function resize() {
  const st = app.st;
  if (!st) return;
  const w = cv.parentElement.clientWidth - 20;
  if (w <= 0) return;
  const u = w / (st.N + 2);                       // cell size
  // Box line height: at least 72 screen px so boxes stay readable on big murals. lh = same, in cells.
  const linePx = Math.max(u * 1.9, Math.min(96, u * 3.4), 72);
  const lh = linePx / u;
  const h = u * (st.N + 2 + lh);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  cv.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  app.geo = { w, h, u, lh };
}

// Rounded rectangle path (fill or stroke it afterwards).
export function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// One mural pixel: rounded square, slight highlight, thin outline on light themes.
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

// Filled circle.
export function dot(x, y, r, c) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 7);
  ctx.fill();
}
