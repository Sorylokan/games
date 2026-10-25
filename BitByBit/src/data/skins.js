// Themes: who carries the pixels.
// carriers: [species, odds, relative speed]; species are drawn in render/carriers/.
// crew: rules text key ("rules.<crew>" in locales/). Names: "skin.<key>" and "group.<group>".
// Colors and decorations live in styles/themes/.

export const DEFAULT_SKIN = 'night';

export const SKINS = {
  // Classic
  night:  { group: 'classic', crew: 'ants', carriers: [['ant', 1, 1]] },
  palace: { group: 'classic', crew: 'ants', carriers: [['ant', 1, 1]] },
  ruby:   { group: 'classic', crew: 'ants', carriers: [['ant', 1, 1]] },
  // Escapades
  beach:  { group: 'escapades', crew: 'crabs',   carriers: [['crab', 0.98, 1], ['hermit', 0.02, 0.75]] },
  forest: { group: 'escapades', crew: 'fairies', carriers: [['fairy', 0.97, 1], ['wisp', 0.03, 1.35]] },
  garden: { group: 'escapades', crew: 'gnomes',  carriers: [['gnome', 0.95, 0.95], ['snail', 0.05, 0.45]] },
  // Seasons
  spring: { group: 'seasons', crew: 'ants',  carriers: [['ant', 1, 1]] },
  summer: { group: 'seasons', crew: 'ants',  carriers: [['ant', 1, 1]] },
  autumn: { group: 'seasons', crew: 'foxes', carriers: [['fox', 0.97, 1.1], ['hedgehog', 0.03, 0.55]] },
  winter: { group: 'seasons', crew: 'ants',  carriers: [['ant', 1, 1]] },
  // Festive
  halloween: { group: 'festive', crew: 'ghosts', carriers: [['ghost', 0.97, 1], ['bat', 0.03, 1.4]] },
  xmas:      { group: 'festive', crew: 'elves',  carriers: [['elf', 0.97, 1], ['snowman', 0.03, 0.5]] },
};

// Random carrier species, weighted by the theme's odds.
export function pickCarrier(skin, rnd = Math.random) {
  const list = SKINS[skin].carriers;
  let x = rnd();
  for (const [kind, p, spd] of list) {
    if ((x -= p) <= 0) return { kind, spd };
  }
  const [kind, , spd] = list[0];
  return { kind, spd };
}
