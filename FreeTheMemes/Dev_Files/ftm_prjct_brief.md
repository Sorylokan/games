# Free the Memes

**Free the Memes** is a browser-based multiplayer game inspired by
the board game **Shadow Hunters**.

For this project:

- **Free the Memes** = the remake / this project.
- **Shadow Hunters** = the original board game.
- **Shadow Hunter Remake** = old project name. Do not use it as the
  game's name in new code or user-facing text.

## 1. Project Overview

**Free the Memes** is a browser-based multiplayer game inspired by the board game *Shadow Hunters*.

The goal is to recreate the core gameplay experience as an online game that can be played privately with friends, directly from a web browser.

The project is intended to be:

- Browser-based
- Multiplayer Peer-to-peer
- Using **WebRTC**
- Using **Trystero** for peer-to-peer connection and signaling
- Hostable on **GitHub Pages**
- Free to use
- Designed primarily for private games with friends
- Lightweight and easy to deploy

Free The Memes deliberately uses a different presentation, terminology, names, artwork, UI and several adapted mechanics.

The project should **not depend on the original game's assets**.

(See `/ftm_prjct_cards.md`)

---

# 2. Thematic Direction

The original game's fantasy/horror terminology is replaced by an absurd internet-culture theme.

The three factions are:

| Original | Free The Memes |
|---|---|
| Neutral | **User** |
| Hunter | **Memer** |
| Shadow | **Troller** |

The terminology should consistently use Free The Memes names.

For example:

- Neutral → User
- Hunter → Memer
- Shadow → Troller
- Hermit Card → Notifications
- Area → Locations
- Character Card → Character
- Equipment Card → Equipment
- White Card → White Card
- Black Card → Black Card

The humor is based primarily on internet culture, memes, web terminology and deliberately stupid descriptions.

Examples of the intended tone:

- `Ctrl+Z this Enchantment`
- `Luck.exe`
- `Forbidden Google Search`
- `Christmas DLC`
- `Google Maps: Medieval Edition`
- `Jesus' Last Pajamas`
- `Emotional ALT+F4`
- `Rest in Piss`
- `PFRFRFRFRFRFRFRFRRT -tube`
- `The Cursed Japanese Chopsticks`

The game should feel deliberately ridiculous without requiring every single element to follow one rigid theme.

---

# 3. Technical Direction

The application is a web application intended to run entirely in the browser.

### Hosting

The project must be compatible with **GitHub Pages**.

Do not require a traditional application server for normal gameplay.

The GitHub Pages deployment should serve only the static web application.

### Multiplayer

The intended multiplayer architecture is **peer-to-peer using WebRTC**.

The project uses **Trystero** to simplify peer discovery, signaling and WebRTC connection management.

Trystero is responsible for establishing peer connections. It is **not** the game server and should not contain game rules.

Once peers are connected, game state should preferably be synchronized directly between peers.

The architecture should be designed so that:

- One player can create a room.
- Other players can join the room.
- Players receive their private information only when appropriate.
- Public game state is synchronized between players.
- Hidden information remains private.
- The game can continue without a permanent game server.
- GitHub Pages only hosts the static application.
- No custom signaling server should be required.

### Trystero

Use **Trystero** as the networking layer for establishing peer-to-peer connections.

Trystero should be treated as an infrastructure dependency, not as part of the rules engine.

The implementation should keep the following responsibilities separate:

```text
Game Rules
    ↓
Game State
    ↓
Networking Adapter
    ↓
Trystero / WebRTC
```

The game engine should not directly depend on Trystero APIs.

Instead, create a small networking abstraction that can:

- connect to a room
- discover peers
- send public game-state updates
- send private player-specific data
- receive state updates
- detect peers joining
- detect peers leaving
- handle connection errors

For example, conceptually:

```js
network.connect(roomId)
network.sendPublic(message)
network.sendPrivate(playerId, message)
network.onMessage(callback)
network.onPeerJoin(callback)
network.onPeerLeave(callback)
network.disconnect()
```

The exact API may differ depending on the chosen Trystero implementation.

Do not duplicate game rules inside networking callbacks.

---

# 4. Multiplayer Authority

The game may use a designated **host/game authority** to keep game logic deterministic.

The host is still a normal peer.

The host is **not** a traditional server.

The host should preferably be responsible for authoritative operations such as:

- validating actions
- resolving random rolls
- resolving card effects
- applying damage
- applying healing
- resolving attacks
- checking deaths
- checking Win Conditions
- advancing turns
- generating authoritative state updates

Clients should send requests to the host rather than independently modifying authoritative game state.

Conceptually:

```text
Client
  │
  │ request action
  ▼
Host / Game Authority
  │
  │ validate + resolve
  ▼
Game Engine
  │
  │ updated state
  ▼
Host
  │
  │ synchronize
  ▼
Clients
```

This does **not** mean that the host should contain a completely separate rules implementation.

The same reusable rules engine should be used for local simulation and authoritative game resolution.

---

# 5. Room System

The game should support a lightweight room system compatible with Trystero.

A player should be able to:

1. Create a room.
2. Obtain a room identifier or shareable room link/code.
3. Give that identifier to friends.
4. Have friends join the room directly from the browser.
5. Start the game once enough players have joined.

The room itself should not require a dedicated application server.

Do not implement an unnecessary custom lobby backend.

The exact room identifier format and Trystero configuration should be kept behind the networking layer.

---

# 6. Core Game Concept

The game is a hidden-role multiplayer board/card game.

Players receive a secret Character.

Each Character belongs to one of three factions:

- Users
- Memers
- Trollers

Players do not normally know the identities of other players.

Players move between Areas, draw cards, use Equipment, attack each other and attempt to satisfy their Character's Win Condition.

The game ends when one or more players satisfy their Win Condition.

Important:

**Multiple players can win simultaneously.**

For example, Kolalie's condition is:

> You survive until another player reaches their Win Condition.

If another player reaches their Win Condition while Kolalie is still alive, both players win.

---

# 7. HP System

Free The Memes changes the original damage-counter system.

## Original system

Characters effectively have a maximum HP value but start at **0 damage**.

Damage increases the damage counter.

Healing decreases the damage counter.

A character dies when:

> damage >= Maximum HP

Example:

A character with 8 HP:

- 0 damage → alive
- 4 damage → alive
- 7 damage → alive
- 8 damage → dead

## Free The Memes system

Free The Memes uses conventional HP.

Each Character has a Maximum HP.

Players start at Maximum HP.

Damage reduces HP.

Healing restores HP.

A character dies at 0 HP.

Example:

A character with 8 Maximum HP:

- 8 HP → full health
- 4 HP → injured
- 1 HP → critically injured
- 0 HP → dead

### Important implementation rule

HP must never exceed Maximum HP unless a future card explicitly states otherwise.

Healing should therefore normally be:

`min(currentHP + healingAmount, maxHP)`

Damage should normally be:

`max(currentHP - damageAmount, 0)`

---

# 8. Mechanical Adaptation

Free The Memes does not blindly translate every original card effect word-for-word.

Effects that relied on the original damage-counter system may be adapted to make sense with conventional HP.

Example:

Original:

> First Aid — Set a character's damage at 7. (You may choose yourself.)

Free The Memes:

> EMMOTIONAL DAMAGE. — Set any character's HP to 2.

This is intentional.

The goal is to preserve the gameplay purpose of the effect rather than mechanically reproducing an implementation detail of the original damage system.

---

# 9. Characters

There are 10 Characters in the current Free The Memes version.

| HP | Type | Name | Special Effect | Win conditions |
|:-:|:-:|:-:|:-:|:-:|
| 8 | User | Doge | Twice per game, when attacked, roll a die. On even, you do not take damage. | You survive until another player reaches their Win Condition. |
| 10 | User | Pay-to-Win | When you would deal 2 or more damage, you may steal an Equipment card from your target instead. | You possess 5 or more equipment cards. |
| 11 | User | John Wick | After attacking, you may take 2 damage to attack again. | Your attack kills a character and that kill puts the total body count at 3 or more. |
| 13 | User | Press F | When a character dies, reveal your identity. | You are the first character to die, or you survive and the Memers achieve their Win Condition. |
| 10 | Memer | Parkour Guy | When moving, you may move to an adjacent Area instead of rolling the dice. | All Trollers are dead. |
| 12 | Memer | DEATH NOTE | Once per game, you may deal damage to any player equal to a 6-sided die roll. | All Trollers are dead. |
| 14 | Memer | Hadouken! | Once per game, you may deal damage to any player equal to a 4-sided die roll. | All Trollers are dead. |
| 11 | Troller | Poker Face | When given a Notification, you may lie without revealing your identity. | All Memers are dead, or 3 Neutrals are dead. |
| 13 | Troller | Life Stonks | When you attack a player and deal damage, you may heal 2 HP. | All Memers are dead, or 3 Neutrals are dead. |
| 14 | Troller | Surprise MF | After being attacked, you may immediately attack your attacker. | All Memers are dead, or 3 Neutrals are dead. |

# 9.1 Character allocation by player count

The faction totals match the original game exactly, so the allocation table is reused directly with Free The Memes faction names:

| Players | Memer | Troller | User |
|:-:|:-:|:-:|:-:|
| 4 | 2 | 2 | 0 |
| 5 | 2 | 2 | 1 |
| 6 | 2 | 2 | 2 |
| 7 | 2 | 2 | 3 |
| 8 | 3 | 3 | 2 |

**Exception:** at 7 and 8 players, the User pool excludes **Pay-to-Win**. This exception only applies if the implementation ever draws a User subset (e.g. a future "speculation" variant with a larger card pool than player count). With exactly 10 fixed Characters and no oversized pool, this exception does not currently trigger, but it must remain documented so it isn't lost if that variant is implemented later.

---

# 10. Cards

Cards are divided into:

- Notifications
- White Single-use cards
- White Equipment
- Black Single-use cards
- Black Equipment

The exact current card list and card text is maintained separately from this technical project brief.

Do not invent cards, effects, factions, characters or rules that are not defined in the project data.

If an effect appears ambiguous, preserve the existing documented behavior rather than inventing a new mechanic.

---

# 11. Locations

The game currently contains six Areas.

| Die Result | Area | Effect |
|:-:|---|---|
| 2–3 | Otaku's Paradise | Draw 1 Notification, read it, then give it to another player. |
| 4–5 | The Bed of Your Dreams | Draw 1 White card and follow its instructions. |
| 6 | Grandma's New Bedroom | Draw 1 Black card and follow its instructions. |
| 8 | Attic Hatch | Choose a White, Black, or Notification deck. Draw 1 card and follow its instructions. |
| 9 | Toxic Relationship | Choose a player: deal 2 damage or heal 1 HP. You may choose yourself. |
| 10 | Pickpocket Boulevard | Take 1 Equipment card from another player. Nothing happens if no one has Equipment. |

Movement uses two dice:

- 1d6
- 1d4

Possible totals are 2–10.

A total of **7** has a special movement behavior: the player chooses their destination.

The Die Result → Area mapping above is **fixed and never changes between games**. A total of 2–3 is always Otaku's Paradise, a total of 10 is always Pickpocket Boulevard, and so on. This table determines which action a player triggers and is independent of the board's physical layout (§11.1).

## 11.1 Area placement (setup-time, not fixed)

Separately from the die mapping above, each Area is also placed on a **physical board position**. This placement is random and determines attack range and movement adjacency only — it does not affect which die total triggers which Area.

1. The board has 6 fixed physical positions, grouped into 3 fixed pairs. The pairing itself (which position is paired with which) never changes between games.
2. At the start of each game, the six Areas are shuffled and dealt one per position.
3. Each pair shares one attack-range zone (see §11.3).

Game state must store this Area→position assignment per game; it must not be hardcoded as a constant. The position pairing itself (§11.2, §11.3), by contrast, IS a constant and must never be regenerated.

## 11.2 Adjacency (for movement abilities)

Abilities that move a player "to an adjacent Area" (e.g. Parkour Guy) use the following adjacency rule, taken directly from the source game:

- The player may move to the **other Area in their current pair** (their attack-range partner), OR
- The player may move to the **closest Area in the opposite pair** across the board.

Zones (attack range pairs): A = {1,2}, B = {3,4}, C = {5,6}

Circular adjacency between zones:
  ... 6 - 1 - 2 - 3 - 4 - 5 - 6 ...

This adjacency is a **static, hardcoded constant** — it is fixed by board geometry and must never be generated or recalculated at runtime. Only the Area→position assignment from §11.1 is randomized per game; the position-to-position adjacency itself never changes.

## 11.3 Attack range pairing

The 3 pairs described in §11.2 define attack range: a player may attack a target on their own Area or on the paired Area. Unlike the Area→position assignment (§11.1), this pairing is **fixed by board geometry** and does not need to be generated or stored per game.

---

# 12. Game State

The game state should contain at minimum:

### Player

- player ID
- display name
- connection state
- current Area
- Character
- current HP
- Equipment cards
- faction information where appropriate
- alive/dead state
- whether their Character identity has been revealed

### Game

- current phase
- current player
- turn order
- Areas
- players
- decks
- discard piles if required
- body count
- game-end state
- winners
- pending actions
- temporary effects
- per-character ability usage

Hidden information must never be exposed to clients that should not have access to it.

The authoritative host should maintain the complete game state.

Clients should receive only the information they are allowed to know.

---

# 13. Turn Structure

## 13.1 Card and information model (context for the sequence below)

Shadow Hunters/Free the Memes has no "hand of cards" in the classic sense:

- **Character card** — one per player, secret, face-down in front of them for the whole game.
- **Notification (Hermit) cards** — drawn, then immediately given to another player, who resolves it and discards it. Never kept.
- **Single-use (White/Black) cards** — drawn, resolved immediately, then discarded. Never kept or played later at will.
- **Equipment cards** — kept face-up in front of their owner once acquired, passive by default, no limit to how many a player can hold.

There is therefore no "play a card from hand" step anywhere in a turn.

## 13.2 The active player's own turn

```text
TURN(player)
  ├─ Start turn
  ├─ Movement
  ├─ Resolve movement/area effect
  │    └─ cards/effects may trigger
  │         ├─ resolve immediately
  │         ├─ check deaths
  │         └─ check win conditions
  ├─ Attack (if permitted)
  │    ├─ resolve attack
  │    ├─ reactive abilities may trigger (e.g. Surprise MF)
  │    ├─ resolve resulting effects
  │    ├─ check deaths
  │    └─ check win conditions
  ├─ End turn
  │    └─ some effects may queue an extra turn (e.g. Forbidden Google Search)
  └─ Next player
```

White/Black/Notification cards are drawn and resolved as part of "Resolve movement/area effect" — never as a separate "play a card" step.

## 13.3 Event/Trigger model (required for reactive abilities)

Reactive abilities and interrupting cards are **not** modeled as extra steps appended to the active player's own turn. They are modeled as triggers reacting to events, resolved immediately when the event occurs, after which play resumes exactly where it was interrupted:

```text
Event: CharacterAttacked
  → trigger Surprise MF

Event: CharacterDied
  → trigger Press F

Event: TurnEnded
  → trigger Forbidden Google Search
```

General resolution loop:

```text
resolve(action)
  → generate events
  → collect triggered effects
  → resolve triggered effects
  → generate new events
  → repeat
  → check win conditions after each resolution
```

This correctly handles trigger chains, for example:

```text
Alice attacks Bob
→ Bob dies
→ Press F triggers
→ Press F effect resolves
→ another character dies
→ Press F triggers again
→ win condition becomes true
→ game ends
```

**Critical rule:** Character deaths and Win Conditions must be checked immediately after every resolution step in this loop — not only at `End turn`. A Win Condition can become true because of another player's action and must be declared the moment it happens. Waiting for `End turn` to check win conditions is an implementation bug.

## 13.4 Why reactive abilities are triggers, not turn steps

- **Surprise MF** — triggers on `CharacterAttacked`, during the attacker's own turn, not the Surprise MF player's turn.
- **Press F** — triggers on `CharacterDied`, for ANY character's death, at any time, regardless of whose turn it is.
- **Forbidden Google Search** — triggers on `TurnEnded` and queues an extra turn, interrupting normal turn order.

These must be modeled as event-driven triggers that can fire during any player's turn, not as a step inside the triggering player's own sequence.

## 13.5 Equipment: passive by default, with two explicit exceptions

Equipment is not a "playable action." Player state simply holds:

```text
equipment: Set<Equipment>
```

Most Equipment effects are purely passive — consulted automatically when a relevant event occurs (e.g. a flat damage bonus applied on `AttackResolved`). No activation step, no player decision.

**Two Equipment cards are exceptions** and require a player decision at the moment their triggering event occurs — not a standing "activation" action, but a conditional prompt raised by the event itself, handled through the same pending-action system described in `instructions.md` §11:

- **Google Maps: Medieval Edition** — on the `Movement` event, the owner may choose to roll twice and pick which result to use.
- **Telescopic lance** — on a successful `AttackResolved` event (Memer only), the owner may choose to reveal their identity; if they do, the attack deals 2 additional damage.

Implementation-wise, these are handled inside `resolve(action)` as "resolve triggered effects → prompt for player choice → continue resolution," not as separate menu actions outside the event loop.

---

# 14. Hidden Information

Hidden information is fundamental to the game.

Examples:

- Character identity
- Character faction
- Certain private card information
- Cards held by other players
- Information revealed only to specific players

The host must not broadcast secret information unnecessarily.

The networking layer must support both:

### Public messages

Information that every player may receive.

Examples:

- player movement
- public HP
- deaths
- revealed Characters
- public card effects
- turn changes

### Private messages

Information intended for a specific player.

Examples:

- their Character
- their private cards
- private Notifications
- information revealed only to them

The UI should only display information that the current player is allowed to know.

---

# 15. Rules Engine

Game mechanics should be implemented as reusable rules/actions rather than hardcoded directly into UI components.

Prefer a structure where effects can be represented conceptually as:

- `dealDamage(target, amount)`
- `heal(target, amount)`
- `setHP(target, amount)`
- `drawCard(deck)`
- `giveCard(card, target)`
- `stealEquipment(target)`
- `revealCharacter(player)`
- `movePlayer(player, area)`
- `attack(attacker, target)`
- `checkWinConditions()`
- `killPlayer(player)`

Card effects should call these shared game actions whenever possible.

This avoids having slightly different damage/healing behavior depending on which card caused it.

# 15.1 Identity revelation and Special Abilities

**General rule:** using a Character's Special Ability requires revealing that Character's identity, unless the Character's own ability text explicitly says otherwise.

Exceptions in the current 10 Characters:

- **Press F** — passive, mandatory trigger. On ANY Character's death (including its own), Press F's identity is revealed automatically. There is no player choice involved — this is not an "activation" in the same sense as other abilities, and should be implemented as an automatic reaction (`onCharacterDeath → revealCharacter(self)`), not as a player-triggered action with a reveal cost.
- **Poker Face** — may lie about a Notification without revealing identity, by design (mirrors "Unknown/Deceit" in the original).

All other Characters (Doge, Pay-to-Win, John Wick, Parkour Guy, DEATH NOTE, Hadouken!, Life Stonks, Surprise MF) must reveal their identity as a cost of activating their Special Ability. The Rules Engine must model this as part of the ability-activation action, and the UI must prompt for confirmation before the reveal is committed, since it is irreversible public information.

---

# 16. Networking Architecture

Networking must remain separate from the rules engine.

A suggested conceptual architecture is:

```text
┌─────────────────────────────┐
│           UI                │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      Game Controller        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        Rules Engine         │
│                             │
│ damage / heal / attack /    │
│ movement / cards / deaths / │
│ win conditions              │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      Game State              │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│    Networking Adapter       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│          Trystero           │
│                             │
│       WebRTC / P2P          │
└─────────────────────────────┘
```

The rules engine must not directly import or depend on Trystero.

The networking adapter is responsible for translating between game-level messages and Trystero communication.

For example:

```text
Player clicks "Attack"
        ↓
UI requests attack(target)
        ↓
Game Controller
        ↓
Host validates action
        ↓
Rules Engine resolves attack
        ↓
Game State changes
        ↓
Networking Adapter
        ↓
Trystero broadcasts resulting state
        ↓
Clients update their local views
```

Do not allow clients to arbitrarily overwrite authoritative game state.

---

# 17. Host Authority and Synchronization

The host acts as the authoritative game peer.

Clients should generally send **actions/requests**, not complete state replacements.

For example:

```js
{
    type: "REQUEST_ATTACK",
    targetId: "player-3"
}
```

rather than:

```js
{
    type: "SET_HP",
    playerId: "player-3",
    hp: 4
}
```

The host resolves the request through the rules engine and then sends the resulting state changes.

This reduces the risk of:

- desynchronized game states
- clients modifying illegal values
- duplicated rule implementations
- clients manipulating their own hidden information
- different clients resolving random events differently

Random events such as dice rolls should preferably be resolved by the host.

# 17.1 Equipment transfer on death

Default rule: when a player kills another Character, the killer takes **one Equipment card of their choice** from the dead Character. Any remaining Equipment is discarded.

If multiple Characters die from the same effect (e.g. an AoE like "PFRFRFRFRFRFRFRFRRT Tube"), the killer gets **one Equipment card of their choice per Character killed**, not one total.

**Gods' Hand Spinner** is an explicit exception: its owner steals **all** Equipment from a Character they kill, overriding the default one-card rule for that kill.

---

# 18. State Synchronization

The networking layer should support:

### Initial synchronization

When a player joins:

1. The host accepts the connection.
2. The host sends the appropriate initial public state.
3. The host sends the joining player their private information.
4. The player becomes synchronized with the current game state.

### Runtime synchronization

When the authoritative game state changes:

1. The rules engine produces the new state.
2. The host determines what information is public.
3. The host determines what information is private.
4. The networking adapter sends the appropriate messages.
5. Clients update their local state.

### Reconnection

If technically practical, the architecture should allow a disconnected player to reconnect.

A reconnecting player should receive a fresh authoritative state rather than attempting to reconstruct the game from every previous event.

Do not make reconnection a prerequisite for the first playable version.

---

# 19. Error Handling

The game should never silently corrupt the game state.

Invalid actions should be rejected cleanly.

Examples:

- attacking while dead
- playing a card that is not in the player's hand
- using a once-per-game ability twice
- targeting an invalid player
- exceeding Maximum HP
- taking an action outside the current phase
- moving when movement is not allowed
- attempting to modify authoritative state directly
- receiving an invalid network message

The UI should provide a clear explanation when an action cannot be performed.

Malformed or invalid network messages should be rejected rather than applied to the game state.

---

# 20. Development Priorities

Implement in approximately this order:

### Phase 1 — Core engine

- Game state
- Players
- Characters
- HP
- Damage
- Healing
- Death
- Turn system
- Win Conditions

### Phase 2 — Board

- Areas
- Movement
- Dice
- Area effects

### Phase 3 — Cards

- Decks
- Drawing
- Card effects
- Equipment
- Notifications
- White cards
- Black cards

### Phase 4 — Combat

- Attack system
- Attack range
- Dice
- Damage modifiers
- Character abilities
- Equipment effects
- Reactions

### Phase 5 — Local multiplayer simulation

Before implementing real networking, verify that the complete game can run locally with several simulated players.

The purpose is to validate the rules independently from networking.

### Phase 6 — Networking / Trystero

- Networking abstraction
- Room creation
- Room joining
- Trystero integration
- Peer discovery
- Host authority
- Public state synchronization
- Private state synchronization
- Connection state
- Basic disconnection handling
- Optional reconnection handling

### Phase 7 — UI/UX

- Lobby
- Game board
- Player list
- Hand
- Character information
- Areas
- Dice interface
- Combat interface
- Notifications
- End-game screen

### Phase 8 — Polish

- Animations
- Sounds
- Card visuals
- Responsive feedback
- Error messages
- Game logs
- Accessibility
- Spectator/read-only state if desired

---

# 21. Coding Guidelines for Copilot

When generating code:

- Prefer simple, maintainable solutions.
- Avoid unnecessary frameworks or dependencies.
- Keep modules small and focused.
- Do not create a giant single-file application.
- Keep game rules independent from the UI.
- Keep networking independent from game rules.
- Keep Trystero-specific code isolated inside the networking layer.
- Use clear names based on Free The Memes terminology.
- Do not reintroduce the original faction names into the user-facing interface.
- Do not invent mechanics.
- Do not silently change existing card behavior.
- Ask for clarification when an undocumented rule is genuinely required.
- Prefer deterministic game logic.
- Keep random rolls controlled by the game authority where appropriate.
- Make state transitions explicit.
- Avoid duplicating game logic between client and host.
- Clients should send actions/requests rather than arbitrary state mutations.
- Do not make the UI responsible for validating core game rules.
- Do not make Trystero APIs leak throughout the game engine.

---

# 22. Current Terminology

Use these names in code and UI where appropriate:

| Concept | Term |
|---|---|
| Neutral | User |
| Hunter | Memer |
| Shadow | Troller |
| Hermit | Notification |
| HP | HP |
| Maximum HP | Maximum HP |
| Damage | Damage |
| Equipment card | Equipment |
| White card | White |
| Black card | Black |
| Location | Area |
| Character card | Character |
| Win condition | Win Condition |

---

# 23. Important Rule About Original vs Free The Memes Data

The project documentation may contain both **original/reference data** and **Free The Memes data**.

The original data exists primarily as a reference for understanding the source mechanics.

The application itself must use the **NOUVEAU / Free The Memes data**.

Do not automatically copy an original name, faction, card name or text into the game just because it appears in reference documentation.

Free The Memes data is authoritative for implementation.

# 23.1 Implementation notes from source-game Q&A

These clarifications come from the original rulebook's Q&A and apply to Free The Memes unless a specific card says otherwise:

- **Equipment stacking:** all owned Equipment effects are always active simultaneously and combine (e.g. multiple flat damage bonuses all apply to the same attack).
- **"If you reveal your identity" effects:** these trigger even if the Character is already revealed — treat an already-revealed Character as satisfying the reveal condition.
- **Healing/damage with no effect:** targeting a full-HP Character with healing (or a 0-damage state with damage-based conditionals) is legal and simply wastes the effect — it is not an invalid action.
- **Equipment is always on, with one exception:** Equipment effects cannot be selectively disabled, except Google Maps: Medieval Edition (roll-twice-and-choose), which is an optional choice made before moving.

---

# 24. Current Goal

The immediate goal is not to build every visual detail.

First establish a reliable game engine capable of running a complete match locally with several simulated players.

Once the rules work correctly locally, add the **Trystero/WebRTC multiplayer layer**.

Then build the final UI around the stable game state and rules engine.

The most important property of the project is:

> **A complete game with correct rules is more important than a beautiful UI with incomplete game logic.**

The networking system should remain replaceable.

The rules engine must work without Trystero.

Trystero should only provide the peer-to-peer communication layer required to turn the local game into an online multiplayer game.
