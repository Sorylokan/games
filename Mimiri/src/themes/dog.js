// Dessin du chien partagé par les thèmes « chiens » : tête ronde, longues
// oreilles tombantes (ou dressées), truffe, petites pattes, joues roses.
// Même contrat que cat.js : chaque thème fournit seulement le visage.

export const FURS = ["#c98d5a", "#9aa3c7", "#E8C9A0", "#8d6e5a"];
export const EYE = "#2b2236";
export const NOSE = `<ellipse cx="50" cy="63" rx="5.2" ry="4" fill="#3a2c3f"/>`;

// Grands yeux brillants (chien réveillé)
export const BIG_EYES = `
  <ellipse cx="32" cy="54" rx="7.5" ry="9" fill="${EYE}"/><ellipse cx="68" cy="54" rx="7.5" ry="9" fill="${EYE}"/>
  <circle cx="34.8" cy="50.5" r="3.2" fill="#fff"/><circle cx="29.5" cy="58" r="1.6" fill="#fff"/>
  <circle cx="70.8" cy="50.5" r="3.2" fill="#fff"/><circle cx="65.5" cy="58" r="1.6" fill="#fff"/>`;

// Oreilles légèrement plus sombres que le pelage
const EARS = ["#a9713f", "#7c8291", "#cfa878", "#6f5546"];

// idx   : position de la case (varie le pelage)
// face  : yeux, nez, gueule... (SVG) fournis par le thème
// blush : opacité des joues roses
// opts.ears : "up" (oreilles dressées) ou "down" (longues oreilles tombantes)
// opts.wig  : le chien se balance doucement
export function dog(idx, face, blush, opts = {}) {
  const fur = FURS[idx % FURS.length];
  const ear = EARS[idx % EARS.length];
  const ears = opts.ears === "up"
    ? `<path d="M18 46 Q10 14 30 4 Q36 2 38 10 L42 30 Z" fill="${ear}"/>
       <path d="M82 46 Q90 14 70 4 Q64 2 62 10 L58 30 Z" fill="${ear}"/>`
    : `<path d="M16 38 Q2 58 8 82 Q12 94 22 88 Q30 82 26 60 Q23 45 28 34 Z" fill="${ear}"/>
       <path d="M84 38 Q98 58 92 82 Q88 94 78 88 Q70 82 74 60 Q77 45 72 34 Z" fill="${ear}"/>`;
  const spot = idx % 2 === 0
    ? `<ellipse cx="30" cy="48" rx="13" ry="15" fill="rgba(0,0,0,.18)"/>`
    : "";
  return `<svg viewBox="0 0 100 100" class="${opts.wig ? "wig" : ""}" aria-hidden="true">
    <ellipse cx="34" cy="89" rx="10" ry="6.5" fill="${fur}"/>
    <ellipse cx="66" cy="89" rx="10" ry="6.5" fill="${fur}"/>
    <g stroke="rgba(0,0,0,.2)" stroke-width="1.6" stroke-linecap="round">
      <line x1="31" y1="88" x2="31" y2="92"/><line x1="37" y1="88" x2="37" y2="92"/>
      <line x1="63" y1="88" x2="63" y2="92"/><line x1="69" y1="88" x2="69" y2="92"/></g>
    ${ears}
    <ellipse cx="50" cy="56" rx="38" ry="32" fill="${fur}"/>
    ${spot}
    <ellipse cx="50" cy="72" rx="16" ry="11" fill="rgba(255,255,255,.35)"/>
    <ellipse cx="23" cy="68" rx="7" ry="4.5" fill="#ff8fa3" opacity="${blush}"/>
    <ellipse cx="77" cy="68" rx="7" ry="4.5" fill="#ff8fa3" opacity="${blush}"/>
    ${face}
  </svg>`;
}
