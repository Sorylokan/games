// Dessin du chat partagé par les thèmes « chats » : tête ronde, grandes oreilles,
// petites pattes, joues roses. Chaque thème fournit seulement le visage.

export const FURS = ["#F29F58", "#9aa3c7", "#E8C9A0", "#d9788f"];
export const EYE = "#2b2236";
export const NOSE = `<ellipse cx="50" cy="65" rx="3.8" ry="2.8" fill="#e8708a"/>`;

// Grands yeux brillants (chat réveillé)
export const BIG_EYES = `
  <ellipse cx="32" cy="56" rx="7.5" ry="9" fill="${EYE}"/><ellipse cx="68" cy="56" rx="7.5" ry="9" fill="${EYE}"/>
  <circle cx="34.8" cy="52.5" r="3.2" fill="#fff"/><circle cx="29.5" cy="60" r="1.6" fill="#fff"/>
  <circle cx="70.8" cy="52.5" r="3.2" fill="#fff"/><circle cx="65.5" cy="60" r="1.6" fill="#fff"/>`;

// idx   : position de la case (varie le pelage)
// face  : yeux, nez, bouche... (SVG) fournis par le thème
// blush : opacité des joues roses
// opts.ears : "up" (grandes oreilles dressées) ou "down" (oreilles plus discrètes)
// opts.wig  : le chat se balance doucement
export function cat(idx, face, blush, opts = {}) {
  const fur = FURS[idx % FURS.length];
  const ears = opts.ears === "up"
    ? `<path d="M13 52 Q12 18 20 6 Q24 2 29 6 L50 26 Z" fill="${fur}"/>
       <path d="M87 52 Q88 18 80 6 Q76 2 71 6 L50 26 Z" fill="${fur}"/>
       <path d="M21 42 Q20 20 24 12 Q27 10 30 14 L40 28 Z" fill="#f6b8c4"/>
       <path d="M79 42 Q80 20 76 12 Q73 10 70 14 L60 28 Z" fill="#f6b8c4"/>`
    : `<path d="M16 50 Q9 10 46 25 Z" fill="${fur}"/><path d="M84 50 Q91 10 54 25 Z" fill="${fur}"/>
       <path d="M23 42 Q19 20 39 28 Z" fill="#f6b8c4"/><path d="M77 42 Q81 20 61 28 Z" fill="#f6b8c4"/>`;
  const stripes = idx % 3 === 0
    ? `<g stroke="rgba(0,0,0,.22)" stroke-width="3" stroke-linecap="round">
         <line x1="50" y1="24" x2="50" y2="33"/><line x1="40" y1="26" x2="42" y2="33"/><line x1="60" y1="26" x2="58" y2="33"/></g>`
    : "";
  return `<svg viewBox="0 0 100 100" class="${opts.wig ? "wig" : ""}" aria-hidden="true">
    <ellipse cx="34" cy="89" rx="10" ry="6.5" fill="${fur}"/>
    <ellipse cx="66" cy="89" rx="10" ry="6.5" fill="${fur}"/>
    <g stroke="rgba(0,0,0,.2)" stroke-width="1.6" stroke-linecap="round">
      <line x1="31" y1="88" x2="31" y2="92"/><line x1="37" y1="88" x2="37" y2="92"/>
      <line x1="63" y1="88" x2="63" y2="92"/><line x1="69" y1="88" x2="69" y2="92"/></g>
    ${ears}
    <ellipse cx="50" cy="55" rx="40" ry="33" fill="${fur}"/>
    ${stripes}
    <ellipse cx="23" cy="66" rx="7" ry="4.5" fill="#ff8fa3" opacity="${blush}"/>
    <ellipse cx="77" cy="66" rx="7" ry="4.5" fill="#ff8fa3" opacity="${blush}"/>
    ${face}
    <g stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".65">
      <line x1="6" y1="58" x2="19" y2="60"/><line x1="6" y1="66" x2="19" y2="65"/>
      <line x1="94" y1="58" x2="81" y2="60"/><line x1="94" y1="66" x2="81" y2="65"/></g>
  </svg>`;
}
