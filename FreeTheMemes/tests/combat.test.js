import test from "node:test";
import assert from "node:assert/strict";
import { createBoard } from "../src/board.js";
import { areaAttack, attack, canTargetWithAttack, resolveCombatPendingAction } from "../src/game/combat.js";
import { CHARACTERS } from "../src/data/characters.js";
import { createGameState, createPlayer, GAME_PHASES } from "../src/game/game-state.js";

const createCombatState = () => {
  const board = createBoard(() => 0);
  const areas = Object.values(board.areaAtPosition);
  const players = [
    { ...createPlayer({ id: "attacker", name: "Alice", character: CHARACTERS.DOGE }), areaId: areas[0] },
    { ...createPlayer({ id: "partner", name: "Bob", character: CHARACTERS.PARKOUR_GUY }), areaId: areas[1] },
    { ...createPlayer({ id: "outsider", name: "Cara", character: CHARACTERS.POKER_FACE }), areaId: areas[2] }
  ];

  return { ...createGameState({ players }), board, phase: GAME_PHASES.ATTACK };
};

test("attack range includes the same area and its paired area", () => {
  const state = createCombatState();

  assert.equal(canTargetWithAttack(state, "attacker", "partner"), true);
  assert.equal(canTargetWithAttack(state, "attacker", "outsider"), false);
});

test("equal attack dice deal no damage", () => {
  const state = createCombatState();
  const result = attack(state, "attacker", "partner", {
    rollDie: () => 3
  });

  assert.equal(result.ok, true);
  assert.equal(result.damage, 0);
  assert.equal(result.state.players.partner.hp, 10);
  assert.equal(result.state.events.at(-1).type, "ATTACK_RESOLVED");
});

test("attack damage includes all flat equipment bonuses", () => {
  const state = createCombatState();
  state.players.attacker = {
    ...state.players.attacker,
    equipment: ["shark-teeth", "free-circumcision"]
  };
  const result = attack(state, "attacker", "partner", {
    rollDie: (sides) => sides === 6 ? 6 : 2
  });

  assert.equal(result.ok, true);
  assert.equal(result.damage, 6);
  assert.equal(result.state.players.partner.hp, 4);
});

test("attacking outside range is rejected", () => {
  const state = createCombatState();
  const result = attack(state, "attacker", "outsider");

  assert.equal(result.ok, false);
  assert.equal(result.error, "INVALID_TARGET");
});

test("area attacks use one roll for every target in range", () => {
  const state = createCombatState();
  state.players.attacker = {
    ...state.players.attacker,
    equipment: ["pfrt-tube"]
  };
  const result = areaAttack(state, "attacker", {
    rollDie: (sides) => sides === 6 ? 5 : 1
  });

  assert.deepEqual(result.targetIds, ["partner"]);
  assert.equal(result.damage, 4);
  assert.equal(result.state.players.partner.hp, 6);
});

test("forced attack equipment uses one d4 and cannot fail", () => {
  const state = createCombatState();
  state.players.attacker = {
    ...state.players.attacker,
    equipment: ["cursed-japanese-chopsticks"]
  };
  const result = attack(state, "attacker", "partner", { rollDie: () => 1 });

  assert.equal(result.ok, true);
  assert.equal(result.damage, 1);
  assert.equal(result.state.players.partner.hp, 9);
});

test("Doge can reveal and prevent an incoming attack on an even roll", () => {
  const state = createCombatState();
  state.players.partner = {
    ...state.players.partner,
    characterId: "doge",
    abilityState: {}
  };
  const incoming = attack(state, "attacker", "partner", { rollDie: () => 4 });
  const result = resolveCombatPendingAction(incoming.state, incoming.pendingAction, {
    confirmReveal: true
  }, { rollDie: () => 2 });

  assert.equal(result.ok, true);
  assert.equal(result.state.players.partner.hp, 10);
  assert.equal(result.state.players.partner.abilityState["doge-dodge"], 1);
});

test("Life Stonks and Surprise MF create reactive pending actions", () => {
  const state = createCombatState();
  state.players.attacker = {
    ...state.players.attacker,
    characterId: "life-stonks",
    hp: 8
  };
  state.players.partner = {
    ...state.players.partner,
    characterId: "surprise-mf"
  };
  const result = attack(state, "attacker", "partner", {
    rollDie: (sides) => sides === 6 ? 6 : 2
  });

  assert.equal(result.ok, true);
  assert.equal(result.state.pendingActions.some((action) => action.type === "LIFE_STONKS_REACTION"), true);
  assert.equal(result.state.pendingActions.some((action) => action.type === "SURPRISE_COUNTERATTACK"), true);
});

test("Pay-to-Win can replace qualifying attack damage with an equipment choice", () => {
  const state = createCombatState();
  state.players.attacker = { ...state.players.attacker, characterId: "pay-to-win" };
  state.players.partner = { ...state.players.partner, equipment: ["target-card"] };
  const result = attack(state, "attacker", "partner", {
    rollDie: (sides) => sides === 6 ? 6 : 2
  });

  assert.equal(result.ok, true);
  assert.equal(result.state.pendingActions[0].type, "PAY_TO_WIN_REACTION");
});

test("John Wick can pay 2 HP for a second attack", () => {
  const state = createCombatState();
  state.players.attacker = { ...state.players.attacker, characterId: "john-wick" };
  const result = attack(state, "attacker", "partner", {
    rollDie: (sides) => sides === 6 ? 6 : 2
  });
  const reaction = result.state.pendingActions.find((action) => action.type === "JOHN_WICK_SECOND_ATTACK");
  const second = resolveCombatPendingAction(result.state, reaction, { confirmReveal: true }, {
    rollDie: (sides) => sides === 6 ? 6 : 2
  });

  assert.equal(second.ok, true);
  assert.equal(second.state.players.attacker.hp, 6);
});

test("Telescopic lance offers its optional Memer attack bonus", () => {
  const state = createCombatState();
  state.players.attacker = {
    ...state.players.attacker,
    faction: "memer",
    equipment: ["telescopic-lance"]
  };
  const result = attack(state, "attacker", "partner", {
    rollDie: (sides) => sides === 6 ? 6 : 2
  });
  const reaction = result.state.pendingActions[0];
  const resolved = resolveCombatPendingAction(result.state, reaction, { confirmReveal: true });

  assert.equal(reaction.type, "TELESCOPIC_LANCE_REACTION");
  assert.equal(resolved.ok, true);
  assert.equal(resolved.state.players.partner.hp, 4);
});

test("Doge can decline the dodge and simply take the hit without revealing", () => {
  const state = createCombatState();
  state.players.partner = { ...state.players.partner, characterId: "doge", abilityState: {} };
  const incoming = attack(state, "attacker", "partner", { rollDie: () => 4 });
  const result = resolveCombatPendingAction(incoming.state, incoming.pendingAction, { decline: true }, {
    rollDie: (sides) => sides === 6 ? 6 : 2
  });

  assert.equal(result.ok, true);
  assert.equal(result.state.players.partner.revealed, false);
  assert.equal(result.state.players.partner.abilityState["doge-dodge"], undefined);
  assert.equal(result.state.players.partner.hp, 6);
});

test("Life Stonks can decline the heal without revealing", () => {
  const state = createCombatState();
  state.players.attacker = { ...state.players.attacker, characterId: "life-stonks", hp: 8 };
  const result = attack(state, "attacker", "partner", { rollDie: (sides) => sides === 6 ? 6 : 2 });
  const reaction = result.state.pendingActions.find((action) => action.type === "LIFE_STONKS_REACTION");
  const resolved = resolveCombatPendingAction(result.state, reaction, { decline: true });

  assert.equal(resolved.ok, true);
  assert.equal(resolved.state.players.attacker.revealed, false);
  assert.equal(resolved.state.players.attacker.hp, 8);
});

test("Surprise MF can decline the counterattack without revealing", () => {
  const state = createCombatState();
  state.players.partner = { ...state.players.partner, characterId: "surprise-mf" };
  const result = attack(state, "attacker", "partner", { rollDie: (sides) => sides === 6 ? 6 : 2 });
  const reaction = result.state.pendingActions.find((action) => action.type === "SURPRISE_COUNTERATTACK");
  const resolved = resolveCombatPendingAction(result.state, reaction, { decline: true });

  assert.equal(resolved.ok, true);
  assert.equal(resolved.state.players.partner.revealed, false);
  assert.equal(resolved.state.players.attacker.hp, 8);
});

test("John Wick can decline the second attack without taking self-damage", () => {
  const state = createCombatState();
  state.players.attacker = { ...state.players.attacker, characterId: "john-wick" };
  const result = attack(state, "attacker", "partner", { rollDie: (sides) => sides === 6 ? 6 : 2 });
  const reaction = result.state.pendingActions.find((action) => action.type === "JOHN_WICK_SECOND_ATTACK");
  const resolved = resolveCombatPendingAction(result.state, reaction, { decline: true });

  assert.equal(resolved.ok, true);
  assert.equal(resolved.state.players.attacker.hp, 8);
  assert.equal(resolved.state.pendingActions.length, 0);
});

test("Pay-to-Win can take the plain damage option without revealing", () => {
  const state = createCombatState();
  state.players.attacker = { ...state.players.attacker, characterId: "pay-to-win" };
  state.players.partner = { ...state.players.partner, equipment: ["target-card"] };
  const result = attack(state, "attacker", "partner", { rollDie: (sides) => sides === 6 ? 6 : 2 });
  const reaction = result.state.pendingActions[0];
  const resolved = resolveCombatPendingAction(result.state, reaction, { action: "damage" });

  assert.equal(resolved.ok, true);
  assert.equal(resolved.state.players.attacker.revealed, false);
  assert.equal(resolved.state.players.partner.hp, 6);
  assert.equal(resolved.state.players.partner.equipment.includes("target-card"), true);
});

test("Pay-to-Win can steal equipment instead of dealing damage", () => {
  const state = createCombatState();
  state.players.attacker = { ...state.players.attacker, characterId: "pay-to-win" };
  state.players.partner = { ...state.players.partner, equipment: ["target-card"] };
  const result = attack(state, "attacker", "partner", { rollDie: (sides) => sides === 6 ? 6 : 2 });
  const reaction = result.state.pendingActions[0];
  const resolved = resolveCombatPendingAction(result.state, reaction, { action: "steal", cardId: "target-card", confirmReveal: true });

  assert.equal(resolved.ok, true);
  assert.equal(resolved.state.players.attacker.revealed, true);
  assert.equal(resolved.state.players.attacker.equipment.includes("target-card"), true);
  assert.equal(resolved.state.players.partner.equipment.includes("target-card"), false);
  assert.equal(resolved.state.players.partner.hp, 10);
});

test("Telescopic lance can deal plain damage without revealing or the bonus", () => {
  const state = createCombatState();
  state.players.attacker = { ...state.players.attacker, faction: "memer", equipment: ["telescopic-lance"] };
  const result = attack(state, "attacker", "partner", { rollDie: (sides) => sides === 6 ? 6 : 2 });
  const reaction = result.state.pendingActions[0];
  const resolved = resolveCombatPendingAction(result.state, reaction, {});

  assert.equal(resolved.ok, true);
  assert.equal(resolved.state.players.attacker.revealed, false);
  assert.equal(resolved.state.players.partner.hp, 6);
});