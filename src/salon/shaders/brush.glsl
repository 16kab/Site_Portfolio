// Visible brush strokes (CLAUDE.md §2.0): a line integral convolution of
// random noise along the local flow of the image (structure tensor), so the
// streaks follow the shapes like brush hairs. RGB = painted colour streaked,
// A = stroke height, used by the composite for impasto and broken edges.

uniform sampler2D tColor;
uniform sampler2D tTensor;
uniform sampler2D tNoise;
uniform vec2 uTexel;
uniform float uWidth;
uniform float uStep;
uniform float uStrength;
varying vec2 vUv;

const vec2 DEFAULT_FLOW = vec2(0.7071, 0.7071);

// Edge-tangent direction; in flat areas a painter's default diagonal.
vec2 flowAt(vec2 uv) {
  vec3 g = texture2D(tTensor, uv).xyz;
  float root = sqrt(max(g.y * g.y - 2.0 * g.x * g.y + g.x * g.x + 4.0 * g.z * g.z, 0.0));
  float l1 = 0.5 * (g.y + g.x + root);
  float l2 = 0.5 * (g.y + g.x - root);
  vec2 v = vec2(l1 - g.x, -g.z);
  float anisotropy = (l1 + l2 > 1e-8) ? (l1 - l2) / (l1 + l2) : 0.0;
  vec2 t = length(v) > 1e-8 ? normalize(v) : DEFAULT_FLOW;
  if (dot(t, DEFAULT_FLOW) < 0.0) t = -t;
  return normalize(mix(DEFAULT_FLOW, t, smoothstep(0.03, 0.35, anisotropy)) + 1e-5);
}

float noiseAt(vec2 px) {
  return texture2D(tNoise, px / (256.0 * uWidth)).r;
}

void main() {
  vec2 px = vUv / uTexel;
  float sum = noiseAt(px);
  vec2 forward = px;
  vec2 backward = px;
  vec2 dirF = flowAt(vUv);
  vec2 dirB = -dirF;
  // follow the streamline both ways, re-reading the flow at every step
  for (int i = 0; i < 7; i++) {
    forward += dirF * uStep;
    backward += dirB * uStep;
    vec2 nf = flowAt(forward * uTexel);
    vec2 nb = flowAt(backward * uTexel);
    dirF = dot(nf, dirF) < 0.0 ? -nf : nf;
    dirB = dot(nb, dirB) < 0.0 ? -nb : nb;
    sum += noiseAt(forward) + noiseAt(backward);
  }
  // averaging 15 samples shrinks the variance: stretch it back
  float streak = clamp((sum / 15.0 - 0.5) * 3.2 + 0.5, 0.0, 1.0);

  vec3 col = texture2D(tColor, vUv).rgb;
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  // strokes show more in the lit areas, the deep shadows stay calm
  float amount = uStrength * mix(0.35, 1.0, smoothstep(0.03, 0.35, luma));
  col *= 1.0 + (streak - 0.5) * amount;
  gl_FragColor = vec4(col, streak);
}
