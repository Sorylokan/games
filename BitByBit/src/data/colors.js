// Palette des pixels : une lettre par couleur, utilisée dans les fresques (data/maps.js).

export const COLORS = {
  R: '#c8574a', // rouge brique
  W: '#ece4d6', // blanc cassé
  S: '#d6bd96', // sable
  G: '#6f9a63', // vert herbe
  L: '#4d7a52', // vert feuille
  Y: '#e0b65a', // jaune
  N: '#34477a', // bleu nuit
  M: '#efe3c2', // crème
  D: '#7a5440', // brun
  O: '#d98a4e', // orange
  P: '#d98fa8', // rose
  B: '#7fa6c9', // bleu ciel
  K: '#665e90', // contour (violet sombre)
  A: '#a3a8b4', // gris
};

// Couleur de texte lisible sur un fond donné (sombre sur clair, clair sur sombre).
export function inkFor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#1a1d26' : '#f4efe6';
}
