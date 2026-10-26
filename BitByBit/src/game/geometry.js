// Board coordinates, in cells. Cell (r, c) is centered at (c + .5, r + .5).
// The mural has a 1-cell path around it; the box line is below.
import { app } from './state.js';
import { entryCol } from '../core/grid.js';

// Cell → canvas pixels.
export const toScreen = (x, y) => [(x + 1) * app.geo.u, (y + 1) * app.geo.u];

// Center of slot i on the box line.
export function slotPos(i) {
  const { st, geo } = app;
  return { x: -1 + (i + 0.5) * (st.N + 2) / st.line.length, y: st.N + 1 + geo.lh / 2 };
}

// Path cell where carriers from slot i enter the area around the mural (same rule as the generator).
export function entryOf(i) {
  const { N, line } = app.st;
  return [N, entryCol(i, line.length, N)];
}
