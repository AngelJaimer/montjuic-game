import { pluck, marimba, bass, perc, reed } from './instruments';

// iMUSE-lite Web Audio engine. A lookahead scheduler plays one of several styles
// (Andalusian groove, sardana, medieval) that vary each bar so they never loop
// identically. Robust: if anything audio-related fails, it no-ops so the game runs.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let wet: GainNode | null = null;
let noise: AudioBuffer | null = null;
let muted = false;
let running = false;
let timer: any = null;

let stepNo = 0;
let nextTime = 0;
const LOOKAHEAD = 0.025;
const AHEAD = 0.12;
const STEPS_PER_BAR = 8;

type ThemeName = 'town' | 'gate' | 'title' | 'sardana' | 'medieval';
let active: ThemeName = 'town';
let pending: ThemeName | null = null;
let manualSong: ThemeName | null = null; // when set, overrides per-room adaptivity

const CHORDS: Record<string, number[]> = {
  Am: [45, 57, 60, 64], G: [43, 55, 59, 62], F: [41, 53, 57, 60], E: [40, 52, 56, 59],
  C: [48, 60, 64, 67], Dm: [38, 57, 62, 65],
};
type Theme = { bpm: number; style: 'andalusian' | 'sardana' | 'medieval'; prog: string[]; scale: number[]; gain: number };
const THEMES: Record<ThemeName, Theme> = {
  town:     { bpm: 104, style: 'andalusian', prog: ['Am', 'G', 'F', 'E'], scale: [57, 59, 60, 62, 64, 65, 67, 69], gain: 0.9 },
  title:    { bpm: 96,  style: 'andalusian', prog: ['Am', 'F', 'G', 'E'], scale: [57, 60, 64, 65, 67, 69, 72], gain: 1.0 },
  gate:     { bpm: 78,  style: 'andalusian', prog: ['Am', 'Am', 'E', 'E'], scale: [57, 60, 62, 64, 67], gain: 0.8 },
  sardana:  { bpm: 116, style: 'sardana',    prog: ['C', 'F', 'G', 'C'], scale: [60, 62, 64, 65, 67, 69, 71, 72], gain: 0.85 },
  medieval: { bpm: 100, style: 'medieval',   prog: ['Dm', 'Dm', 'Dm', 'Dm'], scale: [62, 64, 65, 67, 69, 71, 72], gain: 0.85 },
};

const ARP = [{ s: 0, i: 1 }, { s: 2, i: 2 }, { s: 3, i: 3 }, { s: 4, i: 2 }, { s: 6, i: 3 }, { s: 7, i: 1 }];

// The song selector (UI) maps to themes; 'auto' = adaptive per room.
export const SONGS = [
  { label: 'Automática', key: 'auto' },
  { label: 'Mediterránea', key: 'town' },
  { label: 'Sardana', key: 'sardana' },
  { label: 'Medieval', key: 'medieval' },
];
let songKey = 'auto';
export function getSong(): string { return songKey; }
export function setSong(key: string) {
  songKey = key;
  if (key === 'auto') { manualSong = null; return; } // caller re-applies the room theme
  manualSong = key as ThemeName;
  if (!running) active = key as ThemeName;
  else if (key !== active) pending = key as ThemeName;
}

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
    if (ctx.state === 'suspended') ctx.resume();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.34;
    const comp = ctx.createDynamicsCompressor();
    const conv = ctx.createConvolver(); conv.buffer = makeImpulse(ctx);
    wet = ctx.createGain(); wet.gain.value = 0.16;
    master.connect(comp);
    master.connect(wet); wet.connect(conv);

    // On iOS, route output through a <audio> media element so the OS treats it as
    // media playback (plays through the silent switch, uses media volume) instead of
    // the ringer channel. Fall back to the speakers if that path isn't available.
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
    const toSpeakers = () => { try { comp.connect(ctx!.destination); conv.connect(ctx!.destination); } catch (e) { /* ignore */ } };
    let routed = false;
    if (iOS) {
      try {
        const sd = ctx.createMediaStreamDestination();
        comp.connect(sd); conv.connect(sd);
        let el = document.getElementById('audiosink') as HTMLAudioElement;
        if (!el) { el = new Audio(); el.id = 'audiosink'; document.body.appendChild(el); }
        (el as any).playsInline = true; el.autoplay = true;
        (el as any).srcObject = sd.stream;
        const p = el.play();
        if (p && p.catch) p.catch(() => toSpeakers());
        routed = true;
      } catch (e) { routed = false; }
    }
    if (!routed) toSpeakers();

    noise = makeNoise(ctx);
    nextTime = ctx.currentTime + 0.1;
    stepNo = 0;
    running = true;
    loop();
  } catch (e) {
    running = false;
  }
}

function spb(): number { return 60 / THEMES[active].bpm / 2; }

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

function rnd(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function schedule(step: number, bar: number, time: number) {
  if (!ctx || !master) return;
  const th = THEMES[active];
  const g = th.gain;
  const sc = th.scale;

  if (th.style === 'andalusian') {
    const chord = CHORDS[th.prog[bar % th.prog.length]];
    const sparse = Math.floor(bar / 4) % 2 === 1;
    if (step === 0) bass(ctx, master, time, chord[0], spb() * 3, 0.5 * g);
    if (step === 4) bass(ctx, master, time, chord[0], spb() * 2.5, 0.42 * g);
    for (const a of ARP) {
      if (a.s !== step) continue;
      if (sparse && (step === 3 || step === 7)) continue;
      pluck(ctx, master, time, chord[a.i], spb() * 1.6, 0.26 * g);
    }
    if (!sparse && (step === 2 || step === 3 || step === 6) && rnd(bar * 8 + step) > 0.45) {
      marimba(ctx, master, time, sc[Math.floor(rnd(bar * 13 + step * 7) * sc.length)], spb() * 1.4, 0.2 * g);
    }
    if (noise) {
      if (step % 2 === 1) perc(ctx, master, noise, time, 'shaker', 0.3 * g);
      const clave = (bar % 2 === 0) ? [0, 3, 6] : [2, 4];
      if (clave.includes(step)) perc(ctx, master, noise, time, 'clave', 0.34 * g);
    }
  } else if (th.style === 'sardana') {
    // lilting Catalan circle-dance: oom-pah bass + reedy tenora melody
    const chord = CHORDS[th.prog[bar % th.prog.length]];
    if (step === 0 || step === 4) bass(ctx, master, time, chord[0], spb() * 1.7, 0.48 * g);
    if (step === 2 || step === 6) { pluck(ctx, master, time, chord[1], spb() * 1.1, 0.2 * g); pluck(ctx, master, time, chord[2], spb() * 1.1, 0.17 * g); }
    if (rnd(bar * 17 + step * 3) > 0.3) {
      const idx = Math.floor((Math.sin(bar * 1.7 + step * 0.85) * 0.5 + 0.5) * (sc.length - 1) + rnd(bar * 5 + step) * 1.4) % sc.length;
      reed(ctx, master, time, sc[idx], spb() * 0.95, 0.17 * g);
    }
    if (noise) {
      if (step % 2 === 1) perc(ctx, master, noise, time, 'shaker', 0.2 * g);
      if (step === 0 || step === 4) perc(ctx, master, noise, time, 'clave', 0.22 * g);
    }
  } else {
    // medieval (Llibre Vermell flavour): open-fifth drone + modal reed + frame drum
    if (step === 0) { bass(ctx, master, time, 38, spb() * 8, 0.4 * g); bass(ctx, master, time, 45, spb() * 8, 0.28 * g); }
    if (step !== 1 && step !== 5 && rnd(bar * 23 + step * 5) > 0.28) {
      const idx = Math.floor((Math.sin(bar * 1.3 + step * 1.1) * 0.5 + 0.5) * (sc.length - 1)) % sc.length;
      reed(ctx, master, time, sc[idx], spb() * 0.9, 0.17 * g);
    }
    if (noise) {
      if (step === 0 || step === 4) perc(ctx, master, noise, time, 'palma', 0.42 * g);
      if (step === 2 || step === 6) perc(ctx, master, noise, time, 'palma', 0.22 * g);
      if (step % 2 === 1) perc(ctx, master, noise, time, 'shaker', 0.14 * g);
    }
  }
}

export function setTheme(name: ThemeName) {
  if (manualSong) return; // a manually-selected song overrides room adaptivity
  if (!running) { active = name; return; }
  if (name !== active) pending = name;
}

export function toggleMute(): boolean {
  muted = !muted;
  if (master && ctx) master.gain.setTargetAtTime(muted ? 0 : 0.34, ctx.currentTime, 0.05);
  return muted;
}
export function isMuted(): boolean { return muted; }

export function sfx(name: 'pickup' | 'give' | 'door' | 'win' | 'ui') {
  if (!ctx || !master || muted) return;
  const t = ctx.currentTime + 0.01;
  try {
    if (name === 'pickup') { marimba(ctx, master, t, 72, 0.12, 0.3); marimba(ctx, master, t + 0.07, 79, 0.18, 0.3); }
    else if (name === 'give') { [69, 73, 76, 81].forEach((m, i) => marimba(ctx!, master!, t + i * 0.07, m, 0.22, 0.3)); }
    else if (name === 'door') { bass(ctx, master, t, 33, 0.4, 0.5); if (noise) perc(ctx, master, noise, t, 'palma', 0.3); }
    else if (name === 'win') { [57, 60, 64, 69, 72, 76].forEach((m, i) => pluck(ctx!, master!, t + i * 0.1, m, 0.5, 0.3)); }
    else if (name === 'ui') { marimba(ctx, master, t, 84, 0.05, 0.12); }
  } catch (e) { /* ignore */ }
}
