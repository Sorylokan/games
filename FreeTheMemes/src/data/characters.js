export const CHARACTERS = Object.freeze({
  DOGE: Object.freeze({ id: "doge", initial: "d", nameKey: "characters.doge.name", abilityKey: "characters.doge.ability", winConditionKey: "characters.doge.winCondition", faction: "user", maxHp: 8 }),
  PAY_TO_WIN: Object.freeze({ id: "pay-to-win", initial: "p", nameKey: "characters.payToWin.name", abilityKey: "characters.payToWin.ability", winConditionKey: "characters.payToWin.winCondition", faction: "user", maxHp: 10 }),
  JOHN_WICK: Object.freeze({ id: "john-wick", initial: "j", nameKey: "characters.johnWick.name", abilityKey: "characters.johnWick.ability", winConditionKey: "characters.johnWick.winCondition", faction: "user", maxHp: 11 }),
  PRESS_F: Object.freeze({ id: "press-f", initial: "p", nameKey: "characters.pressF.name", abilityKey: "characters.pressF.ability", winConditionKey: "characters.pressF.winCondition", faction: "user", maxHp: 13 }),
  PARKOUR_GUY: Object.freeze({ id: "parkour-guy", initial: "p", nameKey: "characters.parkourGuy.name", abilityKey: "characters.parkourGuy.ability", winConditionKey: "characters.parkourGuy.winCondition", faction: "memer", maxHp: 10 }),
  DEATH_NOTE: Object.freeze({ id: "death-note", initial: "d", nameKey: "characters.deathNote.name", abilityKey: "characters.deathNote.ability", winConditionKey: "characters.deathNote.winCondition", faction: "memer", maxHp: 12 }),
  HADOUKEN: Object.freeze({ id: "hadouken", initial: "h", nameKey: "characters.hadouken.name", abilityKey: "characters.hadouken.ability", winConditionKey: "characters.hadouken.winCondition", faction: "memer", maxHp: 14 }),
  POKER_FACE: Object.freeze({ id: "poker-face", initial: "p", nameKey: "characters.pokerFace.name", abilityKey: "characters.pokerFace.ability", winConditionKey: "characters.pokerFace.winCondition", faction: "troller", maxHp: 11 }),
  LIFE_STONKS: Object.freeze({ id: "life-stonks", initial: "l", nameKey: "characters.lifeStonks.name", abilityKey: "characters.lifeStonks.ability", winConditionKey: "characters.lifeStonks.winCondition", faction: "troller", maxHp: 13 }),
  SURPRISE_MF: Object.freeze({ id: "surprise-mf", initial: "s", nameKey: "characters.surpriseMf.name", abilityKey: "characters.surpriseMf.ability", winConditionKey: "characters.surpriseMf.winCondition", faction: "troller", maxHp: 14 })
});

export const getCharacter = (characterId) => {
  const character = Object.values(CHARACTERS).find(({ id }) => id === characterId);

  if (!character) {
    throw new Error(`Unknown character: ${characterId}`);
  }

  return character;
};