// Lecture / écriture dans localStorage, sans jamais planter (navigation privée, stockage bloqué…).

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
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* stockage indisponible : tant pis */ }
  },
};
