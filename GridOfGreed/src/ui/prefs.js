// Préférences globales (langue, thème, sons) gardées dans le navigateur.
export const LANGS = ["fr", "en"];
export const THEMES = ["night", "palace", "ruby", "poker", "jackpot", "wizard"];

export const getPref = (key, fallback) => {
  try { return localStorage.getItem(`gog-${key}`) ?? fallback; } catch { return fallback; }
};
export const setPref = (key, value) => {
  try { localStorage.setItem(`gog-${key}`, value); } catch { /* stockage indisponible */ }
};
export const soundEnabled = () => getPref("sound", "on") === "on";

// Migration unique des anciens ids : casino→palace, night→wizard (palettes renommées).
// Le drapeau themeV2 évite de re-mapper un "night" choisi APRÈS la migration
// (« night » désigne désormais une nouvelle palette bleutée).
export const readTheme = () => {
  const stored = getPref("theme", null);
  if (getPref("themeV2", null) === null) {
    setPref("themeV2", "1");
    if (stored === "casino") return "palace";
    if (stored === "night") return "wizard";
  }
  return stored ?? THEMES[0];
};