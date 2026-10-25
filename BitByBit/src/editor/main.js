// Atelier : création de fresques perso. Branche le canevas, la palette, les réglages,
// la bibliothèque et le partage par code.
import { COLORS } from '../data/colors.js';
import { DEFAULT_SKIN } from '../data/skins.js';
import { STORAGE } from '../config.js';
import { store } from '../storage.js';
import { $ } from '../dom.js';
import { encodeMural, decodeMural, toMapsSnippet, pixelCount, cleanName, MIN_SIZE, MAX_SIZE } from '../core/mural-code.js';
import { initLangSelect, initialLang, setLang, t } from '../ui/lang.js';
import { initSkinSelect, fillSkinSelect, setSkin } from '../ui/skin.js';
import { ed, ERASER, newMural, loadMural, toMural, toMap, isEmpty, snapshot, undo, resize, clear } from './model.js';
import * as library from './library.js';
import { initView, resizeView, draw, setBackground, setBackgroundOpacity, setBackgroundVisible, imagePixels } from './view.js';
import { pixelsToMap } from '../core/image-to-map.js';

// ---------- petits utilitaires d'interface ----------
let statusTimer;
function status(key, vars, isError = false) {
  const el = $('status');
  el.textContent = key ? t(key, vars) : '';
  el.classList.toggle('error', isError);
  clearTimeout(statusTimer);
  if (key) statusTimer = setTimeout(() => { el.textContent = ''; }, 3500);
}

// Bouton à double clic de confirmation (pas de fenêtre « êtes-vous sûr ? ») :
// le 1er clic change le texte, le 2e dans les 3 secondes exécute l'action.
function confirmable(btn, needConfirm, action) {
  let armed = null;
  btn.addEventListener('click', () => {
    if (!needConfirm() || armed) {
      clearTimeout(armed); armed = null;
      btn.textContent = t(btn.dataset.i18n);
      action();
      return;
    }
    btn.textContent = t('ed.sure');
    armed = setTimeout(() => { armed = null; btn.textContent = t(btn.dataset.i18n); }, 3000);
  });
}

async function copy(text, field) {
  try { await navigator.clipboard.writeText(text); status('ed.copied'); }
  catch { field?.select(); status('ed.copyManual'); }
}

// L'atelier vit dans editor/ : le jeu est un dossier au-dessus.
const playUrl = (mural) => '../#play=' + encodeMural(mural);

// Proposer une fresque : formulaire GitHub (.github/ISSUE_TEMPLATE/fresque.yml) pré-rempli par l'adresse.
const ISSUES_URL = 'https://github.com/Sorylokan/games/issues/new';
const MAX_URL = 7000; // au-delà, GitHub peut refuser l'adresse : le code passe alors par le presse-papier
function suggestUrl(mural, withCode) {
  const p = new URLSearchParams({ template: 'fresque.yml', title: `[Fresque] ${mural.name || t('custom.untitled')}` });
  if (withCode) p.set('code', encodeMural(mural));
  return `${ISSUES_URL}?${p}`;
}

// ---------- rendu des panneaux ----------
function buildPalette() {
  const box = $('palette');
  box.innerHTML = '';
  for (const key of [...Object.keys(COLORS), ERASER]) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch' + (key === ERASER ? ' eraser' : '');
    b.dataset.color = key;
    if (key !== ERASER) b.style.setProperty('--c', COLORS[key]);
    b.addEventListener('click', () => { selectColor(key); });
    box.append(b);
  }
}

function selectColor(key) {
  ed.color = key;
  if (ed.tool === 'pick') ed.tool = 'brush';
  renderTools();
}

function renderTools() {
  document.querySelectorAll('.swatch').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.color === ed.color));
    b.title = b.dataset.color === ERASER ? t('ed.eraser') : '';
    b.setAttribute('aria-label', b.dataset.color === ERASER ? t('ed.eraser') : `${t('ed.color')} ${b.dataset.color}`);
  });
  document.querySelectorAll('#toolBar button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tool === ed.tool)));
}

function renderInfo() {
  $('name').value = ed.name;
  $('size').value = ed.N;
  $('sizeMinus').disabled = ed.N <= MIN_SIZE;
  $('sizePlus').disabled = ed.N >= MAX_SIZE;
  $('pixInfo').textContent = t('ed.pixels', { n: pixelCount(toMap()), total: ed.N * ed.N });
  $('undo').disabled = !ed.history.length;
  const empty = isEmpty();
  $('play').disabled = empty;
  $('save').disabled = empty;
  $('copyCode').disabled = empty;
  $('suggest').disabled = empty;
  $('code').value = empty ? '' : encodeMural(toMural());
  $('snippet').value = empty ? '' : toMapsSnippet(toMural());
}

function thumb(map) {
  const N = map.length, s = 72, c = document.createElement('canvas');
  c.width = s; c.height = s;
  const x = c.getContext('2d'), k = s / N;
  map.forEach((row, r) => [...row].forEach((v, col) => {
    if (v === ERASER) return;
    x.fillStyle = COLORS[v];
    x.fillRect(col * k, r * k, Math.ceil(k), Math.ceil(k));
  }));
  return c;
}

function renderLibrary() {
  const ul = $('lib');
  ul.innerHTML = '';
  const items = library.list();
  if (!items.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = t('ed.libEmpty');
    ul.append(li);
    return;
  }
  for (const m of items) {
    const li = document.createElement('li');
    if (m.id === ed.editingId) li.className = 'current';
    const meta = document.createElement('div');
    meta.className = 'meta';
    const b = document.createElement('b');
    b.textContent = m.name || t('custom.untitled');
    const small = document.createElement('small');
    small.textContent = `${m.map.length} × ${m.map.length}`;
    meta.append(b, small);
    const acts = document.createElement('div');
    acts.className = 'acts';
    const mk = (key, fn, cls = '') => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.dataset.i18n = key; btn.textContent = t(key);
      if (cls) btn.className = cls;
      fn(btn);
      acts.append(btn);
    };
    mk('ed.libEdit', (btn) => btn.addEventListener('click', () => {
      loadMural(m, m.id); afterLoad(); status('ed.loaded', { name: m.name || t('custom.untitled') });
    }));
    mk('ed.libPlay', (btn) => btn.addEventListener('click', () => { location.href = playUrl(m); }));
    mk('ed.libDelete', (btn) => confirmable(btn, () => true, () => {
      library.remove(m.id);
      if (ed.editingId === m.id) ed.editingId = null;
      renderLibrary();
    }), 'danger');
    li.append(thumb(m.map), meta, acts);
    ul.append(li);
  }
}

function renderAll() {
  renderTools();
  renderInfo();
  renderLibrary();
  draw();
}

// À chaque modification du dessin : brouillon sauvé, infos et image à jour.
function changed() {
  library.saveDraft(toMural(), ed.editingId);
  renderInfo();
  draw();
}

function afterLoad() {
  library.saveDraft(toMural(), ed.editingId);
  renderAll();
}

// ---------- conversion image → pixels ----------
const SAMPLES = 8; // pixels d'échantillon par côté de case : ils votent pour la couleur de la case
let lastConverted = null; // grille produite par la dernière conversion, sous forme de texte

const convOptions = () => ({
  saturation: Number($('convSaturation').value) / 100,
  contrast: Number($('convContrast').value) / 100,
  maxColors: Number($('convColors').value),
  cleanup: $('convCleanup').checked,
  transparentBg: $('convTransparent').checked,
});

// Une « série » de conversion dure tant que la grille n'a pas été retouchée : un seul snapshot()
// au début, donc un Ctrl+Z revient à l'état d'avant la conversion, quels que soient les réglages essayés.
const inSeries = () => lastConverted !== null && toMap().join('|') === lastConverted;

function convert() {
  const data = imagePixels(ed.N, SAMPLES);
  if (!data) return false;
  if (!inSeries()) snapshot();
  ed.cells = pixelsToMap(data, ed.N, COLORS, convOptions()).map((row) => [...row]);
  lastConverted = toMap().join('|');
  ed.dirty = true;
  changed();
  return true;
}

// Aperçu en direct : un réglage modifié relance la conversion en cours (au plus une fois par image affichée).
let convFrame = 0;
function reconvert() {
  if (!inSeries() || convFrame) return;
  convFrame = requestAnimationFrame(() => { convFrame = 0; convert(); });
}

function renderConvValues() {
  $('convSaturationVal').textContent = (Number($('convSaturation').value) / 100).toFixed(2);
  $('convContrastVal').textContent = (Number($('convContrast').value) / 100).toFixed(2);
  $('convColorsVal').textContent = $('convColors').value;
}

const showBgTools = (on) => {
  for (const id of ['bgControls', 'bgRemove', 'bgConvert', 'convControls']) $(id).hidden = !on;
};

// ---------- branchements ----------
function bindControls() {
  $('name').addEventListener('input', (e) => { ed.name = cleanName(e.target.value); ed.dirty = true; library.saveDraft(toMural(), ed.editingId); renderInfo(); });

  const setSize = (n) => { snapshot(); if (resize(n)) changed(); else { ed.history.pop(); renderInfo(); } };
  $('sizeMinus').addEventListener('click', () => setSize(ed.N - 1));
  $('sizePlus').addEventListener('click', () => setSize(ed.N + 1));
  $('size').addEventListener('change', (e) => setSize(Number(e.target.value) || ed.N));

  $('undo').addEventListener('click', () => { if (undo()) changed(); });
  confirmable($('clear'), () => !isEmpty(), () => { snapshot(); clear(); changed(); });

  document.querySelectorAll('#toolBar button').forEach((b) =>
    b.addEventListener('click', () => { ed.tool = b.dataset.tool; renderTools(); }));

  // Image de fond (gardée en mémoire seulement)
  $('bgFile').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setBackground(img);
        lastConverted = null; // nouvelle image : la prochaine conversion ouvre une nouvelle série
        showBgTools(true);
        status('ed.bgLoaded');
      };
      img.onerror = () => status('ed.bgError', null, true);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });
  $('bgOpacity').addEventListener('input', (e) => setBackgroundOpacity(Number(e.target.value) / 100));
  $('bgVisible').addEventListener('change', (e) => setBackgroundVisible(e.target.checked));
  $('bgRemove').addEventListener('click', () => { setBackground(null); lastConverted = null; showBgTools(false); });

  // Remplit toute la grille d'après l'image de fond (annulable avec Ctrl+Z), puis les réglages s'appliquent en direct.
  $('bgConvert').addEventListener('click', () => { if (convert()) status('ed.bgConverted'); });
  $('convColors').max = Object.keys(COLORS).length;
  renderConvValues();
  for (const id of ['convSaturation', 'convContrast', 'convColors']) {
    $(id).addEventListener('input', () => { renderConvValues(); reconvert(); });
  }
  for (const id of ['convCleanup', 'convTransparent']) $(id).addEventListener('change', reconvert);

  $('play').addEventListener('click', () => { location.href = playUrl(toMural()); });
  $('save').addEventListener('click', () => {
    ed.editingId = library.save(toMural(), ed.editingId);
    ed.dirty = false;
    library.saveDraft(toMural(), ed.editingId);
    renderLibrary();
    status('ed.saved');
  });
  confirmable($('new'), () => ed.dirty && !isEmpty(), () => { newMural(ed.N); afterLoad(); });

  $('copyCode').addEventListener('click', () => copy($('code').value, $('code')));
  $('suggest').addEventListener('click', () => {
    const mural = toMural();
    // Le code est toujours copié AVANT d'ouvrir l'onglet (après, la page n'a plus le focus et la copie échoue).
    navigator.clipboard?.writeText(encodeMural(mural)).catch(() => {});
    const full = suggestUrl(mural, true);
    const fits = full.length <= MAX_URL;
    window.open(fits ? full : suggestUrl(mural, false), '_blank', 'noopener');
    status(fits ? 'ed.suggestOpened' : 'ed.suggestPaste');
  });
  $('copySnippet').addEventListener('click', () => copy($('snippet').value, $('snippet')));
  const doImport = () => {
    const m = decodeMural($('importCode').value);
    if (!m) { status('ed.badCode', null, true); return; }
    loadMural(m); afterLoad();
    $('importCode').value = '';
    status('ed.imported', { name: m.name || t('custom.untitled') });
  };
  $('import').addEventListener('click', doImport);
  $('importCode').addEventListener('keydown', (e) => { if (e.key === 'Enter') doImport(); });

  // Raccourcis : Ctrl/Cmd+Z annuler ; B pinceau, F remplir, I pipette, E gomme
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (undo()) changed(); return; }
    if (e.target.closest('input, textarea, select') || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'b') { ed.tool = 'brush'; renderTools(); }
    else if (k === 'f') { ed.tool = 'fill'; renderTools(); }
    else if (k === 'i') { ed.tool = 'pick'; renderTools(); }
    else if (k === 'e') selectColor(ERASER);
  });
}

// ---------- démarrage ----------
initLangSelect(async (lang) => { await setLang(lang); fillSkinSelect(); renderAll(); });
initSkinSelect((s) => { setSkin(s); draw(); });
await setLang(initialLang());
fillSkinSelect();
setSkin(store.get(STORAGE.skin, DEFAULT_SKIN));

buildPalette();
initView({ changed, picked: (v) => selectColor(v) });
bindControls();

// editor/#edit=BB1-… (depuis le jeu) > brouillon en cours > fresque vide
const editCode = location.hash.match(/^#edit=(.+)$/)?.[1];
const fromLink = editCode && decodeMural(decodeURIComponent(editCode));
const draft = library.loadDraft();
if (fromLink) {
  const same = library.list().find((m) => encodeMural(m) === encodeMural(fromLink));
  loadMural(fromLink, same?.id ?? null);
  history.replaceState(null, '', location.pathname);
  library.saveDraft(toMural(), ed.editingId);
} else if (draft) {
  loadMural(draft.mural, draft.editingId);
} else {
  newMural(12);
}

let lastW = 0;
new ResizeObserver(() => {
  const w = $('board').clientWidth;
  if (Math.abs(w - lastW) < 1) return;
  lastW = w;
  requestAnimationFrame(resizeView);
}).observe($('board'));
renderAll();
document.fonts?.ready.then(renderInfo);
