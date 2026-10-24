// Thème « Jardin fleuri » : on arrose les boutons pour faire éclore tout le jardin.
// render(on, idx) : on = 1 = bouton fermé (à faire éclore), on = 0 = fleur éclose (gagné).
// Les couleurs de la page vivent dans theme-jardin.css ; ici, les textes et le dessin.

const PETALS = ["#F29F58", "#ff8fa3", "#f6d28b", "#d9a7ff"]; // une couleur de fleur par case
const LEAF = "#2f7a4d";
const LEAF_DARK = "#235c3a";
const EYE = "#2b2236";

// Tige et deux feuilles, communes aux deux états.
const STEM = `
  <path d="M50 62 Q49 80 50 97" fill="none" stroke="${LEAF}" stroke-width="5" stroke-linecap="round"/>
  <path d="M50 84 Q34 82 27 70 Q43 68 50 84 Z" fill="${LEAF}"/>
  <path d="M50 88 Q66 86 73 74 Q57 72 50 88 Z" fill="${LEAF}"/>
  <path d="M50 84 Q38 77 30 71" fill="none" stroke="${LEAF_DARK}" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M50 88 Q62 81 70 75" fill="none" stroke="${LEAF_DARK}" stroke-width="1.6" stroke-linecap="round"/>`;

export default {
  title: "Jardin fleuri",
  goal: "Arrose un bouton pour le faire éclore… mais attention, ça change aussi l'état des fleurs voisines !",
  leftLabel: "Boutons",
  win: "Tout le jardin est en fleurs, bravo ! 🌸",
  hint: "Arroser une fleur l'ouvre (ou la referme), ainsi que ses 4 voisines.",
  ariaOn: "Bouton fermé",
  ariaOff: "Fleur éclose",

  render(on, idx) {
    const c = PETALS[idx % PETALS.length];
    if (on) {
      // Bouton fermé, un peu penché, sans visage, avec un croissant de lune.
      return `<svg viewBox="0 0 100 100" aria-hidden="true">
        ${STEM}
        <g transform="rotate(-7 50 64)">
          <path d="M50 16 Q70 38 64 56 Q50 68 36 56 Q30 38 50 16 Z" fill="${c}" opacity=".78"/>
          <path d="M50 16 Q46 40 50 64" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="2" stroke-linecap="round"/>
          <path d="M36 56 Q50 72 64 56 Q60 68 50 70 Q40 68 36 56 Z" fill="${LEAF}"/>
        </g>
        <path transform="translate(168 0) scale(-1 1)" d="M82.7 16.6 A10.5 10.5 0 1 0 94.0 30.3 A9 9 0 1 1 82.7 16.6 Z" fill="#c6d195" stroke="#c6d195" stroke-width="3" stroke-linejoin="round"/>
      </svg>`;
    }
    // Fleur éclose : six pétales, cœur doré avec un petit visage content.
    const petals = [0, 60, 120, 180, 240, 300]
      .map((a) => `<ellipse cx="50" cy="26" rx="11.5" ry="17" fill="${c}" transform="rotate(${a} 50 44)"/>`)
      .join("");
    return `<svg viewBox="0 0 100 100" class="wig" aria-hidden="true">
      ${STEM}
      ${petals}
      <circle cx="50" cy="44" r="13.5" fill="#ffd36b"/>
      <ellipse cx="42.5" cy="49" rx="3" ry="2" fill="#ff8fa3" opacity=".8"/>
      <ellipse cx="57.5" cy="49" rx="3" ry="2" fill="#ff8fa3" opacity=".8"/>
      <path d="M42 41 Q45.5 37 49 41" fill="none" stroke="${EYE}" stroke-width="2.3" stroke-linecap="round"/>
      <path d="M51 41 Q54.5 37 58 41" fill="none" stroke="${EYE}" stroke-width="2.3" stroke-linecap="round"/>
      <path d="M45 48 Q50 54 55 48 Z" fill="#d9546e" stroke="${EYE}" stroke-width="1.8" stroke-linejoin="round"/>
      <g class="z" fill="#fff6c9"><circle cx="86" cy="18" r="2.6"/><circle cx="14" cy="30" r="2"/><circle cx="90" cy="46" r="1.8"/></g>
    </svg>`;
  }
};