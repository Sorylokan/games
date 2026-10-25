// Synthesized sounds (Web Audio, no audio files).
//   Dice:   tick(die)  thunk(die, value)   -> DiceTray onTick / onSettle
//   UI:     click()  ping()  bonk()
//   Events: hit(amount)  heal()  death()  tada()
//   Mute:   toggleMuted() / isMuted() / setMuted(v)   (saved)
//   setSoundTheme(id) switches the preset (timbre, pitch, envelopes).

const KEY = "ftm-muted";

/* --- Presets per theme ---
- osc:   base oscillator ("sine", "triangle", "square", "sawtooth")
- pitch: global pitch multiplier (1 = normal)
- dur:   note duration multiplier
- gain:  global volume multiplier
- wizz:  if true, click()/ping() play a rising MSN-"nudge" glide
*/

const DEFAULT_PRESET = { osc: "sine", pitch: 1, dur: 1, gain: 1, wizz: false, dice: "classic" };

const SOUND_PRESETS = {
    "desktop-2004": DEFAULT_PRESET,
    "persona5":     { osc: "triangle", pitch: 1.05, dur: 0.9, gain: 1, wizz: false, dice: "sharp" },
    "synthwave":    { osc: "sawtooth", pitch: 0.6,  dur: 1.4, gain: 1.1, wizz: false, dice: "deep" },
    "msn":          { osc: "sine",     pitch: 1.2,  dur: 0.9, gain: 1, wizz: true, dice: "soft" },
    "memes":        { osc: "square",   pitch: 1.3,  dur: 0.8, gain: 1, wizz: false, dice: "toy" }
};

let activePreset = DEFAULT_PRESET;

export function setSoundTheme(id) {
    activePreset = SOUND_PRESETS[id] ?? DEFAULT_PRESET;
}

let ctx = null;
let master = null;
let noise = null;

let muted = false;
try { muted = localStorage.getItem(KEY) === "1"; } catch { /* stockage indisponible */ }


/* --- Init (unlocked by the first click / key) --- */

function ensure() {
    if (ctx) {
        if (ctx.state === "suspended") ctx.resume();
        return;
    }

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    ctx = new AC();

    const comp = ctx.createDynamicsCompressor();   // avoids clipping
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(comp);
    comp.connect(ctx.destination);

    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
}

["pointerdown", "keydown"].forEach((type) =>
    window.addEventListener(type, ensure, { passive: true })
);

const ready = () => ctx && !muted;


/* ---------------------------------------------------------
   Utilitaires
   --------------------------------------------------------- */

// vary(0.1) -> random number between 0.9 and 1.1
const vary = (amount) => 1 + (Math.random() * 2 - 1) * amount;

const clamp01 = (x) => Math.min(1, Math.max(0, x));

// Stereo: D6 on the left, D4 on the right
function dest(die) {
    if (!die || !ctx.createStereoPanner) return master;
    const p = ctx.createStereoPanner();
    p.pan.value = die.sides === 4 ? 0.3 : -0.3;
    p.connect(master);
    return p;
}

function envelope(gain, t, peak, duration) {
    gain.gain.setValueAtTime(peak, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
}

function note(type, freq, t, peak, duration, freqEnd, out = master) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    // The active preset adjusts oscillator type, pitch, duration and gain.
    o.type = type ?? activePreset.osc;
    o.frequency.setValueAtTime(freq * activePreset.pitch, t);
    const dur = duration * activePreset.dur;
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd * activePreset.pitch, t + dur * 0.8);
    envelope(g, t, peak * activePreset.gain, dur);
    o.connect(g);
    g.connect(out);
    o.start(t);
    o.stop(t + dur + 0.02);
}

// Short filtered noise burst: base of ticks and impacts
function burst(t, freq, q, peak, duration, out = master) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    envelope(g, t, peak, duration);
    src.connect(f);
    f.connect(g);
    g.connect(out);
    src.start(t);
}


/* --- Dice --- */

const lastTickAt = new WeakMap();

/* A number goes by. The sound follows the speed (time since this die's last tick):
fast = dry and high; slowing down = lower, louder, with a small wooden body. */
export function tick(die) {
    if (!ready()) return;

    const t = ctx.currentTime;
    const now = performance.now();

    const dt = die ? now - (lastTickAt.get(die) ?? 0) : 40;
    if (die) lastTickAt.set(die, now);

    // 0 = top speed (~40 ms between ticks), 1 = almost stopped (~180 ms)
    const slow = dt > 400 ? 0.6 : clamp01((dt - 40) / 140);

    // Theme variant of the tick: pitch/timbre.
    const dicePitch = { classic: 1, sharp: 1.35, deep: 0.55, soft: 0.85, toy: 1.6 }[activePreset.dice] ?? 1;
    const base  = (die && die.sides === 4 ? 2300 : 1700) * (1 - 0.35 * slow) * dicePitch;
    const out   = dest(die);

    burst(t, (base + Math.random() * 1000) * vary(0.1), 3.5 + 3 * slow,
          (0.09 + 0.10 * slow) * vary(0.3), 0.028 + 0.02 * slow, out);

    if (slow > 0.35) {
        note(activePreset.osc, 280 * (1 - 0.3 * slow) * vary(0.08) * dicePitch, t, 0.05 * slow, 0.05, 150 * dicePitch, out);
    }
}

/* The die stops: "clunk" + impact. Higher values sound brighter. */
export function thunk(die, value) {
    if (!ready()) return;

    const t = ctx.currentTime;
    const sides = die ? die.sides : 6;
    const bright = value && sides > 1 ? (value - 1) / (sides - 1) : 0.5;

    // Theme variant of the stop: lower/higher, drier/rounder.
    const dicePitch = { classic: 1, sharp: 1.3, deep: 0.5, soft: 0.8, toy: 1.5 }[activePreset.dice] ?? 1;
    const start = (sides === 4 ? 190 : 150) * (0.92 + 0.16 * bright) * vary(0.06) * dicePitch;
    const out = dest(die);

    note(activePreset.osc, start, t, 0.16 * vary(0.25), 0.11 * activePreset.dur, 55 * vary(0.1) * dicePitch, out);
    burst(t, 900 * vary(0.2) * dicePitch, 1.2, 0.07 * vary(0.3), 0.03, out);
}


/* ---------------------------------------------------------
   INTERFACE
   --------------------------------------------------------- */

export function click() {
    if (!ready()) return;
    if (activePreset.wizz) {
        // MSN-nudge "wizz": fast rising glide
        const t = ctx.currentTime;
        note(activePreset.osc, 500, t, 0.09, 0.18, 1600);
        return;
    }
    note(activePreset.osc, 520 * vary(0.1), ctx.currentTime, 0.07 * vary(0.3), 0.05, 260 * vary(0.1));
}

/* Your turn */
export function ping() {
    if (!ready()) return;
    const t = ctx.currentTime;
    if (activePreset.wizz) {
        // Nudge MSN : deux glissants montants
        note(activePreset.osc, 600, t,        0.10, 0.20, 1800);
        note(activePreset.osc, 800, t + 0.12, 0.08, 0.22, 2000);
        return;
    }
    note(activePreset.osc, 784,  t,        0.10, 0.30);
    note(activePreset.osc, 1175, t + 0.09, 0.10, 0.38);
}

/* Refused action: two falling "bonks", like an error box */
export function bonk() {
    if (!ready()) return;
    const t = ctx.currentTime;
    note("square", 311, t,        0.04, 0.12);
    note("square", 233, t + 0.10, 0.04, 0.22);
}


/* --- Game events --- */

/* Damage: the bigger the amount, the heavier the impact. */
export function hit(amount = 1) {
    if (!ready()) return;

    const t = ctx.currentTime;
    const p = clamp01(amount / 6);

    note("sine", (150 - 40 * p) * vary(0.05), t, 0.12 + 0.08 * p, 0.14 + 0.08 * p, 45);
    burst(t, 700 * vary(0.2), 1, 0.10 + 0.08 * p, 0.05);

    if (amount >= 4) {                      // big hit: second impact
        note("sine", 110, t + 0.07, 0.12, 0.2, 40);
    }
}

/* Heal: small soft rising arpeggio */
export function heal() {
    if (!ready()) return;
    const t = ctx.currentTime;
    [523, 659, 784].forEach((f, i) => note("sine", f, t + i * 0.06, 0.06, 0.28));
}

/* Player death: low fall */
export function death() {
    if (!ready()) return;
    const t = ctx.currentTime;
    note("triangle", 260, t, 0.14, 0.7, 45);
    note("sine", 130, t, 0.12, 0.8, 35);
}

/* Victory: arpeggio + final chord */
export function tada() {
    if (!ready()) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => note("triangle", f, t + i * 0.07, 0.09, 0.5));
    [523, 659, 784, 1047].forEach((f) => note("sine", f, t + 0.32, 0.05, 1.2));
}


/* ---------------------------------------------------------
   Sourdine
   --------------------------------------------------------- */

export function isMuted() { return muted; }

export function setMuted(value) {
    muted = Boolean(value);
    try { localStorage.setItem(KEY, muted ? "1" : "0"); } catch { /* ignore */ }
}

export function toggleMuted() {
    setMuted(!muted);
    return muted;
}