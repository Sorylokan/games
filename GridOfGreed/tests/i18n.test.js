// Tests du traducteur (miroir de i18n.test.js de FTM).
import test from "node:test";
import assert from "node:assert/strict";
import { createTranslator, getLocale, DEFAULT_LOCALE } from "../src/i18n.js";

const messages = {
  fr: { greet: "Salut {name} !", only: "Seulement en français", "errors.missingTranslation": "[{key}]" },
  en: { greet: "Hi {name}!" },
};

test("traduit dans la langue active avec variables", () => {
  const t = createTranslator({ locale: "fr", messages });
  assert.equal(t("greet", { name: "Zoé" }), "Salut Zoé !");
});

test("retombe sur la langue de repli quand la clé manque", () => {
  const t = createTranslator({ locale: "en", messages });
  assert.equal(t("only"), "Seulement en français");
});

test("clé inconnue : message de repli avec le nom de la clé", () => {
  const t = createTranslator({ locale: "fr", messages });
  assert.equal(t("nope"), "[nope]");
});

test("variables absentes conservées telles quelles", () => {
  const t = createTranslator({ locale: "en", messages });
  assert.equal(t("greet"), "Hi {name}!");
});

test("langue par défaut hors navigateur", () => {
  assert.equal(DEFAULT_LOCALE, "fr");
  assert.equal(getLocale(), "fr");
});
