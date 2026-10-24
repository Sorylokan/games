// Préférences et sauvegardes gardées dans le navigateur (préfixe mimiri-).
export const getPref = (key, fallback) => {
  try { return localStorage.getItem(`mimiri-${key}`) ?? fallback; } catch { return fallback; }
};
export const setPref = (key, value) => {
  try { localStorage.setItem(`mimiri-${key}`, value); } catch { /* stockage indisponible */ }
};

export const getJSON = (key, fallback) => {
  try { return JSON.parse(getPref(key, "null")) ?? fallback; } catch { return fallback; }
};
export const setJSON = (key, value) => setPref(key, JSON.stringify(value));
