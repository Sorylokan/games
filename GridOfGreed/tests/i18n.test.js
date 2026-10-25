// Translator tests (mirrors Free the Memes).
import test from "node:test";
import assert from "node:assert/strict";
import { createTranslator, DEFAULT_LOCALE } from "../src/i18n.js";

const messages = {
  en: { greet: "Hi {name}!", only: "English only", "errors.missingTranslation": "[{key}]" },
  fr: { greet: "Salut {name} !" },
};

test("traduit dans la langue active avec variables", () => {
  const t = createTranslator({ locale: "fr", messages });
  assert.equal(t("greet", { name: "Zoé" }), "Salut Zoé !");
});

test("retombe sur la langue de référence quand la clé manque", () => {
  const t = createTranslator({ locale: "fr", messages });
  assert.equal(t("only"), "English only");
});

test("clé inconnue : message de repli avec le nom de la clé", () => {
  const t = createTranslator({ locale: "fr", messages });
  assert.equal(t("nope"), "[nope]");
});

test("variables absentes conservées telles quelles", () => {
  const t = createTranslator({ locale: "fr", messages });
  assert.equal(t("greet"), "Salut {name} !");
});

test("langue de référence : l'anglais", () => {
  assert.equal(DEFAULT_LOCALE, "en");
});
