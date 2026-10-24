// sound.js - sons synthétisés avec WebAudio (aucun fichier audio).
//
//   Dés :       tick(die)  thunk(die, value)        -> onTick / onSettle du DiceTray
//   Interface : click()  ping()  bonk()
//   Événements: hit(amount)  heal()  death()  tada()
//   Sourdine :  toggleMuted() / isMuted() / setMuted(v)   (mémorisé)
//
//   Thème sonore : setSoundTheme(id) change le "preset" actif (timbre, hauteur,
//   enveloppes). Chaque preset adapte les paramètres des fonctions ci-dessus.
//   Plus tard : on pourra ajouter des fichiers par thème (sounds/<id>/) en repli.

const KEY = "ftm-muted";

/* ---------------------------------------------------------
   PRESETS PAR THÈME
   Chaque preset définit des modificateurs consommés par les fonctions de son.
   - osc     : type d'oscillateur de base ("sine", "triangle", "square", "sawtooth")
   - pitch   : multiplicateur de hauteur global (1 = normal, <1 = grave, >1 = aigu)
   - dur     : multiplicateur de durée des notes
   - gain    : multiplicateur de volume global
   - wizz    : si true, click()/ping() jouent un glissant montant façon "nudge" MSN
   --------------------------------------------------------- */

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


/* ---------------------------------------------------------
   Initialisation (débloquée par le premier clic / première touche)
   --------------------------------------------------------- */

function ensure() {
    if (ctx) {
        if (ctx.state === "suspended") ctx.resume();
        return;
    }

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    ctx = new AC();

    const comp = ctx.createDynamicsCompressor();   // évite la saturation
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

// vary(0.1) -> nombre aléatoire entre 0.9 et 1.1
const vary = (amount) => 1 + (Math.random() * 2 - 1) * amount;

const clamp01 = (x) => Math.min(1, Math.max(0, x));

// Sortie stéréo : le D6 à gauche, le D4 à droite
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
    // Le preset actif module le type d'oscillateur, la hauteur, la duree et le gain.
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

// Petite salve de bruit filtré : base des "tic" et des impacts
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


/* ---------------------------------------------------------
   DÉS
   --------------------------------------------------------- */

const lastTickAt = new WeakMap();

/* Un chiffre passe. Le son dépend de la vitesse, déduite du temps écoulé
   depuis le tic précédent du même dé : rapide = sec et aigu ; en ralentissant,
   le tic devient plus grave, plus fort, avec un petit "corps" de bois. */
export function tick(die) {
    if (!ready()) return;

    const t = ctx.currentTime;
    const now = performance.now();

    const dt = die ? now - (lastTickAt.get(die) ?? 0) : 40;
    if (die) lastTickAt.set(die, now);

    // 0 = vitesse maximale (~40 ms entre deux tics), 1 = presque arrêté (~180 ms)
    const slow = dt > 400 ? 0.6 : clamp01((dt - 40) / 140);

    // Variante du roll selon le thème : hauteur/timbre du tic.
    const dicePitch = { classic: 1, sharp: 1.35, deep: 0.55, soft: 0.85, toy: 1.6 }[activePreset.dice] ?? 1;
    const base  = (die && die.sides === 4 ? 2300 : 1700) * (1 - 0.35 * slow) * dicePitch;
    const out   = dest(die);

    burst(t, (base + Math.random() * 1000) * vary(0.1), 3.5 + 3 * slow,
          (0.09 + 0.10 * slow) * vary(0.3), 0.028 + 0.02 * slow, out);

    if (slow > 0.35) {
        note(activePreset.osc, 280 * (1 - 0.3 * slow) * vary(0.08) * dicePitch, t, 0.05 * slow, 0.05, 150 * dicePitch, out);
    }
}

/* Le dé s'arrête : "clunk" + claque d'impact.
   Plus la valeur est haute, plus le son est clair. */
export function thunk(die, value) {
    if (!ready()) return;

    const t = ctx.currentTime;
    const sides = die ? die.sides : 6;
    const bright = value && sides > 1 ? (value - 1) / (sides - 1) : 0.5;

    // Variante de l'arrêt selon le thème : plus grave/aigu, plus sec/ronde.
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
        // "Wizz" façon MSN nudge : glissant montant rapide
        const t = ctx.currentTime;
        note(activePreset.osc, 500, t, 0.09, 0.18, 1600);
        return;
    }
    note(activePreset.osc, 520 * vary(0.1), ctx.currentTime, 0.07 * vary(0.3), 0.05, 260 * vary(0.1));
}

/* À toi de jouer */
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

/* Action refusée : deux "bonk" descendants, façon boîte d'erreur */
export function bonk() {
    if (!ready()) return;
    const t = ctx.currentTime;
    note("square", 311, t,        0.04, 0.12);
    note("square", 233, t + 0.10, 0.04, 0.22);
}


/* ---------------------------------------------------------
   ÉVÉNEMENTS DE JEU
   --------------------------------------------------------- */

/* Dégâts : plus le montant est élevé, plus l'impact est lourd. */
export function hit(amount = 1) {
    if (!ready()) return;

    const t = ctx.currentTime;
    const p = clamp01(amount / 6);

    note("sine", (150 - 40 * p) * vary(0.05), t, 0.12 + 0.08 * p, 0.14 + 0.08 * p, 45);
    burst(t, 700 * vary(0.2), 1, 0.10 + 0.08 * p, 0.05);

    if (amount >= 4) {                      // gros coup : deuxième choc
        note("sine", 110, t + 0.07, 0.12, 0.2, 40);
    }
}

/* Soin : petit arpège doux montant */
export function heal() {
    if (!ready()) return;
    const t = ctx.currentTime;
    [523, 659, 784].forEach((f, i) => note("sine", f, t + i * 0.06, 0.06, 0.28));
}

/* Mort d'un joueur : chute grave */
export function death() {
    if (!ready()) return;
    const t = ctx.currentTime;
    note("triangle", 260, t, 0.14, 0.7, 45);
    note("sine", 130, t, 0.12, 0.8, 35);
}

/* Victoire : arpège + accord final */
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
    try { localStorage.setItem(KEY, muted ? "1" : "0"); } catch { /* ignoré */ }
}

export function toggleMuted() {
    setMuted(!muted);
    return muted;
}