/**
 * Every tunable of the experience lives here so it can be iterated on quickly
 * (and live-edited from the lil-gui dev panel). Systems read these values
 * every frame: mutate them, never copy them.
 */
export const config = {
  render: {
    maxPixelRatio: 1.5,
    msaaSamples: 4,
    exposure: 1.3,
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
    scale: 0.5,
    radius: 6,
    /** Anisotropy strength of the strokes. */
    alpha: 1.0,
    hardness: 8,
    sharpness: 8,
    /** Pigment noise injected before the filter, turned into strokes. */
    strokeNoise: 0.18,
    canvasStrength: 0.09,
    grainStrength: 0.045,
    vignette: 0.55,
    /** Shadows are lifted toward this tint, never pure black. */
    shadowTint: [0.11, 0.06, 0.13] as [number, number, number],
    shadowLift: 0.55,
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
    lampIntensity: 5,
    handFill: 0.35,
    lampColor: '#ffad5c',
    windowIntensity: 1.6,
    ambientIntensity: 0.9,
    headlightEvery: [14, 30] as [number, number],
    headlightIntensity: 5,
  },

  audio: {
    master: 0.5,
  },
};

export type Config = typeof config;
