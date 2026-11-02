// Placeholder channels until the real video loops exist (CLAUDE.md §7.1).
// One pattern per project, each with its own dominant colour so the room
// light visibly changes when zapping. Output is display-referred (sRGB).

uniform float uTime;
uniform int uPattern;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float box(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// anti-aliased fill of a signed distance (480 px tall picture)
float fill(float d) {
  return smoothstep(0.002, -0.002, d);
}

// 0 · Mauni — mint, coins rising
vec3 mauni(vec2 q, float t) {
  vec3 col = mix(vec3(0.02, 0.2, 0.15), vec3(0.12, 0.5, 0.38), q.y + 0.5);
  for (int i = 0; i < 8; i++) {
    float f = float(i);
    vec2 c = vec2(
      fract(f * 0.37 + 0.1) * 1.3 - 0.65,
      fract(t * 0.07 * (1.0 + f * 0.15) + f * 0.21) * 1.4 - 0.7
    );
    vec2 p = q - c;
    float r = 0.06 + 0.035 * fract(f * 0.53);
    p.x /= max(abs(cos(t * 1.4 + f)), 0.12);
    col = mix(col, vec3(0.8, 1.0, 0.88), fill(length(p) - r));
    col = mix(col, vec3(0.3, 0.85, 0.62), fill(length(p) - r * 0.62));
  }
  return col;
}

// 1 · Onboarding RH — warm sunrise over a grid
vec3 sunrise(vec2 q, float t) {
  vec3 col = mix(vec3(1.0, 0.58, 0.28), vec3(0.35, 0.1, 0.28), q.y + 0.5);
  vec2 sp = q - vec2(0.0, 0.0);
  float sun = fill(length(sp) - 0.24);
  float stripe = step(0.5, fract(q.y * 16.0 + t * 0.6));
  sun *= mix(1.0, stripe, step(q.y, 0.0));
  col = mix(col, mix(vec3(1.0, 0.9, 0.4), vec3(1.0, 0.4, 0.35), 0.5 - sp.y * 2.0), sun);
  if (q.y < -0.18) {
    float z = 0.12 / (-q.y - 0.1);
    vec2 g = vec2(q.x * z, z + t * 0.6);
    float line = max(
      smoothstep(0.9, 1.0, fract(g.y * 2.0)),
      smoothstep(0.92, 1.0, 1.0 - abs(fract(g.x * 2.0) - 0.5) * 2.0)
    );
    col = mix(vec3(0.28, 0.06, 0.18), vec3(1.0, 0.6, 0.3), line);
  }
  return col;
}

// 2 · SYMA — magenta nested squares turning
vec3 syma(vec2 q, float t) {
  vec3 col = vec3(0.12, 0.02, 0.16);
  for (int i = 0; i < 6; i++) {
    float f = float(i);
    float dir = mod(f, 2.0) * 2.0 - 1.0;
    vec2 p = rot(t * 0.4 * dir + f * 0.3) * q;
    float d = abs(box(p, vec2(0.44 - f * 0.068))) - 0.014;
    col = mix(col, mix(vec3(1.0, 0.25, 0.7), vec3(0.55, 0.3, 1.0), f / 5.0), fill(d));
  }
  return col;
}

// 3 · TrackIt — red film strip scrolling
vec3 trackit(vec2 q, float t) {
  vec3 col = vec3(0.06, 0.02, 0.02);
  float y = q.y + t * 0.22;
  float strip = fill(abs(q.x) - 0.36);
  col = mix(col, vec3(0.09, 0.07, 0.07), strip);
  vec2 hole = vec2(abs(q.x) - 0.315, (fract(y * 10.0) - 0.5) / 10.0);
  col = mix(col, vec3(0.5, 0.45, 0.42), strip * fill(box(hole, vec2(0.014, 0.02))));
  float frame = floor(y * 2.5);
  vec2 pic = vec2(q.x, (fract(y * 2.5) - 0.5) / 2.5);
  float inPic = fill(box(pic, vec2(0.25, 0.16)) - 0.01);
  vec3 tone = vec3(0.9, 0.16, 0.12) * (0.45 + 0.55 * hash(vec2(frame, 1.0)));
  tone += 0.25 * smoothstep(0.2, -0.2, pic.x + pic.y);
  col = mix(col, tone, inPic);
  return col;
}

// 4 · Parcours SPVIE — blue stepper filling up
vec3 parcours(vec2 q, float t) {
  vec3 col = mix(vec3(0.04, 0.1, 0.32), vec3(0.12, 0.32, 0.72), q.y + 0.5);
  float progress = fract(t * 0.12) * 5.6;
  vec3 white = vec3(0.92, 0.96, 1.0);
  col = mix(col, white * 0.35, fill(box(q - vec2(0.0, 0.1), vec2(0.48, 0.006))));
  float lineEnd = -0.48 + clamp(progress - 0.5, 0.0, 4.0) * 0.24;
  vec2 lineCenter = vec2((lineEnd - 0.48) * 0.5, 0.1);
  float lineHalf = (lineEnd + 0.48) * 0.5;
  col = mix(col, white, fill(box(q - lineCenter, vec2(lineHalf, 0.008))));
  for (int i = 0; i < 5; i++) {
    float f = float(i);
    vec2 p = q - vec2(-0.48 + f * 0.24, 0.1);
    float done = step(f + 0.5, progress);
    float ring = abs(length(p) - 0.05) - 0.01;
    col = mix(col, white, fill(mix(ring, length(p) - 0.06, done)));
  }
  col = mix(col, white * 0.9, fill(box(q - vec2(0.0, -0.2), vec2(0.4, 0.12)) - 0.03));
  for (int i = 0; i < 3; i++) {
    float f = float(i);
    vec2 p = q - vec2(-0.1 + f * 0.04, -0.15 - f * 0.05);
    col = mix(col, vec3(0.3, 0.45, 0.75), fill(box(p, vec2(0.25 - f * 0.05, 0.012))));
  }
  return col;
}

// 5 · CRM BigBroker — teal dashboard bars
vec3 crm(vec2 q, float t) {
  vec3 col = vec3(0.03, 0.12, 0.14);
  float grid = step(0.97, fract((q.y + 0.5) * 10.0));
  col += grid * 0.05;
  for (int i = 0; i < 9; i++) {
    float f = float(i);
    float h = 0.12 + 0.6 * (0.5 + 0.5 * sin(t * 1.1 + f * 1.7));
    vec2 p = q - vec2(-0.52 + f * 0.13, -0.42 + h * 0.5);
    vec3 bar = i == 5 ? vec3(1.0, 0.82, 0.25) : vec3(0.2, 0.85, 0.8);
    col = mix(col, bar, fill(box(p, vec2(0.04, h * 0.5))));
  }
  return col;
}

// 6 · Agir Pour Toutes — pink rings pulsing
vec3 agpt(vec2 q, float t) {
  float r = length(q);
  float wave = sin(r * 30.0 - t * 3.0);
  vec3 col = mix(vec3(0.32, 0.04, 0.24), vec3(1.0, 0.45, 0.72),
    smoothstep(0.0, 0.25, wave) * smoothstep(0.8, 0.05, r));
  return mix(col, vec3(1.0, 0.85, 0.9), fill(r - 0.06 - 0.02 * sin(t * 4.0)));
}

// 7 · Refonte SPVIE — website wireframe scrolling
vec3 website(vec2 q, float t) {
  vec3 col = vec3(0.78, 0.86, 0.96);
  float y = q.y + t * 0.1;
  float row = floor(y * 3.0);
  vec2 p = vec2(q.x, (fract(y * 3.0) - 0.5) / 3.0);
  float side = mod(row, 2.0) * 2.0 - 1.0;
  col = mix(col, vec3(0.25, 0.5, 0.85), fill(box(p - vec2(side * 0.3, 0.0), vec2(0.2, 0.12)) - 0.01));
  for (int i = 0; i < 3; i++) {
    float f = float(i);
    vec2 l = p - vec2(-side * 0.22, 0.07 - f * 0.06);
    col = mix(col, vec3(0.3, 0.38, 0.55), fill(box(l, vec2(0.18 - f * 0.04, 0.01))));
  }
  col = mix(col, vec3(0.08, 0.2, 0.45), step(0.4, q.y));
  return col;
}

// 8 · Charte SPVIE — palette swatches sliding
vec3 charte(vec2 q, float t) {
  float x = q.x + t * 0.06;
  float id = mod(floor(x * 5.0), 6.0);
  vec3 col = vec3(0.1, 0.16, 0.36);
  if (id == 1.0) col = vec3(0.95, 0.45, 0.38);
  if (id == 2.0) col = vec3(0.93, 0.85, 0.68);
  if (id == 3.0) col = vec3(0.12, 0.55, 0.55);
  if (id == 4.0) col = vec3(0.92, 0.7, 0.2);
  if (id == 5.0) col = vec3(0.45, 0.2, 0.42);
  float label = step(q.y, -0.28);
  col = mix(col, col * 0.6 + 0.35, label);
  col = mix(col, vec3(0.15), label * fill(box(vec2(fract(x * 5.0) - 0.3, q.y + 0.36), vec2(0.15, 0.012))));
  return col;
}

// 9 · Appli CGRM — amber phone with scrolling cards
vec3 cgrm(vec2 q, float t) {
  vec3 col = mix(vec3(0.95, 0.62, 0.15), vec3(0.6, 0.28, 0.08), q.y + 0.5);
  col = mix(col, vec3(0.1, 0.08, 0.08), fill(box(q, vec2(0.17, 0.4)) - 0.04));
  vec2 s = q;
  if (abs(s.x) < 0.17 && abs(s.y) < 0.37) {
    col = vec3(0.96, 0.93, 0.86);
    float y = s.y + t * 0.08;
    vec2 p = vec2(s.x, (fract(y * 4.0) - 0.5) / 4.0);
    col = mix(col, vec3(1.0, 0.75, 0.3), fill(box(p, vec2(0.14, 0.09)) - 0.015));
    col = mix(col, vec3(0.35, 0.2, 0.1), fill(box(p - vec2(-0.03, 0.03), vec2(0.08, 0.01))));
  }
  return col;
}

void main() {
  vec2 q = vec2((vUv.x - 0.5) * 4.0 / 3.0, vUv.y - 0.5);
  float t = uTime;
  vec3 col;
  if (uPattern == 0) col = mauni(q, t);
  else if (uPattern == 1) col = sunrise(q, t);
  else if (uPattern == 2) col = syma(q, t);
  else if (uPattern == 3) col = trackit(q, t);
  else if (uPattern == 4) col = parcours(q, t);
  else if (uPattern == 5) col = crm(q, t);
  else if (uPattern == 6) col = agpt(q, t);
  else if (uPattern == 7) col = website(q, t);
  else if (uPattern == 8) col = charte(q, t);
  else col = cgrm(q, t);

  // broadcast wear: soft vignette, a drifting tracking band, fine noise
  col *= 1.0 - 0.35 * dot(q, q);
  float band = smoothstep(0.03, 0.0, abs(fract(vUv.y * 0.7 - t * 0.05) - 0.5));
  col += band * 0.06 * hash(vec2(floor(vUv.y * 240.0), t));
  col += (hash(vUv * 480.0 + fract(t) * 17.0) - 0.5) * 0.04;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
