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

  constructor(private readonly engine: AudioEngine) {
    const e = engine;
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

  meow(intensity = 1): void {
    const e = this.engine;
    const t = e.now + 0.02;
    const duration = randFloat(0.45, 0.8) * (0.8 + intensity * 0.3);
    const pitch = randFloat(480, 620);

    const osc = e.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(pitch * 0.85, t);
    osc.frequency.linearRampToValueAtTime(pitch * 1.45, t + duration * 0.3);
    osc.frequency.linearRampToValueAtTime(pitch * 1.25, t + duration * 0.6);
    osc.frequency.linearRampToValueAtTime(pitch * 0.8, t + duration);
    // a little vibrato makes it alive
    const vibrato = e.ctx.createOscillator();
    vibrato.frequency.value = 6.5;
    const vibratoDepth = e.gain(pitch * 0.02);
    vibrato.connect(vibratoDepth).connect(osc.frequency);

    const f1 = e.filter('bandpass', 400, 5);
    const f2 = e.filter('bandpass', 2200, 7);
    // i → a → u
    f1.frequency.setValueAtTime(350, t);
    f1.frequency.linearRampToValueAtTime(950, t + duration * 0.4);
    f1.frequency.linearRampToValueAtTime(450, t + duration);
    f2.frequency.setValueAtTime(2400, t);
    f2.frequency.linearRampToValueAtTime(1500, t + duration * 0.4);
    f2.frequency.linearRampToValueAtTime(900, t + duration);

    const env = e.gain(0);
    const peak = 0.35 * intensity;
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(peak, t + 0.06);
    env.gain.setValueAtTime(peak, t + duration * 0.6);
    env.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(f1).connect(env);
    osc.connect(f2).connect(e.gain(0.6)).connect(env);
    const breath = e.burst(e.white, t, duration);
    breath
      .connect(e.filter('bandpass', 3000, 1))
      .connect(e.gain(0.04))
      .connect(env);
    env.connect(this.panner);

    osc.start(t);
    vibrato.start(t);
    osc.stop(t + duration + 0.05);
    vibrato.stop(t + duration + 0.05);
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
