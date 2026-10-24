// Changement de thème : attribut data-skin sur <html>, couleurs lues dans le CSS pour le canvas,
// texte des règles accordé, et sélecteur rempli depuis data/skins.js (noms traduits).
import { SKINS, DEFAULT_SKIN } from '../data/skins.js';
import { STORAGE } from '../config.js';
import { store } from '../storage.js';
import { $ } from '../dom.js';
import { app } from '../game/state.js';
import { t } from './lang.js';

// (Re)remplit la liste déroulante, groupée par catégorie, dans l'ordre de data/skins.js.
// Rappelée à chaque changement de langue.
export function fillSkinSelect() {
  const select = $('skin');
  select.innerHTML = '';
  const groups = new Map();
  for (const [key, s] of Object.entries(SKINS)) {
    if (!groups.has(s.group)) {
      const og = document.createElement('optgroup');
      og.label = t(`group.${s.group}`);
      groups.set(s.group, og);
      select.append(og);
    }
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = t(`skin.${key}`);
    groups.get(s.group).append(opt);
  }
  select.value = app.skin;
}

export function initSkinSelect(onChange) {
  $('skin').addEventListener('change', (e) => onChange(e.target.value));
}

// Couleurs du thème actif, pour ce que le canvas dessine (cadres, fourmis, encoches…).
function readPalette() {
  const cs = getComputedStyle(document.documentElement);
  const pal = {};
  for (const k of ['bg', 'card', 'accent', 'line', 'txt', 'mut']) pal[k] = cs.getPropertyValue('--' + k).trim();
  const n = parseInt(pal.card.replace('#', ''), 16);
  pal.light = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 150;
  app.pal = pal;
}

export function renderRules() {
  $('rules').textContent = `${t('rules.intro')} ${t(`rules.${SKINS[app.skin].crew}`)}`;
}

export function setSkin(name) {
  const s = SKINS[name] ? name : DEFAULT_SKIN;
  app.skin = s;
  if (s === DEFAULT_SKIN) document.documentElement.removeAttribute('data-skin');
  else document.documentElement.setAttribute('data-skin', s);
  $('skin').value = s;
  store.set(STORAGE.skin, s);
  readPalette();
  renderRules();
}
