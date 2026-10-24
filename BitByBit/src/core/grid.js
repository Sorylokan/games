// Règles de base sur une grille de pixels (aucune dépendance au navigateur : testable avec node).
// Une grille g est un tableau N×N de lettres de couleur, ou null pour une case vide.

export const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export const rand = (a, b, rnd = Math.random) => a + Math.floor(rnd() * (b - a + 1));
export const pick = (arr, rnd = Math.random) => arr[Math.floor(rnd() * arr.length)];
export const clone = (g) => g.map((r) => r.slice());
export const remaining = (g) => g.reduce((s, r) => s + r.filter(Boolean).length, 0);

// Transforme une fresque (lignes de lettres) en grille.
export const parseMap = (map) => map.map((row) => [...row].map((ch) => (ch === '.' ? null : ch)));

// Zone libre reliée à l'extérieur. La grille est entourée d'une bordure de 1 case
// (coordonnées -1 et N), d'où un tableau (N+2)×(N+2).
export function outsideMap(g, N) {
  const W = N + 2, seen = new Uint8Array(W * W), stack = [[-1, -1]];
  const free = (r, c) => r < 0 || c < 0 || r >= N || c >= N || !g[r][c];
  seen[0] = 1;
  while (stack.length) {
    const [r, c] = stack.pop();
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < -1 || nc < -1 || nr > N || nc > N) continue;
      const i = (nr + 1) * W + (nc + 1);
      if (seen[i] || !free(nr, nc)) continue;
      seen[i] = 1;
      stack.push([nr, nc]);
    }
  }
  return seen;
}

// Pixels qu'un porteur peut toucher : pleins, avec au moins un voisin dans la zone extérieure.
// color facultatif : ne garde que cette couleur.
export function reachable(g, N, color) {
  const W = N + 2, out = outsideMap(g, N), res = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const v = g[r][c];
    if (!v || (color && v !== color)) continue;
    if (DIRS.some(([dr, dc]) => out[(r + dr + 1) * W + (c + dc + 1)])) res.push([r, c]);
  }
  return res;
}

// Une boîte ouverte ramasse tout ce qu'elle peut atteindre de sa couleur, jusqu'à k pixels.
// Modifie g et renvoie le nombre de pixels ramassés.
export function collect(g, N, color, k) {
  let n = 0;
  while (n < k) {
    const acc = reachable(g, N, color);
    if (!acc.length) break;
    for (const [r, c] of acc) {
      if (n >= k) break;
      g[r][c] = null;
      n++;
    }
  }
  return n;
}

// Laisse toutes les boîtes de la ligne ramasser jusqu'à ce que plus rien ne bouge.
// line : [{ color, rem }]. Renvoie les boîtes qui ne sont pas encore pleines.
export function settle(g, N, line) {
  let changed = true;
  while (changed) {
    changed = false;
    for (const b of line) {
      if (b.rem <= 0) continue;
      const n = collect(g, N, b.color, b.rem);
      if (n) { b.rem -= n; changed = true; }
    }
  }
  return line.filter((b) => b.rem > 0);
}
