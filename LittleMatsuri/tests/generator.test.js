// Generator and hints, on every size.
import test from "node:test";
import assert from "node:assert/strict";
import { SIZES, EMPTY, LANTERN, CROSS, isSolved } from "../src/game/rules.js";
import { generate, dailyGrid, DAILY_SIZE, countSolutions } from "../src/game/generator.js";
import { possibleCells, hint, applyHint } from "../src/game/hints.js";
import { mulberry32 } from "../src/game/random.js";

const connected = (n, regions, k) => {
  const cells = regions.flatMap((r, i) => (r === k ? [i] : []));
  const seen = new Set([cells[0]]), todo = [cells[0]];
  while (todo.length) {
    const i = todo.pop();
    for (const j of [i - n, i + n, i % n ? i - 1 : -1, (i + 1) % n ? i + 1 : -1]) {
      if (j >= 0 && j < n * n && regions[j] === k && !seen.has(j)) { seen.add(j); todo.push(j); }
    }
  }
  return seen.size === cells.length;
};

for (const n of SIZES) {
  test(`${n}×${n}: n districts in one piece, and the starting layout solves the grid`, () => {
    const rand = mulberry32(n);
    for (let k = 0; k < 5; k++) {
      const { regions, solution } = generate(n, rand);
      assert.equal(new Set(regions).size, n);
      assert.ok(regions.every((r) => r >= 0 && r < n));
      for (let d = 0; d < n; d++) assert.ok(connected(n, regions, d), `district ${d} split`);
      const marks = new Array(n * n).fill(EMPTY);
      for (const i of solution) marks[i] = LANTERN;
      assert.ok(isSolved(n, regions, marks));
    }
  });
}

test("the kept grid reports its true solution count, and small grids are mostly unique", () => {
  const rand = mulberry32(11);
  let unique = 0;
  for (let k = 0; k < 20; k++) {
    const g = generate(6, rand);
    assert.equal(g.solutions, countSolutions(g.n, g.regions));
    if (g.solutions === 1) unique++;
  }
  assert.ok(unique >= 15, `${unique}/20 unique`);
});

test("more candidates never give more solutions", () => {
  const few = generate(8, mulberry32(4), 1), many = generate(8, mulberry32(4), 300);
  assert.ok(many.solutions <= few.solutions);
});

test("the daily grid is the same all day, and changes the next day", () => {
  assert.deepEqual(dailyGrid("2026-11-09"), dailyGrid("2026-11-09"));
  assert.notDeepEqual(dailyGrid("2026-11-09").regions, dailyGrid("2026-11-10").regions);
  assert.equal(dailyGrid("2026-11-09").n, DAILY_SIZE);
});

test("a sure cross is never on a solution lantern", () => {
  const rand = mulberry32(7);
  for (let k = 0; k < 30; k++) {
    const { n, regions, solution } = generate(7, rand);
    const possible = possibleCells(n, regions);
    for (const i of solution) assert.ok(possible.has(i));
  }
});

test("a hint crosses one line, keeps a wrong lantern and reports it", () => {
  const { n, regions } = generate(7, mulberry32(3));
  const possible = possibleCells(n, regions);
  const wrongCell = [...Array(n * n).keys()].find((i) => !possible.has(i));
  const marks = new Array(n * n).fill(EMPTY);
  marks[wrongCell] = LANTERN;
  // Keep asking until the hint lands on the wrong lantern's line.
  let h, rand = mulberry32(1);
  do h = hint(n, regions, marks, rand, possible); while (!h.crosses.includes(wrongCell));
  assert.deepEqual(h.wrong, [wrongCell]);
  const after = applyHint(marks, h);
  assert.equal(after[wrongCell], LANTERN);
  for (const i of h.crosses) if (i !== wrongCell) assert.equal(after[i], CROSS);
});

test("no hint left once every sure cross is placed", () => {
  const { n, regions } = generate(6, mulberry32(5));
  const possible = possibleCells(n, regions);
  const marks = [...Array(n * n).keys()].map((i) => (possible.has(i) ? EMPTY : CROSS));
  assert.equal(hint(n, regions, marks), null);
});
