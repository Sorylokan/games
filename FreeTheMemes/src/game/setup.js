import { createBoard } from "../board.js";
import { CARDS, getCardsByDeck } from "../data/cards.js";
import { CHARACTERS } from "../data/characters.js";
import { createGameState, createPlayer } from "./game-state.js";
import { createDeckState } from "./cards.js";

const PLAYER_COUNTS = Object.freeze({
  4: Object.freeze({ memer: 2, troller: 2, user: 0 }),
  5: Object.freeze({ memer: 2, troller: 2, user: 1 }),
  6: Object.freeze({ memer: 2, troller: 2, user: 2 }),
  7: Object.freeze({ memer: 2, troller: 2, user: 3 }),
  8: Object.freeze({ memer: 3, troller: 3, user: 2 })
});

const shuffle = (items, random) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

const getCharactersForFaction = (faction) => Object.values(CHARACTERS)
  .filter((character) => character.faction === faction);

export const getCharacterAllocation = (playerCount) => PLAYER_COUNTS[playerCount] ?? null;

export const createLocalGame = (
  playerInputs,
  { random = Math.random, startingPlayerIndex = 0 } = {}
) => {
  const allocation = getCharacterAllocation(playerInputs.length);

  if (!allocation) {
    throw new Error("Free the Memes supports 4 to 8 players.");
  }

  const factionCharacters = Object.entries(allocation).flatMap(([faction, count]) => (
    shuffle(getCharactersForFaction(faction), random).slice(0, count)
  ));
  const characters = shuffle(factionCharacters, random);
  const players = playerInputs.map((input, index) => (
    createPlayer({
      id: input.id,
      name: input.name,
      character: characters[index]
    })
  ));
  const turnOrder = players.map((player) => player.id);
  const decks = Object.fromEntries(
    ["notifications", "white", "black"].map((deckId) => [
      deckId,
      createDeckState(getCardsByDeck(deckId), random)
    ])
  );

  if (!Number.isInteger(startingPlayerIndex) || startingPlayerIndex < 0 || startingPlayerIndex >= players.length) {
    throw new Error("The starting player index is invalid.");
  }

  return {
    ...createGameState({ players, turnOrder }),
    board: createBoard(random),
    decks,
    currentPlayerId: turnOrder[startingPlayerIndex]
  };
};

export { PLAYER_COUNTS };