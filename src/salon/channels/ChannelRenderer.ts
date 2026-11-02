import {
  LinearFilter,
  LinearMipmapLinearFilter,
  ShaderMaterial,
  type Texture,
  type WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import fakeChannels from '../shaders/fakeChannels.glsl?raw';

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/** How often the picture colour is measured for the TV light, in seconds. */
const SAMPLE_INTERVAL = 0.1;

/**
 * Renders the current channel picture into a 4:3 texture (with mipmaps, used
 * by the CRT bloom) and measures its average colour for the room light.
 * Fake channels are procedural; real video loops will be drawn here too.
 */
export class ChannelRenderer {
  readonly target = new WebGLRenderTarget(640, 480, {
    generateMipmaps: true,
    minFilter: LinearMipmapLinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
  });
  private readonly material = new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPattern: { value: 0 } },
    vertexShader: VERTEX,
    fragmentShader: fakeChannels,
    depthTest: false,
    depthWrite: false,
  });
  private readonly quad = new FullScreenQuad(this.material);

  private readonly sampleTarget = new WebGLRenderTarget(1, 1, {
    depthBuffer: false,
  });
  private readonly sampleQuad = new FullScreenQuad(
    new ShaderMaterial({
      uniforms: { tPicture: { value: this.target.texture } },
      vertexShader: VERTEX,
      fragmentShader: /* glsl */ `
        uniform sampler2D tPicture;
        void main() {
          vec3 sum = vec3(0.0);
          for (int y = 0; y < 4; y++) {
            for (int x = 0; x < 4; x++) {
              vec2 uv = (vec2(float(x), float(y)) + 0.5) / 4.0;
              sum += textureLod(tPicture, uv, 4.0).rgb;
            }
          }
          gl_FragColor = vec4(sum / 16.0, 1.0);
        }
      `,
      depthTest: false,
      depthWrite: false,
    }),
  );
  private readonly pixel = new Uint8Array(4);
  private sinceSample = SAMPLE_INTERVAL;
  private sampling = false;

  get texture(): Texture {
    return this.target.texture;
  }

  render(renderer: WebGLRenderer, time: number, pattern: number): void {
    this.material.uniforms.uTime.value = time;
    this.material.uniforms.uPattern.value = pattern;
    renderer.setRenderTarget(this.target);
    this.quad.render(renderer);
    renderer.setRenderTarget(null);
  }

  /**
   * Measures the picture colour every SAMPLE_INTERVAL without stalling the
   * GPU (async read-back); `onColor` receives sRGB values in 0..1.
   */
  sample(
    renderer: WebGLRenderer,
    dt: number,
    onColor: (r: number, g: number, b: number) => void,
  ): void {
    this.sinceSample += dt;
    if (this.sampling || this.sinceSample < SAMPLE_INTERVAL) return;
    this.sinceSample = 0;
    this.sampling = true;
    renderer.setRenderTarget(this.sampleTarget);
    this.sampleQuad.render(renderer);
    renderer.setRenderTarget(null);
    renderer
      .readRenderTargetPixelsAsync(this.sampleTarget, 0, 0, 1, 1, this.pixel)
      .then(() => {
        const [r, g, b] = this.pixel;
        onColor(r / 255, g / 255, b / 255);
      })
      .catch(() => {
        // read-back unsupported: keep the last colour
      })
      .finally(() => {
        this.sampling = false;
      });
  }
}
