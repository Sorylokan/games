# Translating the games

Want to play these games with friends who don't read English or French? Add your language! 🌍
No coding needed: each game keeps all its texts in one JSON file per language, and you can do
everything from the GitHub website.

**English is the reference.** Every text exists in `en.json`; if a text is missing in your
language, the game shows the English one instead. Translating a single game is already great.

## What to translate

| Project | Copy this file… | …then add your language here |
|---|---|---|
| Catalog (home page) | `locales/en.json` | `LANGS` in `scripts.js` |
| Free the Memes | `FreeTheMemes/locales/en.json` | `LANGS` in `FreeTheMemes/src/i18n.js` |
| Grid of Greed | `GridOfGreed/locales/en.json` | `LANGS` in `GridOfGreed/src/i18n.js` |
| Mimiri | `Mimiri/locales/en.json` | `LANGS` in `Mimiri/src/i18n.js` |
| Bit by Bit | `BitByBit/locales/en.json` | `LANGS` in `BitByBit/src/i18n.js` |

`LANGS` is the list shown in the language menu. Add one line with your
[language code](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes) (two lowercase letters)
and the language's name written in that language:

```js
export const LANGS = { fr: "Français", en: "English", de: "Deutsch" };
```

The game picks your language automatically when it matches the browser's, and remembers the
player's choice.

## Step by step, on GitHub

1. Open the `en.json` file of a game (table above) and copy its content.
2. In the same `locales/` folder: **Add file → Create new file**, name it after your language code
   (`de.json`), paste, and translate. GitHub makes your own copy of the project (a "fork") for you.
3. Edit the `i18n.js` (or `scripts.js`) file from the table and add your line to `LANGS`.
4. **Propose changes**, then **Create pull request**.

A check runs on your pull request within a minute. ✅ means everything is there; ❌ lists exactly
what to fix (a missing text, a `{variable}` that changed…). Push a fix and it runs again.

Not comfortable with pull requests? [Open a translation issue](https://github.com/Sorylokan/games/issues/new?template=translation.yml)
and attach your files instead.

## Rules

```json
"log.moved": "{name} moved to {area}.",
```

- **Translate the text on the right, never the key on the left** (`log.moved`).
- **Keep `{variables}` exactly as they are**: `{name}` is replaced by a player's name, `{n}` by a
  number. You can move them within the sentence: `"{name} ist nach {area} gegangen."`
- **Keep HTML tags** such as `<i>…</i>` or `<b>…</b>`; translate the text inside them.
- **Keep emojis**, unless they mean nothing in your culture.
- **Don't translate the game names**: Free the Memes, Grid of Greed, Mimiri, Bit by Bit, nor Sorylokan.
- Free the Memes characters are internet memes (Doge…): keep the name the meme has in your language,
  usually the original one. Card and place names are jokes: translate them so they stay funny.
- The tone is casual and friendly: address the player informally.
- Keep the texts short: they sit on buttons and small screens.
- Not sure about a text? Write your best guess and ask in the pull request.

Right-to-left languages (Arabic, Hebrew…) need some layout work: open an issue first and we'll sort it out.

## Where the texts appear

Keys are grouped by their first word.

- **Catalog**: `hero.*` page header, `filter.*` the Solo/Multiplayer filter, `footer.*` page bottom.
  The game cards themselves are in `card_*.json`: each text is `{ "fr": "…", "en": "…" }`, add your
  `"de": "…"` next to them (optional: without it, the card shows English).
- **Free the Memes**: `characters.*`, `areas.*`, `cards.*` (game content: name + effect),
  `factions.*`, `lobby.*` (room screen, styled as an old desktop: `join.exe` windows), `ui.*` (game
  screen), `pending.*` and `reactions.*` (choices offered to a player), `log.*` (game log lines),
  `phase.*` (turn steps), `errors.*` (refused actions), `theme.*` (visual themes).
- **Grid of Greed**: `app.*` home screen, `lobby.*` room, `table.*` game table, `side.*` side panel,
  `end.*` end screen, `bar.*` top bar, `theme.*` / `themecat.*` visual themes.
- **Mimiri**: `ui.*` interface; `theme.<id>` is a theme's name and `theme.<id>.*` its texts
  (`goal`, `hint`, the `win` message, and `ariaOn` / `ariaOff`: what a screen reader says for a tile).
- **Bit by Bit**: `rules.*` how to play, `line.*` / `queue.*` the board, `end.*` end of a mural,
  `map.*` mural names, `skin.*` / `group.*` themes, `community.*` player murals, `ed.*` the mural editor.

`errors.missingTranslation` is shown when a text is missing: translate it too.

## Testing (optional)

With [Node.js](https://nodejs.org) installed, from the repository root:

```bash
node .github/scripts/check-locales.mjs   # the same check as on pull requests
npx serve .                              # then open the address shown and pick your language
```

## Fixing a translation

Same steps: edit the line in the language file and open a pull request, or open a
[translation issue](https://github.com/Sorylokan/games/issues/new?template=translation.yml)
saying which game, which text, and what it should say.

Thank you! 💛
