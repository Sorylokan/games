// UI language: loads locales/<lang>.json, provides t(), translates the HTML
// (data-i18n: text, data-i18n-title: tooltip + aria-label, data-i18n-ph: placeholder).
import { createTranslator, loadLocale, getLocale, DEFAULT_LOCALE } from '../i18n.js';
import { STORAGE } from '../config.js';
import { store } from '../storage.js';
import { $ } from '../dom.js';

// Available languages: add locales/xx.json and a line here.
export const LANGS = { fr: 'Français', en: 'English' };

let translate = (key) => key;
const cache = {};

export const t = (key, vars) => translate(key, vars);

async function messagesFor(lang) {
  if (!cache[lang]) cache[lang] = await loadLocale(lang);
  return cache[lang];
}

// Saved choice, else the browser language if available, else French.
export function initialLang() {
  const saved = store.get(STORAGE.lang, null);
  if (LANGS[saved]) return saved;
  const nav = getLocale();
  return LANGS[nav] ? nav : DEFAULT_LOCALE;
}

export async function setLang(lang) {
  if (!LANGS[lang]) lang = DEFAULT_LOCALE;
  const messages = { [DEFAULT_LOCALE]: await messagesFor(DEFAULT_LOCALE), [lang]: await messagesFor(lang) };
  translate = createTranslator({ locale: lang, messages });
  document.documentElement.lang = lang;
  $('lang').value = lang;
  store.set(STORAGE.lang, lang);
  applyTexts();
}

export function applyTexts(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const text = t(el.dataset.i18nTitle);
    el.title = text;
    el.setAttribute('aria-label', text);
  });
}

export function initLangSelect(onChange) {
  const select = $('lang');
  for (const [code, label] of Object.entries(LANGS)) {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = label; // each language named in itself
    select.append(opt);
  }
  select.addEventListener('change', (e) => onChange(e.target.value));
}
