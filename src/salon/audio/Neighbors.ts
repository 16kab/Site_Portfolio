import { MathUtils, Vector3 } from 'three';
import { layout } from '../scene/layout';
import type { AudioEngine } from './engine';

const { randFloat, randInt } = MathUtils;

/** Rough vowel formants (F1, F2) in Hz. */
const VOWELS: [number, number][] = [
  [730, 1090],
  [530, 1840],
  [270, 2290],
  [570, 840],
  [440, 1020],
  [660, 1720],
  [300, 870],
];

type Voice = { pitch: number; formantShift: number };
const HIM: Voice = { pitch: 108, formantShift: 1 };
const HER: Voice = { pitch: 205, formantShift: 1.16 };

/**
 * The neighbours arguing behind the left wall (CLAUDE.md §4.9): voice-like
 * babble (pitch contour, vowel formants, syllable rhythm) heard through
 * plaster, i.e. only the low end survives. An episode escalates, the two
 * voices start talking over each other, and sometimes a door slams.
 */
export class Neighbors {
  private readonly wall: BiquadFilterNode;
  private timer = randFloat(8, 14);
  private episode: { end: number; start: number; speaker: Voice } | null = null;
  private nextPhrase = 0;

  constructor(private readonly engine: AudioEngine) {
    const where = new Vector3(layout.room.minX - 0.4, 1.4, 0.4);
    const panner = engine.panner(where, engine.ambience, 0.6);
    // plaster + bricks: a steep low-pass with a bit of boom
    this.wall = engine.filter('lowpass', 560, 0.9);
    const second = engine.filter('lowpass', 900, 0.5);
    const boom = engine.filter('peaking', 180, 1.2);
    boom.gain.value = 5;
    this.wall.connect(second).connect(boom).connect(panner);
  }

  update(dt: number): void {
    const e = this.engine;
    if (!this.episode) {
      this.timer -= dt;
      if (this.timer <= 0) {
        const duration = randFloat(18, 40);
        this.episode = {
          start: e.now,
          end: e.now + duration,
          speaker: Math.random() < 0.5 ? HIM : HER,
        };
        this.nextPhrase = e.now + 0.1;
      }
      return;
    }
    const { episode } = this;
    if (e.now > episode.end) {
      if (Math.random() < 0.45) this.doorSlam(e.now + randFloat(0.4, 1.2));
      this.episode = null;
      this.timer = randFloat(20, 50);
      return;
    }
    // schedule a little ahead of time for a tight rhythm
    while (this.nextPhrase < e.now + 0.4) {
      const anger =
        (this.nextPhrase - episode.start) / (episode.end - episode.start);
      const length = this.phrase(this.nextPhrase, episode.speaker, anger);
      // they interrupt each other more and more
      const overlap = Math.random() < anger * 0.5;
      const gap = overlap
        ? -length * randFloat(0.2, 0.5)
        : randFloat(0.25, 1.1) * (1.2 - anger);
      this.nextPhrase += Math.max(0.15, length + gap);
      if (!overlap || Math.random() < 0.7) {
        episode.speaker = episode.speaker === HIM ? HER : HIM;
      }
    }
  }

  /** One phrase of babble; returns its duration in seconds. */
  private phrase(t0: number, voice: Voice, anger: number): number {
    const e = this.engine;
    const syllables = randInt(3, 11);
    const rate = 1 + anger * 0.5;
    const loud = 0.26 + anger * 0.3;
    const base = voice.pitch * (1 + anger * 0.35);

    const source = e.ctx.createOscillator();
    source.type = 'sawtooth';
    const breath = e.burst(e.white, t0, 4);
    const f1 = e.filter('bandpass', 600, 6);
    const f2 = e.filter('bandpass', 1400, 8);
    const env = e.gain(0);
    source.connect(f1);
    source.connect(f2);
    breath.connect(e.gain(0.08)).connect(f2);
    f1.connect(env);
    f2.connect(e.gain(0.5)).connect(env);
    env.connect(this.wall);

    let t = t0;
    env.gain.setValueAtTime(0, t);
    for (let i = 0; i < syllables; i++) {
      const length = randFloat(0.09, 0.22) / rate;
      const [v1, v2] = VOWELS[randInt(0, VOWELS.length - 1)];
      const shift = voice.formantShift;
      f1.frequency.setTargetAtTime(v1 * shift, t, 0.02);
      f2.frequency.setTargetAtTime(v2 * shift, t, 0.02);
      // intonation: drifts down through the phrase, angry peaks on stresses
      const fall = 1 - (i / syllables) * 0.2;
      const stress =
        Math.random() < 0.25 + anger * 0.3 ? 1.25 + anger * 0.3 : 1;
      source.frequency.setTargetAtTime(
        base * fall * stress * randFloat(0.94, 1.06),
        t,
        0.03,
      );
      env.gain.setTargetAtTime(loud * (stress > 1 ? 1.3 : 1), t, 0.015);
      env.gain.setTargetAtTime(loud * 0.25, t + length * 0.7, 0.02);
      t += length;
      // a breath between words now and then
      if (Math.random() < 0.25) {
        env.gain.setTargetAtTime(0, t, 0.02);
        t += randFloat(0.05, 0.15);
      }
    }
    // question-like rise or angry final drop
    source.frequency.setTargetAtTime(
      base * (Math.random() < 0.4 ? 1.3 : 0.8),
      t - 0.1,
      0.05,
    );
    env.gain.setTargetAtTime(0, t, 0.03);
    source.start(t0);
    source.stop(t + 0.3);
    return t - t0;
  }

  private doorSlam(t: number): void {
    const e = this.engine;
    const osc = e.ctx.createOscillator();
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.3);
    const level = e.gain(0);
    level.gain.setValueAtTime(0.0001, t);
    level.gain.exponentialRampToValueAtTime(0.9, t + 0.005);
    level.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    const crack = e.burst(e.white, t, 0.08);
    const crackLevel = e.gain(0);
    crackLevel.gain.setValueAtTime(0.5, t);
    crackLevel.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    crack.connect(crackLevel).connect(this.wall);
    osc.connect(level).connect(this.wall);
    osc.start(t);
    osc.stop(t + 0.5);
  }
}
