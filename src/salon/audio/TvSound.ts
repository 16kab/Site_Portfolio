import type { Vector3 } from 'three';
import type { AudioEngine } from './engine';

type Programme = {
  bpm: number;
  /** MIDI note of the tonic. */
  root: number;
  scale: number[];
  lead: OscillatorType;
  /** 16 steps of scale degrees (null = rest). */
  melody: (number | null)[];
  bass: (number | null)[];
  level: number;
};

const MAJOR_PENTA = [0, 2, 4, 7, 9];
const MINOR_PENTA = [0, 3, 5, 7, 10];
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const DORIAN = [0, 2, 3, 5, 7, 9, 10];
const MINOR = [0, 2, 3, 5, 7, 8, 10];

/** Small deterministic PRNG so every channel always plays the same tune. */
function seeded(seed: number): () => number {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function programme(
  seed: number,
  bpm: number,
  root: number,
  scale: number[],
  lead: OscillatorType,
  density: number,
  level = 1,
): Programme {
  const random = seeded(seed);
  const melody: (number | null)[] = [];
  let degree = 0;
  for (let i = 0; i < 16; i++) {
    const strong = i % 4 === 0;
    if (random() < (strong ? density + 0.3 : density)) {
      degree += Math.round((random() - 0.5) * 4);
      degree = Math.max(-2, Math.min(scale.length + 3, degree));
      melody.push(degree);
    } else {
      melody.push(null);
    }
  }
  const bass = Array.from({ length: 16 }, (_, i) =>
    i % 8 === 0 ? 0 : i % 8 === 4 ? (random() < 0.5 ? 4 : 2) : null,
  );
  return { bpm, root, scale, lead, melody, bass, level };
}

/** Placeholder soundtracks, one per fake channel (same order as projects). */
const PROGRAMMES: Programme[] = [
  programme(1, 92, 62, MAJOR_PENTA, 'triangle', 0.45),
  programme(2, 80, 60, MAJOR, 'sine', 0.35, 1.2),
  programme(3, 112, 57, MINOR, 'sawtooth', 0.5, 0.6),
  programme(4, 68, 50, MINOR_PENTA, 'square', 0.18, 0.7),
  programme(5, 120, 64, MAJOR, 'square', 0.5, 0.55),
  programme(6, 132, 67, MAJOR_PENTA, 'square', 0.6, 0.5),
  programme(7, 74, 62, DORIAN, 'sine', 0.3, 1.2),
  programme(8, 100, 58, DORIAN, 'triangle', 0.4),
  programme(9, 104, 65, MAJOR_PENTA, 'triangle', 0.55),
  programme(10, 116, 60, MAJOR, 'sawtooth', 0.5, 0.6),
];

function midiToHz(note: number): number {
  return 440 * 2 ** ((note - 69) / 12);
}

/**
 * Everything that comes out of the TV: the channel's programme (generative
 * placeholder music until the real loops exist), static, the 15.7 kHz line
 * whine. All of it goes through a small, boxy CRT speaker placed on the TV.
 */
export class TvSound {
  private readonly speaker: AudioNode;
  private readonly programmeLevel: GainNode;
  /** Static and zapping crackle, on their own fader. */
  private readonly noise: GainNode;
  private readonly whine: GainNode;
  private channel = 0;
  private on = true;
  private step = 0;
  private nextStep = 0;

  constructor(
    private readonly engine: AudioEngine,
    position: Vector3,
  ) {
    const e = engine;
    const panner = e.busPanner(position, e.tv, 0.35);
    const shaper = e.ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      curve[i] = Math.tanh(x * 1.8);
    }
    shaper.curve = curve;
    const honk = e.filter('peaking', 1700, 1.4);
    honk.gain.value = 5;
    const input = e.filter('highpass', 230, 0.8);
    input
      .connect(honk)
      .connect(e.filter('lowpass', 4200, 0.9))
      .connect(shaper)
      .connect(panner);
    this.speaker = input;

    this.programmeLevel = e.gain(1);
    this.programmeLevel.connect(e.fader('tvMusic')).connect(this.speaker);
    this.noise = e.fader('tvStatic');
    this.noise.connect(this.speaker);

    this.whine = e.gain(0.004);
    const osc = e.ctx.createOscillator();
    osc.frequency.value = 15734;
    osc.connect(this.whine).connect(panner);
    osc.start();

    this.nextStep = e.now + 0.1;
  }

  setChannel(index: number): void {
    this.channel = index % PROGRAMMES.length;
    this.step = 0;
  }

  setPower(on: boolean): void {
    this.on = on;
    const t = this.engine.now;
    this.programmeLevel.gain.setTargetAtTime(on ? 1 : 0, t, on ? 0.3 : 0.05);
    this.whine.gain.setTargetAtTime(on ? 0.004 : 0, t, 0.2);
  }

  /** Programme ducks under the static while the channel changes. */
  zap(duration: number): void {
    const t = this.engine.now;
    const g = this.programmeLevel.gain;
    g.cancelScheduledValues(t);
    g.setTargetAtTime(0, t, 0.01);
    g.setTargetAtTime(1, t + duration, 0.08);
    // the real zapping crackle; synthetic static covers longer gaps
    const played = this.engine.play('zapping', this.noise, { gain: 0.8 });
    if (!played || duration > 0.35) this.static(duration + 0.05);
  }

  static(duration: number, level = 0.5): void {
    const e = this.engine;
    const t = e.now;
    const noise = e.burst(e.white, t, duration);
    const env = e.gain(0);
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(level, t + 0.012);
    env.gain.setValueAtTime(level, t + duration * 0.7);
    env.gain.linearRampToValueAtTime(0, t + duration);
    noise
      .connect(e.filter('bandpass', 2400, 0.6))
      .connect(env)
      .connect(this.noise);
  }

  update(): void {
    const e = this.engine;
    if (!this.on) {
      this.nextStep = e.now + 0.1;
      return;
    }
    const p = PROGRAMMES[this.channel];
    const sixteenth = 60 / p.bpm / 4;
    while (this.nextStep < e.now + 0.15) {
      const t = this.nextStep;
      const i = this.step % 16;
      const degree = p.melody[i];
      if (degree !== null)
        this.note(t, p, degree, 12, p.lead, sixteenth * 1.6, 0.05);
      const bass = p.bass[i];
      if (bass !== null)
        this.note(t, p, bass, -12, 'triangle', sixteenth * 3.5, 0.09);
      this.step++;
      this.nextStep += sixteenth;
    }
  }

  private note(
    t: number,
    p: Programme,
    degree: number,
    octaveShift: number,
    type: OscillatorType,
    length: number,
    level: number,
  ): void {
    const e = this.engine;
    const n = p.scale.length;
    const octave = Math.floor(degree / n);
    const semitone = p.scale[((degree % n) + n) % n] + octave * 12;
    const osc = e.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = midiToHz(p.root + semitone + octaveShift);
    const env = e.gain(0);
    const peak = level * p.level;
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(peak, t + 0.012);
    env.gain.exponentialRampToValueAtTime(peak * 0.4, t + length * 0.5);
    env.gain.exponentialRampToValueAtTime(0.0001, t + length);
    osc.connect(env).connect(this.programmeLevel);
    osc.start(t);
    osc.stop(t + length + 0.02);
  }
}
