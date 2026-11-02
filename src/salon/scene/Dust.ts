import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three';
import { config } from '../config';
import type { Beam } from './LightShafts';

const COUNT = 700;
const BEAMS = 4;

/**
 * Dust motes sparkling in the light shafts. They float everywhere but are
 * only lit inside a beam, taking its colour, and twinkle. Drawn in the
 * overlay pass (after the paint filter, which would erase them).
 */
export class Dust {
  readonly points: Points;
  private readonly material: ShaderMaterial;

  /** @param beams window, lamp down, lamp up, TV (same order as colours) */
  constructor(beams: Beam[]) {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    const point = new Vector3();
    for (let i = 0; i < COUNT; i++) {
      // most motes live inside a beam, a few drift elsewhere
      const r = Math.random();
      const beam =
        r < 0.45
          ? beams[0]
          : r < 0.65
            ? beams[1]
            : r < 0.75
              ? beams[2]
              : beams[3];
      const t = Math.random();
      point.lerpVectors(beam.from, beam.to, t);
      const radius =
        (beam.rFrom + (beam.rTo - beam.rFrom) * t) * Math.sqrt(Math.random());
      const angle = Math.random() * Math.PI * 2;
      point.x += Math.cos(angle) * radius;
      point.z += Math.sin(angle) * radius;
      point.y += (Math.random() - 0.5) * radius * 0.6;
      point.toArray(positions, i * 3);
      seeds[i] = Math.random();
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('seed', new BufferAttribute(seeds, 1));

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAmount: { value: 0 },
        uPixelRatio: { value: 1 },
        uFrom: { value: beams.map((b) => b.from.clone()) },
        uTo: { value: beams.map((b) => b.to.clone()) },
        uRadius: { value: beams.map((b) => new Vector2(b.rFrom, b.rTo)) },
        uColor: { value: Array.from({ length: BEAMS }, () => new Color()) },
        uPower: { value: new Array(BEAMS).fill(0) },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uPixelRatio;
        uniform vec3 uFrom[${BEAMS}];
        uniform vec3 uTo[${BEAMS}];
        uniform vec2 uRadius[${BEAMS}];
        uniform vec3 uColor[${BEAMS}];
        uniform float uPower[${BEAMS}];
        attribute float seed;
        varying vec3 vColor;
        void main() {
          vec3 p = position;
          // lazy drift, a slow fall that loops
          float s = seed * 6.2831;
          p.x += sin(uTime * 0.13 + s * 3.0) * 0.05;
          p.z += cos(uTime * 0.11 + s * 5.0) * 0.05;
          p.y += sin(uTime * 0.09 + s * 2.0) * 0.04 - mod(uTime * 0.012 + seed, 1.0) * 0.12;
          // light received: inside which beam, and how deep
          vec3 light = vec3(0.0);
          for (int i = 0; i < ${BEAMS}; i++) {
            vec3 axis = uTo[i] - uFrom[i];
            float t = clamp(dot(p - uFrom[i], axis) / dot(axis, axis), 0.0, 1.0);
            float radius = mix(uRadius[i].x, uRadius[i].y, t);
            float d = length(p - (uFrom[i] + axis * t)) / radius;
            light += uColor[i] * uPower[i] * smoothstep(1.0, 0.2, d) * (1.0 - t * 0.6);
          }
          float twinkle = 0.45 + 0.55 * pow(0.5 + 0.5 * sin(uTime * (1.5 + seed * 3.0) + seed * 40.0), 3.0);
          vColor = light * twinkle;
          vec4 view = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (1.2 + seed * 1.8) * uPixelRatio * (2.2 / max(-view.z, 0.3));
          gl_Position = projectionMatrix * view;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uAmount;
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vColor * a * uAmount, 1.0);
        }
      `,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    this.points = new Points(geometry, this.material);
    this.points.frustumCulled = false;
  }

  /**
   * @param colors sRGB-ish display colours of the 4 beams
   * @param powers how lit each beam is (0..1)
   */
  update(
    time: number,
    pixelRatio: number,
    colors: Color[],
    powers: number[],
  ): void {
    const amount = config.look.dust;
    this.points.visible = amount > 0.001;
    if (!this.points.visible) return;
    const u = this.material.uniforms;
    u.uTime.value = time;
    u.uAmount.value = amount;
    u.uPixelRatio.value = pixelRatio;
    for (let i = 0; i < BEAMS; i++) {
      u.uColor.value[i].copy(colors[i]);
      u.uPower.value[i] = powers[i];
    }
  }
}
