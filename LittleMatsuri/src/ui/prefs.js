// Theme and screen wake lock, both behind the ⚙ menu. The language is handled by src/i18n.js.
import { THEMES as ALL } from "./themes/index.js";

const THEMES = Object.keys(ALL);
const THEME_KEY = "matsuri-theme";
const AWAKE_KEY = "matsuri-awake";

const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key, value) => { try { localStorage.setItem(key, value); } catch {} };

// Option labels carry data-i18n, so applyTexts translates them with the rest of the page.
export function initTheme(select, onChange) {
  select.innerHTML = THEMES.map((k) => `<option value="${k}" data-i18n="theme.${k}"></option>`).join("");
  const saved = read(THEME_KEY);
  select.value = THEMES.includes(saved) ? saved : THEMES[0];
  document.documentElement.dataset.theme = select.value;
  select.addEventListener("change", () => {
    document.documentElement.dataset.theme = select.value;
    write(THEME_KEY, select.value);
    onChange();
  });
}

export const theme = () => document.documentElement.dataset.theme;

let lock = null;

async function keepAwake(on) {
  if (on && !document.hidden) {
    if (lock) return;
    try {
      lock = await navigator.wakeLock.request("screen");
      lock.addEventListener("release", () => { lock = null; });
    } catch { /* refused: battery saver, or no tap yet on some browsers */ }
  } else if (lock) {
    lock.release();
    lock = null;
  }
}

// Phones and tablets only: a long think over a big grid is enough for a phone to dim and lock, a computer screen doesn't.
export function initAwake(checkbox) {
  if (!("wakeLock" in navigator) || !window.matchMedia?.("(pointer: coarse)").matches) return;
  checkbox.closest("label").hidden = false;
  checkbox.checked = read(AWAKE_KEY) !== "off";
  checkbox.addEventListener("change", () => {
    write(AWAKE_KEY, checkbox.checked ? "on" : "off");
    keepAwake(checkbox.checked);
  });
  // The browser drops the lock whenever the tab is hidden, so it's taken again on return (and on the first tap, for browsers that refuse it before).
  document.addEventListener("visibilitychange", () => keepAwake(checkbox.checked));
  window.addEventListener("pointerdown", () => keepAwake(checkbox.checked), { once: true });
  keepAwake(checkbox.checked);
}
