// localStorage that never throws (private browsing, blocked storage…).

// Renames the keys from the game's first name ("Petite Colonie", "pc-…") once; runs on import, before anything is read. Can go once old players have reloaded.
try {
  for (const old of Object.keys(localStorage).filter((k) => k.startsWith('pc-'))) {
    const key = 'bbb-' + old.slice(3);
    if (localStorage.getItem(key) === null) localStorage.setItem(key, localStorage.getItem(old));
    localStorage.removeItem(old);
  }
} catch { /* storage unavailable */ }

export const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v == null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  },
};
