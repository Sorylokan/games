// Palette des pixels : une lettre majuscule par couleur, utilisée dans les fresques (data/maps.js)
// et dans les codes de partage BB1-… (core/mural-code.js n'accepte que A-Z : 26 couleurs au plus).
// Rangée par familles : c'est l'ordre de la palette de l'atelier. Les lettres, elles, ne doivent
// jamais changer (les fresques et les codes déjà partagés en dépendent) ; la teinte peut être ajustée.
// Lettres encore libres : E, U.

export const COLORS = {
  // neutres
  H: '#2b2a33', // noir charbon
  X: '#5c6170', // gris foncé
  A: '#a3a8b4', // gris
  W: '#ebe4d6', // blanc cassé
  M: '#efe3c2', // crème
  // bruns
  D: '#7a5440', // brun
  S: '#d6bd96', // sable
  // rouges, oranges
  Q: '#8c3a44', // bordeaux
  R: '#c8574a', // rouge brique
  O: '#da823f', // orange
  // jaunes
  Y: '#e0b65a', // jaune doré
  J: '#e8dc6a', // jaune citron
  // verts
  L: '#4d7a52', // vert feuille
  G: '#6f9a63', // vert herbe
  V: '#9cc25a', // vert pomme
  // bleus
  T: '#2f7f86', // sarcelle
  C: '#8fd3cf', // cyan clair
  B: '#7fa6c9', // bleu ciel
  N: '#34477a', // bleu nuit
  // violets
  K: '#665e90', // contour (violet sombre)
  I: '#9b6bc6', // violet
  Z: '#b9a6d9', // lavande
  // roses
  F: '#b0487f', // fuchsia
  P: '#d98fa8', // rose
};

// Couleur de texte lisible sur un fond donné (sombre sur clair, clair sur sombre).
export function inkFor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#1a1d26' : '#f4efe6';
}
