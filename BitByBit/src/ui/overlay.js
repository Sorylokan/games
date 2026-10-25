// Window over the board (end of mural, community list).
import { $ } from '../dom.js';
import { renderUI } from './panel.js';

// actions: [{ label, fn, ghost? }]; falsy entries are skipped (optional buttons).
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
  renderUI(); // refresh queue buttons (disabled once the game is over)
}

export function hideOverlay() {
  $('overlay').hidden = true;
}
