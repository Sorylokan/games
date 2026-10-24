// Tests du placement des joueurs (calqué sur la maquette et le tableau du brief).
import test from "node:test";
import assert from "node:assert/strict";
import { layoutFor, myCell, centerCell } from "../src/board-layout.js";

// Cases attendues pour chaque nombre de joueurs, vues depuis le siège 0.
const EXPECTED = {
  2: ["TM"],
  3: ["TL", "TR"],
  4: ["ML", "TM", "MR"],
  5: ["ML", "TL", "TR", "MR"],
  6: ["ML", "TL", "TM", "TR", "MR"],
  7: ["BL", "ML", "TL", "TR", "MR", "BR"],
  8: ["BL", "ML", "TL", "TM", "TR", "MR", "BR"],
};
const NAME = {
  "3,2": "BM", "1,2": "TM", "1,1": "TL", "1,3": "TR",
  "2,1": "ML", "2,3": "MR", "3,1": "BL", "3,3": "BR",
};

test("moi : toujours en bas au centre ; le centre est libre", () => {
  assert.deepEqual(myCell(), [3, 2]);
  assert.deepEqual(centerCell(), [2, 2]);
});

test("placements symétriques pour 2 à 8 joueurs (brief, section 5)", () => {
  for (let n = 2; n <= 8; n++) {
    const cells = layoutFor(n, 0).map((x) => NAME[x.cell.join(",")]);
    assert.deepEqual(cells, ["BM", ...EXPECTED[n]], `${n} joueurs`);
  }
});

test("nombre de joueurs invalide : liste vide", () => {
  assert.deepEqual(layoutFor(1), []);
  assert.deepEqual(layoutFor(9), []);
});

test("chaque joueur voit le plateau depuis sa propre place", () => {
  // 4 joueurs : depuis le siège 2, lui-même est en bas, et les autres suivent.
  const from2 = layoutFor(4, 2).map((x) => [x.index, NAME[x.cell.join(",")]]);
  assert.deepEqual(from2, [[2, "BM"], [3, "ML"], [0, "TM"], [1, "MR"]]);
  // Aucune case en double, personne au centre.
  const cells = from2.map(([, c]) => c);
  assert.equal(new Set(cells).size, cells.length);
});
