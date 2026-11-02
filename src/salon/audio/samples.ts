/**
 * Real recordings (BigSoundBank, CC0 — see ATTRIBUTIONS.md), served from
 * public/salon/audio/. Files are fetched as soon as the page loads and
 * decoded once the AudioContext exists; every sound starts when ready.
 */
const FILES = {
  cityClosedWindow: 'city-paris-apartment-closed-window.mp3',
  cityNight: 'city-paris-by-night.mp3',
  scooter: 'scooter-passage.mp3',
  siren: 'siren-two-tone-passage.mp3',
  neighbors: 'neighbors-conversation.mp3',
  neighborExclamation: 'neighbor-exclamation.mp3',
  meow1: 'cat-meow-1.mp3',
  meow2: 'cat-meow-2.mp3',
  meow3: 'cat-meow-3.mp3',
  mewOpenDoor: 'cat-mew-open-door.mp3',
  purr: 'cat-purr.mp3',
  crtOff: 'tv-crt-off.mp3',
  zapping: 'tv-zapping.mp3',
  fridge: 'fridge.mp3',
  clock: 'clock-pendulum.mp3',
  creak1: 'parquet-creak-1.mp3',
  creak2: 'parquet-creak-2.mp3',
  creak3: 'parquet-creak-3.mp3',
  upstairs: 'upstairs-floor.mp3',
} as const;

export type SampleName = keyof typeof FILES;

const BASE = `${import.meta.env.BASE_URL}salon/audio/`;

/** Starts downloading every file right away (no AudioContext needed). */
const downloads = new Map<SampleName, Promise<ArrayBuffer | null>>(
  (Object.keys(FILES) as SampleName[]).map((name) => [
    name,
    fetch(BASE + FILES[name])
      .then((response) => (response.ok ? response.arrayBuffer() : null))
      .catch(() => null),
  ]),
);

export class SampleBank {
  private readonly buffers = new Map<SampleName, AudioBuffer>();
  private readonly waiting = new Map<
    SampleName,
    ((b: AudioBuffer) => void)[]
  >();

  constructor(ctx: BaseAudioContext) {
    for (const [name, download] of downloads) {
      void download.then(async (data) => {
        if (!data) return;
        try {
          // decodeAudioData detaches the buffer: give it a copy
          const buffer = await ctx.decodeAudioData(data.slice(0));
          this.buffers.set(name, buffer);
          for (const callback of this.waiting.get(name) ?? []) callback(buffer);
          this.waiting.delete(name);
        } catch {
          // undecodable file: that sound simply stays silent
        }
      });
    }
  }

  get(name: SampleName): AudioBuffer | null {
    return this.buffers.get(name) ?? null;
  }

  /** Calls back once the sample is decoded (immediately if it already is). */
  ready(name: SampleName, callback: (buffer: AudioBuffer) => void): void {
    const buffer = this.buffers.get(name);
    if (buffer) {
      callback(buffer);
      return;
    }
    const list = this.waiting.get(name) ?? [];
    list.push(callback);
    this.waiting.set(name, list);
  }
}
