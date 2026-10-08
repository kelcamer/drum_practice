// Web Audio synthesized drum kit — no sample files.

let AC = null;
let MASTER = null;

function ctx() {
  if (!AC) {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    MASTER = AC.createGain();
    MASTER.gain.value = 0.9;
    MASTER.connect(AC.destination);
  }
  return AC;
}

export function resume() {
  ctx().resume();
}
export function now() {
  return ctx().currentTime;
}

function noise(dur) {
  const c = ctx();
  const n = Math.floor(c.sampleRate * dur);
  const b = c.createBuffer(1, n, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

function env(g, t, a, d, peak) {
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

// Toms: a pitched sine that sags a little, plus a short noise slap for the stick.
function tomVoice(t, v, hi, lo, decay) {
  const c = ctx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(hi, t);
  o.frequency.exponentialRampToValueAtTime(lo, t + decay * 0.8);
  env(g, t, 0.003, decay, 0.85 * v);
  o.connect(g);
  g.connect(MASTER);
  o.start(t);
  o.stop(t + decay + 0.05);
  const s = c.createBufferSource();
  s.buffer = noise(0.05);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = hi * 6;
  const ng = c.createGain();
  env(ng, t, 0.001, 0.03, 0.25 * v);
  s.connect(bp);
  bp.connect(ng);
  ng.connect(MASTER);
  s.start(t);
  s.stop(t + 0.05);
}

const V = {
  tom(t, v) {
    tomVoice(t, v, 240, 170, 0.32);
  },
  floor(t, v) {
    tomVoice(t, v, 120, 82, 0.5);
  },
  kick(t, v) {
    const c = ctx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
    env(g, t, 0.004, 0.42, 1.0 * v);
    o.connect(g);
    g.connect(MASTER);
    o.start(t);
    o.stop(t + 0.5);
  },
  snare(t, v) {
    const c = ctx();
    const s = c.createBufferSource();
    s.buffer = noise(0.3);
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1400;
    const ng = c.createGain();
    env(ng, t, 0.003, 0.19, 0.7 * v);
    s.connect(hp);
    hp.connect(ng);
    ng.connect(MASTER);
    s.start(t);
    s.stop(t + 0.3);
    const o = c.createOscillator();
    const og = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(190, t);
    env(og, t, 0.002, 0.12, 0.45 * v);
    o.connect(og);
    og.connect(MASTER);
    o.start(t);
    o.stop(t + 0.2);
  },
  hat(t, v) {
    const c = ctx();
    const s = c.createBufferSource();
    s.buffer = noise(0.08);
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 8000;
    const g = c.createGain();
    env(g, t, 0.001, 0.05, 0.42 * v);
    s.connect(hp);
    hp.connect(g);
    g.connect(MASTER);
    s.start(t);
    s.stop(t + 0.08);
  },
  openhat(t, v) {
    const c = ctx();
    const s = c.createBufferSource();
    s.buffer = noise(0.4);
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7000;
    const g = c.createGain();
    env(g, t, 0.002, 0.32, 0.4 * v);
    s.connect(hp);
    hp.connect(g);
    g.connect(MASTER);
    s.start(t);
    s.stop(t + 0.42);
  },
  ride(t, v) {
    const c = ctx();
    const s = c.createBufferSource();
    s.buffer = noise(0.6);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 6000;
    bp.Q.value = 0.6;
    const g = c.createGain();
    env(g, t, 0.002, 0.5, 0.3 * v);
    s.connect(bp);
    bp.connect(g);
    g.connect(MASTER);
    s.start(t);
    s.stop(t + 0.6);
    const o = c.createOscillator();
    const og = c.createGain();
    o.type = "square";
    o.frequency.value = 520;
    env(og, t, 0.002, 0.35, 0.06 * v);
    o.connect(og);
    og.connect(MASTER);
    o.start(t);
    o.stop(t + 0.5);
  },
  crash(t, v) {
    const c = ctx();
    const s = c.createBufferSource();
    s.buffer = noise(1.2);
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 4000;
    const g = c.createGain();
    env(g, t, 0.003, 1.1, 0.5 * v);
    s.connect(hp);
    hp.connect(g);
    g.connect(MASTER);
    s.start(t);
    s.stop(t + 1.2);
  },
};

/** Play a voice at audio-clock time `t` with velocity `v` (0..1). */
export function play(voice, t, v) {
  (V[voice] || V.hat)(t, v == null ? 1 : v);
}

export const KIT = [
  { id: "kick", label: "Kick", key: "A" },
  { id: "snare", label: "Snare", key: "S" },
  { id: "hat", label: "Hi-Hat", key: "D" },
  { id: "ride", label: "Ride", key: "F" },
  { id: "crash", label: "Crash", key: "G" },
  { id: "tom", label: "Hi Tom", key: "H" },
  { id: "floor", label: "Floor", key: "J" },
];
export const KEYMAP = { a: "kick", s: "snare", d: "hat", f: "ride", g: "crash", h: "tom", j: "floor" };
