// Niveau n° i (0, 1, 2…) : quelle fresque, et à quel point c'est serré.
// Après la dernière fresque, la série recommence avec une difficulté plus haute.
import { MAPS } from './maps.js';

export function levelAt(i) {
  const m = MAPS[i % MAPS.length];
  const round = Math.floor(i / MAPS.length);
  return {
    id: m.id,
    map: m.map,
    round,
    cap: i < 3 ? 4 : 3,                          // places sur la ligne
    mix: Math.min(16, 3 + i * 1.5),              // désordre dans les files
    tries: Math.min(24, 4 + i * 3 + round * 4),  // niveaux générés, on garde le plus dur
  };
}

// Niveau pour une fresque perso (atelier) : difficulté moyenne, moins d'essais si la grille est grande.
export function customLevel({ name, map }) {
  const N = map.length;
  return { id: null, name, map, round: 0, custom: true, cap: 4, mix: 8, tries: N > 16 ? 4 : N > 12 ? 6 : 8 };
}

// Vrai quand on vient de finir la dernière fresque de la série.
export const isEndOfSeries = (i) => (i + 1) % MAPS.length === 0;
