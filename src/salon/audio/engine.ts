import type { Vector3 } from 'three';
import { config } from '../config';
import { SampleBank, type SampleName } from './samples';

export type MixChannel = keyof typeof config.audio.mix;

type PlayOptions = {
  when?: number;
  gain?: number;
  rate?: number;
  /** Start offset in seconds (random if 'random'). */
  offset?: number | 'random';
  duration?: number;
};

/**
 * WebAudio plumbing shared by every sound of the room: volume groups
 * (CLAUDE.md §8), a small room reverb, the recorded samples, noise buffers
 * and HRTF panners.
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
  readonly samples: SampleBank;
  /** Every fader node, by channel, kept in sync with config.audio.mix. */
  private readonly faders = new Map<MixChannel, GainNode[]>();
  private readonly applied = new Map<MixChannel, number>();
  private appliedMaster = config.audio.master;

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
    this.samples = new SampleBank(ctx);

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

  /**
   * A fader of the mix (config.audio.mix[channel]); the caller connects it.
   * Several nodes can share a channel: they all follow the same value.
   */
  fader(channel: MixChannel): GainNode {
    const node = this.gain(config.audio.mix[channel]);
    const list = this.faders.get(channel) ?? [];
    list.push(node);
    this.faders.set(channel, list);
    return node;
  }

  /** Applies the dev-panel values (master + faders) when they change. */
  applyMix(): void {
    const t = this.now;
    if (config.audio.master !== this.appliedMaster) {
      this.appliedMaster = config.audio.master;
      this.master.gain.setTargetAtTime(this.appliedMaster, t, 0.05);
    }
    for (const [channel, nodes] of this.faders) {
      const value = config.audio.mix[channel];
      if (this.applied.get(channel) === value) continue;
      this.applied.set(channel, value);
      for (const node of nodes) node.gain.setTargetAtTime(value, t, 0.05);
    }
  }

  /**
   * HRTF panner at a world position, on a mix channel: its fader scales
   * both the dry sound and its share of the room reverb.
   */
  panner(position: Vector3, channel: MixChannel, reverb = 0.3): PannerNode {
    const bus =
      channel === 'tvPower' || channel === 'transitions'
        ? this.fx
        : this.ambience;
    const panner = this.ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.rolloffFactor = 1;
    this.place(panner, position);
    const dry = this.fader(channel);
    panner.connect(dry).connect(bus);
    if (reverb > 0) {
      const wet = this.fader(channel);
      wet.connect(this.room);
      panner.connect(this.gain(reverb)).connect(wet);
    }
    return panner;
  }

  /** Panner straight into a bus, without a mix fader (the TV speaker). */
  busPanner(position: Vector3, bus: AudioNode, reverb = 0.3): PannerNode {
    const panner = this.ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    this.place(panner, position);
    panner.connect(bus);
    if (reverb > 0) panner.connect(this.gain(reverb)).connect(this.room);
    return panner;
  }

  place(panner: PannerNode, position: Vector3): void {
    const t = this.now;
    panner.positionX.setTargetAtTime(position.x, t, 0.05);
    panner.positionY.setTargetAtTime(position.y, t, 0.05);
    panner.positionZ.setTargetAtTime(position.z, t, 0.05);
  }

  /**
   * One-shot recorded sample into `destination`. Returns null (and plays
   * nothing) if the file is not decoded yet.
   */
  play(
    name: SampleName,
    destination: AudioNode,
    options: PlayOptions = {},
  ): AudioBufferSourceNode | null {
    const buffer = this.samples.get(name);
    if (!buffer) return null;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = options.rate ?? 1;
    const level = this.gain(options.gain ?? 1);
    source.connect(level).connect(destination);
    const offset =
      options.offset === 'random'
        ? Math.random() * Math.max(0, buffer.duration - (options.duration ?? 0))
        : (options.offset ?? 0);
    source.start(options.when ?? this.now, offset, options.duration);
    return source;
  }

  /**
   * Seamless loop of a recorded sample, started at a random point as soon
   * as it is decoded. Returns its level node right away (to fade it).
   */
  loopSample(name: SampleName, destination: AudioNode, gain = 1): GainNode {
    const level = this.gain(gain);
    level.connect(destination);
    this.samples.ready(name, (buffer) => {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(level);
      source.start(this.now, Math.random() * buffer.duration);
    });
    return level;
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
