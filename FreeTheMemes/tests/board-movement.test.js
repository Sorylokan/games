import test from "node:test";
import assert from "node:assert/strict";
import { AREAS, getAreaForDieTotal } from "../src/data/areas.js";
import {
  ADJACENT_POSITIONS,
  ATTACK_RANGE_PAIRS,
  canAttackFromPosition,
  createBoard
} from "../src/board.js";
import {
  getAdjacentAreaIds,
  resolveMovementRoll
} from "../src/movement.js";

test("die totals map to fixed areas independently from board placement", () => {
  assert.equal(getAreaForDieTotal(2), AREAS.OTAKUS_PARADISE.id);
  assert.equal(getAreaForDieTotal(3), AREAS.OTAKUS_PARADISE.id);
  assert.equal(getAreaForDieTotal(7), null);
  assert.equal(getAreaForDieTotal(10), AREAS.PICKPOCKET_BOULEVARD.id);
});

test("board setup shuffles six areas across six positions", () => {
  const board = createBoard(() => 0);
  const assignedAreas = Object.values(board.areaAtPosition);

  assert.equal(assignedAreas.length, 6);
  assert.equal(new Set(assignedAreas).size, 6);
  assert.deepEqual(board.attackRangePairs, ATTACK_RANGE_PAIRS);
  assert.deepEqual(board.adjacentPositions, ADJACENT_POSITIONS);
});

test("attack range includes the current position and its fixed partner", () => {
  assert.equal(canAttackFromPosition(createBoard(), 1, 1), true);
  assert.equal(canAttackFromPosition(createBoard(), 1, 2), true);
  assert.equal(canAttackFromPosition(createBoard(), 1, 3), false);
});

test("a roll of seven requests a destination", () => {
  assert.deepEqual(resolveMovementRoll(7, "any-area"), {
    ok: true,
    requiresDestination: true,
    areaId: null
  });
});

test("rolling the current area's total requests a reroll", () => {
  const currentArea = AREAS.OTAKUS_PARADISE.id;

  assert.deepEqual(resolveMovementRoll(2, currentArea), {
    ok: true,
    reroll: true,
    areaId: null
  });
});

test("adjacent areas follow static board geometry", () => {
  const board = createBoard(() => 0);
  const areaAtPositionOne = board.areaAtPosition[1];
  const expected = [board.areaAtPosition[2], board.areaAtPosition[6]];

  assert.deepEqual(getAdjacentAreaIds(board, areaAtPositionOne), expected);
});