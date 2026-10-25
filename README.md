# games

Small browser games written in vanilla JavaScript, served as static pages on GitHub Pages.

**Live:** https://sorylokan.github.io/games/

## Games

| Game | What it is | Players | Status |
|------|------------|---------|--------|
| [Free the Memes](https://sorylokan.github.io/games/FreeTheMemes/) | Hidden-role game inspired by Shadow Hunters: roll, move, bluff, and figure out who's on your side. | 4–8, online | Playable |
| [Grid of Greed](https://sorylokan.github.io/games/GridOfGreed/) | Card game: flip and swap your tiles, clear columns of matching cards. Lowest score wins. | 2–8, online | Playable |
| [Mimiri](https://sorylokan.github.io/games/Mimiri/) | Lights Out–style puzzle: each click flips a tile and its four neighbours. New grid every day. | 1 | Beta |
| [Bit by Bit](https://sorylokan.github.io/games/BitByBit/) | Puzzle: little carriers take apart a pixel-art mural. Place their boxes in the right order before the line fills up. | 1 | Beta |

All games are available in English and French, and most come with several visual themes.

## Translations welcome 🌍

Want to play with friends in another language? Each game keeps its texts in one JSON file per
language: copy the English one, translate it, open a pull request. No coding needed, and a check
tells you if anything is missing. See **[TRANSLATING.md](TRANSLATING.md)**.

## Multiplayer

Online games are peer-to-peer (WebRTC through [Trystero](https://github.com/dmotz/trystero)): there is no game server. The host's browser runs the rules and sends each player only what they're allowed to see. Friends join with a room code or an invite link, no account needed.

## Layout

```text
games/
├── index.html, scripts.js, styles.css   catalog page
├── cards.json                           which cards to show, and the featured game
├── card_*.json                          one card per game (text, style, preview)
├── locales/                             catalog texts, one file per language (en.json is the reference)
├── TRANSLATING.md                       how to add a language
├── FreeTheMemes/
├── GridOfGreed/
├── BitByBit/
└── Mimiri/
```

The catalog page is built from the `card_*.json` files. Adding a game means adding its folder, a card file, and one line in `cards.json`. The `featured` field of `cards.json` picks the game shown large at the top of the page; every card works both as a featured game and in the regular grid.

## Conventions

- **Self-contained games.** Each folder holds its own HTML, scripts, styles and translations, so a game can be moved or removed without touching the others.
- **Rules apart from the interface.** Each game keeps its rules in `src/game/` (or `src/core/`), with no access to the page, so they can be tested with Node.
- **Relative paths only.** The site is served under `/games/`, so an absolute path like `/assets/...` would resolve to the wrong place.
- **No bundler, no framework.** Plain HTML, CSS and JS that runs as-is.

## Deployment

Every push to `main` is published by GitHub Pages (Settings → Pages → branch `main`, folder `/`).

## About

This is a hobby project. I'm not a developer by trade: I learned HTML and CSS
on my own back in the XHTML days, and these days I build things with the help
of AI tools like GitHub Copilot.
