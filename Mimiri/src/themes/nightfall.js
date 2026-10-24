// Thème « Nightfall » : la tombée de la nuit — des étoiles douces à éteindre.
// render(on, idx) : on = 1 = étoile allumée (à éteindre), on = 0 = éteinte (gagné).
// Les couleurs vivent dans theme-nightfall.css ; ici, uniquement les textes et le dessin.
//
// Étoile reprise de src/star.svg (path principal, forme organique douce), intégrée
// telle quelle et recentrée dans la case via transform. Allumée = pleine, couleur
// douce unique ; éteinte = contour. Pas de halo, pas de brillance.
const ON = "#f4d47c";      // jaune lune doux (rappelle --accent de theme-nightfall.css)
const OFF = "#3a4266";     // contour éteint

// Path exact de star.svg (« Color Fill 1 copy »), viewBox source 550×542.
// On l'affiche dans une viewBox 550×542 mise à l'échelle et centrée dans la case.
const STAR_PATH = "m116.87 377c24.26-87.47-29.55-71.65-71.3-124.95-34.54-44.11 24.99-82.33 107.32-86.74 50.27-2.69 38.03-64.04 66.15-104.37 24.83-35.62 83.79-42.63 120.54 36.02 33.63 71.96 21.97 49.2 88.21 47.04 67.62-2.21 102.17 38.95 67.62 93.35-22.96 36.14-59.48 56.13-58.8 80.85 0.67 24.72 45.14 78.86 38.95 107.31-6.18 28.46-47.81 48.38-105.84 23.52-58.03-24.86-69.35-45.4-94.72-44.83-25.37 0.57-48.61 85.26-121.38 87.47-33.64 1.02-55.75-46.15-36.75-114.67z";

// L'étoile source occupe environ x:[45,530] y:[18,506] dans sa viewBox → on la
// recadre : translate pour la centrer, puis viewBox 100×100 côté case.
const VIEW = "0 0 550 542";
const FRAME = `translate(0 -20)`; // léger recentrage vertical de l'étoile dans son cadre
const STAR_ON = `<svg viewBox="${VIEW}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g transform="${FRAME}"><path d="${STAR_PATH}" fill="${ON}"/></g></svg>`;
const STAR_OFF = `<svg viewBox="${VIEW}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g transform="${FRAME}"><path d="${STAR_PATH}" fill="none" stroke="${OFF}" stroke-width="22" stroke-linejoin="round"/></g></svg>`;

export default {
  title: "Nightfall",
  goal: "Éteins une étoile… mais attention, ça bascule aussi ses voisines !",
  leftLabel: "Allumées",
  win: "Toutes les étoiles sont éteintes, bonne nuit !",
  hint: "Éteindre une étoile la bascule, ainsi que ses 4 voisines.",
  ariaOn: "Étoile allumée",
  ariaOff: "Étoile éteinte",

  // Traductions (les champs ci-dessus = français, référence utilisée par les tests).
  texts: {
    en: {
      title: "Nightfall",
      goal: "Switch off a star… but watch out, it also flips its neighbours!",
      leftLabel: "Still on",
      win: "All the stars are out, good night!",
      hint: "Switching a star flips it, along with its 4 neighbours.",
      ariaOn: "Star lit",
      ariaOff: "Star out"
    }
  },

  render(on) {
    return on ? STAR_ON : STAR_OFF;
  }
};
