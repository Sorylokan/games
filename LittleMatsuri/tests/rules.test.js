// Rules: marks cycle, conflicts, win.
import test from "node:test";
import assert from "node:assert/strict";
import { EMPTY, LANTERN, CROSS, tap, rightClick, conflicts, isSolved, touching, autoCrosses } from "../src/game/rules.js";

// 4×4 example: each row is a district, solution in columns 1, 3, 0, 2.
const N = 4;
const REGIONS = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3];
const withLanterns = (cells) => {
  const marks = new Array(N * N).fill(EMPTY);
  for (const i of cells) marks[i] = LANTERN;
  return marks;
};

test("tap cycles lantern, cross, empty", () => {
  assert.equal(tap(EMPTY), LANTERN);
  assert.equal(tap(LANTERN), CROSS);
  assert.equal(tap(CROSS), EMPTY);
});

test("right click cycles cross, empty", () => {
  assert.equal(rightClick(EMPTY), CROSS);
  assert.equal(rightClick(CROSS), EMPTY);
  assert.equal(rightClick(LANTERN), CROSS);
});

test("diagonal neighbours touch, two cells apart don't", () => {
  assert.ok(touching(N, 0, 5));
  assert.ok(!touching(N, 0, 2));
  assert.ok(!touching(N, 3, 4)); // end of a row and start of the next
});

test("lanterns on the same row, column, district or touching are flagged", () => {
  assert.deepEqual([...conflicts(N, REGIONS, withLanterns([0, 2]))].sort(), [0, 2]); // same row and district
  assert.deepEqual([...conflicts(N, REGIONS, withLanterns([1, 9]))].sort(), [1, 9]); // same column
  assert.deepEqual([...conflicts(N, REGIONS, withLanterns([1, 4]))].sort(), [1, 4]); // diagonal
  assert.equal(conflicts(N, REGIONS, withLanterns([1, 7])).size, 0);
});

test("a lantern crosses out its row, column, district and neighbours, only on empty cells", () => {
  const marks = withLanterns([5]); // row 1, column 1, district 1
  marks[13] = CROSS;
  const auto = autoCrosses(N, REGIONS, marks);
  assert.deepEqual([...auto].sort((a, b) => a - b), [0, 1, 2, 4, 6, 7, 8, 9, 10]);
  assert.ok(!auto.has(5) && !auto.has(13)); // the lantern itself, and a cross the player placed
});

test("solved only with n lanterns and no conflict, crosses don't matter", () => {
  const marks = withLanterns([1, 7, 8, 14]);
  assert.ok(isSolved(N, REGIONS, marks));
  marks[0] = CROSS;
  assert.ok(isSolved(N, REGIONS, marks));
  assert.ok(!isSolved(N, REGIONS, withLanterns([1, 7, 8])));
});
