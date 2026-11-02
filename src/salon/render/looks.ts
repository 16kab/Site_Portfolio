import { config } from '../config';

/**
 * Art direction presets, switchable live (key L) to compare.
 *
 * "wicked" pushes toward No Rest for the Wicked as observed in gameplay
 * (CLAUDE.md §2.0): black dominates and light exists only in pools, the
 * blacks themselves are coloured (teal, plum), one complementary pair per
 * place (cold teal TV / warm amber lamp + candle), light visible in the
 * air (shafts, dust), strong glow around sources, a coloured haze swallowing
 * the depth.
 */
type Sections = Pick<
  typeof config,
  'render' | 'paint' | 'grade' | 'lights' | 'look'
>;
type Preset = { [K in keyof Sections]?: Partial<Sections[K]> };

export type LookName = 'current' | 'wicked';

const WICKED: Preset = {
  render: { exposure: 1.1 },
  paint: { vignette: 0.88 },
  grade: {
    contrast: 1.32,
    saturation: 1,
    // coloured blacks: deep teal, never grey
    shadowTint: [0.012, 0.07, 0.085],
    shadowLift: 1.05,
    highlightTint: [1.18, 0.96, 0.72],
  },
  lights: {
    ambientIntensity: 0.18,
    lampIntensity: 6,
    tvIntensity: 14,
    windowIntensity: 4.5,
    handFill: 0.45,
  },
  look: {
    bloom: 0.85,
    bloomThreshold: 0.62,
    beams: 1,
    dust: 1,
    fog: 0.16,
    candle: true,
  },
};

/** Snapshot of the values the "current" look started with. */
const base: Preset = {};
const sections = ['render', 'paint', 'grade', 'lights', 'look'] as const;
for (const name of sections) {
  const values: Record<string, unknown> = {};
  for (const key of Object.keys(WICKED[name] ?? {})) {
    const value = (config[name] as Record<string, unknown>)[key];
    values[key] = Array.isArray(value) ? [...value] : value;
  }
  (base as Record<string, unknown>)[name] = values;
}

export let currentLook: LookName = 'current';

export function applyLook(name: LookName): void {
  const preset = name === 'wicked' ? WICKED : base;
  for (const section of sections) {
    const values = preset[section];
    if (!values) continue;
    for (const [key, value] of Object.entries(values)) {
      (config[section] as Record<string, unknown>)[key] = Array.isArray(value)
        ? [...value]
        : value;
    }
  }
  currentLook = name;
}

export function toggleLook(): LookName {
  applyLook(currentLook === 'wicked' ? 'current' : 'wicked');
  return currentLook;
}
