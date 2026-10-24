// Noël : lutins, et de temps en temps un bonhomme de neige.
// Chaque fonction dessine l'espèce debout, centrée en (0, 0), à l'échelle « 30 unités = 1 case ».
// Paramètres : ph (phase d'animation), flip (1 ou -1 selon la direction), carry (couleur du pixel porté ou null).
import { ctx, tile, dot, rr } from '../canvas.js';

export function drawElf(ph, flip, carry) {
  ctx.scale(flip, 1);
  const step = Math.sin(ph * 1.7);
  ctx.translate(0, -Math.abs(step) * 1.3);
  ctx.fillStyle = '#2d5a3a';
  ctx.fillRect(-4 + step * 1.2, 8, 3, 2.6); ctx.fillRect(1 - step * 1.2, 8, 3, 2.6);
  ctx.fillStyle = '#b83a3a'; rr(-4.8, -1, 9.6, 9.5, 3); ctx.fill();
  ctx.fillStyle = '#e8c45a'; ctx.fillRect(-4.8, 3.8, 9.6, 1.4);
  ctx.fillStyle = '#f2c8a8'; ctx.beginPath(); ctx.moveTo(-3, -4.8); ctx.lineTo(-5.6, -6.5); ctx.lineTo(-2.6, -3.4); ctx.fill();
  dot(0, -4.4, 3, '#f2c8a8'); dot(2.5, -3.9, .9, '#e3958a'); dot(1.4, -5, .55, '#2c2a26');
  ctx.fillStyle = '#2f7a46'; ctx.beginPath(); ctx.moveTo(-3.8, -6); ctx.lineTo(3.8, -6); ctx.quadraticCurveTo(6, -12, 9, -11); ctx.closePath(); ctx.fill();
  dot(9.2, -11, 1.6, '#f4efe6');
  if (carry) tile(8, 1.5, 8, carry);
}

export function drawSnowman(ph, flip, carry) {
  ctx.scale(flip, 1); ctx.rotate(Math.sin(ph * 0.9) * 0.06);
  dot(0, 4, 6.5, '#f7f9fc'); dot(0, -5, 4.6, '#f7f9fc');
  ctx.strokeStyle = 'rgba(120,150,180,.5)'; ctx.lineWidth = .8;
  ctx.beginPath(); ctx.arc(0, 4, 6.5, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -5, 4.6, 0, 7); ctx.stroke();
  dot(-1.5, -6, .7, '#22262e'); dot(1.6, -6, .7, '#22262e'); dot(0, 2, .8, '#22262e'); dot(0, 5, .8, '#22262e');
  ctx.fillStyle = '#e8873a'; ctx.beginPath(); ctx.moveTo(0.5, -5); ctx.lineTo(5, -4.4); ctx.lineTo(0.5, -3.9); ctx.fill();
  ctx.fillStyle = '#b83a3a'; ctx.fillRect(-4.2, -1.6, 8.4, 1.8);
  ctx.fillStyle = '#22262e'; ctx.fillRect(-3.4, -12.5, 6.8, 4.5); ctx.fillRect(-5, -8.4, 10, 1.4);
  if (carry) tile(8, 0, 8, carry);
}
