// Hints guide without solving: they cross out cells where no solution can have a lantern. They read the grid only, never the player's lanterns, so a cross is always right.
import { CROSS, LANTERN, eachSolution } from "./rules.js";

export const HINTS_PER_GRID = 3;
export const HINT_COOLDOWN_MS = 2 * 60 * 1000;

// Cells holding a lantern in at least one solution. A grid may have several solutions, so all of them are explored.
export function possibleCells(n, regions) {
  const possible = new Set();
  eachSolution(n, regions, (cols) => { cols.forEach((c, row) => possible.add(row * n + c)); });
  return possible;
}

// Sure crosses of one row or one column the player hasn't fully crossed yet. `wrong` = player lanterns sitting on those crosses, shown in red ("this is false").
// Returns null when every sure cross is already there.
export function hint(n, regions, marks, rand = Math.random, possible = possibleCells(n, regions)) {
  const lines = [];
  for (let k = 0; k < n; k++) {
    for (const kind of ["row", "col"]) {
      const cells = [...Array(n).keys()].map((x) => (kind === "row" ? k * n + x : x * n + k));
      const crosses = cells.filter((i) => !possible.has(i));
      if (crosses.some((i) => marks[i] !== CROSS)) lines.push({ kind, index: k, crosses });
    }
  }
  if (!lines.length) return null;
  const line = lines[Math.floor(rand() * lines.length)];
  return { ...line, wrong: line.crosses.filter((i) => marks[i] === LANTERN) };
}

// The hint applied to the player's marks: sure crosses go on empty cells; a wrong lantern stays, so the player sees it turn red and removes it.
export function applyHint(marks, h) {
  const next = marks.slice();
  for (const i of h.crosses) if (next[i] !== LANTERN) next[i] = CROSS;
  return next;
}
