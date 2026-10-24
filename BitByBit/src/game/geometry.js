// Repères du plateau, en « cases ». Le centre de la case (r, c) est en (c + .5, r + .5).
// La fresque est entourée d'un chemin d'une case, puis la ligne de boîtes est dessous.
import { app } from './state.js';

// Case → pixels écran dans le canvas.
export const toScreen = (x, y) => [(x + 1) * app.geo.u, (y + 1) * app.geo.u];

// Centre de la place n° i sur la ligne de boîtes.
export function slotPos(i) {
  const { st, geo } = app;
  return { x: -1 + (i + 0.5) * (st.N + 2) / st.line.length, y: st.N + 1 + geo.lh / 2 };
}

// Case du chemin par laquelle les porteurs de la place i entrent autour de la fresque.
export function entryOf(i) {
  const { N } = app.st;
  return [N, Math.max(-1, Math.min(N, Math.floor(slotPos(i).x)))];
}
