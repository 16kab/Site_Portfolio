import { MathUtils, Vector3 } from 'three';
import { layout } from '../scene/layout';
import type { AudioEngine } from './engine';
import type { SampleName } from './samples';

const { randFloat } = MathUtils;
const CREAKS: SampleName[] = ['creak1', 'creak2', 'creak3'];

/**
 * The room is never silent (CLAUDE.md §4.9, §8). Real recordings (CC0):
 * a Paris boulevard heard through the closed window, Paris at night behind
 * it, a scooter and a two-tone siren passing now and then, the fridge
 * cycling in the kitchen, the pendulum clock, the parquet creaking, the
 * upstairs neighbour walking. Only the faint room tone is synthesised.
 */
export class Ambience {
  private readonly fridge: GainNode;
  private fridgeOn = false;
  private fridgeTimer = randFloat(4, 12);
  private sirenTimer = randFloat(60, 120);
  private scooterTimer = randFloat(15, 35);
  private creakTimer = randFloat(12, 30);
  private readonly cityPanner: PannerNode;
  private readonly nightLevel: GainNode;
  private readonly ceiling: AudioNode;

  constructor(private readonly engine: AudioEngine) {
    const e = engine;
    const { ambience } = e;

    // room tone: the air of a quiet flat at night
    const tone = e.loop(e.pink);
    tone
      .connect(e.filter('lowpass', 420))
      .connect(e.gain(0.025))
      .connect(ambience);

    // the city, through the window glass
    const window = new Vector3(layout.room.maxX + 0.3, 1.5, layout.window.z);
    this.cityPanner = e.panner(window, ambience, 0.25);
    const glass = e.filter('lowpass', 5000, 0.6);
    glass.connect(this.cityPanner);
    e.loopSample('cityClosedWindow', glass, 0.9);
    // Paris at 1 a.m. recorded outside: duller, so it sits behind the glass
    const night = e.filter('lowpass', 1600, 0.7);
    night.connect(glass);
    this.nightLevel = e.loopSample('cityNight', night, 0.45);

    // fridge in the kitchen, behind and to the right
    const kitchen = e.panner(new Vector3(2.2, 0.9, 2.4), ambience, 0.4);
    this.fridge = e.loopSample('fridge', kitchen, 0);

    // pendulum wall clock
    const clock = e.panner(layout.clock, ambience, 0.5);
    e.loopSample('clock', clock, 0.35);

    // upstairs: the floor above, heard through the ceiling (bass only)
    const ceilingPanner = e.panner(
      new Vector3(0.3, layout.room.height + 0.5, 0.4),
      ambience,
      0.3,
    );
    const boom = e.filter('peaking', 120, 1);
    boom.gain.value = 6;
    this.ceiling = e.filter('lowpass', 450, 0.8);
    this.ceiling.connect(boom).connect(ceilingPanner);
  }

  update(dt: number): void {
    this.updateFridge(dt);

    this.sirenTimer -= dt;
    if (this.sirenTimer <= 0) {
      this.siren();
      this.sirenTimer = randFloat(110, 240);
    }
    this.scooterTimer -= dt;
    if (this.scooterTimer <= 0) {
      this.engine.play('scooter', this.cityPanner, {
        gain: randFloat(0.25, 0.45),
        rate: randFloat(0.92, 1.08),
      });
      this.scooterTimer = randFloat(25, 60);
    }
    this.creakTimer -= dt;
    if (this.creakTimer <= 0) {
      if (Math.random() < 0.35) this.upstairsSteps();
      else this.creak();
      this.creakTimer = randFloat(18, 50);
    }
  }

  /**
   * A car passing close, synchronised with the headlight sweep on the
   * ceiling: the street comes forward for a few seconds.
   */
  carPass(duration = 3.2): void {
    const e = this.engine;
    const t = e.now;
    const g = this.nightLevel.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(1.2, t + duration * 0.5);
    g.linearRampToValueAtTime(0.45, t + duration);
  }

  private updateFridge(dt: number): void {
    const e = this.engine;
    this.fridgeTimer -= dt;
    if (this.fridgeTimer > 0) return;
    this.fridgeOn = !this.fridgeOn;
    const t = e.now;
    const g = this.fridge.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    if (this.fridgeOn) {
      g.linearRampToValueAtTime(0.35, t + 2.5);
      this.fridgeTimer = randFloat(40, 90);
    } else {
      // the compressor shudders before it stops
      g.linearRampToValueAtTime(0.45, t + 0.15);
      g.linearRampToValueAtTime(0.15, t + 0.3);
      g.linearRampToValueAtTime(0.3, t + 0.45);
      g.linearRampToValueAtTime(0, t + 1);
      this.fridgeTimer = randFloat(25, 60);
    }
  }

  /** Fire brigade passing a few streets away. */
  private siren(): void {
    const e = this.engine;
    const far = new Vector3(layout.room.maxX + 25, 4, layout.window.z - 20);
    const panner = e.panner(far, e.ambience, 0.15);
    panner.refDistance = 25;
    const distance = e.filter('lowpass', 1800, 0.7);
    distance.connect(panner);
    e.play('siren', distance, { gain: 0.6, rate: randFloat(0.96, 1.03) });
  }

  /** Old floorboards somewhere behind the sofa. */
  private creak(): void {
    const e = this.engine;
    const where = new Vector3(randFloat(-1.8, 1.8), 0, randFloat(1.6, 2.1));
    const panner = e.panner(where, e.ambience, 0.5);
    const name = CREAKS[Math.floor(Math.random() * CREAKS.length)];
    e.play(name, panner, {
      gain: randFloat(0.25, 0.45),
      rate: randFloat(0.85, 1.05),
    });
  }

  /** A few seconds of the upstairs neighbour walking on their floor. */
  private upstairsSteps(): void {
    const e = this.engine;
    const t = e.now;
    const duration = randFloat(4, 8);
    // soft edges: the excerpt starts and ends mid-recording
    const envelope = e.gain(0);
    envelope.gain.linearRampToValueAtTime(1.4, t + 0.4);
    envelope.gain.setValueAtTime(1.4, t + duration - 0.6);
    envelope.gain.linearRampToValueAtTime(0, t + duration);
    envelope.connect(this.ceiling);
    e.play('upstairs', envelope, { offset: 'random', duration });
  }
}
