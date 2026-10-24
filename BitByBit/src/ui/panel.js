// Colonne de droite : infos de la fresque et files de boîtes.
// Reconstruite seulement quand quelque chose change (pas à chaque image), sinon les clics se perdent.
import { COLORS, inkFor } from '../data/colors.js';
import { QUEUE_COUNT } from '../config.js';
import { $ } from '../dom.js';
import { app } from '../game/state.js';
import { t } from './lang.js';

const boxHTML = (a, small) =>
  `<span class="box${small ? ' small' : ''}" style="--c:${COLORS[a.color]};--ink:${inkFor(COLORS[a.color])}">${a.count}</span>`;

let queueBtns = [];

// Crée les boutons des files une fois pour toutes. onPlace(qi, bouton) est appelé au clic.
export function initPanel(onPlace) {
  queueBtns = Array.from({ length: QUEUE_COUNT }, (_, qi) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'queue';
    b.addEventListener('click', () => onPlace(qi, b));
    $('queues').appendChild(b);
    return b;
  });
}

export function renderUI() {
  const st = app.st;
  if (!st) return;
  if (st.lvl.custom) {
    $('lvlNum').textContent = t('custom.badge');
    $('lvlName').textContent = st.lvl.name || t('custom.untitled');
  } else {
    $('lvlNum').textContent = t('side.number', { n: st.li + 1 }) + (st.lvl.round ? ` · ${t('side.round', { n: st.lvl.round + 1 })}` : '');
    $('lvlName').textContent = t(`map.${st.lvl.id}`);
  }
  $('total').textContent = st.total;

  const playing = st.status === 'play';
  st.queues.forEach((q, qi) => {
    const b = queueBtns[qi];
    b.disabled = !q.length || !playing;
    b.setAttribute('aria-label', q.length ? t('queue.place', { n: qi + 1, count: q[0].count }) : t('queue.emptyLabel', { n: qi + 1 }));
    b.innerHTML = q.length
      ? q.slice(0, 4).map((a, i) => boxHTML(a, i > 0)).join('') + (q.length > 4 ? `<span class="more">+${q.length - 4}</span>` : '')
      : `<span class="empty">${t('queue.empty')}</span>`;
  });

  const used = st.line.filter(Boolean).length, free = st.line.length - used;
  $('lineUsed').textContent = used;
  $('lineCap').textContent = st.line.length;
  const info = $('lineInfo');
  info.textContent = free === 0 ? t('line.full') : free === 1 ? t('line.last') : t('line.free', { n: free });
  info.className = free <= 1 ? 'warn' : '';
}

// Progression : mise à jour à chaque image, sans toucher au reste.
export function renderProgress() {
  const st = app.st;
  if (!st) return;
  $('count').textContent = st.picked;
  $('bar').style.width = (st.picked / st.total * 100) + '%';
}

// Petit tremblement quand on clique une file alors que la ligne est pleine.
export function shake(el) {
  el.classList.remove('shake');
  void el.offsetWidth; // relance l'animation
  el.classList.add('shake');
}
