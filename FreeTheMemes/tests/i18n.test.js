import test from "node:test";
import assert from "node:assert/strict";
import englishMessages from "../locales/en.json" with { type: "json" };
import { CHARACTERS } from "../src/data/characters.js";
import { AREAS } from "../src/data/areas.js";
import { createTranslator } from "../src/i18n.js";

const messages = {
  en: {
    greeting: "Hello, {name}!",
    fallbackOnly: "English text",
    "errors.missingTranslation": "Missing translation: {key}"
  },
  fr: {
    greeting: "Bonjour, {name}!"
  }
};

test("translator uses the selected locale and interpolates variables", () => {
  const translate = createTranslator({ locale: "fr", messages });

  assert.equal(translate("greeting", { name: "Ada" }), "Bonjour, Ada!");
});

test("translator falls back to English for missing keys", () => {
  const translate = createTranslator({ locale: "fr", messages });

  assert.equal(translate("fallbackOnly"), "English text");
});

test("translator reports missing keys without throwing", () => {
  const translate = createTranslator({ locale: "fr", messages });

  assert.equal(translate("unknown.key"), "Missing translation: unknown.key");
});

test("unknown locales fall back entirely to English", () => {
  const translate = createTranslator({ locale: "de", messages });

  assert.equal(translate("greeting", { name: "Ada" }), "Hello, Ada!");
});

test("secondary locales may omit keys and fall back to English", () => {
  const translate = createTranslator({
    locale: "fr",
    messages: {
      en: englishMessages,
      fr: { greeting: "Bonjour !" }
    }
  });

  assert.equal(translate("characters.doge.ability"), englishMessages["characters.doge.ability"]);
});

test("characters and areas expose translation keys instead of display text", () => {
  for (const character of Object.values(CHARACTERS)) {
    assert.equal(typeof character.nameKey, "string");
    assert.equal(typeof character.abilityKey, "string");
    assert.equal(typeof character.winConditionKey, "string");
    assert.equal(typeof englishMessages[character.nameKey], "string");
    assert.equal(typeof englishMessages[character.abilityKey], "string");
    assert.equal(typeof englishMessages[character.winConditionKey], "string");
  }

  for (const area of Object.values(AREAS)) {
    assert.equal(typeof area.nameKey, "string");
    assert.equal(typeof area.effectKey, "string");
    assert.equal(typeof englishMessages[area.nameKey], "string");
    assert.equal(typeof englishMessages[area.effectKey], "string");
  }
});