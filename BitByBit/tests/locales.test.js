// Language files: same keys everywhere, and one file per language listed in src/i18n.js.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { LANGS, DEFAULT_LOCALE, createTranslator } from "../src/i18n.js";

const dir = new URL("../locales/", import.meta.url);
const locales = Object.fromEntries(
  readdirSync(dir).filter((f) => f.endsWith(".json"))
    .map((f) => [f.replace(".json", ""), JSON.parse(readFileSync(new URL(f, dir), "utf8").replace(/^\uFEFF/, ""))])
);

test("every language in LANGS has a file, and every file is listed", () => {
  assert.deepEqual(Object.keys(locales).sort(), Object.keys(LANGS).sort());
});

test("every language file has exactly the keys of the reference language", () => {
  const ref = Object.keys(locales[DEFAULT_LOCALE]).sort();
  for (const [lang, messages] of Object.entries(locales)) {
    assert.deepEqual(Object.keys(messages).sort(), ref, `${lang}.json`);
  }
});

test("every language keeps the same {variables} as the reference", () => {
  const vars = (s) => (String(s).match(/\{[^}]+\}/g) ?? []).sort().join(",");
  for (const [lang, messages] of Object.entries(locales)) {
    for (const [key, text] of Object.entries(locales[DEFAULT_LOCALE])) {
      assert.equal(vars(messages[key]), vars(text), `${lang}.json: ${key}`);
    }
  }
});

test("t.has tells whether a translation exists", () => {
  const t = createTranslator({ locale: DEFAULT_LOCALE, messages: locales });
  const someKey = Object.keys(locales[DEFAULT_LOCALE])[0];
  assert.equal(t.has(someKey), true);
  assert.equal(t.has("no.such.key"), false);
});
