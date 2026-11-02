// CRT tube (CLAUDE.md §2.3). Writes alpha = 0: the composer uses it as the
// mask that keeps the screen out of the paint filter (occluders in front
// of the screen write alpha = 1, so the mask is depth-correct for free).

uniform sampler2D uPicture;
uniform sampler2D uOsd;
uniform float uTime;
uniform float uNoise;
uniform float uRoll;
uniform vec2 uCollapse;
uniform float uFlash;
uniform float uSignal;
uniform float uCurvature;
uniform float uScanlines;
uniform float uMask;
uniform float uAberration;
uniform float uBloom;
uniform float uBrightness;
uniform float uReflection;
uniform float uVignette;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  // barrel distortion of the picture inside the glass
  vec2 c = vUv * 2.0 - 1.0;
  c *= 1.0 + uCurvature * dot(c, c);
  vec2 uv = c * 0.5 + 0.5;

  // power on/off: the picture collapses to a line, then to a dot
  vec2 p = (uv - 0.5) / max(uCollapse, vec2(1e-4)) + 0.5;
  float inPicture = step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0);

  // loss of sync while zapping
  float wobble = uNoise * 0.014 * sin(p.y * 38.0 + uTime * 47.0);
  vec2 sp = vec2(p.x + wobble, fract(p.y + uRoll));

  vec2 shift = c * uAberration * (1.0 + 3.0 * uNoise);
  vec3 col;
  col.r = texture2D(uPicture, sp + shift).r;
  col.g = texture2D(uPicture, sp).g;
  col.b = texture2D(uPicture, sp - shift).b;

  // phosphor bloom from the picture mipmaps
  vec3 bloom = textureLod(uPicture, sp, 3.0).rgb * 0.5 + textureLod(uPicture, sp, 5.0).rgb * 0.5;
  col += bloom * bloom * uBloom;

  float snow = hash(floor(sp * vec2(320.0, 240.0)) + fract(uTime * vec2(13.1, 7.7)) * 100.0);
  col = mix(col, vec3(snow), clamp(uNoise, 0.0, 1.0));

  vec4 osd = texture2D(uOsd, p);
  col = mix(col, osd.rgb * 1.3, osd.a);

  col *= inPicture * uSignal;
  col += inPicture * uFlash * vec3(0.85, 0.92, 1.0);

  // scanlines + aperture grille. Their count follows the on-screen size
  // (≥ 3 px per line, snapped to powers of two) so they never alias into
  // moiré, whatever the window size.
  float lines = clamp(exp2(floor(log2(0.33 / max(fwidth(vUv.y), 1e-5)))), 64.0, 256.0);
  float triads = clamp(exp2(floor(log2(0.33 / max(fwidth(vUv.x), 1e-5)))), 64.0, 512.0);
  float scan = 0.5 + 0.5 * cos(sp.y * lines * 6.28318);
  col *= 1.0 - uScanlines * scan;
  vec3 grille = 0.5 + 0.5 * cos(vUv.x * triads * 6.28318 + vec3(0.0, 2.09, 4.19));
  col *= 1.0 - uMask * grille;

  // dark corners of the tube
  float vig = 16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
  col *= mix(1.0, clamp(pow(max(vig, 0.0), 0.35), 0.0, 1.0), uVignette);

  vec3 lin = pow(max(col, 0.0), vec3(2.2)) * uBrightness;

  // glass: dark green-grey phosphor, a soft highlight, the window glare
  vec3 glass = vec3(0.012, 0.016, 0.015);
  float highlight = smoothstep(0.5, 0.0, length((vUv - vec2(0.27, 0.8)) * vec2(1.0, 1.7)));
  float glare = smoothstep(0.08, 0.0, abs(vUv.x - 0.86 + vUv.y * 0.08)) *
    smoothstep(0.15, 0.6, vUv.y) * 0.5;
  glass += (highlight * 0.6 + glare) * uReflection * vec3(0.55, 0.62, 0.8);

  gl_FragColor = vec4(lin + glass, 0.0);
}
