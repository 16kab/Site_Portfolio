import { ShaderMaterial, type Texture, Vector2 } from 'three';
import { config } from '../config';
import crt from '../shaders/crt.glsl?raw';

/** Live signal state, animated by the TV controller. */
export type Signal = {
  /** Snow amount on top of the base noise (0..1). */
  noise: number;
  /** Vertical roll offset (sync loss). */
  roll: number;
  /** Picture scale for the power on/off collapse. */
  collapseX: number;
  collapseY: number;
  /** Over-brightness of the collapsing line / dot. */
  flash: number;
  /** 0 = tube off, 1 = picture shown. */
  signal: number;
};

export function createCrtMaterial(
  picture: Texture,
  osd: Texture,
): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uPicture: { value: picture },
      uOsd: { value: osd },
      uTime: { value: 0 },
      uNoise: { value: 0 },
      uRoll: { value: 0 },
      uCollapse: { value: new Vector2(1, 1) },
      uFlash: { value: 0 },
      uSignal: { value: 1 },
      uCurvature: { value: 0 },
      uScanlines: { value: 0 },
      uMask: { value: 0 },
      uAberration: { value: 0 },
      uBloom: { value: 0 },
      uBrightness: { value: 1 },
      uReflection: { value: 0 },
      uVignette: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: crt,
  });
}

export function updateCrtMaterial(
  material: ShaderMaterial,
  time: number,
  signal: Signal,
): void {
  const u = material.uniforms;
  const { crt: c } = config;
  u.uTime.value = time;
  u.uNoise.value = Math.min(1, c.baseNoise + signal.noise);
  u.uRoll.value = signal.roll;
  u.uCollapse.value.set(signal.collapseX, signal.collapseY);
  u.uFlash.value = signal.flash;
  u.uSignal.value = signal.signal;
  u.uCurvature.value = c.curvature;
  u.uScanlines.value = c.scanlines;
  u.uMask.value = c.mask;
  u.uAberration.value = c.aberration;
  u.uBloom.value = c.bloom;
  u.uBrightness.value = c.brightness;
  u.uReflection.value = c.reflection;
  u.uVignette.value = c.vignette;
}
