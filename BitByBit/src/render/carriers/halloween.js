// Halloween: ghosts, and now and then a bat.
// Each function draws the species standing, centered on (0, 0), 30 units = 1 cell.
// ph: animation phase, flip: 1 or -1 (direction), carry: carried pixel color or null.
import { ctx, tile, dot } from '../canvas.js';

export function drawGhost(ph, flip, carry) {
  ctx.scale(flip, 1); ctx.translate(0, Math.sin(ph * 0.8) * 1.8);
  const g = ctx.createRadialGradient(0, -2, 1, 0, -2, 14);
  g.addColorStop(0, 'rgba(240,230,255,.25)'); g.addColorStop(1, 'rgba(240,230,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -2, 14, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(246,242,255,.94)';
  ctx.beginPath(); ctx.moveTo(-7, 7); ctx.lineTo(-7, -3); ctx.arc(0, -3, 7, Math.PI, 0); ctx.lineTo(7, 7);
  const w = Math.sin(ph * 2) * 1.2;
  for (let k = 0; k < 4; k++) { const x1 = 7 - (k + 0.5) * 3.5, x2 = 7 - (k + 1) * 3.5; ctx.quadraticCurveTo(x1, 10 + (k % 2 ? -w : w), x2, 7); }
  ctx.closePath(); ctx.fill();
  dot(-2.4, -4, 1.3, '#2a1d33'); dot(2.6, -4, 1.3, '#2a1d33');
  ctx.fillStyle = '#2a1d33'; ctx.beginPath(); ctx.ellipse(0.3, 0, 1.3, 1.7, 0, 0, 7); ctx.fill();
  if (carry) tile(8.5, 2, 8, carry);
}

export function drawBat(ph, flip, carry) {
  ctx.scale(flip, 1); ctx.translate(0, Math.sin(ph * 1.2) * 2);
  const f = Math.sin(ph * 4);
  ctx.fillStyle = '#6b5580'; ctx.strokeStyle = 'rgba(234,220,240,.35)'; ctx.lineWidth = .6;
  for (const sd of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(sd * 2, -1);
    ctx.quadraticCurveTo(sd * 8, -7 - f * 4, sd * 13, -3 - f * 3);
    ctx.quadraticCurveTo(sd * 10, -1, sd * 9.5, 2); ctx.quadraticCurveTo(sd * 6, 0, sd * 2, 2); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.beginPath(); ctx.ellipse(0, 0.5, 3, 3.8, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-2.2, -2.5); ctx.lineTo(-1.6, -5.5); ctx.lineTo(-0.6, -3); ctx.moveTo(2.2, -2.5); ctx.lineTo(1.6, -5.5); ctx.lineTo(0.6, -3); ctx.fill();
  dot(-1, -1.2, .7, '#f08a24'); dot(1, -1.2, .7, '#f08a24');
  if (carry) tile(0, 9, 7.5, carry);
}
