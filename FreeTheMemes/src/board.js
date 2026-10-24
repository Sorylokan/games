import { AREAS } from "./data/areas.js";

export const BOARD_POSITIONS = Object.freeze([1, 2, 3, 4, 5, 6]);

export const ATTACK_RANGE_PAIRS = Object.freeze([
  Object.freeze([1, 2]),
  Object.freeze([3, 4]),
  Object.freeze([5, 6])
]);

export const ADJACENT_POSITIONS = Object.freeze({
  1: Object.freeze([2, 6]),
  2: Object.freeze([1, 3]),
  3: Object.freeze([4, 2]),
  4: Object.freeze([3, 5]),
  5: Object.freeze([6, 4]),
  6: Object.freeze([5, 1])
});

const shuffle = (items, random) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

export const createBoard = (random = Math.random) => {
  const areaIds = shuffle(Object.values(AREAS).map((area) => area.id), random);

  return {
    areaAtPosition: Object.fromEntries(
      BOARD_POSITIONS.map((position, index) => [position, areaIds[index]])
    ),
    attackRangePairs: ATTACK_RANGE_PAIRS,
    adjacentPositions: ADJACENT_POSITIONS
  };
};

export const getAreaPosition = (board, areaId) => (
  BOARD_POSITIONS.find((position) => board.areaAtPosition[position] === areaId) ?? null
);

export const canAttackFromPosition = (board, attackerPosition, targetPosition) => (
  attackerPosition === targetPosition || ATTACK_RANGE_PAIRS.some(([first, second]) => (
    (first === attackerPosition && second === targetPosition) ||
    (second === attackerPosition && first === targetPosition)
  ))
);