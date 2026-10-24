// Composition du paquet et plages de couleur (données pures).

export function fullDeck() {
  const d = [];
  const add = (v, n) => { for (let i = 0; i < n; i++) d.push(v); };
  add(-2, 5); add(0, 15); add(-1, 10);
  for (let v = 1; v <= 12; v++) add(v, 10);
  return d; // 150 cartes
}

export function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Plage de couleur d'une valeur (pour l'UI : cadre et chiffre).
export function rangeOf(v) {
  if (v < 0) return 'neg';
  if (v === 0) return 'zero';
  if (v <= 4) return 'low';
  if (v <= 8) return 'mid';
  return 'high';
}
