import {
  type Camera,
  HalfFloatType,
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

/**
 * Render pipeline (CLAUDE.md §6.3):
 * 1. scene → HDR target (the CRT screen writes alpha 0 = its own mask)
 * 2. paint filter at reduced resolution
 * 3. composite: painted room + sharp screen + canvas weave + grain + vignette
 */
export class Composer {
  private readonly scene: WebGLRenderTarget;
  private readonly paint = new PaintPass();
  private readonly resolution = new Vector2();
  private readonly composite: FullScreenQuad;

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

          void main() {
            vec4 scene = texture2D(tScene, vUv);
            vec3 sharp = grade(scene.rgb);
            float screen = 1.0 - scene.a;
            vec2 px = vUv * uResolution;
            vec3 painted = sharp;
            if (uPaint > 0.5) {
              // broken edges: the painted image is sampled with a slow wobble
              vec2 wobble = vec2(noise(px * 0.035), noise(px.yx * 0.035 + 17.0)) - 0.5;
              vec2 uv = vUv + wobble * 2.0 * uEdgeBreak * uPaintTexel;
              vec4 paint = texture2D(tPaint, uv);
              // impasto: stroke height (alpha) lit from the top left
              vec2 toLight = vec2(-0.7071, 0.7071) * uPaintTexel;
              float behind = texture2D(tPaint, uv - toLight).a;
              float relief = paint.a - behind;
              float luma = dot(paint.rgb, vec3(0.299, 0.587, 0.114));
              painted = paint.rgb * (1.0 + relief * uImpasto * 1.6);
              painted += relief * uImpasto * 0.35 * smoothstep(0.05, 0.6, luma);
            }
            vec3 col = mix(painted, sharp, screen);

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
  }

  render(scene: Scene, camera: Camera, time: number): void {
    const { renderer } = this;
    const { paint } = config;
    renderer.setRenderTarget(this.scene);
    renderer.render(scene, camera);

    if (paint.enabled) this.paint.render(renderer, this.scene.texture);

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
    renderer.setRenderTarget(null);
    this.composite.render(renderer);
  }
}
