# Mimiri

A small *Lights Out*-style puzzle. Each click flips a tile and its four neighbors; clear the whole grid.
Grids go from 3×3 to 6×6, and the daily challenge gives everyone the same 5×5 grid each day. Your best
move count is kept per grid size and per day, and an unfinished game is resumed when you come back.

**Play:** https://sorylokan.github.io/games/Mimiri/

## Run locally

ES modules don't load from `file://`. Serve the **repository root** (so the back-to-catalog link works)
and open `/Mimiri/`:

```bash
npx serve .
```

Tests (Node 18+), from this folder: `npm test`, or a single file with `node --test tests/engine.test.js`.

## Layout

```
index.html            page: settings, grid, score
locales/              UI text, one file per language (fr.json, en.json)
src/
  game/engine.js      rules: pure, no DOM (clicks, solvable grid generation, seeded daily grid)
  themes/             one module per theme: SVG drawing of a cell; index.js is the registry
  ui/                 page wiring, preferences, base styles and one stylesheet per theme
  i18n.js             languages, translator, HTML translation (same module in every game)
tests/                node tests (engine, theme registry)
```

Grids are always solvable: they are made by starting from a solved grid and simulating clicks.
The daily grid uses a seeded random generator keyed on the local date.

## Themes

Kittens, Puppies, Grumpy cats, Garden and Nightfall, plus a "chaos" mode that switches theme on every
move. Themes only change how a cell looks, never the rules. To add one:
1. `src/themes/<id>.js`: `render(on, idx)`, which returns the SVG of a cell (`on` = still to fix);
2. `src/ui/theme-<id>.css`: colors, fonts, background (the variables are listed at the top of `src/ui/styles.css`);
3. a line in `src/themes/index.js`;
4. in each `locales/` file: its name under `theme.<id>`, and its texts under `theme.<id>.goal`, `.hint`,
   `.leftLabel`, `.win`, `.ariaOn`, `.ariaOff`.

`npm test` checks that every theme is complete and draws both states.

## Languages

English and French, through `src/i18n.js` (the same module in every game of this repo). All texts,
theme texts included, are in `locales/`; `en.json` is the reference and missing keys fall back to it.
To add a language, see [TRANSLATING.md](../TRANSLATING.md). `npm test` flags missing keys.
