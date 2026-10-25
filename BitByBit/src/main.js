// Entry point: wires the UI, restores theme and progress, runs the animation loop.
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

// Retranslates everything without restarting the game.
async function changeLang(lang) {
  await setLang(lang);
  fillSkinSelect();
  renderRules();
  renderUI();
  renderCommunityBtn();
}

// Community murals: a button (if any) opening the list over the board.
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

// Resize only when the board WIDTH changes: its height depends on the canvas,
// so watching it would loop ("ResizeObserver loop").
let lastW = 0;
new ResizeObserver(() => {
  const w = $('board').clientWidth;
  if (Math.abs(w - lastW) < 1) return;
  lastW = w;
  requestAnimationFrame(resize);
}).observe($('board'));

// --- resume ---
await setLang(initialLang());
fillSkinSelect();
setSkin(store.get(STORAGE.skin, DEFAULT_SKIN));
renderCommunityBtn();
// #play=BB1-…: play a custom mural (link from the editor or a friend).
const playCode = location.hash.match(/^#play=(.+)$/)?.[1];
const mural = playCode && decodeMural(decodeURIComponent(playCode));
if (mural) {
  startCustom(mural);
} else {
  const saved = store.get(STORAGE.level, 0);
  start(Number.isInteger(saved) && saved >= 0 && saved < 999 ? saved : 0);
}
document.fonts?.ready.then(renderUI); // redraw numbers once Fraunces has loaded

// --- loop ---
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
