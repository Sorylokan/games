// Pixel palette: one uppercase letter per color, used in murals (data/maps.js) and share codes
// (core/mural-code.js only accepts A-Z, so 26 colors max). Grouped by family = editor palette order.
// Never change a letter (murals and shared codes depend on it); the hex value can be tweaked.
// Free letters: E, U.

export const COLORS = {
  // neutrals
  H: '#2b2a33', // charcoal
  X: '#5c6170', // dark gray
  A: '#a3a8b4', // gray
  W: '#ebe4d6', // off-white
  M: '#efe3c2', // cream
  // browns
  D: '#7a5440', // brown
  S: '#d6bd96', // sand
  // reds, oranges
  Q: '#8c3a44', // burgundy
  R: '#c8574a', // brick red
  O: '#da823f', // orange
  // yellows
  Y: '#e0b65a', // golden yellow
  J: '#e8dc6a', // lemon
  // greens
  L: '#4d7a52', // leaf green
  G: '#6f9a63', // grass green
  V: '#9cc25a', // apple green
  // blues
  T: '#2f7f86', // teal
  C: '#8fd3cf', // light cyan
  B: '#7fa6c9', // sky blue
  N: '#34477a', // night blue
  // purples
  K: '#665e90', // outline (dark purple)
  I: '#9b6bc6', // purple
  Z: '#b9a6d9', // lavender
  // pinks
  F: '#b0487f', // fuchsia
  P: '#d98fa8', // pink
};

// Readable text color on a given background (dark on light, light on dark).
export function inkFor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#1a1d26' : '#f4efe6';
}
