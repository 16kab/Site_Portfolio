import { CanvasTexture, LinearFilter } from 'three';

const W = 640;
const H = 480;
const GREEN = '#7dff86';
const FONT = 'VT323';

/**
 * The TV's own on-screen display (channel number, volume bar), drawn in a
 * canvas and composited inside the CRT shader so it gets the tube curvature
 * and scanlines but none of the signal noise. Items vanish abruptly, like a
 * real OSD.
 */
export class Osd {
  readonly texture: CanvasTexture;
  private readonly ctx: CanvasRenderingContext2D;
  private channel: { label: string; title: string; ttl: number } | null = null;
  private volume: { level: number; muted: boolean; ttl: number } | null = null;
  private muted = false;
  private dirty = true;

  constructor() {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas unavailable');
    this.ctx = ctx;
    this.texture = new CanvasTexture(canvas);
    this.texture.minFilter = LinearFilter;
    this.texture.generateMipmaps = false;
  }

  showChannel(label: string, title: string, ttl: number): void {
    this.channel = { label, title, ttl };
    this.dirty = true;
  }

  /** Volume 0..1. */
  showVolume(level: number, muted: boolean, ttl: number): void {
    this.volume = { level, muted, ttl };
    this.muted = muted;
    this.dirty = true;
  }

  clear(): void {
    this.channel = null;
    this.volume = null;
    this.dirty = true;
  }

  update(dt: number): void {
    if (this.channel) {
      this.channel.ttl -= dt;
      if (this.channel.ttl <= 0) {
        this.channel = null;
        this.dirty = true;
      }
    }
    if (this.volume) {
      this.volume.ttl -= dt;
      if (this.volume.ttl <= 0) {
        this.volume = null;
        this.dirty = true;
      }
    }
    if (this.dirty) this.draw();
  }

  private draw(): void {
    const { ctx } = this;
    ctx.clearRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';
    if (this.channel) {
      this.text(this.channel.label, 52, 92, 72);
      this.text(this.channel.title.toUpperCase(), 54, 132, 36);
    }
    if (this.volume) {
      const { level, muted } = this.volume;
      this.text(muted ? 'MUET' : 'VOLUME', 70, 392, 36);
      const segments = 24;
      const lit = Math.round(level * segments);
      for (let i = 0; i < segments; i++) {
        this.glow();
        ctx.fillStyle = GREEN;
        ctx.globalAlpha = i < lit && !muted ? 1 : 0.22;
        ctx.fillRect(70 + i * 21, 408, 14, 30);
      }
      ctx.globalAlpha = 1;
    } else if (this.muted) {
      this.text('MUET', 500, 92, 40);
    }
    this.texture.needsUpdate = true;
    this.dirty = false;
  }

  private glow(): void {
    this.ctx.shadowColor = 'rgba(80, 255, 110, 0.85)';
    this.ctx.shadowBlur = 10;
  }

  private text(value: string, x: number, y: number, size: number): void {
    const { ctx } = this;
    ctx.font = `${size}px ${FONT}, monospace`;
    // dark outline keeps it readable over bright pictures
    ctx.shadowBlur = 0;
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(0, 20, 0, 0.75)';
    ctx.strokeText(value, x, y);
    this.glow();
    ctx.fillStyle = GREEN;
    ctx.fillText(value, x, y);
  }
}
