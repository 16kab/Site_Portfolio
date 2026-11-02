import type { Vector3 } from 'three';
import { Ambience } from '../audio/Ambience';
import { CatVoice } from '../audio/CatVoice';
import { AudioEngine } from '../audio/engine';
import { Neighbors } from '../audio/Neighbors';
import { TvSound } from '../audio/TvSound';
import { config } from '../config';

/**
 * Every sound of the experience. Until a real sound bank exists, everything
 * is synthesised with WebAudio (see src/salon/audio/); each sound can later
 * be swapped for a recording without touching the callers.
 * Nothing plays before `unlock()` (browser autoplay policy): before that
 * every call is a no-op.
 */
export class Audio {
  private engine: AudioEngine | null = null;
  private ambience: Ambience | null = null;
  private neighbors: Neighbors | null = null;
  private tvSound: TvSound | null = null;
  /** The cat's voice, available once audio is unlocked. */
  cat: CatVoice | null = null;
  private tvVolume = 0.6;
  private muted = false;
  private tvOn = true;
  private channel = 0;
  private ambienceLevel = config.audio.ambience;

  constructor(private readonly tvPosition: Vector3) {}

  /** Must be called from a user gesture (autoplay policy). */
  unlock(): void {
    if (this.engine) {
      if (this.engine.ctx.state === 'suspended') void this.engine.ctx.resume();
      return;
    }
    const engine = new AudioEngine();
    this.engine = engine;
    this.ambience = new Ambience(engine);
    this.neighbors = new Neighbors(engine);
    this.tvSound = new TvSound(engine, this.tvPosition);
    this.cat = new CatVoice(engine);
    this.tvSound.setChannel(this.channel);
    this.tvSound.setPower(this.tvOn);
    this.applyTvVolume();
    this.applyAmbienceLevel();
  }

  /** Per frame: listener = the viewer's head, schedulers. */
  update(dt: number, head: Vector3, forward: Vector3, up: Vector3): void {
    const engine = this.engine;
    if (engine?.ctx.state !== 'running') return;
    engine.updateListener(head, forward, up);
    engine.applyMix();
    if (config.audio.ambience !== this.ambienceLevel) this.applyAmbienceLevel();
    this.ambience?.update(dt);
    this.neighbors?.update(dt);
    this.tvSound?.update();
  }

  setTvVolume(volume: number, muted: boolean): void {
    this.tvVolume = volume;
    this.muted = muted;
    this.applyTvVolume();
  }

  setTvChannel(index: number): void {
    this.channel = index;
    this.tvSound?.setChannel(index);
  }

  setTvPower(on: boolean): void {
    this.tvOn = on;
    this.tvSound?.setPower(on);
    this.applyAmbienceLevel();
  }

  /** Channel change: static burst, programme ducked. */
  zap(duration: number): void {
    this.tvSound?.zap(duration);
  }

  static(duration: number, level = 0.5): void {
    this.tvSound?.static(duration, level);
  }

  carPass(): void {
    this.ambience?.carPass();
  }

  /** Plastic click of a remote button. */
  click(): void {
    const e = this.engine;
    if (!e) return;
    const t = e.now;
    const source = e.burst(e.white, t, 0.04);
    const env = e.gain(0.9);
    env.gain.setValueAtTime(0.9, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
    source
      .connect(e.filter('bandpass', 3200 + Math.random() * 1400, 3))
      .connect(env)
      .connect(e.fx);
  }

  /**
   * CRT turning on / off: a soft relay "tock", the crackle of the high
   * voltage on the glass and, when turning on, the short degauss hum.
   * Kept discreet: it is a detail, not an impact.
   */
  thump(on: boolean): void {
    const e = this.engine;
    if (!e) return;
    const t = e.now;
    const tv = e.panner(this.tvPosition, 'tvPower', 0.3);
    // switching off: the real sound of a CRT tube collapsing
    if (!on && e.play('crtOff', tv, { gain: 0.5 })) return;

    const tock = e.ctx.createOscillator();
    tock.frequency.setValueAtTime(on ? 140 : 110, t);
    tock.frequency.exponentialRampToValueAtTime(70, t + 0.06);
    const tockEnv = e.gain(0);
    tockEnv.gain.setValueAtTime(0.0001, t);
    tockEnv.gain.exponentialRampToValueAtTime(0.12, t + 0.003);
    tockEnv.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    tock.connect(tockEnv).connect(tv);
    tock.start(t);
    tock.stop(t + 0.1);

    const crackle = e.burst(e.white, t + 0.01, 0.12);
    const crackleEnv = e.gain(0);
    crackleEnv.gain.setValueAtTime(0.06, t + 0.01);
    crackleEnv.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    crackle.connect(e.filter('highpass', 2500)).connect(crackleEnv).connect(tv);

    if (!on) return;
    const hum = e.ctx.createOscillator();
    hum.type = 'sawtooth';
    hum.frequency.value = 100;
    const humEnv = e.gain(0);
    humEnv.gain.setValueAtTime(0.0001, t + 0.02);
    humEnv.gain.exponentialRampToValueAtTime(0.035, t + 0.06);
    humEnv.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    hum.connect(e.filter('lowpass', 400)).connect(humEnv).connect(tv);
    hum.start(t);
    hum.stop(t + 0.75);
  }

  private applyTvVolume(): void {
    const e = this.engine;
    if (!e) return;
    e.tv.gain.setTargetAtTime(this.muted ? 0 : this.tvVolume, e.now, 0.03);
  }

  /** With the TV off nothing covers the room any more: it comes forward. */
  private applyAmbienceLevel(): void {
    const e = this.engine;
    if (!e) return;
    this.ambienceLevel = config.audio.ambience;
    const level = config.audio.ambience * (this.tvOn ? 1 : 1.4);
    e.ambience.gain.setTargetAtTime(level, e.now, 1.5);
  }
}
