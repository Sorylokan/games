// Lofi background music, generated live (Web Audio, no audio files).
// Every bar is drawn a little ahead of time: chords, bass, drums, a sparse melody, vinyl crackle.
import { STORAGE } from '../config.js';
import { store } from '../storage.js';

const BPM = 65;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const SWING = 0.5;     // position of the off-beat eighth in the beat (0.5 = straight)
const VOLUME = 0.25;
const FADE_IN = 2.5;   // seconds
const CRACKLE_RATE = 1;       // vinyl pops per second
const CRACKLE_VOLUME = 0.04;

// ii–V–I–vi in C with jazzy voicings (MIDI note numbers).
const CHORDS = [
  { bass: 38, keys: [53, 57, 60, 64] }, // Dm9
  { bass: 43, keys: [53, 57, 59, 64] }, // G13
  { bass: 36, keys: [52, 55, 59, 62] }, // Cmaj9
  { bass: 45, keys: [55, 59, 60, 64] }, // Am9
];
const MELODY = [67, 69, 72, 74, 76, 79, 81]; // C major pentatonic, always fits the chords
const TENSE_CHORD = { bass: 40, keys: [56, 59, 62, 65] }; // E7(b9), replaces Am9 during a boss
const TENSION_STEP = 1 / 3; // boss layers fade in (and out) over 3 bars

const freq = (midi) => 440 * 2 ** ((midi - 69) / 12);
const rand = (min, max) => min + Math.random() * (max - min);
const chance = (p) => Math.random() < p;

let ctx = null;
let master, mix, reverb, wow, noise, sfxBus;
let chordLog = []; // [{ start, keys }] of the last scheduled bars
let enabled = store.get(STORAGE.music, true);
let playing = false;
let timer = null;
let nextBar = 0;
let bar = 0;
let melodyIdx = 3;
let tension = 0;       // 0 = calm, 1 = boss layers fully in
let tensionTarget = 0;

// --- audio graph ---

function setup() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();

  master = ctx.createGain();
  master.gain.value = 0;
  const limiter = ctx.createDynamicsCompressor();
  limiter.connect(ctx.destination);
  master.connect(limiter);
  sfxBus = ctx.createGain();
  sfxBus.connect(limiter);

  // "Tape": everything goes through a soft low-pass.
  const tape = ctx.createBiquadFilter();
  tape.type = 'lowpass';
  tape.frequency.value = 2600;
  tape.Q.value = 0.4;
  tape.connect(master);
  mix = ctx.createGain();
  mix.connect(tape);

  reverb = ctx.createConvolver();
  reverb.buffer = impulse(2.2);
  reverb.connect(tape);

  // Wow: a slow pitch wobble shared by every tonal voice.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.35;
  wow = ctx.createGain();
  wow.gain.value = 7; // cents
  lfo.connect(wow);
  lfo.start();

  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

  crackle();
  return true;
}

function impulse(seconds) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3 * 0.5;
  }
  return buf;
}

// Looping vinyl: faint hiss and random pops.
function crackle() {
  const len = ctx.sampleRate * 3;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let pop = 0;
  for (let i = 0; i < len; i++) {
    if (chance(CRACKLE_RATE / ctx.sampleRate)) pop = rand(0.3, 0.8) * (chance(0.5) ? 1 : -1);
    d[i] = (Math.random() * 2 - 1) * 0.012 + pop;
    pop *= 0.82;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 900;
  const g = ctx.createGain();
  g.gain.value = CRACKLE_VOLUME;
  src.connect(hp).connect(g).connect(master);
  src.start();
}

// --- voices ---

// Gain envelope: quick attack, exponential decay. Returns the end time.
function envelope(param, t, peak, attack, decay) {
  param.setValueAtTime(0.0001, t);
  param.exponentialRampToValueAtTime(peak, t + attack);
  param.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return t + attack + decay;
}

function tone(type, f, t, peak, attack, decay, dest, detune = 0) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = f;
  o.detune.value = detune;
  wow.connect(o.detune);
  o.onended = () => wow.disconnect(o.detune);
  const end = envelope(g.gain, t, peak, attack, decay);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(end + 0.05);
  return g;
}

// Electric piano: warm body + slightly detuned layer + short bell on the attack.
function keys(midi, t, vel, length) {
  const f = freq(midi);
  const out = ctx.createGain();
  out.connect(mix);
  const send = ctx.createGain();
  send.gain.value = 0.35;
  out.connect(send).connect(reverb);
  tone('sine', f, t, vel, 0.012, length, out);
  tone('triangle', f, t, vel * 0.25, 0.012, length * 0.8, out, rand(4, 8));
  tone('sine', f * 4, t, vel * 0.08, 0.004, 0.25, out);
}

function bass(midi, t, length) {
  tone('sine', freq(midi), t, 0.32, 0.02, length, mix);
  tone('triangle', freq(midi) * 2, t, 0.05, 0.02, length * 0.6, mix); // audible on phone speakers
}

function lead(midi, t) {
  const out = ctx.createGain();
  out.connect(mix);
  const send = ctx.createGain();
  send.gain.value = 0.6;
  out.connect(send).connect(reverb);
  tone('sine', freq(midi), t, 0.05, 0.02, 0.9, out);
  tone('sine', freq(midi) * 3, t, 0.006, 0.01, 0.3, out);
}

function noiseHit(t, type, cutoff, peak, decay) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.playbackRate.value = rand(0.9, 1.1);
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = cutoff;
  const g = ctx.createGain();
  const end = envelope(g.gain, t, peak, 0.002, decay);
  src.connect(filter).connect(g).connect(mix);
  src.start(t, rand(0, 0.5));
  src.stop(end + 0.05);
}

function kick(t, vel) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(120, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  const end = envelope(g.gain, t, 0.55 * vel, 0.004, 0.32);
  o.connect(g).connect(mix);
  o.start(t);
  o.stop(end + 0.05);
}

const snare = (t) => {
  noiseHit(t, 'bandpass', 1700, 0.12, 0.17);
  tone('triangle', 185, t, 0.06, 0.002, 0.08, mix);
};
const hat = (t, vel) => noiseHit(t, 'highpass', 7500, 0.035 * vel, 0.035);

// Boss layers: a bass pulse on every eighth, and a high string pad slowly opening up.
function pulse(midi, t, level) {
  tone('sine', freq(midi), t, 0.14 * level, 0.01, BEAT * 0.4, mix);
  tone('triangle', freq(midi) * 2, t, 0.03 * level, 0.01, BEAT * 0.25, mix);
}

function pad(midi, t, level) {
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.Q.value = 2;
  f.frequency.setValueAtTime(500, t);
  f.frequency.exponentialRampToValueAtTime(1600, t + BAR);
  f.connect(mix);
  const send = ctx.createGain();
  send.gain.value = 0.5;
  f.connect(send).connect(reverb);
  for (const detune of [-8, 8]) tone('sawtooth', freq(midi), t, 0.02 * level, BAR * 0.4, BAR * 0.65, f, detune);
}

// --- arrangement ---

// Eighth-note step (0–7) → time in the bar, with swing and a little human looseness.
const stepTime = (start, s, loose = 0) =>
  start + Math.floor(s / 2) * BEAT + (s % 2 ? SWING * BEAT : 0) + rand(-loose, loose);

function scheduleBar(start) {
  tension += Math.max(-TENSION_STEP, Math.min(TENSION_STEP, tensionTarget - tension));
  const tense = tension > 0.5 && bar % CHORDS.length === CHORDS.length - 1;
  const chord = tense ? TENSE_CHORD : CHORDS[bar % CHORDS.length];
  const section = bar % 16;
  const drums = bar >= 2 && section !== 15; // 2-bar intro, a break every 16 bars
  const melody = (section >= 4 && section < 8) || (section >= 10 && section < 14);
  chordLog = [...chordLog.slice(-3), { start, keys: chord.keys }];

  chord.keys.forEach((m, i) => keys(m, start + i * 0.022 + rand(0, 0.012), rand(0.05, 0.065), BAR * 0.95));
  if (chance(0.45)) {
    chord.keys.forEach((m, i) => keys(m, stepTime(start, 3) + i * 0.015, rand(0.025, 0.035), BEAT * 1.5));
  }

  bass(chord.bass, start, BEAT * 1.6);
  bass(chance(0.3) ? chord.bass + 12 : chord.bass, stepTime(start, 5, 0.01), BEAT * 1.2);

  if (drums) {
    kick(start, 1);
    kick(stepTime(start, 5, 0.008), 0.8);
    if (chance(0.3)) kick(stepTime(start, 3, 0.008), 0.6);
    snare(stepTime(start, 2, 0.01));
    snare(stepTime(start, 6, 0.01));
    for (let s = 0; s < 8; s++) {
      if (s % 2 && chance(0.15)) continue;
      hat(stepTime(start, s, 0.006), s % 2 ? rand(0.5, 0.8) : rand(0.8, 1));
    }
  }

  if (tension > 0) {
    for (let s = 0; s < 8; s++) pulse(chord.bass + 12, stepTime(start, s, 0.004), tension);
    pad(chord.keys[2] + 12, start, tension);
    pad(chord.keys[3] + 12, start, tension);
  }

  if (melody) {
    for (let s = 0; s < 8; s++) {
      if (!chance(s % 2 ? 0.2 : 0.35)) continue;
      melodyIdx = Math.max(0, Math.min(MELODY.length - 1, melodyIdx + Math.round(rand(-2, 2))));
      lead(MELODY[melodyIdx], stepTime(start, s, 0.01));
    }
  }
  bar++;
}

function tick() {
  while (nextBar < ctx.currentTime + 0.4) {
    scheduleBar(nextBar);
    nextBar += BAR;
  }
}

// --- controls ---

function play() {
  if (playing || !enabled) return;
  if (!ctx && !setup()) return;
  playing = true;
  ctx.resume();
  bar = 0;
  nextBar = ctx.currentTime + 0.15;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(VOLUME, ctx.currentTime + FADE_IN);
  tick();
  timer = setInterval(tick, 100);
}

function stop() {
  if (!playing) return;
  playing = false;
  clearInterval(timer);
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
  chordLog = [];
}

// Boss on/off: the layers follow at the next bar, without cutting the music.
export function setTension(on) {
  tensionTarget = on ? 1 : 0;
}

// For the sound effects (sfx.js): the audio context, their output, and the chord being heard
// (Cmaj9 without music). Null until the browser allows sound.
export function audio() {
  if (!ctx && !setup()) return null;
  if (ctx.state === 'suspended' && !document.hidden) ctx.resume();
  const now = chordLog.filter((c) => c.start <= ctx.currentTime).pop();
  return { ctx, out: sfxBus, chord: now ? now.keys : CHORDS[2].keys };
}

// Button + saved choice. Browsers only allow sound after a click or a key press.
export function initMusic(button) {
  const render = () => button.setAttribute('aria-pressed', String(enabled));
  render();
  button.addEventListener('click', () => {
    enabled = !enabled;
    store.set(STORAGE.music, enabled);
    render();
    if (enabled) play(); else stop();
  });
  const unlock = () => play();
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
  // Paused while the tab is hidden.
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });
}
