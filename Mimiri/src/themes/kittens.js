// "Kittens" theme: play with the kittens to wake them all. on = sleeping (to fix), off = awake.
// Colors live in theme-kittens.css; texts in locales/ (theme.kittens.*); drawing here.
import { cat, BIG_EYES, EYE, NOSE } from "./cat.js";

export default {
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
