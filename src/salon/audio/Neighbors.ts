import { MathUtils, Vector3 } from 'three';
import { layout } from '../scene/layout';
import type { AudioEngine } from './engine';

const { randFloat } = MathUtils;

/**
 * The neighbours behind the left wall (CLAUDE.md §4.9): a real recording
 * of friends talking over dinner (CC0), heard through bricks and plaster —
 * nothing intelligible survives, only the low murmur and the rhythm of the
 * voices. It comes and goes in episodes, each starting somewhere else in
 * the recording, with an exclamation now and then.
 */
export class Neighbors {
  private readonly wall: AudioNode;
  private readonly level: GainNode;
  private timer = randFloat(8, 14);
  private episodeEnd = 0;
  private active = false;
  private exclaimed = false;

  constructor(private readonly engine: AudioEngine) {
    const e = engine;
    const where = new Vector3(layout.room.minX - 0.5, 1.4, 0.3);
    const panner = e.panner(where, e.ambience, 0.55);
    // through the wall: 24 dB/oct above ~330 Hz and a little boom
    const input = e.filter('highpass', 70, 0.7);
    const boom = e.filter('peaking', 150, 1.1);
    boom.gain.value = 6;
    input
      .connect(e.filter('lowpass', 330, 0.7))
      .connect(e.filter('lowpass', 330, 0.7))
      .connect(boom)
      .connect(panner);
    this.wall = input;

    // the conversation itself, gently swelling (voices rise and fall)
    const swell = e.gain(1);
    swell.connect(this.wall);
    const lfo = e.ctx.createOscillator();
    lfo.frequency.value = 0.13;
    lfo.connect(e.gain(0.25)).connect(swell.gain);
    lfo.start();
    this.level = e.loopSample('neighbors', swell, 0);
  }

  update(dt: number): void {
    const e = this.engine;
    if (this.active) {
      if (!this.exclaimed && Math.random() < dt * 0.04) {
        this.exclaimed = true;
        e.play('neighborExclamation', this.wall, {
          gain: randFloat(0.4, 0.6),
          rate: randFloat(0.92, 1.02),
        });
      }
      if (e.now < this.episodeEnd) return;
      this.active = false;
      this.fade(0, 3);
      this.timer = randFloat(15, 40);
      return;
    }
    this.timer -= dt;
    if (this.timer > 0) return;
    this.active = true;
    this.exclaimed = false;
    this.episodeEnd = e.now + randFloat(20, 45);
    this.fade(randFloat(0.7, 0.95), 2.5);
  }

  private fade(to: number, seconds: number): void {
    const t = this.engine.now;
    const g = this.level.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(to, t + seconds);
  }
}
