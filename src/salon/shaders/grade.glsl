// Shared colour grade: HDR scene (linear) → display. Shadows are lifted
// toward a deep violet-brown tint so nothing is ever pure black (§2.5).

uniform float uExposure;
uniform vec3 uShadowTint;
uniform float uShadowLift;

vec3 acesFitted(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

vec3 grade(vec3 linear) {
  vec3 c = acesFitted(linear * uExposure);
  c = pow(c, vec3(1.0 / 2.2));
  float luma = dot(c, vec3(0.299, 0.587, 0.114));
  c += uShadowTint * uShadowLift * pow(1.0 - luma, 3.0);
  return c;
}
