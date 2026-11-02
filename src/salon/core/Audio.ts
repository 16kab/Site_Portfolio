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
  private insideTv = false;
  private transitions: GainNode | null = null;

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
    this.transitions = engine.fader('transitions');
    this.transitions.connect(engine.fx);
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

  /** Inside the TV the room fades far away, the channel goes quiet. */
  setInsideTv(inside: boolean): void {
    this.insideTv = inside;
    this.tvSound?.setPower(!inside && this.tvOn);
    this.applyAmbienceLevel();
  }

  /** Being sucked into the screen: a rising woosh + electric saturation. */
  suck(duration: number): void {
    const e = this.engine;
    const out = this.transitions;
    if (!e || !out) return;
    const t = e.now;
    const air = e.burst(e.pink, t, duration);
    const band = e.filter('bandpass', 200, 1.2);
    band.frequency.setValueAtTime(180, t);
    band.frequency.exponentialRampToValueAtTime(4500, t + duration);
    const airLevel = e.gain(0);
    airLevel.gain.setValueAtTime(0.0001, t);
    airLevel.gain.exponentialRampToValueAtTime(0.6, t + duration * 0.95);
    airLevel.gain.linearRampToValueAtTime(0, t + duration + 0.05);
    air.connect(band).connect(airLevel).connect(out);

    const buzz = e.ctx.createOscillator();
    buzz.type = 'sawtooth';
    buzz.frequency.setValueAtTime(45, t);
    buzz.frequency.exponentialRampToValueAtTime(420, t + duration);
    const crush = e.ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < curve.length; i++) {
      curve[i] = Math.tanh(((i / 255) * 2 - 1) * 6);
    }
    crush.curve = curve;
    const buzzLevel = e.gain(0);
    buzzLevel.gain.setValueAtTime(0.0001, t);
    buzzLevel.gain.exponentialRampToValueAtTime(0.08, t + duration);
    buzzLevel.gain.linearRampToValueAtTime(0, t + duration + 0.05);
    buzz
      .connect(crush)
      .connect(e.filter('lowpass', 2500))
      .connect(buzzLevel)
      .connect(out);
    buzz.start(t);
    buzz.stop(t + duration + 0.1);
  }

  /**
   * Thrown back out of the screen: falling woosh, then (after `impact`
   * seconds) the body hitting the cushions and the sofa springs.
   */
  eject(impact: number): void {
    const e = this.engine;
    const out = this.transitions;
    if (!e || !out) return;
    const t = e.now;
    const air = e.burst(e.pink, t, impact);
    const band = e.filter('bandpass', 3000, 1.2);
    band.frequency.setValueAtTime(3500, t);
    band.frequency.exponentialRampToValueAtTime(200, t + impact);
    const airLevel = e.gain(0.5);
    airLevel.gain.setValueAtTime(0.5, t);
    airLevel.gain.exponentialRampToValueAtTime(0.0001, t + impact);
    air.connect(band).connect(airLevel).connect(out);

    // "pouf": a big soft mass of fabric and foam
    const hit = t + impact;
    const pouf = e.burst(e.brown, hit, 0.35);
    const poufLevel = e.gain(0);
    poufLevel.gain.setValueAtTime(0.0001, hit);
    poufLevel.gain.exponentialRampToValueAtTime(0.9, hit + 0.01);
    poufLevel.gain.exponentialRampToValueAtTime(0.0001, hit + 0.35);
    pouf.connect(e.filter('lowpass', 500)).connect(poufLevel).connect(out);
    const thud = e.ctx.createOscillator();
    thud.frequency.setValueAtTime(75, hit);
    thud.frequency.exponentialRampToValueAtTime(40, hit + 0.2);
    const thudLevel = e.gain(0);
    thudLevel.gain.setValueAtTime(0.0001, hit);
    thudLevel.gain.exponentialRampToValueAtTime(0.35, hit + 0.008);
    thudLevel.gain.exponentialRampToValueAtTime(0.0001, hit + 0.25);
    thud.connect(thudLevel).connect(out);
    thud.start(hit);
    thud.stop(hit + 0.3);

    // old springs: detuned metallic "boing" with a fast wobble
    for (const [frequency, delay] of [
      [212, 0.03],
      [287, 0.06],
    ] as const) {
      const at = hit + delay;
      const spring = e.ctx.createOscillator();
      spring.type = 'triangle';
      spring.frequency.setValueAtTime(frequency * 1.15, at);
      spring.frequency.exponentialRampToValueAtTime(frequency, at + 0.12);
      const wobble = e.ctx.createOscillator();
      wobble.frequency.value = 17;
      wobble.connect(e.gain(frequency * 0.04)).connect(spring.frequency);
      const level = e.gain(0);
      level.gain.setValueAtTime(0.0001, at);
      level.gain.exponentialRampToValueAtTime(0.05, at + 0.01);
      level.gain.exponentialRampToValueAtTime(0.0001, at + 0.9);
      spring
        .connect(e.filter('bandpass', frequency * 2, 3))
        .connect(level)
        .connect(out);
      spring.start(at);
      wobble.start(at);
      spring.stop(at + 1);
      wobble.stop(at + 1);
    }
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
    const level =
      config.audio.ambience * (this.tvOn ? 1 : 1.4) * (this.insideTv ? 0.3 : 1);
    e.ambience.gain.setTargetAtTime(level, e.now, 1.5);
  }
}
