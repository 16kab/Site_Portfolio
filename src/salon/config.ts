/**
 * Every tunable of the experience lives here so it can be iterated on quickly
 * (and live-edited from the lil-gui dev panel). Systems read these values
 * every frame: mutate them, never copy them.
 */
export const config = {
  render: {
    maxPixelRatio: 1.5,
    msaaSamples: 4,
    exposure: 1.2,
  },

  head: {
    /** Max head rotation, in degrees. */
    maxYaw: 20,
    maxPitch: 10,
    /** Resting pitch so the gaze lands on the TV, in degrees. */
    restPitch: -5,
    /** Spring stiffness / damping of the head (higher = snappier). */
    stiffness: 18,
    damping: 7.5,
    breathAmplitude: 0.004,
    breathSpeed: 0.22,
    fov: 40,
    /** How much the hand follows the head (0 = fixed to the body). */
    handFollow: 0.35,
  },

  paint: {
    enabled: true,
    /** Resolution of the paint pass relative to the canvas. */
    scale: 0.4,
    radius: 7,
    /** Anisotropy strength of the strokes. */
    alpha: 1.6,
    hardness: 8,
    sharpness: 8,
    /** Pigment noise injected before the filter, turned into strokes. */
    strokeNoise: 0.22,
    /** Visible brush streaks along the shapes (in paint-pass pixels). */
    strokeWidth: 4,
    strokeLength: 36,
    strokeStrength: 0.14,
    /** Relief of the streaks catching the light. */
    impasto: 0.08,
    /** Wobble of the painted edges, in paint-pass pixels. */
    edgeBreak: 1.6,
    canvasStrength: 0.1,
    grainStrength: 0.04,
    vignette: 0.75,
  },

  /** Colour grade, No Rest for the Wicked style (CLAUDE.md §2.0). */
  grade: {
    contrast: 1.12,
    saturation: 0.92,
    /** Shadows are lifted toward this tint, never pure black. */
    shadowTint: [0.05, 0.055, 0.12] as [number, number, number],
    shadowLift: 0.7,
    highlightTint: [1.1, 0.97, 0.82] as [number, number, number],
  },

  crt: {
    curvature: 0.09,
    scanlines: 0.32,
    mask: 0.18,
    aberration: 0.0035,
    bloom: 0.55,
    brightness: 2.2,
    reflection: 0.06,
    baseNoise: 0.035,
    vignette: 0.55,
  },

  zapping: {
    /** Duration of the snow burst between two channels, in seconds. */
    duration: 0.24,
    noise: 0.85,
    roll: 0.18,
    osdDuration: 2.6,
    /** Delay before a single digit is committed (waiting for a 2nd one). */
    digitTimeout: 1.1,
  },

  lights: {
    tvIntensity: 14,
    tvFlicker: 0.12,
    /** How fast the TV light follows the picture color (per second). */
    tvColorFollow: 6,
    lampIntensity: 3.6,
    handFill: 0.55,
    lampColor: '#ffad5c',
    windowIntensity: 7,
    ambientIntensity: 0.6,
    headlightEvery: [14, 30] as [number, number],
    headlightIntensity: 5,
  },

  audio: {
    master: 0.6,
    /** Room ambience level (city, neighbours, fridge, clock, cat). */
    ambience: 0.9,
    /** Per-source faders (1 = as designed), tuned from the dev panel. */
    mix: {
      city: 1,
      scooter: 1,
      siren: 1,
      neighbors: 1,
      fridge: 1,
      clock: 1,
      creaks: 1,
      upstairs: 1,
      roomTone: 1,
      cat: 1,
      tvMusic: 1,
      tvStatic: 1,
      tvPower: 1,
    },
  },
};

export type Config = typeof config;
