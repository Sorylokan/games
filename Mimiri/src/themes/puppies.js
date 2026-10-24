// Thème « Chiots câlins » : on joue avec les chiots pour les réveiller tous.
// render(on, idx) : on = 1 = chiot endormi (à réveiller), on = 0 = chiot réveillé (gagné).
// Les couleurs vivent dans theme-puppies.css ; ici, uniquement les textes et le dessin.
import { dog, BIG_EYES, EYE, NOSE } from "./dog.js";

export default {
  title: "Chiots câlins",
  goal: "Joue avec un chiot pour le réveiller… mais attention, ça change aussi l'état de ses voisins !",
  leftLabel: "Endormis",
  win: "Tous les chiots sont réveillés et prêts à jouer, bravo ! 🐶",
  hint: "Jouer avec un chiot le réveille (ou l'endort), ainsi que ses 4 voisins.",
  ariaOn: "Chiot endormi",
  ariaOff: "Chiot réveillé",

  // Traductions (les champs ci-dessus = français, référence utilisée par les tests).
  texts: {
    en: {
      title: "Cuddly Puppies",
      goal: "Play with a puppy to wake it up… but watch out, it also flips its neighbours!",
      leftLabel: "Asleep",
      win: "All the puppies are awake and ready to play, well done! 🐶",
      hint: "Playing with a puppy wakes it up (or puts it back to sleep), along with its 4 neighbours.",
      ariaOn: "Sleeping puppy",
      ariaOff: "Awake puppy"
    }
  },

  render(on, idx) {
    if (!on) {
      // Réveillé : grands yeux, gueule ouverte, langue qui pend, oreilles soulevées.
      return dog(idx, `${BIG_EYES}${NOSE}
        <path d="M50 67 L50 71" stroke="${EYE}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M41 71 Q50 80 59 71 Q50 87 41 71 Z" fill="#7a2f3d"/>
        <path d="M45.5 75 Q50 80 54.5 75 Q54 87 50 87.5 Q46 87 45.5 75 Z" fill="#ff7f9a"/>
        <path d="M50 76 L50 83" stroke="#e0607f" stroke-width="1.4" stroke-linecap="round"/>`,
        0.6, { ears: "up", wig: true });
    }
    // Endormi : yeux fermés, petite bouche, oreilles qui tombent, « z » qui flottent.
    return dog(idx, `
      <path d="M25 50 Q33 58 41 50" fill="none" stroke="${EYE}" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M59 50 Q67 58 75 50" fill="none" stroke="${EYE}" stroke-width="3.2" stroke-linecap="round"/>
      ${NOSE}
      <path d="M50 67 L50 70" stroke="${EYE}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M44 72 Q47 75 50 70 Q53 75 56 72" fill="none" stroke="${EYE}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <g class="z" fill="#b6b9ff" font-family="Trebuchet MS, sans-serif" font-weight="bold">
        <text x="74" y="20" font-size="16">z</text><text x="86" y="8" font-size="11">z</text></g>`,
      0.85, { ears: "down" });
  }
};
