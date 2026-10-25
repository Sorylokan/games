// Autumn: foxes, and now and then a hedgehog.
// Each function draws the species standing, centered on (0, 0), 30 units = 1 cell.
// ph: animation phase, flip: 1 or -1 (direction), carry: carried pixel color or null.
import { ctx, tile, dot } from '../canvas.js';

export function drawFox(ph, flip, carry) {
  ctx.scale(flip, 1);
  const step = Math.sin(ph * 1.9);
  ctx.translate(0, -Math.abs(step) * 0.8);
  ctx.strokeStyle = '#4a2a1a'; ctx.lineWidth = 1.5;
  for (const [lx, sg] of [[-4.5, 1], [-2, -1], [3, -1], [5.5, 1]]) { ctx.beginPath(); ctx.moveTo(lx, 3); ctx.lineTo(lx + step * sg * 1.6, 8); ctx.stroke(); }
  const tw = Math.sin(ph * 1.2) * 1.2;
  ctx.fillStyle = '#d9692a';
  ctx.beginPath(); ctx.moveTo(-5, 0); ctx.quadraticCurveTo(-12, -3 + tw, -15, -6 + tw); ctx.quadraticCurveTo(-14, 1 + tw, -6, 3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f6eadb'; ctx.beginPath(); ctx.ellipse(-14.2, -5 + tw, 2, 1.5, -0.6, 0, 7); ctx.fill();
  ctx.fillStyle = '#e0742f'; ctx.beginPath(); ctx.ellipse(0, 1, 7, 4, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#f6eadb'; ctx.beginPath(); ctx.ellipse(3.5, 3, 3.4, 2, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#e0742f';
  ctx.beginPath(); ctx.moveTo(6.2, -6.2); ctx.lineTo(6.4, -10.5); ctx.lineTo(8.6, -6.8); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(8.6, -6.6); ctx.lineTo(10, -10.4); ctx.lineTo(10.8, -6); ctx.closePath(); ctx.fill();
  dot(8.4, -3.4, 3.7, '#e0742f');
  ctx.fillStyle = '#e0742f'; ctx.beginPath(); ctx.moveTo(10, -5); ctx.lineTo(13.4, -2.6); ctx.lineTo(10.4, -1); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f6eadb'; ctx.beginPath(); ctx.moveTo(8, -1.6); ctx.lineTo(13.2, -2.4); ctx.lineTo(10, -0.2); ctx.closePath(); ctx.fill();
  dot(13.3, -2.7, 0.8, '#2a1a12'); dot(9.4, -4.2, 0.65, '#2a1a12');
  if (carry) tile(14.5, 0.5, 7, carry);
}

export function drawHedgehog(ph, flip, carry) {
  ctx.scale(flip, 1);
  const k = Math.sin(ph * 1.4);
  ctx.fillStyle = '#5a3d29';
  ctx.beginPath();
  for (let i = 0; i <= 12; i++) {
    const t = Math.PI + (i / 12) * Math.PI, r = i % 2 ? 9.5 : 7;
    const x = -1 + Math.cos(t) * r, y = 3 + Math.sin(t) * r * 0.9;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7a5538'; ctx.beginPath(); ctx.ellipse(-1, 1.5, 6.5, 4.2, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#d9b98f'; ctx.beginPath(); ctx.moveTo(4, 3.5); ctx.quadraticCurveTo(6, -2, 9.5, 2.6); ctx.lineTo(4, 4); ctx.closePath(); ctx.fill();
  dot(9.6, 2.4, 0.9, '#2a1a12'); dot(6.6, 0.8, 0.55, '#2a1a12');
  ctx.fillStyle = '#4a2f1f'; ctx.fillRect(-5 + k, 3.6, 2, 1.8); ctx.fillRect(2 - k, 3.6, 2, 1.8);
  if (carry) tile(-1, -10, 7.5, carry);
}
