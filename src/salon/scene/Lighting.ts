import {
  Color,
  Group,
  HemisphereLight,
  MathUtils,
  Object3D,
  PointLight,
  SpotLight,
  type Vector3,
} from 'three';
import { config } from '../config';
import { layout } from './layout';

/** Cold blue-cyan of an idle tube, mixed into the picture colour. */
const TV_BASE = new Color('#8fb4ff');
const HAND_WARM = new Color('#ffb38a');

/**
 * Caravaggio-style lighting: the TV is the main source (coloured by the
 * picture), the lamp a weak warm counterpoint (owned by Lamp), the city a
 * faint cold spill through the window, with a car headlight now and then.
 */
export class Lighting {
  readonly group = new Group();
  private readonly tv: SpotLight;
  private readonly ambient: HemisphereLight;
  private readonly window: SpotLight;
  private readonly headlight: SpotLight;
  private readonly headlightTarget = new Object3D();
  /**
   * Small fill on the hand (added to the head rig by the app): the TV
   * backlights it, so without it the hand reads as a dark blob.
   */
  readonly handFill = new PointLight('#ffc29a', 0, 1.2, 2);
  /** Smoothed picture colour, linear. */
  private readonly tvColor = new Color('#8fb4ff');
  private readonly targetColor = new Color('#8fb4ff');
  private flicker = 0;
  private nextHeadlight = 8;
  private headlightTime = -1;
  /** Called when a car passes in the street (to play its sound). */
  onHeadlight: (() => void) | null = null;

  constructor(screenCenter: Vector3, viewer: Vector3) {
    this.ambient = new HemisphereLight('#3a2f5a', '#2a1810', 1);
    this.group.add(this.ambient);

    this.tv = new SpotLight('#8fb4ff', 1, 9, 1.35, 1, 2);
    this.tv.position.copy(screenCenter);
    this.tv.position.z += 0.08;
    this.tv.target.position.set(viewer.x, viewer.y + 0.45, viewer.z);
    this.tv.castShadow = true;
    this.tv.shadow.mapSize.set(512, 512);
    this.tv.shadow.bias = -0.0008;
    this.tv.shadow.normalBias = 0.02;
    this.tv.shadow.radius = 4;
    this.tv.shadow.camera.near = 0.1;
    this.tv.shadow.camera.far = 8;
    this.group.add(this.tv, this.tv.target);

    const { maxX } = layout.room;
    this.window = new SpotLight('#6a86d8', 1, 8, 0.95, 1, 1.5);
    this.window.position.set(maxX + 1.2, 2.4, layout.window.z);
    // cold spill on the plant corner and the TV's right flank
    this.window.target.position.set(0.8, 0.5, -1.1);
    this.group.add(this.window, this.window.target);

    this.headlight = new SpotLight('#ffe9c4', 0, 10, 0.35, 0.8, 1.2);
    this.headlight.position.set(maxX + 0.8, 0.9, layout.window.z);
    this.headlight.target = this.headlightTarget;
    this.group.add(this.headlight, this.headlightTarget);
  }

  /** Current colour of the TV light (linear), for the light shafts. */
  get tvLight(): Color {
    return this.tv.color;
  }

  /** Picture colour measured on the screen (sRGB 0..1). */
  setPictureColor(r: number, g: number, b: number): void {
    this.targetColor.setRGB(r, g, b, 'srgb');
  }

  /**
   * @param power 0 = tube off, 1 = on
   * @param noise snow amount on the screen, brightens and cools the light
   */
  update(dt: number, time: number, power: number, noise: number): void {
    const { lights } = config;
    const follow = 1 - Math.exp(-dt * lights.tvColorFollow);
    this.tvColor.lerp(this.targetColor, follow);

    // picture colour, pushed a bit toward the cold tube tint
    const brightness = Math.max(
      0.25,
      (this.tvColor.r + this.tvColor.g + this.tvColor.b) / 3,
    );
    this.tv.color.copy(this.tvColor).lerp(TV_BASE, 0.25 + noise * 0.5);
    // normalise hue, keep a little of the picture brightness
    const max = Math.max(
      this.tv.color.r,
      this.tv.color.g,
      this.tv.color.b,
      1e-4,
    );
    this.tv.color.multiplyScalar(1 / max);

    // irregular flicker (sum of incommensurate sines + a little noise)
    this.flicker = MathUtils.lerp(this.flicker, Math.random() - 0.5, 0.3);
    const wobble =
      Math.sin(time * 13.1) * 0.4 + Math.sin(time * 7.3) * 0.35 + this.flicker;
    this.tv.intensity =
      lights.tvIntensity *
      power *
      (0.55 + brightness * 0.8 + noise * 0.4) *
      (1 + wobble * lights.tvFlicker);

    this.ambient.intensity = lights.ambientIntensity;
    this.window.intensity = lights.windowIntensity;
    this.handFill.color.copy(this.tv.color).lerp(HAND_WARM, 0.5);
    this.handFill.intensity = lights.handFill * (0.35 + 0.65 * power);
    this.updateHeadlight(dt);
  }

  /** A car passing in the street: a beam sweeping across the ceiling. */
  private updateHeadlight(dt: number): void {
    const { lights } = config;
    if (this.headlightTime < 0) {
      this.nextHeadlight -= dt;
      if (this.nextHeadlight <= 0) {
        this.headlightTime = 0;
        this.onHeadlight?.();
        const [min, max] = lights.headlightEvery;
        this.nextHeadlight = MathUtils.randFloat(min, max);
      }
      this.headlight.intensity = 0;
      return;
    }
    this.headlightTime += dt;
    const duration = 3.2;
    const t = this.headlightTime / duration;
    if (t >= 1) {
      this.headlightTime = -1;
      this.headlight.intensity = 0;
      return;
    }
    const { minZ, maxZ, height } = layout.room;
    this.headlightTarget.position.set(
      MathUtils.lerp(1.5, -2.5, t),
      height,
      MathUtils.lerp(maxZ, minZ, t),
    );
    this.headlight.intensity =
      lights.headlightIntensity * Math.sin(Math.PI * t) ** 2;
  }
}
