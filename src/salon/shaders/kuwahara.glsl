// Anisotropic Kuwahara filter with polynomial sector weights
// (Kyprianidis et al. 2009 / 2011). The kernel is an ellipse stretched along
// the local edge direction, so flat areas become broad brush strokes that
// follow the shapes.

uniform sampler2D tColor;
uniform sampler2D tTensor;
uniform vec2 uTexel;
uniform int uRadius;
uniform float uAlpha;
uniform float uHardness;
uniform float uSharpness;
varying vec2 vUv;

const float ZERO_CROSSING = 0.58;

void main() {
  vec3 g = texture2D(tTensor, vUv).xyz; // (E, G, F) = (Sx², Sy², SxSy)
  float root = sqrt(g.y * g.y - 2.0 * g.x * g.y + g.x * g.x + 4.0 * g.z * g.z);
  float lambda1 = 0.5 * (g.y + g.x + root);
  float lambda2 = 0.5 * (g.y + g.x - root);
  vec2 v = vec2(lambda1 - g.x, -g.z);
  vec2 t = length(v) > 0.0 ? normalize(v) : vec2(0.0, 1.0);
  float phi = -atan(t.y, t.x);
  float A = (lambda1 + lambda2 > 0.0) ? (lambda1 - lambda2) / (lambda1 + lambda2) : 0.0;

  float radius = float(uRadius);
  float a = radius * clamp((uAlpha + A) / uAlpha, 0.1, 2.0);
  float b = radius * clamp(uAlpha / (uAlpha + A), 0.1, 2.0);
  float cosPhi = cos(phi);
  float sinPhi = sin(phi);
  mat2 R = mat2(cosPhi, sinPhi, -sinPhi, cosPhi);
  mat2 S = mat2(0.5 / a, 0.0, 0.0, 0.5 / b);
  mat2 SR = S * R;

  int maxX = int(sqrt(a * a * cosPhi * cosPhi + b * b * sinPhi * sinPhi));
  int maxY = int(sqrt(a * a * sinPhi * sinPhi + b * b * cosPhi * cosPhi));

  float zeta = 2.0 / radius;
  float sinZero = sin(ZERO_CROSSING);
  float eta = (zeta + cos(ZERO_CROSSING)) / (sinZero * sinZero);

  vec4 m[8];
  vec3 s[8];
  for (int k = 0; k < 8; k++) {
    m[k] = vec4(0.0);
    s[k] = vec3(0.0);
  }

  for (int y = -maxY; y <= maxY; y++) {
    for (int x = -maxX; x <= maxX; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 p = SR * offset;
      if (dot(p, p) > 0.25) continue;
      vec3 c = clamp(texture2D(tColor, vUv + offset * uTexel).rgb, 0.0, 1.0);

      float w[8];
      float sum = 0.0;
      float z;
      float vxx = zeta - eta * p.x * p.x;
      float vyy = zeta - eta * p.y * p.y;
      z = max(0.0, p.y + vxx);  w[0] = z * z; sum += w[0];
      z = max(0.0, -p.x + vyy); w[2] = z * z; sum += w[2];
      z = max(0.0, -p.y + vxx); w[4] = z * z; sum += w[4];
      z = max(0.0, p.x + vyy);  w[6] = z * z; sum += w[6];
      p = 0.70710678 * vec2(p.x - p.y, p.x + p.y);
      vxx = zeta - eta * p.x * p.x;
      vyy = zeta - eta * p.y * p.y;
      z = max(0.0, p.y + vxx);  w[1] = z * z; sum += w[1];
      z = max(0.0, -p.x + vyy); w[3] = z * z; sum += w[3];
      z = max(0.0, -p.y + vxx); w[5] = z * z; sum += w[5];
      z = max(0.0, p.x + vyy);  w[7] = z * z; sum += w[7];

      float gauss = exp(-3.125 * dot(p, p)) / max(sum, 1e-6);
      for (int k = 0; k < 8; k++) {
        float wk = w[k] * gauss;
        m[k] += vec4(c * wk, wk);
        s[k] += c * c * wk;
      }
    }
  }

  // On strong edges every sector weight becomes tiny (~1e-12): divide by the
  // true sum (a clamp would darken edges into black outlines), and fall back
  // to the plain sector average if it underflows completely.
  vec4 result = vec4(0.0);
  vec3 average = vec3(0.0);
  float sectors = 0.0;
  for (int k = 0; k < 8; k++) {
    if (m[k].w < 1e-6) continue;
    vec3 mean = m[k].rgb / m[k].w;
    vec3 variance = abs(s[k] / m[k].w - mean * mean);
    float sigma2 = variance.r + variance.g + variance.b;
    float w = 1.0 / (1.0 + pow(uHardness * 1000.0 * sigma2, 0.5 * uSharpness));
    result += vec4(mean * w, w);
    average += mean;
    sectors += 1.0;
  }
  vec3 col = result.w > 1e-30 ? result.rgb / result.w : average / max(sectors, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
