import { config } from '../config';

/**
 * Phase 1 placeholder: the few sounds needed by zapping are synthesised with
 * WebAudio (no files). Howler and the real sound bank come in a later phase;
 * the public methods are the ones the rest of the app will keep using.
 */
export class Audio {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  /** TV group, driven by VOL±. */
  private tv!: GainNode;
  private fx!: GainNode;
  private noise!: AudioBuffer;
  private tvVolume = 0.6;
  private muted = false;

  /** Must be called from a user gesture (autoplay policy). */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = config.audio.master;
    this.master.connect(ctx.destination);
    this.tv = ctx.createGain();
    this.fx = ctx.createGain();
    this.tv.connect(this.master);
    this.fx.connect(this.master);
    this.applyTvVolume();

    this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  setTvVolume(volume: number, muted: boolean): void {
    this.tvVolume = volume;
    this.muted = muted;
    this.applyTvVolume();
  }

  /** Short static burst, through a small "TV speaker" band-pass. */
  static(duration: number, level = 0.55): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 2400;
    band.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(level, t + 0.012);
    gain.gain.setValueAtTime(level, t + duration * 0.7);
    gain.gain.linearRampToValueAtTime(0, t + duration);
    source.connect(band).connect(gain).connect(this.tv);
    source.start(t, Math.random(), duration + 0.05);
  }

  /** Plastic click of a remote button. */
  click(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    const high = ctx.createBiquadFilter();
    high.type = 'bandpass';
    high.frequency.value = 3200 + Math.random() * 1400;
    high.Q.value = 3;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
    source.connect(high).connect(gain).connect(this.fx);
    source.start(t, Math.random(), 0.05);
  }

  /** High-voltage thump of a CRT turning on / off. */
  thump(on: boolean): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(on ? 70 : 90, t);
    osc.frequency.exponentialRampToValueAtTime(on ? 40 : 30, t + 0.25);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain).connect(this.fx);
    osc.start(t);
    osc.stop(t + 0.32);
    if (on) {
      // the famous 15.7 kHz whine, very faint
      const whine = ctx.createOscillator();
      whine.frequency.value = 15700;
      const wGain = ctx.createGain();
      wGain.gain.setValueAtTime(0, t);
      wGain.gain.linearRampToValueAtTime(0.025, t + 0.1);
      wGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      whine.connect(wGain).connect(this.fx);
      whine.start(t);
      whine.stop(t + 1.7);
    }
  }

  private applyTvVolume(): void {
    if (!this.ctx) return;
    const value = this.muted ? 0 : this.tvVolume;
    this.tv.gain.setTargetAtTime(value, this.ctx.currentTime, 0.03);
  }
}
