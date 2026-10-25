// UI language for the game and the editor: wraps src/i18n.js (language list, storage, HTML translation).
import { LANGS, DEFAULT_LOCALE, loadTranslator, initialLocale, saveLocale, applyTexts as translateHtml, fillLangSelect } from '../i18n.js';
import { $ } from '../dom.js';

export { LANGS };

let translate = (key) => key;

export const t = (key, vars) => translate(key, vars);
export const initialLang = initialLocale;

export async function setLang(lang) {
  if (!LANGS[lang]) lang = DEFAULT_LOCALE;
  translate = await loadTranslator(lang);
  document.documentElement.lang = lang;
  $('lang').value = lang;
  saveLocale(lang);
  applyTexts();
}

export const applyTexts = (root = document) => translateHtml(translate, root);

export function initLangSelect(onChange) {
  const select = $('lang');
  fillLangSelect(select, initialLocale());
  select.addEventListener('change', (e) => onChange(e.target.value));
}
