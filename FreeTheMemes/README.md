# Free the Memes

Free the Memes is a browser-based hidden-role game inspired by Shadow Hunters.
Roll, move, bluff, and free the memes — 4 to 8 players, locally or online.

## Play online

The game is deployed as a static site on GitHub Pages:

https://sorylokan.github.io/games/FreeTheMemes/

Online rooms are peer-to-peer (WebRTC via Trystero/Nostr): there is no game
server — the host's browser runs the authoritative rules engine. Share the
invite link or room code with friends.

The UI is available in English and French (`locales/en.json` is the reference).

## Development

Requires Node.js 20 or newer.

Start the local browser client with:

```bash
npm run dev
```

Then open `http://localhost:4173`.

### Tests

```bash
node --test tests/<file>.test.js
```

Run only the test files related to your change; do not run the full suite by
default. The `tests/` folder and the design documents are intentionally kept
out of the public repository (local development only).

## Project layout

- `src/data/` — authoritative game data (characters, cards, areas)
- `src/game/` — rules engine (network- and UI-agnostic)
- `src/networking/` — P2P rooms, host authority, serialization
- `src/ui/` — browser client
- `locales/` — UI translations