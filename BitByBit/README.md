# Bit by Bit

A relaxing, ad-free puzzle game. Little carriers (ants, crabs, fairies, foxes…) take apart a pixel-art
mural, one pixel at a time. You place their boxes on a line with limited slots: if no one can reach a
pixel of their color anymore, the colony is stuck.

Vanilla JavaScript ES modules, no bundler: the folder runs as-is on GitHub Pages.

## Run locally

ES modules don't load from `file://`, so serve the folder:

- VS Code: **Live Server** extension, right-click `index.html` → *Open with Live Server*;
- or `npm run serve` and open the printed address.

Tests (Node 18+): `npm test`.

## Layout

```
index.html                 the game
editor/index.html          the hidden mural editor (not linked from the game)
locales/                   UI text, one file per language (fr.json, en.json)
styles/
  base.css                 default colors (Night theme), font, buttons
  layout.css               top bar, board, side column
  components.css           end-of-mural window, cards, box queues
  editor.css               the editor
  themes/                  one file per theme family
assets/                    SVG decorations used by the themes
src/
  main.js                  entry point: wiring, resume, animation loop
  config.js                tuning (speeds, delays, storage keys)
  storage.js               localStorage that never throws
  i18n.js                  languages, translator, HTML translation (same module in every game)
  data/
    colors.js              pixel palette (one letter = one color)
    maps.js                official murals
    community.js           murals suggested by players
    levels.js              difficulty per level
    skins.js               themes: group, carrier crew, odds
  core/                    pure rules, no browser (tested with node)
    grid.js                reachable pixels, pickup
    generator.js           builds solvable but tricky levels
    mural-code.js          "BB1-…" share codes, export for maps.js
    image-to-map.js        image → mural conversion
  game/                    state, board geometry, carrier paths, game flow (session.js)
  render/                  canvas drawing; carriers/ has one file per theme
  ui/                      side panel, end window, theme and language switches, music (generated live)
  editor/                  editor code (the page is editor/index.html)
tests/                     node tests
```

## Custom murals (hidden editor)

The editor isn't linked anywhere: add `editor/` to the game URL (`…/games/BitByBit/editor/`). It can:
- paint a 4×4 to 50×50 mural with the game palette (brush, fill, picker, eraser, right-click erases, Ctrl+Z);
- load a background image to trace, or convert it to pixels (saturation, contrast, max colors, cleanup,
  transparent background), with a live preview;
- play the mural (`…/BitByBit/#play=BB1-…`), save it under "My murals", share it as a `BB1-…` code;
- give the entry to paste into `src/data/maps.js` to make it an official mural.

The draft is saved on every stroke. Above 24×24, boxes hold more pixels so a big mural doesn't
need hundreds of clicks (see `packetFor` in `src/data/levels.js`).

## Community murals

"Suggest this mural" in the editor opens a prefilled GitHub issue (`.github/ISSUE_TEMPLATE/fresque.yml`,
label `mural`). A workflow (`.github/workflows/fresque.yml`, `.github/scripts/fresque.mjs`) then:
1. checks the code when the issue is opened or edited, and replies with a link to play it;
2. when a maintainer adds the `accepted` label: adds it to `src/data/community.js`, runs the tests and
   opens a pull request that closes the issue;
3. merging the pull request publishes it.

By hand, it's one line at the top of `COMMUNITY` in `src/data/community.js`:
`{ author: 'Name', code: 'BB1-…' },`

The "Community murals" button shows up in the game as soon as there is one. These murals don't affect
adventure progress and have no "Edit" button (it would reveal the editor).

## Recipes

**Add a mural**: an entry in `src/data/maps.js` (an `id` and the grid), then its name under `map.<id>`
in every `locales/` file. Square grid, one letter per color from `src/data/colors.js`, `.` for empty.
`npm test` checks shape, colors and translations.

**Add a theme**:
1. its colors and decoration in a `styles/themes/` file
   (`:root[data-skin="mytheme"] { --bg: …; --card: …; --accent: …; --line: …; --txt: …; --mut: … }`);
2. one line in `src/data/skins.js` (group, crew, carriers); the dropdown updates itself;
3. its name under `skin.<key>` in every `locales/` file (and `rules.<crew>` for a new crew).

**Add a carrier species**: a draw function in `src/render/carriers/` (standing, centered on 0,0,
30 units = 1 cell), register it in `src/render/carriers/index.js`, then add it to a theme's `carriers`.

**Add a language**: copy `locales/en.json` (the reference) to `locales/xx.json`, translate the values
(not the keys), then add `xx: "Language name"` to `LANGS` in `src/i18n.js` (the same module in every game
of this repo). Full guide: [TRANSLATING.md](../TRANSLATING.md). `npm test` flags missing keys.

**Tune difficulty**: `src/data/levels.js` (line slots, queue shuffling); speeds and delays in `src/config.js`.
