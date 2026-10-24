export const GAME_PHASES = Object.freeze({
  SETUP: "setup",
  START_TURN: "start-turn",
  MOVEMENT: "movement",
  AREA_ACTION: "area-action",
  OPTIONAL_ACTIONS: "optional-actions",
  ATTACK: "attack",
  RESOLUTION: "resolution",
  VICTORY_CHECK: "victory-check",
  END_TURN: "end-turn",
  GAME_OVER: "game-over"
});

export const createPlayer = ({ id, name, character }) => ({
  id,
  name,
  characterId: character.id,
  faction: character.faction,
  areaId: null,
  maxHp: character.maxHp,
  hp: character.maxHp,
  equipment: [],
  alive: true,
  revealed: false,
  abilityState: {}
});

export const createGameState = ({ players = [], turnOrder = [] } = {}) => ({
  phase: GAME_PHASES.SETUP,
  currentPlayerId: null,
  queuedTurns: [],
  turnOrder,
  board: null,
  decks: {},
  players: Object.fromEntries(players.map((player) => [player.id, player])),
  bodyCount: 0,
  firstDeathPlayerId: null,
  winners: [],
  gameOver: false,
  temporaryEffects: [],
  privateRevelations: {},
  pendingActions: [],
  events: []
});