/*
 * CARD SOUND ENGINE
 * Vanilla JavaScript + Web Audio API
 *
 * Direction : Soft Tactile / Digital Mystery
 * Aucun asset audio ni dépendance externe.
 */

const CardSound = (() => {
  let ctx = null;
  let master = null;
  let dryBus = null;
  let wetBus = null;
  let convolver = null;
  let noiseBuffer = null;
  let initialized = false;

  const settings = {
    volume: 0.75,
    muted: false,

    // Intensité des composantes
    texture: 0.28,
    resonance: 0.24,
    mystery: 0.60,
    depth: 0.40,

    // Réverbération discrète
    reverb: 0.13,

    // Évite que les actions répétées soient identiques
    variation: 0.12,
  };

  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

  const random = (min, max) =>
    min + Math.random() * (max - min);

  function init() {
    if (initialized) return;

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error("Web Audio API non disponible.");
    }

    ctx = new AudioContextClass();

    master = ctx.createGain();
    dryBus = ctx.createGain();
    wetBus = ctx.createGain();

    convolver = ctx.createConvolver();
    convolver.buffer = createImpulse(0.65, 2.2);

    master.gain.value = settings.volume;
    dryBus.gain.value = 1;
    wetBus.gain.value = settings.reverb;

    dryBus.connect(master);
    wetBus.connect(convolver);
    convolver.connect(master);
    master.connect(ctx.destination);

    noiseBuffer = createNoiseBuffer(0.5);

    initialized = true;
  }

  async function resume() {
    if (!initialized) init();

    if (ctx.state !== "running") {
      await ctx.resume();
    }
  }

  function createNoiseBuffer(duration) {
    const length = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Bruit adouci : chaque échantillon est corrélé au précédent.
    let previous = 0;

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      previous = previous * 0.72 + white * 0.28;
      data[i] = previous;
    }

    return buffer;
  }

  function createImpulse(duration, decay) {
    const length = Math.floor(ctx.sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);

      for (let i = 0; i < length; i++) {
        const t = i / length;
        const envelope = Math.pow(1 - t, decay);
        const diffuse = Math.random() * 2 - 1;

        // Réverbération sombre, sans queue métallique prononcée.
        data[i] = diffuse * envelope * 0.20;
      }
    }

    return impulse;
  }

  function route(node, wet = 0.15) {
    node.connect(dryBus);

    if (wet > 0) {
      const send = ctx.createGain();
      send.gain.value = wet;
      node.connect(send);
      send.connect(wetBus);
    }
  }

  // Enveloppe sans discontinuité brutale.
  function envelope(gain, start, peak, attack, decay, end) {
    gain.gain.cancelScheduledValues(start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, peak),
      start + attack
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      start + attack + decay
    );

    gain.gain.setValueAtTime(0.0001, end);
  }

  /*
   * Résonateur :
   * une fréquence, une attaque et une décroissance.
   * Plusieurs résonateurs simultanés créent le timbre.
   */
  function resonator({
    frequency,
    volume,
    attack = 0.006,
    decay = 0.12,
    type = "sine",
    detune = 0,
    wet = 0.12,
    start = ctx.currentTime,
  }) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    osc.detune.setValueAtTime(detune, start);

    envelope(
      gain,
      start,
      volume,
      attack,
      decay,
      start + attack + decay + 0.01
    );

    osc.connect(gain);
    route(gain, wet);

    osc.start(start);
    osc.stop(start + attack + decay + 0.025);
  }

  /*
   * Microtexture :
   * petit souffle modelé par un filtre qui bouge
   * pendant le son. Ce n'est pas un bruit constant.
   */
  function texture({
    duration = 0.08,
    volume = 0.025,
    cutoff = 1800,
    attack = 0.008,
    wet = 0.08,
    start = ctx.currentTime,
  } = {}) {
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    source.buffer = noiseBuffer;

    filter.type = "bandpass";
    filter.Q.value = 0.8;
    filter.frequency.setValueAtTime(cutoff * 1.5, start);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(180, cutoff * 0.65),
      start + duration
    );

    envelope(
      gain,
      start,
      volume,
      Math.min(attack, duration * 0.4),
      duration,
      start + duration + 0.01
    );

    source.connect(filter);
    filter.connect(gain);
    route(gain, wet);

    source.start(start);
    source.stop(start + duration + 0.015);
  }

  /*
   * Transitoire de contact :
   * une petite impulsion texturée, sans clic brutal.
   */
  function transient({
    volume = 0.035,
    duration = 0.025,
    frequency = 950,
    start = ctx.currentTime,
  } = {}) {
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    source.buffer = noiseBuffer;

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(frequency, start);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(200, frequency * 0.55),
      start + duration
    );
    filter.Q.value = 1.1;

    envelope(
      gain,
      start,
      volume,
      0.003,
      duration,
      start + duration + 0.005
    );

    source.connect(filter);
    filter.connect(gain);
    route(gain, 0.04);

    source.start(start);
    source.stop(start + duration + 0.01);
  }

  /*
   * Couche mystérieuse :
   * des partiels inharmoniques et légèrement désaccordés.
   * Le niveau reste proportionnel au réglage mystery.
   */
  function shimmer(base, start, intensity = 1) {
    const amount = settings.mystery * intensity;

    if (amount <= 0) return;

    resonator({
      frequency: base * 2.76,
      volume: 0.010 * amount,
      attack: 0.012,
      decay: 0.16,
      detune: random(-5, 5),
      wet: 0.25,
      start,
    });

    resonator({
      frequency: base * 4.13,
      volume: 0.0045 * amount,
      attack: 0.018,
      decay: 0.22,
      detune: random(-7, 7),
      wet: 0.35,
      start: start + 0.008,
    });
  }

  function variation(value) {
    return value * random(
      1 - settings.variation,
      1 + settings.variation
    );
  }

  /*
   * PRENDRE UNE CARTE
   *
   * Sensation : la carte quitte doucement sa surface.
   * Un mouvement léger, une matière douce, une résonance.
   */
  function pickup() {
    if (!initialized || settings.muted) return;

    const now = ctx.currentTime + 0.005;
    const v = settings.texture;

    transient({
      volume: 0.022 * v / 0.28,
      duration: 0.022,
      frequency: variation(1350),
      start: now,
    });

    texture({
      duration: 0.070,
      volume: 0.018 * v,
      cutoff: variation(2100),
      attack: 0.014,
      start: now + 0.008,
    });

    resonator({
      frequency: variation(310),
      volume: 0.016 * settings.resonance,
      attack: 0.009,
      decay: 0.085,
      wet: 0.13,
      start: now + 0.012,
    });

    shimmer(310, now + 0.018, 0.55);
  }

  /*
   * DÉPLACER UNE CARTE
   *
   * Sensation : un glissement directionnel,
   * avec une évolution de timbre au lieu d'un son statique.
   */
  function slide() {
    if (!initialized || settings.muted) return;

    const now = ctx.currentTime + 0.005;
    const duration = random(0.085, 0.125);

    texture({
      duration,
      volume: 0.025 * settings.texture,
      cutoff: variation(1550),
      attack: 0.025,
      wet: 0.07,
      start: now,
    });

    // Deux petites composantes décalées donnent du mouvement.
    resonator({
      frequency: variation(390),
      volume: 0.012 * settings.resonance,
      attack: 0.025,
      decay: duration,
      detune: random(-4, 4),
      wet: 0.12,
      start: now + 0.018,
    });

    resonator({
      frequency: variation(520),
      volume: 0.005 * settings.resonance,
      attack: 0.035,
      decay: duration * 0.7,
      detune: random(-5, 5),
      wet: 0.18,
      start: now + 0.038,
    });
  }

  /*
   * JOUER UNE CARTE
   *
   * Sensation : un contact doux, mais mémorable.
   * Pas de gros impact grave ni de note musicale explicite.
   */
  function play() {
    if (!initialized || settings.muted) return;

    const now = ctx.currentTime + 0.005;
    const depth = settings.depth;
    const resonance = settings.resonance;

    transient({
      volume: 0.038,
      duration: 0.026,
      frequency: variation(780),
      start: now,
    });

    // Corps de la carte : deux résonances, pas un simple bip.
    resonator({
      frequency: variation(185),
      volume: 0.040 * (0.7 + depth * 0.5),
      attack: 0.004,
      decay: 0.095,
      detune: random(-2, 2),
      wet: 0.16,
      start: now,
    });

    resonator({
      frequency: variation(287),
      volume: 0.019 * resonance,
      attack: 0.007,
      decay: 0.125,
      detune: random(-4, 4),
      wet: 0.22,
      start: now + 0.003,
    });

    // Texture de contact, très courte.
    texture({
      duration: 0.050,
      volume: 0.025 * settings.texture,
      cutoff: variation(1100),
      attack: 0.004,
      wet: 0.07,
      start: now,
    });

    // Signature numérique : elle arrive après le contact.
    shimmer(185, now + 0.012, 0.8);
  }

  function set(options = {}) {
    for (const key of Object.keys(options)) {
      if (!(key in settings)) continue;

      if (key === "muted") {
        settings.muted = Boolean(options.muted);
        continue;
      }

      const value = Number(options[key]);
      if (!Number.isFinite(value)) continue;

      settings[key] = clamp(value, 0, 1);
    }

    if (initialized) {
      const now = ctx.currentTime;

      master.gain.setTargetAtTime(
        settings.muted ? 0 : settings.volume,
        now,
        0.015
      );

      wetBus.gain.setTargetAtTime(
        settings.reverb,
        now,
        0.025
      );
    }
  }

  function getSettings() {
    return { ...settings };
  }

  return {
    init,
    resume,
    pickup,
    slide,
    play,
    set,
    getSettings,
  };
})();

export default CardSound;

/* ---------------- Adaptation GoG (surface attendue par app.js) ----------------
   CardSound.pickup/slide/play pour les cartes ; les événements de partie
   (colonne, ×2, manche, victoire) restent synthétisés en petites notes. */

export function setMuted(v) { CardSound.set({ muted: v }); }
export function isMuted() { return CardSound.getSettings().muted; }

// Débloque l'audio au premier geste (politique autoplay des navigateurs).
["pointerdown", "keydown"].forEach((type) =>
  window.addEventListener(type, () => { CardSound.resume().catch(() => {}); }, { passive: true })
);

const ready = () => !isMuted();

// Petite note auxiliaire via un contexte dédié léger (évite de toucher au moteur carte).
let auxCtx = null;
function auxAudio() {
  if (!auxCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    auxCtx = new AC();
  }
  if (auxCtx.state === "suspended") auxCtx.resume();
  return auxCtx;
}
function note(type, freq, peak, duration, freqEnd, delay = 0) {
  const ac = auxAudio();
  if (!ac) return;
  const t = ac.currentTime + delay;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t + duration * 0.8);
  g.gain.setValueAtTime(peak, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + duration);
  o.connect(g);
  g.connect(ac.destination);
  o.start(t);
  o.stop(t + duration + 0.02);
}

// Clic d'interface discret.
export function click() {
  if (!ready()) return;
  note("sine", 540, 0.07, 0.05);
}

// Carte générique : glissement feutré.
export function flip() {
  if (!ready()) return;
  CardSound.slide();
}

// Colonne retirée : glissement grave.
export function column() {
  if (!ready()) return;
  note("sine", 200, 0.16, 0.3, 95);
}

// Greedy puni : deux notes descendantes.
export function greedy() {
  if (!ready()) return;
  note("triangle", 294, 0.1, 0.14);
  note("triangle", 175, 0.11, 0.24, null, 0.15);
}

// Fin de manche : petit accord.
export function round() {
  if (!ready()) return;
  note("sine", 392, 0.1, 0.28);
  note("sine", 523, 0.1, 0.34, null, 0.07);
}

// Victoire finale : arpège montant feutré.
export function win() {
  if (!ready()) return;
  [392, 494, 587, 784].forEach((f, i) => note("sine", f, 0.11, 0.4, null, i * 0.1));
}

// Coup refusé : petit buzz grave assoupli.
export function bad() {
  if (!ready()) return;
  note("triangle", 110, 0.07, 0.16, 80);
}

// Joue les sons des événements moteur frais (appelé à chaque nouvelle vue).
// try/catch : un AudioContext pas prêt ne doit jamais casser le rendu.
export function playEvents(events) {
  if (!ready() || !events?.length) return;
  try {
    for (const e of events) {
      if (e.type === "swap" || e.type === "discardFlip" || e.type === "initialReveal") CardSound.play();
      else if (e.type === "drawPile" || e.type === "drawDiscard") CardSound.pickup();
      else if (e.type === "columnRemoved") column();
      else if (e.type === "roundEnd") { if (e.doubled) greedy(); else round(); }
      else if (e.type === "gameOver") win();
    }
  } catch { /* contexte audio indisponible */ }
}