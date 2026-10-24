// Fenêtre posée sur le plateau en fin de fresque (gagné ou coincé).
import { $ } from '../dom.js';
import { renderUI } from './panel.js';

// actions : [{ label, fn, ghost? }] ; les valeurs false sont ignorées (boutons optionnels).
export function showOverlay(title, text, actions) {
  const ov = $('overlay');
  ov.innerHTML = '';
  const panel = document.createElement('div');
  panel.className = 'panel';
  const h = document.createElement('h2');
  h.textContent = title;
  const p = document.createElement('p');
  p.textContent = text;
  const row = document.createElement('div');
  row.className = 'row';
  actions.filter(Boolean).forEach((a) => {
    const b = document.createElement('button');
    b.type = 'button';
    if (a.ghost) b.className = 'ghost';
    b.textContent = a.label;
    b.onclick = a.fn;
    row.appendChild(b);
  });
  panel.append(h, p, row);
  ov.append(panel);
  ov.hidden = false;
  renderUI(); // désactive les files pendant que la fenêtre est ouverte
}

export function hideOverlay() {
  $('overlay').hidden = true;
}
