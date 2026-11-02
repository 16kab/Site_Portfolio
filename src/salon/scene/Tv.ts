import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Shape,
  type ShaderMaterial,
  SphereGeometry,
  Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { layout } from './layout';
import { paint, palette } from './materials';

const CABINET = { w: 0.94, h: 0.7, d: 0.6 };
const SCREEN = { w: 0.6, h: 0.45, x: -0.1, y: 0.03, bulge: 0.04 };

function roundedRect(w: number, h: number, r: number): Shape {
  const shape = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/**
 * Chunky wooden CRT: bulged screen (driven by the CRT material), control
 * panel with two knobs and a speaker grille, rabbit-ear antenna on top.
 */
export class Tv {
  readonly group = new Group();
  readonly screen: Mesh;
  /** Screen centre in world space (light source / camera focus). */
  readonly screenCenter = new Vector3();
  private led: MeshStandardMaterial;

  constructor(screenMaterial: ShaderMaterial) {
    const front = CABINET.d / 2;

    const cabinet = new Mesh(
      new RoundedBoxGeometry(CABINET.w, CABINET.h, CABINET.d, 4, 0.07),
      paint(palette.wood, { wood: true, roughness: 0.5 }),
    );
    cabinet.position.y = CABINET.h / 2;
    cabinet.castShadow = true;
    this.group.add(cabinet);

    // dark plastic bezel around the tube
    const bezelShape = roundedRect(SCREEN.w + 0.07, SCREEN.h + 0.07, 0.06);
    bezelShape.holes.push(roundedRect(SCREEN.w - 0.02, SCREEN.h - 0.02, 0.05));
    const bezel = new Mesh(
      new ExtrudeGeometry(bezelShape, {
        depth: 0.03,
        bevelEnabled: true,
        bevelSize: 0.008,
        bevelThickness: 0.008,
        bevelSegments: 2,
      }),
      paint(palette.plastic, { roughness: 0.45 }),
    );
    bezel.position.set(SCREEN.x, CABINET.h / 2 + SCREEN.y, front - 0.012);
    this.group.add(bezel);

    // bulged glass: a subdivided plane pushed forward in its centre
    const geometry = new PlaneGeometry(SCREEN.w, SCREEN.h, 32, 24);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const nx = (position.getX(i) / SCREEN.w) * 2;
      const ny = (position.getY(i) / SCREEN.h) * 2;
      position.setZ(i, SCREEN.bulge * (1 - nx * nx * 0.5 - ny * ny * 0.5));
    }
    geometry.computeVertexNormals();
    this.screen = new Mesh(geometry, screenMaterial);
    this.screen.position.set(SCREEN.x, CABINET.h / 2 + SCREEN.y, front);
    this.group.add(this.screen);

    this.group.add(this.controlPanel(front));
    this.group.add(this.antenna());

    for (const x of [-1, 1]) {
      const foot = new Mesh(
        new BoxGeometry(0.12, 0.025, CABINET.d * 0.8),
        paint(palette.plastic),
      );
      foot.position.set(x * (CABINET.w / 2 - 0.12), -0.012, 0);
      this.group.add(foot);
    }

    this.led = new MeshStandardMaterial({
      color: 0x220000,
      emissive: '#ff2a1a',
      emissiveIntensity: 3,
    });
    const led = new Mesh(new SphereGeometry(0.006, 8, 6), this.led);
    led.position.set(0.33, 0.1, front + 0.005);
    this.group.add(led);

    this.group.position.copy(layout.tv);
    this.group.position.y += 0.012;
    this.group.updateMatrixWorld(true);
    this.screen.getWorldPosition(this.screenCenter);
    this.screenCenter.z += SCREEN.bulge;
  }

  setPowered(on: boolean): void {
    this.led.emissiveIntensity = on ? 3 : 0.15;
  }

  private controlPanel(front: number): Group {
    const group = new Group();
    const panelX = SCREEN.x + SCREEN.w / 2 + 0.135;
    const knobMaterial = paint('#2a2224', { roughness: 0.35 });
    const ring = paint(palette.brass, { roughness: 0.35, metalness: 0.6 });
    for (const [i, y] of [0.2, 0.06].entries()) {
      const knob = new Mesh(
        new CylinderGeometry(0.042 - i * 0.008, 0.046 - i * 0.008, 0.04, 20),
        knobMaterial,
      );
      knob.rotation.x = Math.PI / 2;
      knob.position.set(panelX, CABINET.h / 2 + y, front + 0.02);
      const notch = new Mesh(new BoxGeometry(0.006, 0.03, 0.006), ring);
      notch.position.set(panelX, CABINET.h / 2 + y + 0.015, front + 0.042);
      notch.rotation.z = i ? -0.6 : 0.9;
      group.add(knob, notch);
    }
    // speaker grille: horizontal slits on a dark panel
    const grille = new Mesh(
      new BoxGeometry(0.15, 0.2, 0.01),
      paint('#1a1214', { roughness: 0.9 }),
    );
    grille.position.set(panelX, CABINET.h / 2 - 0.16, front + 0.002);
    group.add(grille);
    const slat = new BoxGeometry(0.15, 0.008, 0.012);
    const slatMaterial = paint(palette.woodDark, { wood: true });
    for (let i = 0; i < 8; i++) {
      const mesh = new Mesh(slat, slatMaterial);
      mesh.position.set(
        panelX,
        CABINET.h / 2 - 0.075 - i * 0.024,
        front + 0.006,
      );
      group.add(mesh);
    }
    const plate = new Mesh(new BoxGeometry(0.1, 0.018, 0.004), ring);
    plate.position.set(panelX, CABINET.h / 2 - 0.29, front + 0.004);
    group.add(plate);
    return group;
  }

  private antenna(): Group {
    const group = new Group();
    const metal = paint('#9a9aa4', { roughness: 0.3, metalness: 0.8 });
    const base = new Mesh(
      new SphereGeometry(0.06, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      paint(palette.plastic, { roughness: 0.4 }),
    );
    group.add(base);
    for (const side of [-1, 1]) {
      const rod = new Mesh(new CylinderGeometry(0.004, 0.005, 0.62, 6), metal);
      rod.geometry.translate(0, 0.31, 0);
      rod.rotation.set(-0.25, 0, side * 0.5);
      rod.castShadow = true;
      const tip = new Mesh(new SphereGeometry(0.009, 8, 6), metal);
      tip.position.set(0, 0.62, 0);
      rod.add(tip);
      group.add(rod);
    }
    group.position.set(0.05, CABINET.h, -0.08);
    return group;
  }
}
