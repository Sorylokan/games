import { createBoard } from "../board.js";
import { CHARACTERS } from "../data/characters.js";
import { attack, resolveCombatPendingAction } from "./combat.js";
import { createGameState, createPlayer } from "./game-state.js";
import { resolveMovementAction } from "../movement.js";
import { beginTurn, completeAreaAction, completeAttack, completeMovement, endTurn, startGame } from "./turn-manager.js";

const players = [
  createPlayer({ id: "memer-1", name: "Alice", character: CHARACTERS.PARKOUR_GUY }),
  createPlayer({ id: "memer-2", name: "Bob", character: CHARACTERS.DEATH_NOTE }),
  createPlayer({ id: "troller-1", name: "Cara", character: CHARACTERS.POKER_FACE }),
  createPlayer({ id: "troller-2", name: "Dan", character: CHARACTERS.SURPRISE_MF })
];

const rollEight = (sides) => sides === 6 ? 6 : 2;
const rollFour = () => 4;

const requireSuccess = (result) => {
  if (!result.ok) {
    throw new Error(`${result.error}: ${result.message ?? "simulation action failed"}`);
  }

  return result.state;
};

const takeMovementAndReachAttack = (state, playerId) => {
  let nextState = requireSuccess(beginTurn(state, playerId));
  nextState = requireSuccess(resolveMovementAction(nextState, playerId, { rollDie: rollEight }));
  nextState = requireSuccess(completeMovement(nextState, playerId));
  nextState = requireSuccess(completeAreaAction(nextState, playerId));
  return nextState;
};

const attackUntilDead = (state, attackerId, targetId) => {
  let nextState = state;

  while (nextState.players[targetId].alive) {
    const result = attack(nextState, attackerId, targetId, {
      rollDie: rollEight
    });
    nextState = requireSuccess(result);

    const reaction = nextState.pendingActions.find((action) => (
      action.type === "SURPRISE_COUNTERATTACK" && action.playerId === targetId
    ));
    if (reaction) {
      nextState = requireSuccess(resolveCombatPendingAction(nextState, reaction, {
        confirmReveal: true
      }, { rollDie: rollFour }));
    }
  }

  return nextState;
};

export const runLocalSimulation = () => {
  const board = createBoard(() => 0);
  const startingArea = board.areaAtPosition[1];
  let state = {
    ...createGameState({ players, turnOrder: players.map((player) => player.id) }),
    board
  };

  state = requireSuccess(startGame(state));
  state = takeMovementAndReachAttack(state, "memer-1");
  state = { ...state, players: Object.fromEntries(Object.values(state.players).map((player) => [
    player.id,
    { ...player, areaId: startingArea }
  ])) };
  state = attackUntilDead(state, "memer-1", "troller-1");
  state = requireSuccess(completeAttack(state, "memer-1"));
  state = requireSuccess(endTurn(state, "memer-1"));

  state = takeMovementAndReachAttack(state, "memer-2");
  const secondAttackArea = state.players["memer-2"].areaId;
  state = {
    ...state,
    players: Object.fromEntries(Object.values(state.players).map((player) => [
      player.id,
      { ...player, areaId: secondAttackArea }
    ]))
  };
  state = attackUntilDead(state, "memer-2", "troller-2");

  return state;
};