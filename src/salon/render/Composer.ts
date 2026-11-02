import {
  type Camera,
  HalfFloatType,
  LinearFilter,
  type Scene,
  ShaderMaterial,
  Vector2,
  type WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { config } from '../config';
import grade from '../shaders/grade.glsl?raw';
import {
  FULLSCREEN_VERTEX,
  gradeUniforms,
  PaintPass,
  updateGradeUniforms,
} from './PaintPass';

function quarterTarget(): WebGLRenderTarget {
  return new WebGLRenderTarget(1, 1, {
    type: HalfFloatType,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
  });
}

/**
 * Render pipeline (CLAUDE.md §6.3):
 * 1. scene → HDR target (the CRT screen writes alpha 0 = its own mask)
 * 2. paint filter at reduced resolution
 * 3. composite: painted room + sharp screen + canvas weave + grain + vignette
 * 3b. painted glow: bright areas of the unpainted image, blurred at quarter
 *     resolution, so even small glints (brass, rims) bloom softly
 * 4. transitions on top (CLAUDE.md §4.5, §4.7): radial zoom blur toward the
 *    TV, chromatic split, white flash — driven by `transition`.
 */
export class Composer {
  private readonly scene: WebGLRenderTarget;
  private readonly paint = new PaintPass();
  private readonly resolution = new Vector2();
  private readonly composite: FullScreenQuad;
  private readonly bright = quarterTarget();
  private readonly glowA = quarterTarget();
  private readonly glowB = quarterTarget();
  private readonly glowTexel = new Vector2();
  private readonly brightPass = new FullScreenQuad(
    new ShaderMaterial({
      uniforms: {
        tScene: { value: null },
        uThreshold: { value: 0.5 },
        ...gradeUniforms(),
      },
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: `${grade}
        uniform sampler2D tScene;
        uniform float uThreshold;
        varying vec2 vUv;
        void main() {
          vec3 c = grade(texture2D(tScene, vUv).rgb);
          float luma = dot(c, vec3(0.299, 0.587, 0.114));
          float k = smoothstep(uThreshold, uThreshold + 0.35, luma);
          gl_FragColor = vec4(c * k, 1.0);
        }`,
      depthTest: false,
      depthWrite: false,
    }),
  );
  private readonly blurPass = new FullScreenQuad(
    new ShaderMaterial({
      uniforms: { tColor: { value: null }, uStep: { value: new Vector2() } },
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: /* glsl */ `
        uniform sampler2D tColor;
        uniform vec2 uStep;
        varying vec2 vUv;
        void main() {
          vec4 sum = texture2D(tColor, vUv) * 0.2270270270;
          sum += texture2D(tColor, vUv + uStep * 1.3846153846) * 0.3162162162;
          sum += texture2D(tColor, vUv - uStep * 1.3846153846) * 0.3162162162;
          sum += texture2D(tColor, vUv + uStep * 3.2307692308) * 0.0702702703;
          sum += texture2D(tColor, vUv - uStep * 3.2307692308) * 0.0702702703;
          gl_FragColor = sum;
        }`,
      depthTest: false,
      depthWrite: false,
    }),
  );
  /** Transition state, animated by the app (all 0 at rest). */
  readonly transition = {
    /** 0..1: zoom blur + chromatic split toward `center`. */
    warp: 0,
    /** 0..1: white flash. */
    flash: 0,
    /** Screen-space point (0..1) the room is sucked toward. */
    center: new Vector2(0.5, 0.5),
  };

  constructor(private readonly renderer: WebGLRenderer) {
    this.scene = new WebGLRenderTarget(1, 1, {
      type: HalfFloatType,
      samples: config.render.msaaSamples,
    });
    this.composite = new FullScreenQuad(
      new ShaderMaterial({
        uniforms: {
          tScene: { value: this.scene.texture },
          tPaint: { value: this.paint.texture },
          uResolution: { value: this.resolution },
          uTime: { value: 0 },
          uPaint: { value: 1 },
          uCanvas: { value: 0 },
          uGrain: { value: 0 },
          uVignette: { value: 0 },
          uPaintTexel: { value: this.paint.texel },
          uImpasto: { value: 0 },
          uEdgeBreak: { value: 0 },
          uWarp: { value: 0 },
          uFlash: { value: 0 },
          uCenter: { value: this.transition.center },
          tGlow: { value: this.glowA.texture },
          uGlow: { value: 0 },
          ...gradeUniforms(),
        },
        vertexShader: FULLSCREEN_VERTEX,
        fragmentShader: `${grade}
          uniform sampler2D tScene;
          uniform sampler2D tPaint;
          uniform vec2 uResolution;
          uniform float uTime;
          uniform float uPaint;
          uniform float uCanvas;
          uniform float uGrain;
          uniform float uVignette;
          uniform vec2 uPaintTexel;
          uniform float uImpasto;
          uniform float uEdgeBreak;
          uniform float uWarp;
          uniform float uFlash;
          uniform vec2 uCenter;
          uniform sampler2D tGlow;
          uniform float uGlow;
          varying vec2 vUv;

          float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
          }
          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
              mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
          }

          // painted room + sharp screen at a given point; alpha = screen mask
          vec4 shade(vec2 at) {
            vec4 scene = texture2D(tScene, at);
            vec3 sharp = grade(scene.rgb);
            float screen = 1.0 - scene.a;
            vec2 px = at * uResolution;
            vec3 painted = sharp;
            if (uPaint > 0.5) {
              // broken edges: the painted image is sampled with a slow wobble
              vec2 wobble = vec2(noise(px * 0.035), noise(px.yx * 0.035 + 17.0)) - 0.5;
              vec2 uv = at + wobble * 2.0 * uEdgeBreak * uPaintTexel;
              vec4 paint = texture2D(tPaint, uv);
              // impasto: stroke height (alpha) lit from the top left
              vec2 toLight = vec2(-0.7071, 0.7071) * uPaintTexel;
              float behind = texture2D(tPaint, uv - toLight).a;
              float relief = paint.a - behind;
              float luma = dot(paint.rgb, vec3(0.299, 0.587, 0.114));
              painted = paint.rgb * (1.0 + relief * uImpasto * 1.6);
              painted += relief * uImpasto * 0.35 * smoothstep(0.05, 0.6, luma);
            }
            return vec4(mix(painted, sharp, screen), screen);
          }

          void main() {
            vec4 base = shade(vUv);
            vec3 col = base.rgb;
            float screen = base.a;
            vec2 px = vUv * uResolution;
            if (uWarp > 0.001) {
              // zoom blur toward the TV, red and blue pulled apart
              vec2 toCenter = vUv - uCenter;
              vec3 sum = vec3(0.0);
              for (int i = 0; i < 10; i++) {
                float k = float(i) / 9.0;
                float s = 1.0 - uWarp * 0.45 * k;
                sum.r += shade(uCenter + toCenter * (s + uWarp * 0.02)).r;
                sum.g += shade(uCenter + toCenter * s).g;
                sum.b += shade(uCenter + toCenter * (s - uWarp * 0.02)).b;
              }
              col = mix(col, sum / 10.0, min(1.0, uWarp * 1.5));
            }

            // painted glow around the light sources
            col += texture2D(tGlow, vUv).rgb * uGlow;

            // canvas: woven threads + uneven priming, in screen space
            float warp = sin(px.x * 1.9 + noise(px * 0.08) * 2.0);
            float weft = sin(px.y * 1.9 + noise(px.yx * 0.08) * 2.0);
            float weave = (warp * weft) * 0.5 + 0.5;
            float priming = noise(px * 0.012) - 0.5;
            float canvas = (weave - 0.5) + priming * 0.8;
            col *= 1.0 + uCanvas * canvas * (1.0 - screen * 0.75);

            col += (hash(px + fract(uTime * 7.0) * 311.0) - 0.5) * uGrain;

            vec2 v = vUv - 0.5;
            v.x *= uResolution.x / uResolution.y;
            col *= mix(1.0, smoothstep(1.15, 0.25, length(v)), uVignette);
            col = mix(col, vec3(1.0, 0.97, 0.92), uFlash);

            gl_FragColor = vec4(col, 1.0);
          }`,
        depthTest: false,
        depthWrite: false,
      }),
    );
  }

  /** @param width,height canvas size in CSS pixels */
  setSize(width: number, height: number): void {
    const ratio = this.renderer.getPixelRatio();
    const w = Math.round(width * ratio);
    const h = Math.round(height * ratio);
    this.scene.setSize(w, h);
    this.resolution.set(w, h);
    this.paint.setSize(width, height);
    const qw = Math.max(1, Math.round(w / 4));
    const qh = Math.max(1, Math.round(h / 4));
    for (const rt of [this.bright, this.glowA, this.glowB]) rt.setSize(qw, qh);
    this.glowTexel.set(1 / qw, 1 / qh);
  }

  /**
   * @param overlay drawn on top of the painted image (tiny sparkles the
   *   paint filter would erase), additive, without depth test
   */
  render(scene: Scene, camera: Camera, time: number, overlay?: Scene): void {
    const { renderer } = this;
    const { paint, look } = config;
    renderer.setRenderTarget(this.scene);
    renderer.render(scene, camera);

    if (paint.enabled) this.paint.render(renderer, this.scene.texture);
    if (look.bloom > 0) this.renderGlow();

    const material = this.composite.material as ShaderMaterial;
    const u = material.uniforms;
    updateGradeUniforms(material);
    u.uTime.value = time;
    u.uPaint.value = paint.enabled ? 1 : 0;
    u.uCanvas.value = paint.canvasStrength;
    u.uGrain.value = paint.grainStrength;
    u.uVignette.value = paint.vignette;
    u.uImpasto.value = paint.impasto;
    u.uEdgeBreak.value = paint.edgeBreak;
    u.uGlow.value = look.bloom;
    u.uWarp.value = this.transition.warp;
    u.uFlash.value = this.transition.flash;
    renderer.setRenderTarget(null);
    this.composite.render(renderer);
    if (overlay) {
      const autoClear = renderer.autoClear;
      renderer.autoClear = false;
      renderer.render(overlay, camera);
      renderer.autoClear = autoClear;
    }
  }

  private renderGlow(): void {
    const { renderer } = this;
    const bright = this.brightPass.material as ShaderMaterial;
    bright.uniforms.tScene.value = this.scene.texture;
    bright.uniforms.uThreshold.value = config.look.bloomThreshold;
    updateGradeUniforms(bright);
    renderer.setRenderTarget(this.bright);
    this.brightPass.render(renderer);

    // two widening blur iterations: a tight core and a wide soft halo
    const blur = this.blurPass.material as ShaderMaterial;
    let source = this.bright;
    for (const spread of [1, 2.6]) {
      blur.uniforms.tColor.value = source.texture;
      blur.uniforms.uStep.value.set(this.glowTexel.x * spread, 0);
      renderer.setRenderTarget(this.glowB);
      this.blurPass.render(renderer);
      blur.uniforms.tColor.value = this.glowB.texture;
      blur.uniforms.uStep.value.set(0, this.glowTexel.y * spread);
      renderer.setRenderTarget(this.glowA);
      this.blurPass.render(renderer);
      source = this.glowA;
    }
  }
}
