// A theme = <key>.js (its piece, and whether a win runs a wave) + <key>.css (colors and animations, linked in index.html) + "theme.<key>" and "<key>.*" texts in locales/. Order here = order in the ⚙ menu.
import * as classic from "./classic.js";
import * as garden from "./garden.js";
import * as flowers from "./flowers.js";
import * as fox from "./fox.js";

export const THEMES = { classic, garden, flowers, fox };
