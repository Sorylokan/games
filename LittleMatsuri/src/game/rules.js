// Little Matsuri rules: one lantern per row, per column and per district (region); two lanterns never touch, diagonals included.
// A grid is n×n, cell i = row * n + col. `regions[i]` is the district of cell i (0…n-1). `marks[i]` is what the player put there.

export const EMPTY = 0, LANTERN = 1, CROSS = 2;

export const SIZES = [6, 7, 8, 9, 10];

export const rowOf = (n, i) => Math.floor(i / n);
export const colOf = (n, i) => i % n;

export const touching = (n, a, b) =>
  a !== b && Math.abs(rowOf(n, a) - rowOf(n, b)) <= 1 && Math.abs(colOf(n, a) - colOf(n, b)) <= 1;

// Left click / tap: lantern, then cross, then empty.
export const tap = (mark) => (mark === EMPTY ? LANTERN : mark === LANTERN ? CROSS : EMPTY);

// Right click (computer only): cross, then empty. On a lantern it gives a cross, the same step as a tap.
export const rightClick = (mark) => (mark === CROSS ? EMPTY : CROSS);

// Lanterns breaking a rule with another one (same row, column or district, or touching): they get highlighted.
export function conflicts(n, regions, marks) {
  const lanterns = [];
  marks.forEach((m, i) => { if (m === LANTERN) lanterns.push(i); });
  const bad = new Set();
  for (let x = 0; x < lanterns.length; x++) {
    for (let y = x + 1; y < lanterns.length; y++) {
      const a = lanterns[x], b = lanterns[y];
      if (rowOf(n, a) === rowOf(n, b) || colOf(n, a) === colOf(n, b) || regions[a] === regions[b] || touching(n, a, b)) {
        bad.add(a);
        bad.add(b);
      }
    }
  }
  return bad;
}

// Empty cells a lantern rules out (its row, column, district and the 8 cells around it). They are shown as crosses but not stored, so they go away with the lantern.
export function autoCrosses(n, regions, marks) {
  const out = new Set();
  marks.forEach((m, a) => {
    if (m !== LANTERN) return;
    for (let b = 0; b < n * n; b++) {
      if (marks[b] === EMPTY && (rowOf(n, a) === rowOf(n, b) || colOf(n, a) === colOf(n, b) || regions[a] === regions[b] || touching(n, a, b))) out.add(b);
    }
  });
  return out;
}

// Calls visit(cols) for every solution (lantern of row r in column cols[r]); visit returns true to stop the search.
export function eachSolution(n, regions, visit) {
  const cols = [], usedCol = new Set(), usedRegion = new Set();
  let stop = false;
  const search = (r) => {
    if (r === n) { stop = visit(cols) === true; return; }
    for (let c = 0; c < n && !stop; c++) {
      const i = r * n + c;
      if (usedCol.has(c) || usedRegion.has(regions[i]) || (r > 0 && Math.abs(cols[r - 1] - c) < 2)) continue;
      cols[r] = c; usedCol.add(c); usedRegion.add(regions[i]);
      search(r + 1);
      usedCol.delete(c); usedRegion.delete(regions[i]);
    }
  };
  search(0);
}

// Any layout following the rules wins, not only the one the grid was built from.
export function isSolved(n, regions, marks) {
  const count = marks.filter((m) => m === LANTERN).length;
  return count === n && conflicts(n, regions, marks).size === 0;
}
