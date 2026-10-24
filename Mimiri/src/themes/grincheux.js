// Thème « Chats grincheux » : on fait des câlins pour redonner le sourire à tout le monde.
// render(on, idx) : on = 1 = chat grincheux (à corriger), on = 0 = chat joyeux (gagné).
// Les couleurs vivent dans theme-grincheux.css ; ici, uniquement les textes et le dessin.
import { cat, EYE, NOSE, FURS } from "./cat.js";

export default {
  title: "Chats grincheux",
  goal: "Fais un câlin à un chat pour lui redonner le sourire… mais ça change aussi l'humeur de ses voisins !",
  leftLabel: "Grincheux",
  win: "Tous les chats sourient, bravo ! 😸",
  hint: "Un câlin change l'humeur du chat et de ses 4 voisins.",
  ariaOn: "Chat grincheux",
  ariaOff: "Chat joyeux",

  // Traductions (les champs ci-dessus = français, référence utilisée par les tests).
  texts: {
    en: {
      title: "Grumpy Cats",
      goal: "Pet a cat to make it smile again… but it also changes its neighbours' mood!",
      leftLabel: "Grumpy",
      win: "All the cats are smiling, well done! 😸",
      hint: "A cuddle changes the mood of the cat and its 4 neighbours.",
      ariaOn: "Grumpy cat",
      ariaOff: "Happy cat"
    }
  },

  render(on, idx) {
    const fur = FURS[idx % FURS.length];
    if (on) {
      return cat(idx, `
        <ellipse cx="32" cy="57" rx="7.5" ry="9" fill="${EYE}"/><ellipse cx="68" cy="57" rx="7.5" ry="9" fill="${EYE}"/>
        <circle cx="34.5" cy="61" r="2.4" fill="#fff"/><circle cx="70.5" cy="61" r="2.4" fill="#fff"/>
        <polygon points="21,42 43,42 43,57 21,50" fill="${fur}"/>
        <polygon points="79,42 57,42 57,57 79,50" fill="${fur}"/>
        <line x1="20" y1="49.5" x2="44" y2="57.5" stroke="${EYE}" stroke-width="3" stroke-linecap="round"/>
        <line x1="80" y1="49.5" x2="56" y2="57.5" stroke="${EYE}" stroke-width="3" stroke-linecap="round"/>
        ${NOSE}
        <path d="M42 77 Q50 69 58 77" fill="none" stroke="${EYE}" stroke-width="2.8" stroke-linecap="round"/>
        <g class="cloud" fill="#6B728E"><ellipse cx="50" cy="9" rx="10" ry="5"/><ellipse cx="43" cy="12" rx="7" ry="4"/><ellipse cx="58" cy="12" rx="7" ry="4"/></g>`,
        0.25, { ears: "down", wig: true });
    }
    return cat(idx, `
      <path d="M24 59 Q32 49 40 59" fill="none" stroke="${EYE}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M60 59 Q68 49 76 59" fill="none" stroke="${EYE}" stroke-width="3.4" stroke-linecap="round"/>
      ${NOSE}
      <path d="M42 70 Q50 84 58 70 Z" fill="#d9546e" stroke="${EYE}" stroke-width="2.4" stroke-linejoin="round"/>
      <ellipse cx="50" cy="75.5" rx="4" ry="2.3" fill="#ff9fb2"/>
      <g class="z" fill="#ff8fa3" font-family="Trebuchet MS, sans-serif" font-weight="bold">
        <text x="44" y="16" font-size="13">♥</text><text x="57" y="10" font-size="9">♥</text></g>`,
      0.95, { ears: "up" });
  }
};
