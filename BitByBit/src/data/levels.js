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

// Pixels par boîte : 4 à 12 jusqu'à 24 de côté. Au-delà, les boîtes grossissent avec la surface,
// pour garder à peu près le même nombre de boîtes à poser qu'une fresque 24×24 (et un calcul rapide).
export function packetFor(N) {
  const k = Math.max(1, (N / 24) ** 2);
  return [Math.round(4 * k), Math.round(12 * k)];
}

// Niveau pour une fresque perso (atelier) : difficulté moyenne. Plus la grille est grande, moins on
// génère d'essais (tries) et moins on simule de parties au hasard pour les comparer (runs) : le calcul
// se fait au lancement, il doit rester court même sur téléphone.
// author : présent pour une fresque de la communauté (data/community.js).
export function customLevel({ name, map, author = null }) {
  const N = map.length;
  return {
    id: null, name, map, author, community: !!author, round: 0, custom: true, cap: 4, mix: 8,
    tries: N > 32 ? 2 : N > 16 ? 4 : N > 12 ? 6 : 8,
    runs: N > 32 ? 6 : 12,
    packet: packetFor(N),
  };
}

// Vrai quand on vient de finir la dernière fresque de la série.
export const isEndOfSeries = (i) => (i + 1) % MAPS.length === 0;
