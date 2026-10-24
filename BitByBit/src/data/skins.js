// Les thèmes : qui transporte les pixels.
// carriers : [espèce, probabilité, vitesse relative]. Les espèces sont dessinées dans render/carriers/.
// crew : clé du texte des règles (« rules.<crew> » dans locales/), accordé selon l'équipe de porteurs.
// Noms affichés : « skin.<clé> » et « group.<groupe> » dans locales/.
// Les couleurs et décors de chaque thème sont dans styles/themes/.

export const DEFAULT_SKIN = 'night';

export const SKINS = {
  // Classique
  night:  { group: 'classic', crew: 'ants', carriers: [['ant', 1, 1]] },
  palace: { group: 'classic', crew: 'ants', carriers: [['ant', 1, 1]] },
  ruby:   { group: 'classic', crew: 'ants', carriers: [['ant', 1, 1]] },
  // Escapades
  beach:  { group: 'escapades', crew: 'crabs',   carriers: [['crab', 0.98, 1], ['hermit', 0.02, 0.75]] },
  forest: { group: 'escapades', crew: 'fairies', carriers: [['fairy', 0.97, 1], ['wisp', 0.03, 1.35]] },
  garden: { group: 'escapades', crew: 'gnomes',  carriers: [['gnome', 0.95, 0.95], ['snail', 0.05, 0.45]] },
  // Saisons
  spring: { group: 'seasons', crew: 'ants',  carriers: [['ant', 1, 1]] },
  summer: { group: 'seasons', crew: 'ants',  carriers: [['ant', 1, 1]] },
  autumn: { group: 'seasons', crew: 'foxes', carriers: [['fox', 0.97, 1.1], ['hedgehog', 0.03, 0.55]] },
  winter: { group: 'seasons', crew: 'ants',  carriers: [['ant', 1, 1]] },
  // Festif
  halloween: { group: 'festive', crew: 'ghosts', carriers: [['ghost', 0.97, 1], ['bat', 0.03, 1.4]] },
  xmas:      { group: 'festive', crew: 'elves',  carriers: [['elf', 0.97, 1], ['snowman', 0.03, 0.5]] },
};

// Tire au sort l'espèce d'un porteur selon les probabilités du thème.
export function pickCarrier(skin, rnd = Math.random) {
  const list = SKINS[skin].carriers;
  let x = rnd();
  for (const [kind, p, spd] of list) {
    if ((x -= p) <= 0) return { kind, spd };
  }
  const [kind, , spd] = list[0];
  return { kind, spd };
}
