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

  /** High-voltage thump of a CRT turning on / off, plus the whine. */
  thump(on: boolean): void {
    const e = this.engine;
    if (!e) return;
    const t = e.now;
    const osc = e.ctx.createOscillator();
    osc.frequency.setValueAtTime(on ? 70 : 90, t);
    osc.frequency.exponentialRampToValueAtTime(on ? 40 : 30, t + 0.25);
    const env = e.gain(0.7);
    env.gain.setValueAtTime(0.7, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(env).connect(e.fx);
    osc.start(t);
    osc.stop(t + 0.32);
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
    const level = config.audio.ambience * (this.tvOn ? 1 : 1.4);
    e.ambience.gain.setTargetAtTime(level, e.now, 1.5);
  }
}
