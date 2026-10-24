// Moteur de Mimiri : règles pures, sans DOM (donc testables avec `node --test`).
//
// Chaque case vaut 1 (« à corriger ») ou 0 (« gagnée »). Un clic bascule la case
// et ses voisines selon PATTERN ; la partie est gagnée quand tout vaut 0.
// Le thème (kittens, chats grincheux, jardin...) ne change JAMAIS ces règles :
// il décide seulement de ce que « 1 » et « 0 » ressemblent à l'écran.

export const SIZES = [3, 4, 5, 6];
export const DAILY_SIZE = 5;

// Motif d'un clic : la croix. Variantes possibles plus tard (diagonales, 8 voisines,
// ligne entière...) : il suffit de passer un autre motif aux fonctions ci-dessous.
export const PATTERN = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];

// --- Aléatoire avec graine (pour le défi du jour) ---
export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Date locale au format AAAA-MM-JJ : sert de graine et de clé du défi du jour.
export function dayKey(date = new Date()) {
  const p = (x) => String(x).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

// --- Règles ---

// Indices des cases touchées par un clic sur la case i (celles qui sont dans la grille).
export function touchedBy(n, i, pattern = PATTERN) {
  const r = Math.floor(i / n), c = i % n;
  const out = [];
  for (const [dr, dc] of pattern) {
    const rr = r + dr, cc = c + dc;
    if (rr >= 0 && rr < n && cc >= 0 && cc < n) out.push(rr * n + cc);
  }
  return out;
}

// Applique un clic en place (bascule chaque case touchée).
export function applyPress(cells, n, i, pattern = PATTERN) {
  for (const j of touchedBy(n, i, pattern)) cells[j] ^= 1;
  return cells;
}

export const isSolved = (cells) => cells.every((v) => v === 0);
export const countOn = (cells) => cells.filter((v) => v === 1).length;

// Génération toujours résoluble : on part de « tout est gagné » et on simule des clics.
// Renvoie la grille ET une solution (la liste des clics simulés), utile pour les tests.
export function scramble(n, rand = Math.random, pattern = PATTERN) {
  const total = n * n;
  const clicks = Math.max(3, Math.round(total * 0.45));
  for (let attempt = 0; attempt < 50; attempt++) {
    const cells = new Array(total).fill(0);
    const order = [...Array(total).keys()];
    for (let i = order.length - 1; i > 0; i--) { // mélange (Fisher-Yates)
      const j = Math.floor(rand() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const solution = order.slice(0, clicks);
    for (const k of solution) applyPress(cells, n, k, pattern);
    if (!isSolved(cells)) return { cells, solution };
  }
  // Repli (quasi impossible) : un seul clic suffit à obtenir une grille non résolue.
  const cells = new Array(total).fill(0);
  applyPress(cells, n, 0, pattern);
  return { cells, solution: [0] };
}

export const generate = (n, rand, pattern) => scramble(n, rand, pattern).cells;

// Grille du jour : même graine, donc même grille pour tout le monde ce jour-là.
export const dailyGrid = (day = dayKey(), n = DAILY_SIZE) =>
  generate(n, mulberry32(hashStr("mimiri-" + day)));
