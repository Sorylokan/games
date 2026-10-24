// Déroulement d'une partie : lancer un niveau, poser une boîte, faire avancer les porteurs, gagner ou perdre.
import { BASE_SPEED, SPAWN_MS, MAX_OUT, BOX_OPEN_MS, BOX_CLOSE_MS, STORAGE } from '../config.js';
import { clone, remaining } from '../core/grid.js';
import { generate } from '../core/generator.js';
import { levelAt, customLevel, isEndOfSeries } from '../data/levels.js';
import { encodeMural } from '../core/mural-code.js';
import { pickCarrier } from '../data/skins.js';
import { store } from '../storage.js';
import { app, nextId } from './state.js';
import { findTarget, pathLen } from './pathfinding.js';
import { resize } from '../render/canvas.js';
import { renderUI, shake } from '../ui/panel.js';
import { showOverlay, hideOverlay } from '../ui/overlay.js';
import { t } from '../ui/lang.js';

// Aventure : la fresque n° li, avec sa difficulté.
export function start(li) {
  launch(levelAt(li), li);
  store.set(STORAGE.level, li);
}

// Fresque perso venue de l'atelier (ne touche pas à la progression de l'aventure).
export function startCustom(mural) {
  launch(customLevel(mural), null);
}

function launch(lvl, li) {
  const { N, target, queues } = generate(lvl, nextId);
  app.st = {
    li, lvl, N, target, queues,
    grid: clone(target),
    total: remaining(target),
    picked: 0,
    cap: lvl.cap,
    line: Array(lvl.cap).fill(null), // places de la ligne : null ou une boîte
    ants: [],                        // porteurs en route
    claimed: new Set(),              // pixels déjà visés par un porteur
    pickedAt: new Map(),             // moment où chaque pixel a été emporté (petite animation)
    ver: 0, bfsCache: new Map(),     // cache des chemins, invalidé à chaque pixel emporté
    status: 'play',
    rescueUsed: false,
  };
  hideOverlay();
  resize();
  renderUI();
}

export const restart = () => (app.st.lvl.custom ? launch(app.st.lvl, null) : start(app.st.li));

// Liens de fin de partie pour une fresque perso.
const editLink = () => { location.href = './editor/#edit=' + encodeMural(app.st.lvl); };
export function backToAdventure() {
  history.replaceState(null, '', location.pathname);
  const saved = store.get(STORAGE.level, 0);
  start(Number.isInteger(saved) && saved >= 0 ? saved : 0);
}

// Pose la boîte de tête de la file qi sur la première place libre.
export function place(qi, el) {
  const st = app.st;
  if (st.status !== 'play') return;
  const q = st.queues[qi];
  if (!q.length) return;
  const i = st.line.indexOf(null);
  if (i < 0) { shake(el); return; }
  const a = q.shift(), now = performance.now();
  st.line[i] = { ...a, slot: i, sent: 0, got: 0, out: 0, nextAt: now + BOX_OPEN_MS, blocked: false, doneAt: 0, placedAt: now };
  renderUI();
}

// Avance la partie de dt secondes.
export function update(now, dt) {
  const st = app.st;
  if (st.status !== 'play') return;
  spawnCarriers(st, now);
  moveCarriers(st, now, dt);
  closeEmptyBoxes(st, now);
  checkEnd(st, now);
}

function spawnCarriers(st, now) {
  for (const box of st.line) {
    if (!box || box.doneAt) continue;
    if (box.sent >= box.count || box.out >= MAX_OUT || now < box.nextAt) continue;
    const t = findTarget(box);
    box.blocked = !t;
    if (!t) continue;
    st.claimed.add(t.r * st.N + t.c);
    st.ants.push({
      box, r: t.r, c: t.c, color: box.color,
      pts: t.pts, len: pathLen(t.pts), d: 0, back: false,
      seed: Math.random() * 10,
      ...pickCarrier(app.skin),
    });
    box.sent++; box.out++;
    box.nextAt = now + SPAWN_MS / app.speed;
  }
}

function moveCarriers(st, now, dt) {
  const v = BASE_SPEED * app.speed;
  st.ants = st.ants.filter((a) => {
    a.d += v * a.spd * dt;
    if (a.d < a.len) return true;
    if (!a.back) { // arrivé au pixel : il l'emporte et fait demi-tour
      const id = a.r * st.N + a.c;
      st.grid[a.r][a.c] = null;
      st.claimed.delete(id);
      st.pickedAt.set(id, now);
      st.picked++; st.ver++; st.bfsCache.clear();
      a.back = true; a.d = 0; a.pts = a.pts.slice().reverse();
      return true;
    }
    a.box.got++; a.box.out--; // rentré à la boîte
    if (a.box.got === a.box.count) a.box.doneAt = now;
    return false;
  });
}

function closeEmptyBoxes(st, now) {
  let changed = false;
  st.line.forEach((b, i) => {
    if (b && b.doneAt && now - b.doneAt > BOX_CLOSE_MS) { st.line[i] = null; changed = true; }
  });
  if (changed) renderUI();
}

function checkEnd(st, now) {
  if (st.picked === st.total && !st.ants.length && st.line.every((b) => !b)) return win();
  // Coincé : personne dehors, aucune boîte ne trouve de pixel, et plus de place (ou plus de boîtes).
  const idle = !st.ants.length && st.line.every((b) => !b || (b.blocked && !b.doneAt));
  const noMove = st.line.every((b) => b) || st.queues.every((q) => !q.length);
  const settled = st.line.some((b) => b) && now - Math.max(...st.line.filter(Boolean).map((b) => b.placedAt)) > 500;
  if (idle && noMove && settled) lose();
}

function lose() {
  const st = app.st;
  st.status = 'lose';
  showOverlay(t('end.stuckTitle'), t('end.stuckText'), [
    !st.rescueUsed && { label: t('end.addSlot'), fn: () => {
      st.rescueUsed = true; st.line.push(null); st.status = 'play';
      hideOverlay(); resize(); renderUI();
    } },
    { label: t('end.restart'), ghost: !st.rescueUsed, fn: restart },
    st.lvl.custom && { label: t('custom.edit'), ghost: true, fn: editLink },
  ]);
}

function win() {
  const st = app.st;
  st.status = 'win';
  if (st.lvl.custom) {
    const name = st.lvl.name || t('custom.untitled');
    showOverlay(t('end.winTitle'), t(st.rescueUsed ? 'end.winHelped' : 'end.winClean', { name }), [
      { label: t('end.replay'), fn: restart },
      { label: t('custom.edit'), ghost: true, fn: editLink },
      { label: t('custom.adventure'), ghost: true, fn: backToAdventure },
    ]);
    return;
  }
  store.set(STORAGE.level, st.li + 1);
  store.set(STORAGE.best, Math.max(store.get(STORAGE.best, 0), st.li + 1));
  const name = t(`map.${st.lvl.id}`);
  const text = t(st.rescueUsed ? 'end.winHelped' : 'end.winClean', { name })
    + (isEndOfSeries(st.li) ? ' ' + t('end.seriesOver') : '');
  showOverlay(t('end.winTitle'), text, [
    { label: t('end.next'), fn: () => start(st.li + 1) },
    { label: t('end.replay'), ghost: true, fn: restart },
  ]);
}
