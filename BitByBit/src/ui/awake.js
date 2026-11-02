// Keeps the phone screen on: waiting for the carriers to finish is long enough for it to dim and lock.
import { STORAGE } from '../config.js';
import { store } from '../storage.js';

let lock = null;

async function apply(on) {
  if (on && !document.hidden) {
    if (lock) return;
    try {
      lock = await navigator.wakeLock.request('screen');
      lock.addEventListener('release', () => { lock = null; });
    } catch { /* refused: battery saver, or no tap yet on some browsers */ }
  } else if (lock) {
    lock.release();
    lock = null;
  }
}

// Phones and tablets only: a computer screen doesn't go off mid-game.
export function initAwake(checkbox) {
  if (!('wakeLock' in navigator) || !window.matchMedia?.('(pointer: coarse)').matches) return;
  checkbox.closest('label').hidden = false;
  checkbox.checked = store.get(STORAGE.awake, true);
  checkbox.addEventListener('change', () => {
    store.set(STORAGE.awake, checkbox.checked);
    apply(checkbox.checked);
  });
  // The browser drops the lock whenever the tab is hidden, so it's taken again on return (and on the first tap, for browsers that refuse it before).
  document.addEventListener('visibilitychange', () => apply(checkbox.checked));
  window.addEventListener('pointerdown', () => apply(checkbox.checked), { once: true });
  apply(checkbox.checked);
}
