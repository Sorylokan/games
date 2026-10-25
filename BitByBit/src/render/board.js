// Dessin d'une image du plateau : cadre, pixels, porteurs, boîtes.
import { COLORS, inkFor } from '../data/colors.js';
import { reduceMotion } from '../dom.js';
import { app } from '../game/state.js';
import { toScreen, slotPos } from '../game/geometry.js';
import { along } from '../game/pathfinding.js';
import { ctx, rr, tile } from './canvas.js';
import { drawCarrier } from './carriers/index.js';

export function draw(now) {
  const { st, geo, pal } = app;
  if (!st || !geo.u) return;
  const { u, w, h } = geo, N = st.N;
  ctx.clearRect(0, 0, w, h);

  // cadre fin autour de la fresque (comme le dos des cartes de Grid of Greed)
  ctx.strokeStyle = pal.line; ctx.lineWidth = 1;
  rr(u * 0.5, u * 0.5, (N + 1) * u, (N + 1) * u, u * 0.3); ctx.stroke();
  // séparation avec la ligne de boîtes
  const ly = (N + 2) * u + 0.5;
  ctx.beginPath(); ctx.moveTo(u * 0.5, ly); ctx.lineTo(w - u * 0.5, ly); ctx.stroke();

  drawPixels(st, u, pal, now);
  for (const a of st.ants) { // les porteurs passent derrière les boîtes
    const p = along(a.pts, Math.min(a.d, a.len));
    drawCarrier(a, p.x, p.y, p.ang, reduceMotion ? 0 : now / 60 + a.seed);
  }
  st.line.forEach((b, i) => drawBox(b, i, now));
}

function drawPixels(st, u, pal, now) {
  const N = st.N;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (!st.target[r][c]) continue;
    const [px, py] = toScreen(c + 0.5, r + 0.5), id = r * N + c, col = st.grid[r][c];
    if (col) {
      const claimed = st.claimed.has(id); // déjà visé par un porteur : il pâlit
      tile(px, py, u * 0.9, COLORS[col], claimed ? 0.55 : 1);
      if (claimed) {
        ctx.strokeStyle = pal.txt; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
        rr(px - u * 0.45, py - u * 0.45, u * 0.9, u * 0.9, u * 0.14); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    } else { // pixel emporté : un petit point discret apparaît
      const t0 = st.pickedAt.get(id), k = t0 ? Math.min(1, (now - t0) / 300) : 1;
      ctx.fillStyle = pal.line; ctx.globalAlpha = 0.7 * k;
      ctx.beginPath(); ctx.arc(px, py, Math.max(1, u * 0.05), 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}

function drawBox(box, i, now) {
  const { st, geo, pal } = app;
  const s = slotPos(i), [px, py] = toScreen(s.x, s.y);
  // taille liée à la case, mais jamais sous ~46 % de la ligne (grandes fresques aux cases minuscules)
  const sz = Math.min(64, Math.max(geo.u * 1.55, geo.lh * geo.u * 0.46), geo.w / st.line.length - 14);

  if (!box) { // place libre : cadre pointillé qui respire, assez marqué pour se voir sur tous les thèmes
    const a = reduceMotion ? 0.8 : 0.7 + 0.2 * Math.sin(now / 700 + i);
    ctx.globalAlpha = a * 0.12; ctx.fillStyle = pal.mut;
    rr(px - sz / 2, py - sz / 2, sz, sz, sz * 0.14); ctx.fill(); // léger fond : la place se lit comme une case
    ctx.globalAlpha = a; ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.mut; ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    return;
  }

  let k = 1;
  const t = (now - box.placedAt) / 260;
  if (t < 1) k = 0.85 + 0.15 * (1 - Math.pow(1 - t, 3)); // arrivée en douceur
  let alpha = Math.min(1, t * 1.5);
  if (box.doneAt) { const d = (now - box.doneAt) / 500; k = 1 + 0.08 * d; alpha = Math.max(0, 1 - d); }
  const waiting = box.blocked && !box.out;
  const z = sz * k, col = COLORS[box.color], ink = inkFor(col);
  const x0 = px - z / 2, y0 = py - z / 2, r = z * 0.14;

  ctx.globalAlpha = alpha * (waiting ? 0.62 : 1);
  ctx.fillStyle = col; rr(x0, y0, z, z, r); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fillRect(x0 + z * 0.16, y0 + 1.5, z * 0.68, 1);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(x0 + z * 0.1, y0 + z - 2.5, z * 0.8, 2);
  ctx.strokeStyle = ink; ctx.globalAlpha *= 0.22; ctx.lineWidth = 1;
  rr(x0 + z * 0.12, y0 + z * 0.12, z * 0.76, z * 0.76, z * 0.08); ctx.stroke(); // petit cadre intérieur
  ctx.globalAlpha = alpha * (waiting ? 0.62 : 1);
  // boîte ouverte : une encoche en haut pour laisser passer les porteurs
  if (!waiting) { ctx.fillStyle = pal.card; rr(px - z * 0.17, y0 - 3, z * 0.34, 6, 2); ctx.fill(); }
  ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `500 ${Math.round(z * 0.42)}px Fraunces, Georgia, serif`;
  ctx.fillText(box.count - box.got, px, py + z * 0.03);
  ctx.globalAlpha = 1;
}
