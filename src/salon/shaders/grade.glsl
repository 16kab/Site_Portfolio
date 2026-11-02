// Shared colour grade: HDR scene (linear) → display, in the spirit of
// No Rest for the Wicked: dark and contrasted, cold shadows (night blue /
// violet, never pure black), warm saturated lights, earthy mid-tones.

uniform float uExposure;
uniform float uContrast;
uniform float uSaturation;
uniform vec3 uShadowTint;
uniform float uShadowLift;
uniform vec3 uHighlightTint;

vec3 acesFitted(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

vec3 grade(vec3 linear) {
  vec3 c = acesFitted(linear * uExposure);
  c = pow(c, vec3(1.0 / 2.2));
  // contrast around a low pivot: deepens the shadows, keeps the lights
  c = clamp((c - 0.32) * uContrast + 0.32, 0.0, 1.0);
  float luma = dot(c, vec3(0.299, 0.587, 0.114));
  // saturation, stronger in the lights than in the mid-tones
  float sat = mix(uSaturation * 0.85, uSaturation * 1.2, smoothstep(0.3, 0.8, luma));
  c = mix(vec3(luma), c, sat);
  // split toning: warm lights, cold lifted shadows
  c = mix(c, c * uHighlightTint, smoothstep(0.35, 0.95, luma));
  c += uShadowTint * uShadowLift * pow(1.0 - luma, 4.0);
  return clamp(c, 0.0, 1.0);
}
