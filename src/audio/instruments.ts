// Tiny synth voices for the soundtrack. Enveloped oscillators (a plucked-string
// flavour) rather than true Karplus-Strong — reliable and warm enough for the
// lazy Mediterranean groove.

export function noteFreq(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12);
}

// Nylon-guitar-ish pluck: triangle + a little sawtooth bite, fast attack, lowpass closing.
export function pluck(ctx: AudioContext, dest: AudioNode, time: number, m: number, dur: number, gain: number) {
  const f = noteFreq(m);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(gain, time + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(3600, time);
  lp.frequency.exponentialRampToValueAtTime(700, time + dur);
  const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = f;
  const o2 = ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = f;
  const o2g = ctx.createGain(); o2g.gain.value = 0.22;
  o1.connect(g); o2.connect(o2g); o2g.connect(g); g.connect(lp); lp.connect(dest);
  o1.start(time); o2.start(time);
  o1.stop(time + dur + 0.05); o2.stop(time + dur + 0.05);
}

// Marimba / steel-drum lead: sine + a high partial, very fast decay.
export function marimba(ctx: AudioContext, dest: AudioNode, time: number, m: number, dur: number, gain: number) {
  const f = noteFreq(m);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(gain, time + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 4;
  const o2g = ctx.createGain(); o2g.gain.value = 0.14;
  o.connect(g); o2.connect(o2g); o2g.connect(g); g.connect(dest);
  o.start(time); o2.start(time);
  o.stop(time + dur + 0.05); o2.stop(time + dur + 0.05);
}

// Soft upright bass.
export function bass(ctx: AudioContext, dest: AudioNode, time: number, m: number, dur: number, gain: number) {
  const f = noteFreq(m);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(gain, time + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520;
  const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
  o.connect(g); g.connect(lp); lp.connect(dest);
  o.start(time); o.stop(time + dur + 0.05);
}

// Percussion from a noise buffer: clave, shaker, palma (hand-clap).
export function perc(ctx: AudioContext, dest: AudioNode, noise: AudioBuffer, time: number, type: 'clave' | 'shaker' | 'palma', gain: number) {
  const src = ctx.createBufferSource(); src.buffer = noise;
  const bp = ctx.createBiquadFilter();
  const g = ctx.createGain();
  if (type === 'clave') {
    bp.type = 'bandpass'; bp.frequency.value = 2100; bp.Q.value = 4;
    g.gain.setValueAtTime(gain, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
  } else if (type === 'shaker') {
    bp.type = 'highpass'; bp.frequency.value = 6500;
    g.gain.setValueAtTime(gain * 0.5, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
  } else {
    bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 1.2;
    g.gain.setValueAtTime(gain, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
  }
  src.connect(bp); bp.connect(g); g.connect(dest);
  src.start(time); src.stop(time + 0.12);
}

// Reedy double-reed voice (tenora / shawm flavour): sawtooth through a bandpass
// with vibrato and a slow-ish attack + sustain. For sardana & medieval leads.
export function reed(ctx: AudioContext, dest: AudioNode, time: number, m: number, dur: number, gain: number) {
  const f = noteFreq(m);
  const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
  const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 5.5;
  const lfg = ctx.createGain(); lfg.gain.value = f * 0.012;
  lfo.connect(lfg); lfg.connect(o.frequency);
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * 2.4; bp.Q.value = 2.2;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.linearRampToValueAtTime(gain, time + 0.03);
  g.gain.setValueAtTime(gain, time + Math.max(0.05, dur - 0.06));
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  o.connect(bp); bp.connect(g); g.connect(dest);
  o.start(time); lfo.start(time);
  o.stop(time + dur + 0.05); lfo.stop(time + dur + 0.05);
}
