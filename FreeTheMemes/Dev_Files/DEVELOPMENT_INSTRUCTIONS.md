# Free the Memes — Development Instructions

Before modifying the project:

1. Read ftm_prjct_brief.md
2. Read ftm_prjct_cards.md when modifying cards
3. Read SHADOW_HUNTERS_RULES_REFERENCE.md when dealing with
   original game rules
4. Read this file for implementation constraints
5. Search the existing code before creating a new file
6. Do not duplicate existing game logic
7. Do not invent mechanics
8. Keep game logic independent from UI
9. Keep networking independent from game rules

### Project Naming

The official name of the game is **Free the Memes**.

Use:
- `Free the Memes` when referring to this game.
- `Shadow Hunters` when referring to the original board game.
- `Shadow Hunter Remake` only when historical context requires
  mentioning the former project name.

Do not introduce `Shadow Hunter Remake` as the current name of the game.

## 1. Purpose

This document is an **implementation instruction manual** for developers and AI coding assistants.

The project brief explains what the project is.

`cards.md` defines the current remake card data.

`SHADOW_HUNTERS_RULES_REFERENCE.md` explains the original game's rules for reference.

This document explains **how the software must be developed**.

---

## 2. Source-of-truth hierarchy

When information conflicts, use this order:

1. Current remake data and explicit remake rules.
2. Project brief.
3. Development instructions.
4. Original rules reference.
5. External sources.

The original rules reference must never silently override remake data.

---

## 3. Golden rule: do not invent mechanics

Before implementing a rule, search the existing project data.

Check:

1. `ftm_prjct_cards.md`
4. `ftm_prjct_brief.md`
5. `SHADOW_HUNTERS_RULES_REFERENCE.md`

If the required **remake behavior** is still undefined and the decision would change gameplay, stop and ask for clarification.

Do not invent a plausible rule just to make the code compile.

---

## 4. Required architecture

Keep these responsibilities separate:

```text
UI
 ↓
Game Controller
 ↓
Rules Engine
 ↓
Game State
 ↓
Networking Adapter
 ↓
Trystero / WebRTC
```

The Rules Engine must work without networking.

The UI must work through game actions rather than directly modifying state.

Trystero-specific code must remain isolated in the networking layer.

---

## 5. Recommended project structure

Use a modular structure similar to:

```text
/
├── index.html
├── package.json
├── README.md
├── cards.md
│
├── docs/
│   ├── ftm_prjct_brief.md
│   ├── SHADOW_HUNTERS_RULES_REFERENCE.md
│   └── DEVELOPMENT_INSTRUCTIONS.md
│
├── data/
│   ├── cards.js
│   ├── characters.js
│   ├── areas.js
│   └── game-config.js
│
├── src/
│   ├── game/
│   │   ├── Game.js
│   │   ├── GameState.js
│   │   ├── Player.js
│   │   ├── TurnManager.js
│   │   ├── RulesEngine.js
│   │   ├── Combat.js
│   │   ├── Movement.js
│   │   ├── Cards.js
│   │   ├── Abilities.js
│   │   └── Victory.js
│   │
│   ├── networking/
│   │   ├── NetworkAdapter.js
│   │   ├── TrysteroNetwork.js
│   │   ├── Messages.js
│   │   └── Serialization.js
│   │
│   ├── ui/
│   │   ├── lobby/
│   │   ├── game/
│   │   ├── cards/
│   │   ├── players/
│   │   └── components/
│   │
│   └── utils/
│       ├── dice.js
│       ├── ids.js
│       └── validation.js
│
└── tests/
    ├── game/
    ├── cards/
    ├── combat/
    ├── victory/
    └── networking/
```

Exact filenames may evolve. The separation of responsibilities must not.
Do not create files or abstractions preemptively.
Create a new module only when the existing structure no longer provides a clear and maintainable place for the functionality.

---

## 6. Data must be separate from logic

Do not hardcode card or Character definitions inside the Rules Engine.

Bad:

```js
if (card.name === "Some Card") {
    player.hp -= 3;
}
```

Prefer data-driven resolution:

```js
resolveCard(card, context);
```

Card data should describe the effect. Reusable game actions should perform it.

---

## 7. Game state

Create one authoritative representation of game state.

At minimum:

```js
{
    phase,
    currentPlayerId,
    turnOrder,
    players,
    areas,
    decks,
    discardPiles,
    bodyCount,
    pendingActions,
    winners,
    gameOver
}
```

A player should contain at least:

```js
{
    id,
    name,
    areaId,
    characterId,
    hp,
    maxHp,
    equipment,
    alive,
    revealed,
    abilityState
}
```

Do not put DOM state or purely visual state in the authoritative game state.

---

## 8. HP implementation

The remake uses conventional remaining HP.

Players start at maximum HP.

Damage:

```js
currentHP = Math.max(currentHP - amount, 0);
```

Healing:

```js
currentHP = Math.min(currentHP + amount, maxHP);
```

Normal healing must never exceed maximum HP.

Normal damage must never produce negative HP.

If a card explicitly sets HP, validate the result through one centralized HP operation.

Do not represent remake HP as the original game's damage counter.

---

## 9. Reusable game actions

Implement centralized actions such as:

```js
dealDamage(targetId, amount)
heal(targetId, amount)
setHP(targetId, value)
killPlayer(playerId)
movePlayer(playerId, areaId)
drawCard(deckId)
giveCard(cardId, playerId)
stealEquipment(fromPlayerId, toPlayerId)
revealCharacter(playerId)
attack(attackerId, targetId)
checkWinConditions()
```

Every action must:

1. Validate input.
2. Validate legality in the current state.
3. Modify authoritative state.
4. Resolve relevant triggers.
5. Resolve deaths where appropriate.
6. Check victory conditions where appropriate.
7. Return a deterministic result or a structured error.

---

## 10. UI must not mutate game state

Never let UI code do this:

```js
player.hp -= 2;
```

Instead:

```js
game.dealDamage(targetId, 2);
```

The Rules Engine decides whether the action is legal.

Buttons should request actions. They should not implement game rules.

---

## 11. Turn system

Use explicit phases rather than one giant turn function.

Suggested phases:

```text
START_TURN
MOVEMENT
AREA_ACTION
OPTIONAL_ACTIONS
ATTACK
RESOLUTION
VICTORY_CHECK
END_TURN
```

The exact phases may evolve, but state transitions must remain explicit.

For effects requiring player input, use a pending-action system.

Example:

```text
Card drawn
 ↓
Card requires target
 ↓
Create pending action
 ↓
UI asks player for target
 ↓
Player submits choice
 ↓
Rules Engine validates choice
 ↓
Effect resolves
 ↓
Continue game
```

Do not implement this through a chain of UI callbacks containing hidden rules.

---

## 12. Randomness

Randomness that changes authoritative state must be resolved by the game authority.

Examples:

- movement dice;
- attack dice;
- card draws;
- Character assignment;
- random setup;
- random card effects.

A client must not independently roll and assume the result matches the host.

The authoritative result is generated once and synchronized.

---

## 13. Card system

Cards must be data-driven.

Card data should contain enough information to identify:

- deck;
- card type;
- name;
- description;
- effect;
- Equipment vs Single-use;
- targeting requirements;
- timing requirements.

Do not duplicate card effect logic in UI components.

Prefer reusable operations such as:

```js
dealDamage
heal
draw
discard
stealEquipment
giveEquipment
reveal
move
extraTurn
```

If a card needs a genuinely new mechanic, add a reusable rules operation rather than hardcoding it into that card's UI.

---

## 14. Equipment

Equipment is persistent player state.

Adding Equipment:

```text
player.equipment += card
```

Stealing Equipment:

```text
remove from original owner
add to new owner
```

Equipment effects are evaluated by the Rules Engine.

The UI must not manually apply Equipment bonuses.

---

## 15. Character abilities

Character abilities must be represented as rules/triggers, not UI-only buttons.

An ability may define:

- trigger;
- timing;
- optional vs automatic behavior;
- once-per-game state;
- revelation requirement;
- targets;
- effects.

Do not assume every ability is an activated action.

---

## 16. Victory conditions

Victory checks belong in one central system:

```js
checkWinConditions(state)
```

The result must support multiple winners:

```js
{
    gameOver: true,
    winners: ["player-1", "player-4"]
}
```

Never stop checking after finding the first winner.

Check victory whenever a relevant state change occurs, including actions caused by another player.

---

## 17. Death resolution

Death is a game event.

Use a centralized operation:

```js
killPlayer(playerId, context)
```

It should:

1. Verify the player is not already dead.
2. Set HP to 0.
3. Mark the player dead.
4. Resolve death-related effects.
5. Resolve any documented Equipment consequence.
6. Update body count if the remake uses it for the relevant rules.
7. Trigger Character abilities that react to death.
8. Check victory conditions.

Do not implement separate death rules for attacks, cards and Areas.

---

## 18. Networking abstraction

The Rules Engine must not import Trystero.

Use a networking abstraction:

```js
class NetworkAdapter {
    connect() {}
    disconnect() {}
    sendPublic() {}
    sendPrivate() {}
}
```

The concrete Trystero implementation belongs behind this interface.

```text
Game Engine
    ↓
NetworkAdapter
    ↓
TrysteroNetwork
    ↓
Trystero / WebRTC
```

This allows the rules engine to be tested without networking.

---

## 19. Trystero rules

Use Trystero for peer communication only.

Do not put game rules inside network callbacks.

Bad:

```js
onAttackMessage(() => {
    target.hp -= 3;
});
```

Good:

```js
onAttackMessage(message => {
    game.requestAction(message);
});
```

The host validates and resolves the request through the Rules Engine.

---

## 20. Host authority

The host is the authoritative game peer.

Clients send requests such as:

```js
{
    type: "REQUEST_ATTACK",
    targetId: "player-3"
}
```

Clients must not send arbitrary state mutations such as:

```js
{
    type: "SET_HP",
    playerId: "player-3",
    hp: 4
}
```

The host decides:

- dice results;
- card draws;
- legal targets;
- damage;
- healing;
- deaths;
- victory;
- turn progression.

---

## 21. Hidden information

Never broadcast the complete authoritative state to every peer.

Separate state into:

### Public state

Information everyone may know.

### Private state

Information only one player may know.

Examples:

- Character identity before revelation;
- private cards;
- private Notifications;
- player-specific secret effects.

The serialization layer must explicitly determine what each recipient receives.

Do not send secret information and merely hide it with CSS.

---

## 22. Network messages

Use explicit message types.

Examples:

```text
REQUEST_ACTION
STATE_UPDATE
PRIVATE_STATE_UPDATE
PLAYER_JOINED
PLAYER_LEFT
GAME_STARTED
GAME_ENDED
ERROR
```

Validate every incoming message.

Reject unknown, malformed or impossible messages.

Do not execute arbitrary code received over the network.

---

## 23. Synchronization

Prefer authoritative state snapshots over trusting clients to reconstruct state independently.

Normal flow:

```text
Client
  ↓
Action request
  ↓
Host
  ↓
Rules Engine
  ↓
State mutation
  ↓
Public/private serialization
  ↓
Peers
```

A newly joined player should receive an appropriate current snapshot.

Do not require a player to replay the complete game history just to synchronize.

---

## 24. Local simulation before networking

Before implementing Trystero multiplayer, create a local simulation mode.

It should support several simulated players and run without a network connection.

At minimum it should be possible to:

- create a game;
- assign Characters;
- run turns;
- move players;
- draw cards;
- attack;
- apply damage;
- heal;
- kill players;
- check victory conditions.

This is the primary environment for manually exercising the Rules Engine.

---

## 25. Focused validation

Automated tests are optional and should stay proportional to the change:

- Prefer one existing test file for the behavior being changed, only when validation is useful.
- Do not run the full suite by default; reserve it for an explicit request.
- Do not add tests for completeness. Add them only when requested or when a risky behavior cannot be checked otherwise.

---

## 26. Error handling

Invalid actions must never silently modify state.

Return structured errors, for example:

```js
{
    ok: false,
    error: "INVALID_TARGET",
    message: "This player cannot be targeted by the current action."
}
```

Rules code must not directly manipulate DOM elements.

---

## 27. Game events and logging

The game engine should be able to emit structured events such as:

```text
PLAYER_MOVED
CARD_DRAWN
CARD_PLAYED
ATTACK_STARTED
ATTACK_RESOLVED
DAMAGE_DEALT
HEAL_APPLIED
PLAYER_DIED
CHARACTER_REVEALED
ABILITY_USED
VICTORY_REACHED
```

The UI can use these events for logs, animations and notifications.

Events are not a replacement for authoritative state.

---

## 28. Development workflow

For every feature:

### Step 1 — Identify the rule

Find the authoritative remake source.

### Step 2 — Identify the required state

Determine what data must exist.

### Step 3 — Define the game action

Create the smallest reusable operation that represents the mechanic.

### Step 4 — Implement the Rules Engine

Implement the mechanic without UI or networking. Use a focused existing check only when useful; do not run the full suite by default.

### Step 5 — Add UI

Expose the action through the interface.

### Step 6 — Add networking

Synchronize the authoritative result through the networking adapter.

### Step 7 — Verify synchronization when relevant

When networking changed, use one focused synchronization check if needed. Reserve broad test runs for an explicit request.

---

## 29. What Copilot must NOT do

Do not:

- create a giant `index.js` or equivalent monolithic file;
- put the complete Rules Engine inside UI components;
- put Trystero calls inside card definitions;
- duplicate attack logic in multiple places;
- let clients directly modify authoritative state;
- broadcast secret Character information to every client;
- invent missing card effects;
- invent missing Characters or factions;
- silently alter documented remake behavior;
- replace remake data with original Shadow Hunters data;
- copy original artwork or assets into the application;
- introduce a permanent backend server when it is not required;
- add a framework without a concrete need;
- add dependencies without a concrete reason;
- optimize prematurely before the rules are correct.

---

## 30. Handling ambiguity

If an implementation question can be answered without changing gameplay, choose the simplest maintainable solution.

If the answer changes gameplay behavior, do not guess.

Examples requiring clarification:

- whether an effect can target a dead player;
- whether a trigger happens before or after damage;
- whether reactions can chain;
- whether an ability requires revelation;
- whether a card interrupts another effect;
- whether an Equipment modifier applies to an adapted effect.

When unclear:

```text
STOP
 ↓
Identify the ambiguity
 ↓
Check project data
 ↓
State what is missing
 ↓
Ask for clarification
```

---

## 31. Definition of done

A feature is not complete merely because the UI appears to work.

A feature is complete when:

- the rule exists in the Rules Engine;
- invalid actions are rejected;
- state transitions are deterministic;
- important edge cases are tested;
- hidden information is protected;
- the UI only requests actions;
- networking can synchronize the authoritative result;
- the rule is not duplicated elsewhere.

---

## 32. Priority order

When priorities conflict, use:

1. Correct game rules.
2. Correct game state.
3. Deterministic authoritative resolution.
4. Hidden-information protection.
5. Testability.
6. Networking reliability.
7. UI correctness.
8. Visual polish.
9. Animations and presentation.

A beautiful UI with incorrect rules is not a working feature.
