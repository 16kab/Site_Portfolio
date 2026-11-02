import { MathUtils, Vector3 } from 'three';
import { layout } from '../scene/layout';
import type { AudioEngine } from './engine';

const { randFloat } = MathUtils;

/**
 * The room is never silent (CLAUDE.md §4.9, §8): room tone, a fridge that
 * cycles, the wall clock, the city behind the window (traffic, cars and
 * scooters passing, a horn, a siren now and then), the floor creaking, the
 * upstairs neighbour walking.
 * Everything is synthesised and placed in space.
 */
export class Ambience {
  private readonly fridge: GainNode;
  private fridgeOn = false;
  private fridgeTimer = randFloat(4, 12);
  private nextTick = 0;
  private tock = false;
  private sirenTimer = randFloat(70, 140);
  private creakTimer = randFloat(12, 30);
  private carTimer = randFloat(3, 7);
  private scooterTimer = randFloat(15, 35);
  private hornTimer = randFloat(30, 70);
  private readonly clockPanner: PannerNode;
  private readonly cityPanner: PannerNode;

  constructor(private readonly engine: AudioEngine) {
    const { ambience } = engine;

    // room tone: the air of a quiet flat at night
    const tone = engine.loop(engine.pink);
    tone
      .connect(engine.filter('lowpass', 420))
      .connect(engine.gain(0.03))
      .connect(ambience);

    // city: distant traffic rumble through the window, slowly breathing
    const window = new Vector3(layout.room.maxX + 0.3, 1.5, layout.window.z);
    this.cityPanner = engine.panner(window, ambience, 0.2);
    const rumble = engine.loop(engine.brown);
    const swell = engine.gain(0.2);
    rumble
      .connect(engine.filter('lowpass', 650))
      .connect(swell)
      .connect(this.cityPanner);
    // the far-away hiss of a whole city's traffic
    const hiss = engine.loop(engine.pink);
    hiss
      .connect(engine.filter('bandpass', 1100, 0.4))
      .connect(engine.gain(0.045))
      .connect(swell);
    const lfo = engine.ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const depth = engine.gain(0.06);
    lfo.connect(depth).connect(swell.gain);
    lfo.start();

    // fridge in the kitchen, behind and to the right
    const kitchen = engine.panner(new Vector3(2.2, 0.9, 2.4), ambience, 0.4);
    this.fridge = engine.gain(0);
    this.fridge.connect(kitchen);
    for (const [frequency, level, type] of [
      [50, 0.5, 'sine'],
      [100, 0.35, 'sine'],
      [150, 0.12, 'triangle'],
      [300, 0.04, 'sine'],
    ] as const) {
      const osc = engine.ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = frequency * randFloat(0.995, 1.005);
      osc.connect(engine.gain(level)).connect(this.fridge);
      osc.start();
    }
    const motor = engine.loop(engine.pink);
    motor
      .connect(engine.filter('bandpass', 140, 3))
      .connect(engine.gain(0.3))
      .connect(this.fridge);

    this.clockPanner = engine.panner(layout.clock, ambience, 0.5);
    this.nextTick = Math.ceil(engine.now);
  }

  update(dt: number): void {
    this.scheduleClock();
    this.updateFridge(dt);

    this.sirenTimer -= dt;
    if (this.sirenTimer <= 0) {
      this.siren();
      this.sirenTimer = randFloat(110, 260);
    }
    this.carTimer -= dt;
    if (this.carTimer <= 0) {
      this.carPass(randFloat(2.4, 4.5), randFloat(0.35, 0.9));
      this.carTimer = randFloat(5, 12);
    }
    this.scooterTimer -= dt;
    if (this.scooterTimer <= 0) {
      this.scooter();
      this.scooterTimer = randFloat(25, 60);
    }
    this.hornTimer -= dt;
    if (this.hornTimer <= 0) {
      this.horn();
      this.hornTimer = randFloat(45, 110);
    }
    this.creakTimer -= dt;
    if (this.creakTimer <= 0) {
      if (Math.random() < 0.35) this.upstairsSteps();
      else this.creak();
      this.creakTimer = randFloat(18, 55);
    }
  }

  /**
   * A car passing in the street (also triggered by the headlight sweep).
   * @param level 0..1, distance of the car
   */
  carPass(duration = 3.2, level = 1): void {
    const e = this.engine;
    const t = e.now;
    const tyres = e.burst(e.brown, t, duration);
    // tyres on wet asphalt: a band of noise rising then falling (doppler)
    const band = e.filter('bandpass', 400, 0.6);
    band.frequency.setValueAtTime(350, t);
    band.frequency.linearRampToValueAtTime(1300, t + duration * 0.5);
    band.frequency.linearRampToValueAtTime(320, t + duration);
    const swell = e.gain(0);
    swell.gain.setValueAtTime(0, t);
    swell.gain.linearRampToValueAtTime(0.9 * level, t + duration * 0.5);
    swell.gain.linearRampToValueAtTime(0, t + duration);
    tyres.connect(band).connect(swell).connect(this.cityPanner);
    const spray = e.burst(e.pink, t, duration);
    spray
      .connect(e.filter('highpass', 1800))
      .connect(e.gain(0.25))
      .connect(swell);

    const engineHum = e.ctx.createOscillator();
    engineHum.type = 'sawtooth';
    engineHum.frequency.setValueAtTime(58, t);
    engineHum.frequency.linearRampToValueAtTime(52, t + duration);
    const hum = e.gain(0);
    hum.gain.linearRampToValueAtTime(0.06 * level, t + duration * 0.5);
    hum.gain.linearRampToValueAtTime(0, t + duration);
    engineHum
      .connect(e.filter('lowpass', 200))
      .connect(hum)
      .connect(this.cityPanner);
    engineHum.start(t);
    engineHum.stop(t + duration + 0.1);
  }

  /** A two-stroke scooter buzzing past, very French. */
  private scooter(): void {
    const e = this.engine;
    const t = e.now;
    const duration = randFloat(3.5, 5.5);
    const engine = e.ctx.createOscillator();
    engine.type = 'sawtooth';
    const base = randFloat(95, 125);
    engine.frequency.setValueAtTime(base * 1.08, t);
    engine.frequency.linearRampToValueAtTime(base * 1.25, t + duration * 0.4);
    engine.frequency.linearRampToValueAtTime(base * 0.85, t + duration);
    const rasp = e.filter('bandpass', 900, 1.5);
    const level = e.gain(0);
    level.gain.setValueAtTime(0, t);
    level.gain.linearRampToValueAtTime(0.06, t + duration * 0.45);
    level.gain.linearRampToValueAtTime(0, t + duration);
    engine.connect(rasp).connect(level).connect(this.cityPanner);
    engine.start(t);
    engine.stop(t + duration + 0.1);
  }

  /** A short horn somewhere down the street. */
  private horn(): void {
    const e = this.engine;
    const t = e.now;
    const level = e.gain(0);
    level.connect(e.filter('lowpass', 1800)).connect(this.cityPanner);
    const blasts = Math.random() < 0.4 ? 2 : 1;
    for (let i = 0; i < blasts; i++) {
      const start = t + i * 0.35;
      const length = randFloat(0.18, 0.45);
      for (const frequency of [410, 520]) {
        const osc = e.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = frequency;
        osc.connect(level);
        osc.start(start);
        osc.stop(start + length);
      }
      level.gain.setValueAtTime(0, start);
      level.gain.linearRampToValueAtTime(0.025, start + 0.02);
      level.gain.setValueAtTime(0.025, start + length - 0.03);
      level.gain.linearRampToValueAtTime(0, start + length);
    }
  }

  private scheduleClock(): void {
    const e = this.engine;
    while (this.nextTick < e.now + 0.3) {
      const t = this.nextTick;
      const click = e.burst(e.white, t, 0.02);
      const body = e.filter('bandpass', this.tock ? 2600 : 3400, 9);
      const env = e.gain(0);
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(0.5, t + 0.002);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
      click.connect(body).connect(env).connect(this.clockPanner);
      this.tock = !this.tock;
      this.nextTick += 1;
    }
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
      g.linearRampToValueAtTime(0.05, t + 2.5);
      this.fridgeTimer = randFloat(40, 90);
    } else {
      // the compressor shudders before it stops
      g.linearRampToValueAtTime(0.07, t + 0.15);
      g.linearRampToValueAtTime(0.02, t + 0.3);
      g.linearRampToValueAtTime(0.04, t + 0.45);
      g.linearRampToValueAtTime(0, t + 0.9);
      this.fridgeTimer = randFloat(25, 60);
    }
  }

  /** French two-tone siren, far away, approaching then fading. */
  private siren(): void {
    const e = this.engine;
    const t = e.now;
    const duration = 16;
    const far = new Vector3(layout.room.maxX + 30, 4, layout.window.z - 25);
    const panner = e.panner(far, e.ambience, 0.1);
    panner.refDistance = 30;
    const osc = e.ctx.createOscillator();
    osc.type = 'square';
    for (let k = 0; k * 0.62 < duration; k++) {
      // slight doppler: a bit higher while approaching, lower after
      const doppler = 1 + 0.025 * Math.cos((k * 0.62 * Math.PI) / duration);
      osc.frequency.setValueAtTime((k % 2 ? 587 : 440) * doppler, t + k * 0.62);
    }
    const level = e.gain(0);
    level.gain.setValueAtTime(0, t);
    level.gain.linearRampToValueAtTime(0.09, t + duration * 0.45);
    level.gain.linearRampToValueAtTime(0, t + duration);
    osc.connect(e.filter('lowpass', 1100)).connect(level).connect(panner);
    osc.start(t);
    osc.stop(t + duration);
  }

  /** Old floorboards somewhere behind the sofa. */
  private creak(): void {
    const e = this.engine;
    const t = e.now;
    const duration = randFloat(0.35, 0.9);
    const where = new Vector3(randFloat(-1.8, 1.8), 0, randFloat(1.6, 2.1));
    const panner = e.panner(where, e.ambience, 0.5);
    const osc = e.ctx.createOscillator();
    osc.type = 'sawtooth';
    const base = randFloat(80, 150);
    osc.frequency.setValueAtTime(base, t);
    // stick-slip: a jittery pitch glide
    for (let i = 1; i < 12; i++) {
      osc.frequency.setValueAtTime(
        base * (1 + (i / 12) * randFloat(0.2, 0.6)) * randFloat(0.93, 1.07),
        t + (i / 12) * duration,
      );
    }
    const level = e.gain(0);
    level.gain.setValueAtTime(0, t);
    level.gain.linearRampToValueAtTime(0.06, t + duration * 0.3);
    level.gain.linearRampToValueAtTime(0, t + duration);
    osc
      .connect(e.filter('bandpass', randFloat(500, 900), 5))
      .connect(level)
      .connect(panner);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  /** Muffled footsteps on the ceiling. */
  private upstairsSteps(): void {
    const e = this.engine;
    const panner = e.panner(
      new Vector3(
        randFloat(-1.5, 1.5),
        layout.room.height + 0.4,
        randFloat(-1, 1.5),
      ),
      e.ambience,
      0.3,
    );
    const count = Math.floor(randFloat(4, 9));
    for (let i = 0; i < count; i++) {
      const t = e.now + i * randFloat(0.48, 0.62);
      const osc = e.ctx.createOscillator();
      osc.frequency.setValueAtTime(70, t);
      osc.frequency.exponentialRampToValueAtTime(38, t + 0.12);
      const level = e.gain(0);
      level.gain.setValueAtTime(0.0001, t);
      level.gain.exponentialRampToValueAtTime(0.16, t + 0.01);
      level.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      osc.connect(level).connect(panner);
      osc.start(t);
      osc.stop(t + 0.2);
    }
  }
}
