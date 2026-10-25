// Theme registry: every theme must be complete and have its CSS.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { THEMES, THEME_FIELDS } from "../src/themes/index.js";
import { DEFAULT_LOCALE } from "../src/i18n.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const ref = JSON.parse(readFileSync(new URL(`../locales/${DEFAULT_LOCALE}.json`, import.meta.url), "utf8"));

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

  test(`thème ${def.id} : textes complets dans la langue de référence`, async () => {
    for (const key of [`theme.${def.id}`, ...THEME_FIELDS.map((f) => `theme.${def.id}.${f}`)]) {
      assert.ok(ref[key], `${DEFAULT_LOCALE}.json : « ${key} » manquant ou vide`);
    }
    assert.equal(typeof (await def.load()).default.render, "function");
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
