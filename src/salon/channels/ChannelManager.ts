import gsap from 'gsap';
import { config } from '../config';
import type { Audio } from '../core/Audio';
import type { StateMachine } from '../core/StateMachine';
import type { Signal } from '../render/CrtMaterial';
import type { Osd } from './Osd';
import projects from './projects.json';

export type Channel = {
  channel: number;
  slug: string;
  title: string;
  year: number;
  role: string;
  tools: string[];
  /** Short channel loop; null while the fake channel is used. */
  loop: string | null;
  video: string | null;
  poster: string | null;
  /** Procedural placeholder picture (see shaders/fakeChannels.glsl). */
  pattern: number;
  description: string;
  links: { label: string; url: string }[];
};

/**
 * The TV's brain: channel list, zapping, direct digit entry, volume and
 * power. It drives the `signal` read by the CRT shader and the OSD.
 */
export class ChannelManager {
  readonly channels: Channel[] = projects;
  readonly signal: Signal = {
    noise: 0,
    roll: 0,
    collapseX: 1,
    collapseY: 1,
    flash: 0,
    signal: 1,
  };
  private index = 0;
  private volume = 0.6;
  private muted = false;
  private digits = '';
  private digitTimer = 0;
  private zap: gsap.core.Timeline | null = null;
  private powerTween: gsap.core.Timeline | null = null;

  constructor(
    private readonly state: StateMachine,
    private readonly osd: Osd,
    private readonly audio: Audio,
  ) {}

  get current(): Channel {
    return this.channels[this.index];
  }

  get isOn(): boolean {
    return !this.state.is('TV_OFF');
  }

  /** Shows the OSD of the current channel (used at start-up). */
  announce(): void {
    this.osd.showChannel(
      this.label(this.current.channel),
      this.current.title,
      config.zapping.osdDuration,
    );
  }

  step(direction: 1 | -1): void {
    if (!this.isOn) return;
    const count = this.channels.length;
    this.switchTo((this.index + direction + count) % count);
  }

  /**
   * Digit entry like a real TV: "1" waits briefly for a second digit when
   * a two-digit channel could follow ("1" then "0" = channel 10).
   */
  digit(value: number): void {
    if (!this.isOn) return;
    const entry = this.digits + String(value);
    const count = this.channels.length;
    const couldContinue = Number(entry) * 10 <= count && entry.length < 2;
    if (couldContinue) {
      this.digits = entry;
      this.digitTimer = config.zapping.digitTimeout;
      this.osd.showChannel(`CH ${entry}-`, '', config.zapping.digitTimeout);
      return;
    }
    this.digits = '';
    this.commitDigits(Number(entry));
  }

  changeVolume(direction: 1 | -1): void {
    if (!this.isOn) return;
    this.muted = false;
    this.volume = Math.min(1, Math.max(0, this.volume + direction / 24));
    this.applyVolume();
  }

  toggleMute(): void {
    if (!this.isOn) return;
    this.muted = !this.muted;
    this.applyVolume();
  }

  togglePower(): void {
    this.powerTween?.kill();
    this.zap?.kill();
    const s = this.signal;
    if (this.isOn) {
      if (!this.state.go('TV_OFF')) return;
      this.osd.clear();
      this.audio.thump(false);
      this.audio.setTvPower(false);
      // picture collapses to a bright line, then a dot that fades slowly
      this.powerTween = gsap
        .timeline()
        .to(s, { noise: 0, roll: 0, duration: 0.05 })
        .to(s, {
          collapseY: 0.006,
          flash: 0.8,
          duration: 0.14,
          ease: 'power2.in',
        })
        .to(s, { collapseX: 0.012, duration: 0.18, ease: 'power3.in' })
        .set(s, { signal: 0 })
        .to(s, { flash: 0, duration: 0.7, ease: 'power2.out' });
    } else {
      if (!this.state.go('TV_ON')) return;
      this.audio.thump(true);
      this.audio.setTvPower(true);
      this.audio.static(0.5, 0.35);
      gsap.set(s, {
        collapseX: 0.012,
        collapseY: 0.006,
        signal: 1,
        flash: 1,
        noise: 0.6,
      });
      this.powerTween = gsap
        .timeline()
        .to(s, { collapseX: 1, duration: 0.16, ease: 'power2.out' })
        .to(s, { collapseY: 1, duration: 0.22, ease: 'power2.out' })
        .to(s, { flash: 0, duration: 0.3 }, '<')
        .to(s, { noise: 0, duration: 0.5, ease: 'power1.in' }, '<')
        .call(() => this.announce());
    }
  }

  update(dt: number): void {
    if (this.digits) {
      this.digitTimer -= dt;
      if (this.digitTimer <= 0) {
        const value = Number(this.digits);
        this.digits = '';
        this.commitDigits(value);
      }
    }
    this.osd.update(dt);
  }

  private commitDigits(value: number): void {
    const target = this.channels.findIndex((c) => c.channel === value);
    if (target === -1) {
      this.osd.showChannel(this.label(value), '- - -', 1.2);
      return;
    }
    this.switchTo(target);
  }

  private switchTo(target: number): void {
    const { zapping } = config;
    const s = this.signal;
    this.zap?.kill();
    this.state.go('ZAPPING');
    this.audio.zap(zapping.duration);
    const roll = (Math.random() > 0.5 ? 1 : -1) * zapping.roll;
    // snow + sync loss, the new picture arrives at the middle of the burst
    this.zap = gsap
      .timeline()
      .to(s, { noise: zapping.noise, roll, duration: zapping.duration * 0.25 })
      .call(() => {
        this.index = target;
        this.audio.setTvChannel(target);
        this.announce();
      })
      .to(s, {
        noise: 0,
        roll: 0,
        duration: zapping.duration * 0.75,
        ease: 'power2.in',
      })
      .call(() => {
        if (this.state.is('ZAPPING')) this.state.go('TV_ON');
      });
  }

  private applyVolume(): void {
    this.audio.setTvVolume(this.volume, this.muted);
    this.osd.showVolume(this.volume, this.muted, config.zapping.osdDuration);
  }

  private label(value: number): string {
    return `CH ${String(value).padStart(2, '0')}`;
  }
}
