// Garden: gnomes, and now and then a snail.
// Each function draws the species standing, centered on (0, 0), 30 units = 1 cell.
// ph: animation phase, flip: 1 or -1 (direction), carry: carried pixel color or null.
import { ctx, tile, dot, rr } from '../canvas.js';

export function drawGnome(ph, flip, carry) {
  ctx.scale(flip, 1);
  const step = Math.sin(ph * 1.6);
  ctx.translate(0, -Math.abs(step) * 1.2);
  ctx.fillStyle = '#5a3d2b';
  ctx.fillRect(-4 + step * 1.2, 8, 3.2, 2.4); ctx.fillRect(1 - step * 1.2, 8, 3.2, 2.4);
  ctx.fillStyle = '#3f6db3'; rr(-5, -1, 10, 9.5, 3); ctx.fill();
  ctx.fillStyle = '#2c2a26'; ctx.fillRect(-5, 4, 10, 1.4);
  ctx.fillStyle = '#f3efe6'; ctx.beginPath(); ctx.moveTo(-3.6, -3); ctx.quadraticCurveTo(0, 7, 3.8, -3); ctx.closePath(); ctx.fill();
  dot(0, -4.6, 3.1, '#f2c8a8'); dot(2.6, -4, 1.1, '#e3958a');
  ctx.fillStyle = '#d64a3a'; ctx.beginPath(); ctx.moveTo(-4.4, -6); ctx.lineTo(4.4, -6); ctx.lineTo(3.5, -17); ctx.closePath(); ctx.fill();
  if (carry) tile(8, 1, 8, carry);
}

export function drawSnail(ph, flip, carry) {
  ctx.scale(flip, 1);
  const k = 1 + Math.sin(ph * 0.8) * 0.06;
  ctx.fillStyle = '#cdb98e';
  ctx.beginPath(); ctx.moveTo(-10, 6); ctx.lineTo(8 * k, 6); ctx.quadraticCurveTo(11 * k, 6, 10 * k, 1); ctx.lineTo(8 * k, -1); ctx.lineTo(6, 3); ctx.lineTo(-10, 4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#cdb98e'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(8.5 * k, 0); ctx.lineTo(10 * k, -5); ctx.moveTo(9.5 * k, 0.5); ctx.lineTo(12.5 * k, -4); ctx.stroke();
  dot(10 * k, -5.3, 0.9, '#2c2a26'); dot(12.5 * k, -4.3, 0.9, '#2c2a26');
  dot(-1, -1, 6.5, '#b57a4a');
  ctx.strokeStyle = '#7a4a2a'; ctx.lineWidth = 1.2; ctx.beginPath();
  for (let t = 0; t < 12; t += 0.2) { const r = 5.6 - t * 0.44, ax = -1 + Math.cos(t) * r, ay = -1 + Math.sin(t) * r; t === 0 ? ctx.moveTo(ax, ay) : ctx.lineTo(ax, ay); }
  ctx.stroke();
  if (carry) tile(-1, -11, 8, carry);
}
