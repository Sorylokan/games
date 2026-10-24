// Placement des joueurs autour de la table (logique pure, sans DOM).
// Grille CSS 3x3. Cases du périmètre repérées par leurs initiales :
// TL haut-gauche, TM haut-milieu, ML milieu-gauche, BR bas-droite...
// Toi (mon siège) : toujours en bas au centre [3,2]. Le centre [2,2] = pioche/défausse.
// Placements calqués sur la maquette Dev_Files/grid-of-greed-table.html (tableau du brief).

export const CELL_POSITIONS = Object.freeze({
  BL: [3, 1], ML: [2, 1], TL: [1, 1],
  TM: [1, 2], TR: [1, 3],
  MR: [2, 3], BR: [3, 3],
});

// Sièges adverses par nombre total de joueurs, dans l'ordre de jeu (horaire).
const SEATS = Object.freeze({
  2: ["TM"],
  3: ["TL", "TR"],
  4: ["ML", "TM", "MR"],
  5: ["ML", "TL", "TR", "MR"],
  6: ["ML", "TL", "TM", "TR", "MR"],
  7: ["BL", "ML", "TL", "TR", "MR", "BR"],
  8: ["BL", "ML", "TL", "TM", "TR", "MR", "BR"],
});

export const centerCell = () => [2, 2];
export const myCell = () => [3, 2];

// myIndex = index de ce client dans l'ordre de jeu (turnOrder).
// Renvoie [{ index, cell:[ligne, colonne] }] pour chaque joueur, dans l'ordre
// de jeu : ce client en bas-centre, les autres décalés horairement.
export function layoutFor(playerCount, myIndex = 0) {
  const seats = SEATS[playerCount];
  if (!seats) return [];
  const out = [{ index: myIndex, cell: myCell() }];
  const n = playerCount;
  for (let offset = 1; offset < n; offset++) {
  out.push({ index: (myIndex + offset) % n, cell: CELL_POSITIONS[seats[offset - 1]] });
  }
  return out;
}
