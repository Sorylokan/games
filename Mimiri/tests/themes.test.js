// Theme registry: every theme must be complete and have its CSS.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { THEMES } from "../src/themes/index.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const TEXT_FIELDS = ["title", "goal", "leftLabel", "win", "hint", "ariaOn", "ariaOff"];

test("les identifiants de thèmes sont uniques", () => {
  const ids = THEMES.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
});

for (const def of THEMES) {
  test(`thème ${def.id} : feuille CSS présente et ciblée sur la bonne classe`, () => {
    const path = root + def.css.replace("./", "");
    assert.ok(existsSync(path), `${def.css} introuvable`);
    assert.match(readFileSync(path, "utf8"), new RegExp(`body\\.theme-${def.id}\\b`));
  });

  test(`thème ${def.id} : textes complets`, async () => {
    const T = (await def.load()).default;
    for (const field of TEXT_FIELDS) {
      assert.equal(typeof T[field], "string", `champ « ${field} » manquant`);
      assert.ok(T[field].length > 0, `champ « ${field} » vide`);
    }
    assert.equal(typeof T.render, "function");
  });

  test(`thème ${def.id} : les deux états se dessinent en SVG, différents l'un de l'autre`, async () => {
    const T = (await def.load()).default;
    for (let idx = 0; idx < 8; idx++) {
      const on = T.render(true, idx);
      const off = T.render(false, idx);
      for (const svg of [on, off]) {
        assert.match(svg, /^<svg[\s\S]*<\/svg>$/);
        assert.ok(!/undefined|NaN/.test(svg), `valeur invalide dans le SVG (case ${idx})`);
      }
      assert.notEqual(on, off);
    }
  });
}
