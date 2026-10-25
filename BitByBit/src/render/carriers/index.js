// Carrier registry: species name (used in data/skins.js) → draw function.
import { COLORS } from '../../data/colors.js';
import { app } from '../../game/state.js';
import { toScreen } from '../../game/geometry.js';
import { ctx } from '../canvas.js';
import { drawAnt } from './ant.js';
import { drawCrab, drawHermit } from './beach.js';
import { drawFairy, drawWisp } from './forest.js';
import { drawGnome, drawSnail } from './garden.js';
import { drawFox, drawHedgehog } from './autumn.js';
import { drawGhost, drawBat } from './halloween.js';
import { drawElf, drawSnowman } from './xmas.js';

// Species drawn standing (they flip with the direction instead of rotating).
const UPRIGHT = {
  crab: drawCrab, hermit: drawHermit,
  fairy: drawFairy, wisp: drawWisp,
  gnome: drawGnome, snail: drawSnail,
  fox: drawFox, hedgehog: drawHedgehog,
  ghost: drawGhost, bat: drawBat,
  elf: drawElf, snowman: drawSnowman,
};

// Draws carrier a at (x, y) in cells, heading ang.
export function drawCarrier(a, x, y, ang, phase) {
  const carry = a.back ? COLORS[a.color] : null; // only carries its pixel on the way back
  if (a.kind === 'ant') return drawAnt(x, y, ang, carry, phase);
  const draw = UPRIGHT[a.kind];
  if (!draw) return;
  const u = app.geo.u, [px, py] = toScreen(x, y), flip = Math.cos(ang) < -0.05 ? -1 : 1;
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(u / 30, u / 30);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  draw(phase, flip, carry, a);
  ctx.restore();
}
