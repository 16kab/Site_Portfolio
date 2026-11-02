import type { Vector3 } from 'three';
import { config } from '../config';

/**
 * WebAudio plumbing shared by every sound of the room: volume groups
 * (CLAUDE.md §8), a small room reverb, noise buffers and HRTF panners.
 * The listener is the viewer's head, so turning the head moves the sounds.
 */
export class AudioEngine {
  readonly ctx: AudioContext;
  readonly master: GainNode;
  /** TV programme and static, driven by VOL±. */
  readonly tv: GainNode;
  /** The room: city, neighbours, fridge, clock, cat… */
  readonly ambience: GainNode;
  /** Remote clicks, CRT thumps. */
  readonly fx: GainNode;
  /** Send to the room reverb. */
  readonly room: GainNode;
  readonly white: AudioBuffer;
  readonly pink: AudioBuffer;
  readonly brown: AudioBuffer;

  constructor() {
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = config.audio.master;
    // gentle glue so overlapping sounds never clip
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -10;
    limiter.ratio.value = 6;
    this.master.connect(limiter).connect(ctx.destination);

    this.tv = this.bus(1);
    this.ambience = this.bus(config.audio.ambience);
    this.fx = this.bus(1);

    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(1.1, 2.8);
    this.room = ctx.createGain();
    this.room.gain.value = 0.35;
    this.room.connect(reverb).connect(this.master);

    const seconds = 6;
    this.white = this.noise(seconds, () => Math.random() * 2 - 1);
    // pink (Paul Kellet's economy filter) and brown (integrated) noise
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    this.pink = this.noise(seconds, () => {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      return (b0 + b1 + b2 + white * 0.1848) * 0.2;
    });
    let last = 0;
    this.brown = this.noise(seconds, () => {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      return last * 3.5;
    });
  }

  get now(): number {
    return this.ctx.currentTime;
  }

  /** HRTF panner at a world position, feeding `bus` (and the reverb). */
  panner(position: Vector3, bus: AudioNode, reverb = 0.3): PannerNode {
    const panner = this.ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.rolloffFactor = 1;
    this.place(panner, position);
    panner.connect(bus);
    if (reverb > 0) {
      const send = this.ctx.createGain();
      send.gain.value = reverb;
      panner.connect(send).connect(this.room);
    }
    return panner;
  }

  place(panner: PannerNode, position: Vector3): void {
    const t = this.now;
    panner.positionX.setTargetAtTime(position.x, t, 0.05);
    panner.positionY.setTargetAtTime(position.y, t, 0.05);
    panner.positionZ.setTargetAtTime(position.z, t, 0.05);
  }

  /** Looping noise source (started). */
  loop(buffer: AudioBuffer): AudioBufferSourceNode {
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.start(this.now, Math.random() * buffer.duration);
    return source;
  }

  /** One-shot slice of a noise buffer. */
  burst(
    buffer: AudioBuffer,
    when: number,
    duration: number,
  ): AudioBufferSourceNode {
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.start(
      when,
      Math.random() * (buffer.duration - duration - 0.1),
      duration + 0.05,
    );
    return source;
  }

  filter(type: BiquadFilterType, frequency: number, q = 0.7): BiquadFilterNode {
    const node = this.ctx.createBiquadFilter();
    node.type = type;
    node.frequency.value = frequency;
    node.Q.value = q;
    return node;
  }

  gain(value: number): GainNode {
    const node = this.ctx.createGain();
    node.gain.value = value;
    return node;
  }

  updateListener(position: Vector3, forward: Vector3, up: Vector3): void {
    const { listener } = this.ctx;
    const t = this.now;
    const k = 0.02;
    listener.positionX.setTargetAtTime(position.x, t, k);
    listener.positionY.setTargetAtTime(position.y, t, k);
    listener.positionZ.setTargetAtTime(position.z, t, k);
    listener.forwardX.setTargetAtTime(forward.x, t, k);
    listener.forwardY.setTargetAtTime(forward.y, t, k);
    listener.forwardZ.setTargetAtTime(forward.z, t, k);
    listener.upX.setTargetAtTime(up.x, t, k);
    listener.upY.setTargetAtTime(up.y, t, k);
    listener.upZ.setTargetAtTime(up.z, t, k);
  }

  private bus(level: number): GainNode {
    const node = this.ctx.createGain();
    node.gain.value = level;
    node.connect(this.master);
    return node;
  }

  private noise(seconds: number, sample: () => number): AudioBuffer {
    const { sampleRate } = this.ctx;
    const buffer = this.ctx.createBuffer(1, sampleRate * seconds, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = sample();
    return buffer;
  }

  /** Stereo exponential-decay impulse: a small, soft living room. */
  private impulse(seconds: number, decay: number): AudioBuffer {
    const { sampleRate } = this.ctx;
    const length = Math.floor(sampleRate * seconds);
    const buffer = this.ctx.createBuffer(2, length, sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        data[i] = (Math.random() * 2 - 1) * (1 - t) ** decay;
      }
    }
    return buffer;
  }
}
