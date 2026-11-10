// Classique: the matsuri lantern, same drawing and coordinates as assets/icon.svg, cropped to the lantern.
const PETAL = "M0 -0.1C-0.42 -0.35 -0.4 -0.9 -0.12 -0.98L0 -0.82L0.12 -0.98C0.4 -0.9 0.42 -0.35 0 -0.1z";

export const piece =
  '<svg viewBox="128 48 256 424" aria-hidden="true">' +
  '<path class="string" d="M256 52v52M256 430v18"/>' +
  '<ellipse class="body" cx="256" cy="265" rx="118" ry="148"/>' +
  '<path class="ribs" d="M165 170h182M144 218h224M145 314h222M167 362h178"/>' +
  `<g class="flower" transform="translate(256 265) scale(62)">${[0, 72, 144, 216, 288].map((a) => `<path d="${PETAL}" transform="rotate(${a})"/>`).join("")}<circle class="heart" r="0.14"/></g>` +
  '<rect class="cap" x="188" y="100" width="136" height="30" rx="10"/><rect class="cap" x="188" y="400" width="136" height="30" rx="10"/>' +
  '<path class="cap" d="M244 448h24l-4 20h-16z"/>' +
  "</svg>";

export const wave = false;
