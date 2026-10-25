// i18n: the same file in every game, only the settings below differ.
// Texts live in locales/<lang>.json (flat keys, {variables}); missing keys fall back to DEFAULT_LOCALE.
// To add a language: locales/xx.json + one line in LANGS (guide: TRANSLATING.md at the repository root).

export const LANGS = { fr: "Français", en: "English" }; // each language named in itself
export const DEFAULT_LOCALE = "en"; // reference language: its file is complete
const STORAGE_KEY = "gog-lang";
const LEGACY_KEYS = []; // older storage keys, still read

// locales/ is resolved from this file (src/i18n.js), not from the page.
const LOCALES_URL = new URL("../locales", import.meta.url).href;

const replaceVariables = (text, vars) =>
  text.replace(/\{([^}]+)\}/g, (_, k) => (vars[k] === undefined ? `{${k}}` : String(vars[k])));

// t(key, vars) → text. t.has(key) tells whether a translation exists.
export const createTranslator = ({ locale, fallbackLocale = DEFAULT_LOCALE, messages }) => {
  const active = messages[locale] ?? {};
  const fallback = messages[fallbackLocale] ?? {};
  const t = (key, vars = {}) => {
    const text = active[key] ?? fallback[key];
    if (text === undefined) return replaceVariables(fallback["errors.missingTranslation"] ?? key, { key, ...vars });
    return replaceVariables(text, vars);
  };
  t.has = (key) => key in active || key in fallback;
  return t;
};

export const loadLocale = async (locale, { baseUrl = LOCALES_URL, fetcher = fetch } = {}) => {
  const response = await fetcher(`${baseUrl}/${locale}.json`);
  if (!response.ok) throw new Error(`Unable to load locale: ${locale}`);
  return response.json();
};

// Browser language code ("fr-CA" → "fr"), supported or not.
export const getLocale = () =>
  (typeof navigator === "undefined" ? "" : navigator.language?.split("-")[0]) || DEFAULT_LOCALE;

const readStorage = (key) => { try { return localStorage.getItem(key); } catch { return null; } };

// Saved choice, else the browser language if available, else the reference language.
export function initialLocale() {
  for (const key of [STORAGE_KEY, ...LEGACY_KEYS]) {
    const saved = readStorage(key)?.replace(/"/g, ""); // some games used to store it as JSON
    if (LANGS[saved]) return saved;
  }
  return LANGS[getLocale()] ? getLocale() : DEFAULT_LOCALE;
}

export function saveLocale(locale) {
  try { localStorage.setItem(STORAGE_KEY, locale); } catch { /* storage unavailable */ }
}

// Translator for a language (+ the reference one). Files are loaded once.
const cache = {};
export async function loadTranslator(locale) {
  const get = (l) => (cache[l] ??= loadLocale(l).catch(() => ({})));
  const [active, fallback] = await Promise.all([get(locale), get(DEFAULT_LOCALE)]);
  return createTranslator({ locale, messages: { [locale]: active, [DEFAULT_LOCALE]: fallback } });
}

// Translates the HTML: data-i18n (text), data-i18n-html (text with tags), data-i18n-title (tooltip + aria-label),
// data-i18n-aria (aria-label), data-i18n-ph (placeholder), data-i18n-label (label attribute, e.g. <optgroup>).
export function applyTexts(t, root = document) {
  const each = (attr, set) => root.querySelectorAll(`[${attr}]`).forEach((el) => set(el, t(el.getAttribute(attr))));
  each("data-i18n", (el, s) => { el.textContent = s; });
  each("data-i18n-html", (el, s) => { el.innerHTML = s; });
  each("data-i18n-title", (el, s) => { el.title = s; el.setAttribute("aria-label", s); });
  each("data-i18n-aria", (el, s) => { el.setAttribute("aria-label", s); });
  each("data-i18n-ph", (el, s) => { el.placeholder = s; });
  each("data-i18n-label", (el, s) => { el.setAttribute("label", s); });
}

// Fills a <select> from LANGS.
export function fillLangSelect(select, current) {
  select.replaceChildren(...Object.entries(LANGS).map(([code, label]) => new Option(label, code, false, code === current)));
}
