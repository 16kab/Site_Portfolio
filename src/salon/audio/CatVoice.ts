import { MathUtils, Vector3 } from 'three';
import type { AudioEngine } from './engine';

const { randFloat } = MathUtils;

/**
 * The cat's sounds, placed on the cat: meows ("mi-a-ou": pitch rise and
 * fall with the formants sweeping i → a → u), a purr (low noise pulsed at
 * ~25 Hz, breathing in and out) and soft landings after a jump.
 */
export class CatVoice {
  private readonly panner: PannerNode;
  private readonly purrLevel: GainNode;
  private purring = false;
  /** Harmonic-rich wave shaped like vocal fold pulses. */
  private readonly glottal: PeriodicWave;

  constructor(private readonly engine: AudioEngine) {
    const e = engine;
    const harmonics = 48;
    const real = new Float32Array(harmonics);
    const imag = new Float32Array(harmonics);
    for (let n = 1; n < harmonics; n++) imag[n] = 1 / n ** 1.3;
    this.glottal = e.ctx.createPeriodicWave(real, imag);
    this.panner = e.panner(new Vector3(0, 0.2, 0), e.ambience, 0.35);
    this.panner.refDistance = 0.6;

    // purr: always running, gated by purrLevel
    this.purrLevel = e.gain(0);
    const rumble = e.loop(e.brown);
    // ~24 pulses per second (gain swings between 0 and 1)
    const pulse = e.gain(0.5);
    const lfo = e.ctx.createOscillator();
    lfo.type = 'sawtooth';
    lfo.frequency.value = 24;
    lfo.connect(e.gain(0.5)).connect(pulse.gain);
    lfo.start();
    // breathing: slow swell, the inhale purr is softer and higher
    const breathing = e.gain(0.65);
    const breath = e.ctx.createOscillator();
    breath.frequency.value = 0.42;
    breath.connect(e.gain(0.35)).connect(breathing.gain);
    breath.connect(e.gain(2)).connect(lfo.frequency);
    breath.start();
    rumble
      .connect(e.filter('lowpass', 240, 1.5))
      .connect(pulse)
      .connect(breathing)
      .connect(this.purrLevel)
      .connect(this.panner);
  }

  follow(position: Vector3): void {
    this.engine.place(this.panner, position);
  }

  purr(on: boolean): void {
    if (on === this.purring) return;
    this.purring = on;
    const t = this.engine.now;
    this.purrLevel.gain.setTargetAtTime(on ? 0.7 : 0, t, on ? 1.2 : 0.4);
  }

  /**
   * A real "mi-a-ou": closed nasal onset (m), the mouth opens (é-a, first
   * formant up, bright), then closes (ou, formants down) while the pitch
   * rises then falls. Glottal-like source with irregular jitter + breath.
   */
  meow(intensity = 1): void {
    const e = this.engine;
    const t = e.now + 0.02;
    const d = randFloat(0.55, 0.85) * (0.85 + intensity * 0.2);
    const p = randFloat(520, 650);
    const voice = this.voiceSource(t, d);
    const f = voice.osc.frequency;
    f.setValueAtTime(p * 0.78, t);
    f.linearRampToValueAtTime(p * 1.32, t + d * 0.35);
    f.linearRampToValueAtTime(p * 1.22, t + d * 0.6);
    f.linearRampToValueAtTime(p * 0.72, t + d);

    const { f1, f2, mouth } = this.tract(voice.out, t);
    // m → é → a → ou
    f1.frequency.setValueAtTime(260, t);
    f1.frequency.linearRampToValueAtTime(700, t + d * 0.18);
    f1.frequency.linearRampToValueAtTime(980, t + d * 0.45);
    f1.frequency.linearRampToValueAtTime(420, t + d);
    f2.frequency.setValueAtTime(1800, t);
    f2.frequency.linearRampToValueAtTime(1950, t + d * 0.2);
    f2.frequency.linearRampToValueAtTime(1500, t + d * 0.5);
    f2.frequency.linearRampToValueAtTime(850, t + d);
    mouth.frequency.setValueAtTime(800, t);
    mouth.frequency.exponentialRampToValueAtTime(5200, t + d * 0.2);
    mouth.frequency.exponentialRampToValueAtTime(1600, t + d);

    const env = e.gain(0);
    const peak = 0.4 * intensity;
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(peak * 0.25, t + d * 0.08);
    env.gain.exponentialRampToValueAtTime(peak, t + d * 0.25);
    env.gain.setValueAtTime(peak, t + d * 0.6);
    env.gain.exponentialRampToValueAtTime(0.0001, t + d);
    mouth.connect(env).connect(this.panner);
  }

  /** "Mrrp": the short rolled greeting trill of a cat arriving. */
  trill(): void {
    const e = this.engine;
    const t = e.now + 0.02;
    const d = randFloat(0.28, 0.4);
    const p = randFloat(420, 520);
    const voice = this.voiceSource(t, d);
    const f = voice.osc.frequency;
    f.setValueAtTime(p * 0.85, t);
    f.linearRampToValueAtTime(p * 1.05, t + d * 0.6);
    f.linearRampToValueAtTime(p * 1.4, t + d);

    const { f1, f2, mouth } = this.tract(voice.out, t);
    f1.frequency.setValueAtTime(280, t);
    f1.frequency.linearRampToValueAtTime(600, t + d);
    f2.frequency.setValueAtTime(1500, t);
    f2.frequency.linearRampToValueAtTime(1900, t + d);
    mouth.frequency.setValueAtTime(1200, t);
    mouth.frequency.exponentialRampToValueAtTime(4000, t + d);

    // the roll: ~28 Hz amplitude flutter
    const roll = e.gain(0.5);
    const lfo = e.ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = randFloat(25, 31);
    const depth = e.gain(0.5);
    depth.gain.setValueAtTime(0.5, t);
    depth.gain.linearRampToValueAtTime(0.1, t + d);
    lfo.connect(depth).connect(roll.gain);
    lfo.start(t);
    lfo.stop(t + d + 0.05);

    const env = e.gain(0);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.28, t + 0.04);
    env.gain.setValueAtTime(0.28, t + d * 0.8);
    env.gain.exponentialRampToValueAtTime(0.0001, t + d);
    mouth.connect(roll).connect(env).connect(this.panner);
  }

  /** Glottal-like source with pitch jitter and breath, started at t. */
  private voiceSource(t: number, d: number) {
    const e = this.engine;
    const osc = e.ctx.createOscillator();
    osc.setPeriodicWave(this.glottal);
    // irregular pitch wobble: slow noise into the frequency
    const jitter = e.burst(e.brown, t, d + 0.1);
    jitter
      .connect(e.filter('lowpass', 14))
      .connect(e.gain(randFloat(25, 45)))
      .connect(osc.frequency);
    const out = e.gain(1);
    osc.connect(out);
    const breath = e.burst(e.white, t, d);
    breath.connect(e.gain(0.035)).connect(out);
    osc.start(t);
    osc.stop(t + d + 0.08);
    return { osc, out };
  }

  /** Three formants in parallel, then the mouth opening (low-pass). */
  private tract(source: AudioNode, t: number) {
    const e = this.engine;
    const f1 = e.filter('bandpass', 500, 4);
    const f2 = e.filter('bandpass', 1600, 7);
    const f3 = e.filter('bandpass', 3300, 9);
    const mouth = e.filter('lowpass', 2000, 0.8);
    source.connect(f1).connect(e.gain(1)).connect(mouth);
    source.connect(f2).connect(e.gain(0.75)).connect(mouth);
    source.connect(f3).connect(e.gain(0.3)).connect(mouth);
    f3.frequency.setValueAtTime(randFloat(3100, 3500), t);
    return { f1, f2, mouth };
  }

  /** Soft paws hitting wood after a jump. */
  land(): void {
    const e = this.engine;
    const t = e.now;
    const osc = e.ctx.createOscillator();
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.08);
    const env = e.gain(0);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.25, t + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    osc.connect(env).connect(this.panner);
    osc.start(t);
    osc.stop(t + 0.15);
    const pat = e.burst(e.pink, t + 0.03, 0.05);
    const patEnv = e.gain(0.12);
    patEnv.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    pat.connect(e.filter('lowpass', 900)).connect(patEnv).connect(this.panner);
  }
}
