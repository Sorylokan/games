// Thème « Chatons câlins » : on joue avec les chatons pour les réveiller tous.
// render(on, idx) : on = 1 = chaton endormi (à réveiller), on = 0 = chaton réveillé (gagné).
// Les couleurs vivent dans theme-chatons.css ; ici, uniquement les textes et le dessin.
import { cat, BIG_EYES, EYE, NOSE } from "./cat.js";

export default {
  title: "Chatons câlins",
  goal: "Joue avec un chaton pour le réveiller… mais attention, ça change aussi l'état de ses voisins !",
  leftLabel: "Endormis",
  win: "Tous les chatons sont réveillés et pleins d'énergie, bravo ! 🐾",
  hint: "Jouer avec un chaton réveille (ou endort) le chaton et ses 4 voisins.",
  ariaOn: "Chaton endormi",
  ariaOff: "Chaton réveillé",

  // Traductions (les champs ci-dessus = français, référence utilisée par les tests).
  texts: {
    en: {
      title: "Cuddly Kittens",
      goal: "Play with a kitten to wake it up… but watch out, it also flips its neighbours!",
      leftLabel: "Asleep",
      win: "All the kittens are awake and full of energy, well done! 🐾",
      hint: "Playing with a kitten wakes it up (or puts it back to sleep), along with its 4 neighbours.",
      ariaOn: "Sleeping kitten",
      ariaOff: "Awake kitten"
    }
  },

  render(on, idx) {
    if (!on) {
      return cat(idx, `${BIG_EYES}${NOSE}
        <path d="M43 71 Q46.5 77 50 71 Q53.5 77 57 71" fill="none" stroke="${EYE}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
        0.55, { ears: "up", wig: true });
    }
    return cat(idx, `
      <path d="M24 57 Q32 65 40 57" fill="none" stroke="${EYE}" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M60 57 Q68 65 76 57" fill="none" stroke="${EYE}" stroke-width="3.2" stroke-linecap="round"/>
      ${NOSE}
      <path d="M46 71 Q50 74 54 71" fill="none" stroke="${EYE}" stroke-width="2.4" stroke-linecap="round"/>
      <g class="z" fill="#b6b9ff" font-family="Trebuchet MS, sans-serif" font-weight="bold">
        <text x="74" y="22" font-size="16">z</text><text x="86" y="9" font-size="11">z</text></g>`,
      0.8, { ears: "down" });
  }
};
