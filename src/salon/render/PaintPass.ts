import {
  DataTexture,
  HalfFloatType,
  LinearFilter,
  RepeatWrapping,
  ShaderMaterial,
  type Texture,
  Vector2,
  Vector3,
  type WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { config } from '../config';
import brush from '../shaders/brush.glsl?raw';
import grade from '../shaders/grade.glsl?raw';
import kuwahara from '../shaders/kuwahara.glsl?raw';

export const FULLSCREEN_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export function gradeUniforms() {
  return {
    uExposure: { value: 1 },
    uContrast: { value: 1 },
    uSaturation: { value: 1 },
    uShadowTint: { value: new Vector3() },
    uShadowLift: { value: 0 },
    uHighlightTint: { value: new Vector3(1, 1, 1) },
  };
}

export function updateGradeUniforms(material: ShaderMaterial): void {
  const u = material.uniforms;
  const { grade } = config;
  u.uExposure.value = config.render.exposure;
  u.uContrast.value = grade.contrast;
  u.uSaturation.value = grade.saturation;
  u.uShadowTint.value.fromArray(grade.shadowTint);
  u.uShadowLift.value = grade.shadowLift;
  u.uHighlightTint.value.fromArray(grade.highlightTint);
}

function pass(
  fragmentShader: string,
  uniforms: Record<string, { value: unknown }>,
) {
  return new FullScreenQuad(
    new ShaderMaterial({
      uniforms,
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
    }),
  );
}

function target(type = HalfFloatType): WebGLRenderTarget {
  return new WebGLRenderTarget(1, 1, {
    type,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
  });
}

/** Random values, linearly filtered: value noise for the brush streaks. */
function noiseTexture(): DataTexture {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 255;
  const texture = new DataTexture(data, size, size);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Oil-paint look (CLAUDE.md §2.0-2.1), computed at reduced resolution:
 * grade → structure tensor → tensor blur (separable) → anisotropic Kuwahara
 * → brush streaks along the flow (stroke height kept in alpha).
 */
export class PaintPass {
  private readonly prepared = target();
  private readonly tensor = target();
  private readonly tensorBlur = target();
  private readonly painted = target();
  private readonly brushed = target();
  readonly texel = new Vector2();

  private readonly prepare = pass(
    `${grade}
    uniform sampler2D tScene;
    uniform float uStroke;
    varying vec2 vUv;
    void main() {
      vec4 scene = texture2D(tScene, vUv);
      // fine pigment noise: the Kuwahara pass stretches it into strokes
      vec2 cell = floor(gl_FragCoord.xy * 0.7);
      float h = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
      vec3 col = grade(scene.rgb) * (1.0 + (h - 0.5) * uStroke);
      gl_FragColor = vec4(col, scene.a);
    }`,
    { tScene: { value: null }, uStroke: { value: 0 }, ...gradeUniforms() },
  );

  private readonly structure = pass(
    /* glsl */ `
    uniform sampler2D tColor;
    uniform vec2 uTexel;
    varying vec2 vUv;
    vec3 at(float x, float y) {
      return texture2D(tColor, vUv + vec2(x, y) * uTexel).rgb;
    }
    void main() {
      vec3 sx = (at(-1.0, -1.0) + 2.0 * at(-1.0, 0.0) + at(-1.0, 1.0)
        - at(1.0, -1.0) - 2.0 * at(1.0, 0.0) - at(1.0, 1.0)) / 4.0;
      vec3 sy = (at(-1.0, -1.0) + 2.0 * at(0.0, -1.0) + at(1.0, -1.0)
        - at(-1.0, 1.0) - 2.0 * at(0.0, 1.0) - at(1.0, 1.0)) / 4.0;
      gl_FragColor = vec4(dot(sx, sx), dot(sy, sy), dot(sx, sy), 1.0);
    }`,
    { tColor: { value: null }, uTexel: { value: new Vector2() } },
  );

  private readonly blur = pass(
    /* glsl */ `
    uniform sampler2D tColor;
    uniform vec2 uStep;
    varying vec2 vUv;
    void main() {
      // 9-tap gaussian, sigma ≈ 2 texels
      vec4 sum = texture2D(tColor, vUv) * 0.2270270270;
      sum += texture2D(tColor, vUv + uStep * 1.3846153846) * 0.3162162162;
      sum += texture2D(tColor, vUv - uStep * 1.3846153846) * 0.3162162162;
      sum += texture2D(tColor, vUv + uStep * 3.2307692308) * 0.0702702703;
      sum += texture2D(tColor, vUv - uStep * 3.2307692308) * 0.0702702703;
      gl_FragColor = sum;
    }`,
    { tColor: { value: null }, uStep: { value: new Vector2() } },
  );

  private readonly kuwahara = pass(kuwahara, {
    tColor: { value: null },
    tTensor: { value: null },
    uTexel: { value: new Vector2() },
    uRadius: { value: 5 },
    uAlpha: { value: 1 },
    uHardness: { value: 8 },
    uSharpness: { value: 8 },
  });

  private readonly brush = pass(brush, {
    tColor: { value: null },
    tTensor: { value: null },
    tNoise: { value: noiseTexture() },
    uTexel: { value: new Vector2() },
    uWidth: { value: 2.5 },
    uStep: { value: 1.5 },
    uStrength: { value: 0.3 },
  });

  /** Painted colour (RGB) and stroke height (A). */
  get texture(): Texture {
    return this.brushed.texture;
  }

  /** @param width,height size of the canvas in CSS pixels */
  setSize(width: number, height: number): void {
    const w = Math.max(1, Math.round(width * config.paint.scale));
    const h = Math.max(1, Math.round(height * config.paint.scale));
    for (const rt of [
      this.prepared,
      this.tensor,
      this.tensorBlur,
      this.painted,
      this.brushed,
    ]) {
      rt.setSize(w, h);
    }
    this.texel.set(1 / w, 1 / h);
  }

  render(renderer: WebGLRenderer, scene: Texture): void {
    const { paint } = config;

    const prepare = this.prepare.material as ShaderMaterial;
    prepare.uniforms.tScene.value = scene;
    prepare.uniforms.uStroke.value = paint.strokeNoise;
    updateGradeUniforms(prepare);
    this.draw(renderer, this.prepare, this.prepared);

    const structure = this.structure.material as ShaderMaterial;
    structure.uniforms.tColor.value = this.prepared.texture;
    structure.uniforms.uTexel.value.copy(this.texel);
    this.draw(renderer, this.structure, this.tensor);

    const blur = this.blur.material as ShaderMaterial;
    blur.uniforms.tColor.value = this.tensor.texture;
    blur.uniforms.uStep.value.set(this.texel.x, 0);
    this.draw(renderer, this.blur, this.tensorBlur);
    blur.uniforms.tColor.value = this.tensorBlur.texture;
    blur.uniforms.uStep.value.set(0, this.texel.y);
    this.draw(renderer, this.blur, this.tensor);

    const k = this.kuwahara.material as ShaderMaterial;
    k.uniforms.tColor.value = this.prepared.texture;
    k.uniforms.tTensor.value = this.tensor.texture;
    k.uniforms.uTexel.value.copy(this.texel);
    k.uniforms.uRadius.value = Math.round(paint.radius);
    k.uniforms.uAlpha.value = paint.alpha;
    k.uniforms.uHardness.value = paint.hardness;
    k.uniforms.uSharpness.value = paint.sharpness;
    this.draw(renderer, this.kuwahara, this.painted);

    const b = this.brush.material as ShaderMaterial;
    b.uniforms.tColor.value = this.painted.texture;
    b.uniforms.tTensor.value = this.tensor.texture;
    b.uniforms.uTexel.value.copy(this.texel);
    b.uniforms.uWidth.value = paint.strokeWidth;
    b.uniforms.uStep.value = paint.strokeLength / 15;
    b.uniforms.uStrength.value = paint.strokeStrength;
    this.draw(renderer, this.brush, this.brushed);
  }

  private draw(
    renderer: WebGLRenderer,
    quad: FullScreenQuad,
    output: WebGLRenderTarget,
  ): void {
    renderer.setRenderTarget(output);
    quad.render(renderer);
  }
}
