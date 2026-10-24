// Registre des porteurs : nom d'espèce (utilisé dans data/skins.js) → fonction de dessin.
// Pour ajouter une espèce : dessine-la dans un fichier de ce dossier, puis ajoute-la ici.
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

// Espèces dessinées debout (elles se retournent selon la direction, sans pivoter).
const UPRIGHT = {
  crab: drawCrab, hermit: drawHermit,
  fairy: drawFairy, wisp: drawWisp,
  gnome: drawGnome, snail: drawSnail,
  fox: drawFox, hedgehog: drawHedgehog,
  ghost: drawGhost, bat: drawBat,
  elf: drawElf, snowman: drawSnowman,
};

// Dessine un porteur a à la position (x, y) en cases, allant dans la direction ang.
export function drawCarrier(a, x, y, ang, phase) {
  const carry = a.back ? COLORS[a.color] : null; // il ne porte son pixel qu'au retour
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
