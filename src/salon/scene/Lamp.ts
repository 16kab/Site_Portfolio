import {
  CylinderGeometry,
  DoubleSide,
  Group,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  PointLight,
  SphereGeometry,
  Vector2,
} from 'three';
import { config } from '../config';
import { layout } from './layout';
import { paint, palette } from './materials';

/** Floor lamp on the left: the warm, weak counterpoint to the TV. */
export class Lamp {
  readonly group = new Group();
  readonly light: PointLight;
  private shade: MeshStandardMaterial;
  /** 0..1, animated by the intro (Phase 3). */
  level = 1;

  constructor() {
    const brass = paint(palette.brass, { roughness: 0.35, metalness: 0.7 });
    const base = new Mesh(new CylinderGeometry(0.16, 0.19, 0.04, 24), brass);
    base.position.y = 0.02;
    const pole = new Mesh(new CylinderGeometry(0.012, 0.012, 1.3, 8), brass);
    pole.position.y = 0.67;
    pole.castShadow = true;

    this.shade = new MeshStandardMaterial({
      color: '#a8743f',
      emissive: config.lights.lampColor,
      emissiveIntensity: 0.45,
      roughness: 1,
      side: DoubleSide,
    });
    const profile = [new Vector2(0.25, 0), new Vector2(0.16, 0.3)];
    const shade = new Mesh(new LatheGeometry(profile, 28), this.shade);
    shade.position.y = 1.25;

    const bulb = new Mesh(
      new SphereGeometry(0.04, 12, 8),
      new MeshStandardMaterial({
        color: '#000000',
        emissive: '#ffd8a0',
        emissiveIntensity: 6,
      }),
    );
    bulb.position.y = 1.33;

    this.light = new PointLight(config.lights.lampColor, 1, 7, 2);
    this.light.position.y = 1.36;
    // real cast shadows, like the torches of the game (cheap-ish map)
    this.light.castShadow = true;
    this.light.shadow.mapSize.set(512, 512);
    this.light.shadow.bias = -0.002;
    this.light.shadow.normalBias = 0.03;
    this.light.shadow.camera.near = 0.05;
    this.light.shadow.camera.far = 7;

    this.group.add(base, pole, shade, bulb, this.light);
    this.group.position.copy(layout.lamp);
  }

  update(): void {
    this.light.color.set(config.lights.lampColor);
    this.light.intensity = config.lights.lampIntensity * this.level;
    this.shade.emissiveIntensity = 0.45 * this.level;
  }
}
