// Beach: crabs, and now and then a hermit crab.
// Each function draws the species standing, centered on (0, 0), 30 units = 1 cell.
// ph: animation phase, flip: 1 or -1 (direction), carry: carried pixel color or null.
import { ctx, tile, dot } from '../canvas.js';

export function drawCrab(ph, flip, carry) {
  ctx.translate(0, Math.sin(ph * 2) * 0.6);
  ctx.strokeStyle = '#c4583b'; ctx.lineWidth = 1.5;
  for (const sd of [-1, 1]) for (const k of [-1, 0, 1]) {
    const w = Math.sin(ph * 1.6 + k + (sd > 0 ? 1.5 : 0)) * 1.3;
    ctx.beginPath(); ctx.moveTo(sd * 6, k * 2.2 + 1); ctx.lineTo(sd * 10.5, k * 3 + w); ctx.lineTo(sd * 12, k * 3 + 3.5 + w); ctx.stroke();
  }
  for (const sd of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(sd * 4, -3); ctx.lineTo(sd * 7, -7.5); ctx.stroke();
    dot(sd * 7.8, -9.4, 2.7, '#e07050');
    ctx.strokeStyle = '#7a2e1e'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sd * 7.8, -12); ctx.lineTo(sd * 7.8, -9.6); ctx.stroke();
    ctx.strokeStyle = '#c4583b'; ctx.lineWidth = 1.5;
  }
  ctx.fillStyle = '#e07050'; ctx.beginPath(); ctx.ellipse(0, 1, 8, 5.5, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(-1.5, -1, 4.5, 1.6, 0, 0, 7); ctx.fill();
  ctx.lineWidth = 1.1; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 2, -3.5); ctx.lineTo(sd * 2.6, -6.5); ctx.stroke(); dot(sd * 2.6, -7, 1.5, '#fff'); dot(sd * 2.6, -7, 0.75, '#1a1d26'); }
  if (carry) tile(0, -15, 8.5, carry);
}

export function drawHermit(ph, flip, carry) {
  ctx.scale(flip, 1); ctx.translate(0, Math.sin(ph * 1.5) * 0.5);
  ctx.strokeStyle = '#c4583b'; ctx.lineWidth = 1.4;
  for (const k of [0, 1, 2]) { const w = Math.sin(ph * 1.4 + k) * 1.2; ctx.beginPath(); ctx.moveTo(4 + k * 1.5, 4); ctx.lineTo(7 + k * 2 + w, 8); ctx.stroke(); }
  dot(10, 2, 2.6, '#e07050'); dot(9, 5.5, 2.1, '#e07050');
  ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(8, -1); ctx.lineTo(9.5, -5); ctx.moveTo(6.5, -1); ctx.lineTo(7, -5); ctx.stroke();
  dot(9.5, -5.4, 1.3, '#fff'); dot(7, -5.4, 1.3, '#fff'); dot(9.8, -5.4, .6, '#1a1d26'); dot(7.3, -5.4, .6, '#1a1d26');
  dot(-1, 0, 8, '#ead8c2');
  ctx.strokeStyle = '#b48d70'; ctx.lineWidth = 1.3; ctx.beginPath();
  for (let t = 0; t < 14; t += 0.2) { const r = 7 - t * 0.45, ax = -1 + Math.cos(t) * r, ay = Math.sin(t) * r; t === 0 ? ctx.moveTo(ax, ay) : ctx.lineTo(ax, ay); }
  ctx.stroke();
  if (carry) tile(-1, -12, 8.5, carry);
}
