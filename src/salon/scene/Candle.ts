import {
  CylinderGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PointLight,
  SphereGeometry,
} from 'three';
import { config } from '../config';
import { paint } from './materials';

/**
 * A candle burning on the coffee table: a second warm pool of light close
 * to the viewer, flickering like the embers of No Rest for the Wicked.
 * Part of the "wicked" look (config.look.candle).
 */
export class Candle {
  readonly group = new Group();
  private readonly flame: Mesh;
  private readonly flameMaterial: MeshStandardMaterial;
  private readonly light: PointLight;
  private flicker = 1;
  private sway = 0;

  constructor() {
    const saucer = new Mesh(
      new CylinderGeometry(0.06, 0.05, 0.012, 24),
      paint('#6b3a22', { roughness: 0.4, impasto: 0.1 }),
    );
    saucer.position.y = 0.006;
    const wax = new Mesh(
      new CylinderGeometry(0.026, 0.028, 0.085, 20),
      paint('#f2e4c8', {
        roughness: 0.5,
        impasto: 0.05,
        emissive: '#ff9a4a',
        emissiveIntensity: 0.25,
      }),
    );
    wax.position.y = 0.012 + 0.0425;
    wax.castShadow = true;
    const wick = new Mesh(
      new CylinderGeometry(0.0012, 0.0012, 0.012, 6),
      new MeshStandardMaterial({
        color: '#120806',
        emissive: '#ff5a1a',
        emissiveIntensity: 1.5,
      }),
    );
    wick.position.y = 0.097 + 0.006;

    this.flameMaterial = new MeshStandardMaterial({
      color: '#000000',
      emissive: '#ffb347',
      emissiveIntensity: 7,
      transparent: true,
      opacity: 0.95,
    });
    this.flame = new Mesh(new SphereGeometry(1, 16, 12), this.flameMaterial);
    this.flame.geometry.translate(0, 1, 0);
    this.flame.scale.set(0.0075, 0.016, 0.0075);
    this.flame.position.y = 0.106;

    this.light = new PointLight('#ff9a3c', 0, 2.2, 2);
    this.light.position.y = 0.14;

    this.group.add(saucer, wax, wick, this.flame, this.light);
  }

  update(dt: number, time: number): void {
    this.group.visible = config.look.candle;
    if (!this.group.visible) return;
    // irregular flicker: smoothed noise + a fast shimmer
    this.flicker = MathUtils.damp(
      this.flicker,
      0.75 + Math.random() * 0.5,
      12,
      dt,
    );
    this.sway = MathUtils.damp(this.sway, (Math.random() - 0.5) * 0.5, 4, dt);
    const shimmer = 1 + Math.sin(time * 31) * 0.04;
    const k = this.flicker * shimmer;
    this.flame.scale.set(0.0075 * (2 - k) * 0.6 + 0.003, 0.016 * k, 0.0075);
    this.flame.rotation.z = this.sway * 0.25;
    this.flameMaterial.emissiveIntensity = 6 * k;
    this.light.intensity = 0.55 * k;
  }
}
