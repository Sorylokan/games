// Global preferences (language, theme, sound) in localStorage.
export const LANGS = ["fr", "en"];
export const THEMES = ["night", "palace", "ruby", "poker", "jackpot", "wizard"];

export const getPref = (key, fallback) => {
  try { return localStorage.getItem(`gog-${key}`) ?? fallback; } catch { return fallback; }
};
export const setPref = (key, value) => {
  try { localStorage.setItem(`gog-${key}`, value); } catch { /* storage unavailable */ }
};
export const soundEnabled = () => getPref("sound", "on") === "on";

// One-time migration of renamed themes: casino→palace, night→wizard. The themeV2 flag keeps a
// "night" picked after the migration (now a new blue palette) from being remapped.
export const readTheme = () => {
  const stored = getPref("theme", null);
  if (getPref("themeV2", null) === null) {
    setPref("themeV2", "1");
    if (stored === "casino") return "palace";
    if (stored === "night") return "wizard";
  }
  return stored ?? THEMES[0];
};