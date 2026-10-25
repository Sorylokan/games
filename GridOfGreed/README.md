# Grid of Greed

An online card game for 2 to 8 players, in the browser, with no server. Flip and swap the cards of your
4×3 grid, clear columns of three matching cards, and keep your score as low as possible. Whoever reveals
their whole grid ends the round, but gets their score doubled if anyone matched or beat it. *Play safe. Or don't.*

**Play:** https://sorylokan.github.io/games/GridOfGreed/

## How online play works

Games are peer-to-peer (WebRTC through [Trystero](https://github.com/dmotz/trystero), loaded from a CDN).
One player creates a table and shares the room code or the invite link (`#salle=ABCD-1234`); the others
join in two clicks, no account needed. The host's browser runs the rules and sends each player a view
where face-down cards and the draw pile are hidden. A player who drops out can reload and take their
seat back. The host picks the number of seats and the end score (50 to 200), and can start a rematch
at the same table once the game is over.

## Run locally

ES modules don't load from `file://`. Serve the **repository root** (so the back-to-catalog link works)
and open `/GridOfGreed/`:

```bash
npx serve .
```

Open two tabs to play against yourself.

Tests (Node 18+), from this folder: `npm test`, or a single file with `node --test tests/scoring.test.js`.

## Layout

```
index.html            page: home, lobby, table
locales/              UI text, one file per language (fr.json, en.json)
src/
  data/deck.js        the 150-card deck
  game/               rules engine: pure, no DOM, no network (dispatch, scoring, rounds, views)
  networking/         Trystero transport, rooms, host authority, sessions
  ui/                 table rendering, side panel, sounds, preferences, styles
  board-layout.js     where each player sits around the table
tests/                node tests (engine, host authority, layout)
```

The engine never mutates its input: `dispatch(state, playerId, action, rng)` returns
`{ ok: true, state, events }` or `{ ok: false, error }`. Randomness is always passed in, so tests are
deterministic. Only the host calls `dispatch`; everyone else sends actions and receives a masked view
(`game/view.js`).

## Languages

English and French, through `src/i18n.js` (the same module in every game of this repo). To add one:
copy `locales/en.json` to `locales/xx.json`, translate the values (not the keys), and add
`xx: "Language name"` to `LANGS` in `src/i18n.js`. The language menu updates itself; missing keys fall
back to English, and `npm test` flags any key or `{variable}` that differs between files.
Full guide: [TRANSLATING.md](../TRANSLATING.md).

## Themes

Six color themes (Night, Palace, Ruby, Poker, Jackpot, Wizard). A theme is a block of CSS variables
in `src/ui/styles.css` (`:root[data-theme="…"]`), a card back, an entry in `THEMES` (`src/ui/prefs.js`)
and its name in each `locales/` file.
