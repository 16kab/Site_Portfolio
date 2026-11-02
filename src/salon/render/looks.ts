import { config } from '../config';

/**
 * Art direction presets, switchable live (key L cycles them) to compare.
 *
 * "matiere" is the reference look, like No Rest for the Wicked (CLAUDE.md
 * §2.0): the paint lives in the materials (every surface has its own
 * painted texture, see scene/materials.ts) and is lit by the real lights
 * of the room; no filter repaints the image afterwards. Black dominates,
 * light exists only in pools, the blacks are coloured (teal), cold TV /
 * window against warm lamp / candle, light visible in the air (shafts,
 * dust), glow around sources, a coloured haze swallowing the depth.
 *
 * "filtre" is the same with the global paint filter (Kuwahara) on top,
 * "origine" the earlier look, both kept for comparison.
 */
type Sections = Pick<
  typeof config,
  'render' | 'paint' | 'grade' | 'lights' | 'look'
>;
type Preset = { [K in keyof Sections]?: Partial<Sections[K]> };

export type LookName = 'matiere' | 'filtre' | 'origine';

export const LOOK_LABELS: Record<LookName, string> = {
  matiere: 'PEINT DANS LA MATIÈRE',
  filtre: 'FILTRE PEINTURE',
  origine: "DA D'ORIGINE",
};

const ATMOSPHERE: Preset = {
  render: { exposure: 1.1 },
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

const PRESETS: Record<Exclude<LookName, 'origine'>, Preset> = {
  matiere: {
    ...ATMOSPHERE,
    paint: {
      enabled: false,
      vignette: 0.88,
      canvasStrength: 0.12,
      grainStrength: 0.035,
    },
  },
  filtre: {
    ...ATMOSPHERE,
    paint: {
      enabled: true,
      vignette: 0.88,
      canvasStrength: 0.1,
      grainStrength: 0.04,
    },
  },
};

const sections = ['render', 'paint', 'grade', 'lights', 'look'] as const;

/** Snapshot of every value the presets touch, as the earlier look had it. */
const origin: Preset = {};
for (const name of sections) {
  const keys = new Set<string>();
  for (const preset of Object.values(PRESETS)) {
    for (const key of Object.keys(preset[name] ?? {})) keys.add(key);
  }
  const values: Record<string, unknown> = {};
  for (const key of keys) {
    const value = (config[name] as Record<string, unknown>)[key];
    values[key] = Array.isArray(value) ? [...value] : value;
  }
  (origin as Record<string, unknown>)[name] = values;
}

const ORDER: LookName[] = ['matiere', 'filtre', 'origine'];
export let currentLook: LookName = 'origine';

export function applyLook(name: LookName): void {
  const preset = name === 'origine' ? origin : PRESETS[name];
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

/** Next look in the cycle; returns its name. */
export function toggleLook(): LookName {
  applyLook(ORDER[(ORDER.indexOf(currentLook) + 1) % ORDER.length]);
  return currentLook;
}
