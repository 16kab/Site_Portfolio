import {
  HalfFloatType,
  LinearFilter,
  ShaderMaterial,
  type Texture,
  Vector2,
  Vector3,
  type WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { config } from '../config';
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
    uShadowTint: { value: new Vector3() },
    uShadowLift: { value: 0 },
  };
}

export function updateGradeUniforms(material: ShaderMaterial): void {
  const u = material.uniforms;
  u.uExposure.value = config.render.exposure;
  u.uShadowTint.value.fromArray(config.paint.shadowTint);
  u.uShadowLift.value = config.paint.shadowLift;
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

/**
 * Oil-paint look (CLAUDE.md §2.1), computed at reduced resolution:
 * grade → structure tensor → tensor blur (separable) → anisotropic Kuwahara.
 */
export class PaintPass {
  private readonly prepared = target();
  private readonly tensor = target();
  private readonly tensorBlur = target();
  private readonly painted = target();
  private readonly texel = new Vector2();

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

  get texture(): Texture {
    return this.painted.texture;
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
