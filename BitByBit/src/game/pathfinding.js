// Carrier paths: walk through free cells to the nearest pixel of their color.
import { DIRS } from '../core/grid.js';
import { app } from './state.js';
import { slotPos, entryOf } from './geometry.js';

// Breadth-first shortest paths from an entry cell, cached until the grid changes.
function bfsFrom(entry) {
  const st = app.st;
  const key = st.ver + ':' + entry[1];
  if (st.bfsCache.has(key)) return st.bfsCache.get(key);
  const N = st.N, W = N + 2;
  const dist = new Int16Array(W * W).fill(-1), prev = new Int16Array(W * W).fill(-1);
  const free = (r, c) => r < 0 || c < 0 || r >= N || c >= N || !st.grid[r][c];
  const id = (r, c) => (r + 1) * W + (c + 1);
  const q = [entry];
  dist[id(...entry)] = 0;
  for (let h = 0; h < q.length; h++) {
    const [r, c] = q[h];
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < -1 || nc < -1 || nr > N || nc > N || !free(nr, nc)) continue;
      const j = id(nr, nc);
      if (dist[j] >= 0) continue;
      dist[j] = dist[id(r, c)] + 1;
      prev[j] = id(r, c);
      q.push([nr, nc]);
    }
  }
  const res = { dist, prev, W, id };
  st.bfsCache.set(key, res);
  return res;
}

// Target pixel and path for a box's next carrier: { r, c, pts }, or null if nothing is reachable.
export function findTarget(box) {
  const st = app.st, N = st.N, b = bfsFrom(entryOf(box.slot));
  let best = null;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (st.grid[r][c] !== box.color || st.claimed.has(r * N + c)) continue;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < -1 || nc < -1 || nr > N || nc > N) continue;
      const d = b.dist[b.id(nr, nc)];
      if (d >= 0 && (!best || d < best.d)) best = { d, r, c, nr, nc };
    }
  }
  if (!best) return null;
  const pts = [];
  let j = b.id(best.nr, best.nc);
  while (j >= 0) {
    const r = Math.floor(j / b.W) - 1, c = (j % b.W) - 1;
    pts.unshift({ x: c + 0.5, y: r + 0.5 });
    j = b.prev[j];
  }
  const s = slotPos(box.slot);
  pts.unshift({ x: s.x, y: s.y - 0.35 });               // out of the box
  const last = pts[pts.length - 1];
  pts.push({ x: last.x + (best.c + 0.5 - last.x) * 0.42, // step up against the pixel
             y: last.y + (best.r + 0.5 - last.y) * 0.42 });
  return { r: best.r, c: best.c, pts };
}

export function pathLen(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return L;
}

// Position and heading at distance d along the path.
export function along(pts, d) {
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], l = Math.hypot(b.x - a.x, b.y - a.y);
    if (d <= l || i === pts.length - 1) {
      const t = l ? Math.min(1, d / l) : 1;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, ang: Math.atan2(b.y - a.y, b.x - a.x) };
    }
    d -= l;
  }
  return { x: pts[0].x, y: pts[0].y, ang: 0 };
}
