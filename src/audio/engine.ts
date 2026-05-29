import { pluck, marimba, bass, perc, noteFreq } from './instruments';

// iMUSE-lite Web Audio engine: a lookahead scheduler plays a Spanish/Mediterranean
// groove (Andalusian cadence) that varies each bar so it never loops identically.
// Robust by design: if anything audio-related fails, it no-ops so the game still runs.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let wet: GainNode | null = null;
let noise: AudioBuffer | null = null;
let muted = false;
let running = false;
let timer: any = null;

let stepNo = 0;          // global 8th-note counter
let nextTime = 0;
const LOOKAHEAD = 0.025; // s between scheduler ticks
const AHEAD = 0.12;      // s scheduled in advance
const STEPS_PER_BAR = 8;

type ThemeName = 'town' | 'gate' | 'title';
let active: ThemeName = 'town';
let pending: ThemeName | null = null;

// chords as MIDI notes [bassRoot, mid, mid, mid]; E uses G#(56) for the major V
const CHORDS: Record<string, number[]> = {
  Am: [45, 57, 60, 64], G: [43, 55, 59, 62], F: [41, 53, 57, 60], E: [40, 52, 56, 59],
};
const THEMES: Record<ThemeName, { bpm: number; prog: string[]; scale: number[]; lead: boolean; percussion: boolean; gain: number }> = {
  town:  { bpm: 104, prog: ['Am', 'G', 'F', 'E'], scale: [57, 59, 60, 62, 64, 65, 67, 69], lead: true, percussion: true, gain: 0.9 },
  title: { bpm: 96,  prog: ['Am', 'F', 'G', 'E'], scale: [57, 60, 64, 65, 67, 69, 72], lead: true, percussion: true, gain: 1.0 },
  gate:  { bpm: 78,  prog: ['Am', 'Am', 'E', 'E'], scale: [57, 60, 62, 64, 67], lead: true, percussion: false, gain: 0.8 },
};

// guitar arpeggio: which step -> which chord-tone index
const ARP = [{ s: 0, i: 1 }, { s: 2, i: 2 }, { s: 3, i: 3 }, { s: 4, i: 2 }, { s: 6, i: 3 }, { s: 7, i: 1 }];

function makeNoise(c: AudioContext): AudioBuffer {
  const len = Math.floor(c.sampleRate * 0.3);
  const b = c.createBuffer(1, len, c.sampleRate);
  const d = b.getChannelData(0);
  let seed = 12345;
  for (let i = 0; i < len; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; d[i] = (seed / 0x3fffffff) - 1; }
  return b;
}
function makeImpulse(c: AudioContext): AudioBuffer {
  const len = Math.floor(c.sampleRate * 1.1);
  const b = c.createBuffer(2, len, c.sampleRate);
  let seed = 99;
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < len; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; d[i] = ((seed / 0x3fffffff) - 1) * Math.pow(1 - i / len, 2.6); }
  }
  return b;
}

export function start() {
  if (running) return;
  try {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.34;
    const comp = ctx.createDynamicsCompressor();
    const conv = ctx.createConvolver(); conv.buffer = makeImpulse(ctx);
    wet = ctx.createGain(); wet.gain.value = 0.16;
    master.connect(comp); comp.connect(ctx.destination);
    master.connect(wet); wet.connect(conv); conv.connect(ctx.destination);
    noise = makeNoise(ctx);
    nextTime = ctx.currentTime + 0.1;
    stepNo = 0;
    running = true;
    loop();
  } catch (e) {
    running = false;
  }
}

function spb(): number { return 60 / THEMES[active].bpm / 2; } // seconds per 8th-note

function loop() {
  if (!ctx || !master) return;
  while (nextTime < ctx.currentTime + AHEAD) {
    const stepInBar = stepNo % STEPS_PER_BAR;
    if (stepInBar === 0 && pending) { active = pending; pending = null; }
    schedule(stepInBar, Math.floor(stepNo / STEPS_PER_BAR), nextTime);
    nextTime += spb();
    stepNo++;
  }
  timer = setTimeout(loop, LOOKAHEAD * 1000);
}

// a cheap deterministic-ish hash for per-bar variation
function rnd(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function schedule(step: number, bar: number, time: number) {
  if (!ctx || !master) return;
  const th = THEMES[active];
  const chord = CHORDS[th.prog[bar % th.prog.length]];
  const g = th.gain;
  const sparse = Math.floor(bar / 4) % 2 === 1; // alternate fuller / sparser sections

  // bass on beats 1 and 3
  if (step === 0) bass(ctx, master, time, chord[0], spb() * 3, 0.5 * g);
  if (step === 4) bass(ctx, master, time, chord[0], spb() * 2.5, 0.42 * g);

  // guitar arpeggio
  for (const a of ARP) {
    if (a.s !== step) continue;
    if (sparse && (step === 3 || step === 7)) continue; // thin it out in the B section
    pluck(ctx, master, time, chord[a.i], spb() * 1.6, 0.26 * g);
  }

  // marimba lead — short varied motifs, often resting
  if (th.lead && !sparse) {
    const r = rnd(bar * 8 + step);
    const motifStep = (step === 2 || step === 3 || step === 6);
    if (motifStep && r > 0.45) {
      const sc = th.scale;
      const n = sc[Math.floor(rnd(bar * 13 + step * 7) * sc.length)];
      marimba(ctx, master, time, n, spb() * 1.4, 0.2 * g);
    }
  }

  // percussion
  if (th.percussion && noise) {
    if (step % 2 === 1) perc(ctx, master, noise, time, 'shaker', 0.3 * g);          // offbeat shaker
    const clave = (bar % 2 === 0) ? [0, 3, 6] : [2, 4];                              // son-clave-ish
    if (clave.includes(step)) perc(ctx, master, noise, time, 'clave', 0.34 * g);
    if (sparse && step === 0) perc(ctx, master, noise, time, 'palma', 0.4 * g);
  }
}

export function setTheme(name: ThemeName) {
  if (!running) { active = name; return; }
  if (name !== active) pending = name;
}

export function toggleMute(): boolean {
  muted = !muted;
  if (master && ctx) master.gain.setTargetAtTime(muted ? 0 : 0.34, ctx.currentTime, 0.05);
  return muted;
}
export function isMuted(): boolean { return muted; }

// quick synthesized one-shots
export function sfx(name: 'pickup' | 'give' | 'door' | 'win' | 'ui') {
  if (!ctx || !master || muted) return;
  const t = ctx.currentTime + 0.01;
  try {
    if (name === 'pickup') { marimba(ctx, master, t, 72, 0.12, 0.3); marimba(ctx, master, t + 0.07, 79, 0.18, 0.3); }
    else if (name === 'give') { [69, 73, 76, 81].forEach((m, i) => marimba(ctx!, master!, t + i * 0.07, m, 0.22, 0.3)); }
    else if (name === 'door') { bass(ctx, master, t, 33, 0.4, 0.5); perc(ctx, master, noise!, t, 'palma', 0.3); }
    else if (name === 'win') { [57, 60, 64, 69, 72, 76].forEach((m, i) => pluck(ctx!, master!, t + i * 0.1, m, 0.5, 0.3)); }
    else if (name === 'ui') { marimba(ctx, master, t, 84, 0.05, 0.12); }
  } catch (e) { /* ignore */ }
}
