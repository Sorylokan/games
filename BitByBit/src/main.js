// Point d'entrée : branche l'interface, restaure thème et progression, lance la boucle d'animation.
import { STORAGE } from './config.js';
import { DEFAULT_SKIN } from './data/skins.js';
import { store } from './storage.js';
import { $ } from './dom.js';
import { app } from './game/state.js';
import { start, startCustom, restart, place, update } from './game/session.js';
import { decodeMural } from './core/mural-code.js';
import { communityMurals } from './data/community.js';
import { showOverlay, hideOverlay } from './ui/overlay.js';
import { t } from './ui/lang.js';
import { resize } from './render/canvas.js';
import { draw } from './render/board.js';
import { initPanel, renderUI, renderProgress } from './ui/panel.js';
import { initSkinSelect, fillSkinSelect, setSkin, renderRules } from './ui/skin.js';
import { initLangSelect, initialLang, setLang } from './ui/lang.js';

// --- interface ---
initPanel(place);
initSkinSelect(setSkin);
initLangSelect(changeLang);

// Changer de langue retraduit tout ce qui est affiché, sans relancer la partie.
async function changeLang(lang) {
  await setLang(lang);
  fillSkinSelect();
  renderRules();
  renderUI();
  renderCommunityBtn();
}

// Fresques de la communauté : un bouton (s'il y en a) qui ouvre la liste par-dessus le plateau.
const community = communityMurals();
function renderCommunityBtn() {
  const b = $('communityBtn');
  b.hidden = !community.length;
  b.textContent = t('community.button', { n: community.length });
}
$('communityBtn').addEventListener('click', () => {
  showOverlay(t('community.title'), t('community.text'), [
    ...community.map((m) => ({
      label: `${m.name || t('custom.untitled')} · ${t('community.by', { author: m.author })}`,
      ghost: true,
      fn: () => startCustom(m),
    })),
    { label: t('community.close'), fn: hideOverlay },
  ]);
});
$('restart').addEventListener('click', restart);
$('speed').addEventListener('click', () => {
  app.speed = app.speed === 1 ? 2 : 1;
  $('speed').textContent = '×' + app.speed;
  $('speed').setAttribute('aria-pressed', String(app.speed === 2));
});

// On ne recalcule le canvas que si la LARGEUR du plateau change : sa hauteur dépend du canvas,
// observer la hauteur relancerait l'observateur en boucle (« ResizeObserver loop »).
let lastW = 0;
new ResizeObserver(() => {
  const w = $('board').clientWidth;
  if (Math.abs(w - lastW) < 1) return;
  lastW = w;
  requestAnimationFrame(resize);
}).observe($('board'));

// --- reprise ---
await setLang(initialLang());
fillSkinSelect();
setSkin(store.get(STORAGE.skin, DEFAULT_SKIN));
renderCommunityBtn();
// index.html#play=BB1-… : on joue une fresque perso (lien venu de l'atelier ou d'un ami).
const playCode = location.hash.match(/^#play=(.+)$/)?.[1];
const mural = playCode && decodeMural(decodeURIComponent(playCode));
if (mural) {
  startCustom(mural);
} else {
  const saved = store.get(STORAGE.level, 0);
  start(Number.isInteger(saved) && saved >= 0 && saved < 999 ? saved : 0);
}
document.fonts?.ready.then(renderUI); // Fraunces chargée : on redessine les chiffres

// --- boucle ---
let lastNow = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastNow) / 1000);
  lastNow = now;
  if (app.st) {
    update(now, dt);
    draw(now);
    renderProgress();
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
