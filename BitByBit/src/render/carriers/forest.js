// Forêt : fées, et de temps en temps un feu follet.
// Chaque fonction dessine l'espèce debout, centrée en (0, 0), à l'échelle « 30 unités = 1 case ».
// Paramètres : ph (phase d'animation), flip (1 ou -1 selon la direction), carry (couleur du pixel porté ou null).
import { ctx, tile, dot } from '../canvas.js';

export function drawFairy(ph, flip, carry) {
  ctx.translate(0, Math.sin(ph * 0.7) * 2);
  const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 13);
  g.addColorStop(0, 'rgba(255,248,220,.35)'); g.addColorStop(1, 'rgba(255,248,220,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.fill();
  const f = 0.55 + 0.45 * Math.abs(Math.sin(ph * 3));
  for (const sd of [-1, 1]) for (const [dy, s] of [[-3, 1], [2, 0.7]]) {
    ctx.save(); ctx.translate(sd * 3, dy); ctx.rotate(sd * (dy < 0 ? -0.5 : 0.4)); ctx.scale(f, 1);
    ctx.fillStyle = 'rgba(205,232,255,.38)'; ctx.strokeStyle = 'rgba(225,242,255,.75)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(sd * 4.5 * s, 0, 5 * s, 3 * s, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  ctx.fillStyle = '#efe4ff'; ctx.beginPath(); ctx.ellipse(0, 2, 2.2, 4.2, 0, 0, 7); ctx.fill();
  dot(0, -4, 2.4, '#ffe6d2');
  ctx.fillStyle = '#e8c27a'; ctx.beginPath(); ctx.ellipse(-0.3 * flip, -5.4, 2.8, 1.5, 0, 0, 7); ctx.fill();
  if (carry) tile(0, 10, 8, carry);
}

export function drawWisp(ph, flip, carry, a) {
  const fl = 0.75 + 0.25 * Math.sin(ph * 4 + a.seed);
  for (let i = 3; i >= 1; i--) dot(-flip * i * 3.2, Math.sin(ph * 2 + i) * 1.5, 2.6 - i * 0.5, `rgba(140,225,255,${0.25 - i * 0.05})`);
  const g = ctx.createRadialGradient(0, 0, 0.5, 0, 0, 11 * fl);
  g.addColorStop(0, 'rgba(240,252,255,.95)'); g.addColorStop(0.35, 'rgba(130,220,255,.65)'); g.addColorStop(1, 'rgba(130,220,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 11 * fl, 0, 7); ctx.fill();
  if (carry) { ctx.globalAlpha = 0.9; tile(0, 9, 7.5, carry); ctx.globalAlpha = 1; }
}
