// Speed button: the speeds offered depend on the mural's pixel count (big murals take a while).
import { $ } from '../dom.js';
import { app } from '../game/state.js';

// [pixels up to, speeds offered]; beyond the last row, the last speeds.
const TIERS = [
  [144, [1]],
  [256, [1, 2]],
  [900, [1, 2, 5]],
  [1600, [1, 2, 5, 10]],
];
const BIGGEST = [1, 2, 5, 10, 20];

const speedsFor = (pixels) => TIERS.find(([max]) => pixels <= max)?.[1] ?? BIGGEST;
const offered = () => speedsFor(app.st?.total ?? 0);

export function setSpeed(n) {
  app.speed = n;
  const b = $('speed');
  b.textContent = '×' + n;
  b.setAttribute('aria-pressed', String(n > 1));
  b.disabled = offered().length < 2; // a small mural: nothing to speed up
}

export function initSpeed() {
  $('speed').addEventListener('click', () => {
    const s = offered();
    setSpeed(s[(s.indexOf(app.speed) + 1) % s.length]);
  });
}

// On a new mural: keep the speed if it's offered, else the fastest one that is.
export function fitSpeed() {
  const s = offered();
  setSpeed(s.includes(app.speed) ? app.speed : s.filter((v) => v <= app.speed).pop() ?? 1);
}
