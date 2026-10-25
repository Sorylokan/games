// Mimiri engine tests (pure rules, no browser).
import test from "node:test";
import assert from "node:assert/strict";
import {
  PATTERN, SIZES, applyPress, touchedBy, isSolved, countOn,
  scramble, generate, dailyGrid, dayKey, mulberry32, hashStr
} from "../src/game/engine.js";

test("un clic au centre touche la case et ses 4 voisines", () => {
  assert.deepEqual(touchedBy(3, 4).sort(), [1, 3, 4, 5, 7]);
});

test("un clic dans un coin ne sort pas de la grille", () => {
  assert.deepEqual(touchedBy(3, 0).sort(), [0, 1, 3]);
  assert.deepEqual(touchedBy(4, 15).sort((a, b) => a - b), [11, 14, 15]);
});

test("cliquer deux fois au même endroit annule l'effet", () => {
  const cells = new Array(25).fill(0);
  applyPress(cells, 5, 7);
  assert.equal(countOn(cells), 5);
  applyPress(cells, 5, 7);
  assert.ok(isSolved(cells));
});

test("un motif personnalisé est respecté (diagonales)", () => {
  const diag = [[0, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]];
  assert.deepEqual(touchedBy(3, 4, diag).sort(), [0, 2, 4, 6, 8]);
});

test("toutes les grilles générées sont résolubles et non résolues", () => {
  for (const n of SIZES) {
    for (let seed = 1; seed <= 40; seed++) {
      const { cells, solution } = scramble(n, mulberry32(seed));
      assert.equal(cells.length, n * n);
      assert.ok(!isSolved(cells), `grille ${n}x${n} (graine ${seed}) déjà résolue`);
      for (const i of solution) applyPress(cells, n, i); // replay the solution
      assert.ok(isSolved(cells), `grille ${n}x${n} (graine ${seed}) non résoluble`);
    }
  }
});

test("la même graine donne toujours la même grille", () => {
  assert.deepEqual(generate(5, mulberry32(42)), generate(5, mulberry32(42)));
});

test("le défi du jour est identique pour tout le monde un jour donné", () => {
  assert.deepEqual(dailyGrid("2026-10-09"), dailyGrid("2026-10-09"));
  assert.notDeepEqual(dailyGrid("2026-10-09"), dailyGrid("2026-10-10"));
  assert.equal(dailyGrid("2026-10-09").length, 25);
});

test("dayKey formate la date en AAAA-MM-JJ", () => {
  assert.equal(dayKey(new Date(2026, 9, 9)), "2026-10-09");
  assert.equal(dayKey(new Date(2027, 0, 5)), "2027-01-05");
});

test("hashStr est stable", () => {
  assert.equal(hashStr("mimiri"), hashStr("mimiri"));
  assert.notEqual(hashStr("a"), hashStr("b"));
});

test("PATTERN par défaut = la croix (5 cases)", () => {
  assert.equal(PATTERN.length, 5);
});
