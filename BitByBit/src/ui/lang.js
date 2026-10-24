// Langue de l'interface : charge le fichier locales/<langue>.json, fournit t(), et traduit le HTML
// (attributs data-i18n pour le texte, data-i18n-title pour l'infobulle et le libellé d'accessibilité).
import { createTranslator, loadLocale, getLocale, DEFAULT_LOCALE } from '../i18n.js';
import { STORAGE } from '../config.js';
import { store } from '../storage.js';
import { $ } from '../dom.js';

// Langues proposées. Pour en ajouter une : un fichier locales/xx.json et une ligne ici.
export const LANGS = { fr: 'Français', en: 'English' };

let translate = (key) => key;
const cache = {};

export const t = (key, vars) => translate(key, vars);

async function messagesFor(lang) {
  if (!cache[lang]) cache[lang] = await loadLocale(lang);
  return cache[lang];
}

// Langue de départ : celle choisie avant, sinon celle du navigateur si on l'a, sinon le français.
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
    opt.textContent = label; // chaque langue écrite dans sa propre langue
    select.append(opt);
  }
  select.addEventListener('change', (e) => onChange(e.target.value));
}
