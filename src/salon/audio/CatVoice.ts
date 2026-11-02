import { MathUtils, Vector3 } from 'three';
import type { AudioEngine } from './engine';
import type { SampleName } from './samples';

const { randFloat } = MathUtils;
const MEOWS: SampleName[] = ['meow1', 'meow2', 'meow3'];

/**
 * The cat's sounds, placed on the cat. Real recordings (CC0): short
 * friendly meows, a longer "let me in" mew, a purr. Only the soft landing
 * after a jump is synthesised.
 */
export class CatVoice {
  private readonly panner: PannerNode;
  private readonly purrLevel: GainNode;
  private purring = false;

  constructor(private readonly engine: AudioEngine) {
    const e = engine;
    this.panner = e.panner(new Vector3(0, 0.2, 0), e.ambience, 0.35);
    this.panner.refDistance = 0.6;
    // recorded very close to the cat: soften the harsh top
    const soft = e.filter('lowpass', 1400, 0.7);
    soft.connect(this.panner);
    this.purrLevel = e.loopSample('purr', soft, 0);
  }

  follow(position: Vector3): void {
    this.engine.place(this.panner, position);
  }

  purr(on: boolean): void {
    if (on === this.purring) return;
    this.purring = on;
    const t = this.engine.now;
    this.purrLevel.gain.setTargetAtTime(on ? 0.5 : 0, t, on ? 1.2 : 0.4);
  }

  /** @param intensity above 0.8: the longer, insistent mew */
  meow(intensity = 1): void {
    const name =
      intensity > 0.8 && Math.random() < 0.5
        ? 'mewOpenDoor'
        : MEOWS[Math.floor(Math.random() * MEOWS.length)];
    this.engine.play(name, this.panner, {
      gain: 0.22 * intensity,
      rate: randFloat(0.94, 1.06),
    });
  }

  /** Greeting when the cat arrives: a short, higher little meow. */
  trill(): void {
    this.engine.play(
      MEOWS[Math.floor(Math.random() * MEOWS.length)],
      this.panner,
      {
        gain: 0.14,
        rate: randFloat(1.08, 1.16),
      },
    );
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
    env.gain.exponentialRampToValueAtTime(0.2, t + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    osc.connect(env).connect(this.panner);
    osc.start(t);
    osc.stop(t + 0.15);
    const pat = e.burst(e.pink, t + 0.03, 0.05);
    const patEnv = e.gain(0.1);
    patEnv.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    pat.connect(e.filter('lowpass', 900)).connect(patEnv).connect(this.panner);
  }
}
