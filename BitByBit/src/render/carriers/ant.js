// Fourmi (thèmes Classique, Printemps, Été, Hiver). Vue de dessus, tournée dans le sens de la marche,
// dessinée dans la couleur du texte du thème.
import { app } from '../../game/state.js';
import { toScreen } from '../../game/geometry.js';
import { ctx, tile } from '../canvas.js';

export function drawAnt(x, y, ang, carry, phase) {
  const u = app.geo.u, [px, py] = toScreen(x, y);
  ctx.save(); ctx.translate(px, py); ctx.rotate(ang); ctx.scale(u / 30, u / 30);
  ctx.strokeStyle = app.pal.txt; ctx.fillStyle = app.pal.txt; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
  const w = Math.sin(phase) * 2;
  for (const [lx, dir] of [[-1.5, 1], [1, -1], [3.5, 1]]) {
    ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx - 2 + w * dir, -5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx - 2 - w * dir, 5); ctx.stroke();
  }
  ctx.beginPath(); ctx.ellipse(-5, 0, 3.8, 2.8, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(1, 0, 2.1, 1.7, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(5, 0, 2.1, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(6.5, -1); ctx.lineTo(9.5, -3.4); ctx.moveTo(6.5, 1); ctx.lineTo(9.5, 3.4); ctx.stroke();
  if (carry) { ctx.rotate(-ang); tile(Math.cos(ang) * 9, Math.sin(ang) * 9, 8.5, carry); }
  ctx.restore();
}
