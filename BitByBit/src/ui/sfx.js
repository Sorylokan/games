// Sound effects, in tune with the music: a pickup plays a note of the chord being heard.
import { STORAGE } from '../config.js';
import { store } from '../storage.js';
import { audio } from './music.js';

const VOLUME = 0.2;
const PICKUP_GAP = 0.07; // seconds: at most ~14 pickup notes per second

let enabled = store.get(STORAGE.sfx, true);
let lastPickup = 0;

const freq = (midi) => 440 * 2 ** ((midi - 69) / 12);

function ready() {
  return enabled ? audio() : null;
}

// One soft note: quick attack, exponential decay.
function note(a, f, t, peak, decay, type = 'sine', fEnd = 0) {
  const o = a.ctx.createOscillator();
  const g = a.ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (fEnd) o.frequency.exponentialRampToValueAtTime(fEnd, t + decay);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak * VOLUME, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  o.connect(g).connect(a.out);
  o.start(t);
  o.stop(t + decay + 0.05);
}

// Small marimba: body + short bell.
function pluck(a, midi, t, peak) {
  note(a, freq(midi), t, peak, 0.35);
  note(a, freq(midi) * 4, t, peak * 0.15, 0.08);
}

// A carrier takes a pixel: a chord note picked by its color, an octave up in the top half.
export function pickup(color, row, size) {
  const a = ready();
  if (!a || a.ctx.currentTime - lastPickup < PICKUP_GAP) return;
  lastPickup = a.ctx.currentTime;
  const midi = a.chord[color.charCodeAt(0) % a.chord.length] + (row < size / 2 ? 12 : 0);
  pluck(a, midi, a.ctx.currentTime, 0.05);
}

// A box goes on the line: wooden tock.
export function place() {
  const a = ready();
  if (!a) return;
  const t = a.ctx.currentTime;
  note(a, 620, t, 0.12, 0.07, 'triangle', 420);
  note(a, 1240, t, 0.03, 0.03);
}

// Line full: soft low thud.
export function full() {
  const a = ready();
  if (!a) return;
  note(a, 150, a.ctx.currentTime, 0.14, 0.18, 'triangle', 95);
}

// Colony stuck: two falling notes.
export function stuck() {
  const a = ready();
  if (!a) return;
  const t = a.ctx.currentTime;
  pluck(a, a.chord[3], t, 0.08);
  pluck(a, a.chord[0] - 12, t + 0.22, 0.09);
}

// Mural done: rising arpeggio on the current chord.
export function win() {
  const a = ready();
  if (!a) return;
  const t = a.ctx.currentTime;
  [...a.chord, a.chord[0] + 12, a.chord[2] + 12].forEach((m, i) => pluck(a, m + 12, t + i * 0.09, 0.07));
}

// Button + saved choice.
export function initSfx(button) {
  const render = () => button.setAttribute('aria-pressed', String(enabled));
  render();
  button.addEventListener('click', () => {
    enabled = !enabled;
    store.set(STORAGE.sfx, enabled);
    render();
  });
}
