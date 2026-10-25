// Seats around the table (pure logic, no DOM). 3×3 CSS grid; edge cells named by initials
// (TL top-left, TM top-middle, ML middle-left, BR bottom-right…).
// You are always bottom-center [3,2]; the center [2,2] holds the draw and discard piles.

export const CELL_POSITIONS = Object.freeze({
  BL: [3, 1], ML: [2, 1], TL: [1, 1],
  TM: [1, 2], TR: [1, 3],
  MR: [2, 3], BR: [3, 3],
});

// Opponent seats per player count, in (clockwise) turn order.
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

// [{ index, cell: [row, col] }] for every player: this client (myIndex) bottom-center,
// the others clockwise from there.
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
