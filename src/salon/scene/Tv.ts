import {
  BoxGeometry,
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  type ShaderMaterial,
  Shape,
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
      paint(palette.wood, { wood: true, roughness: 0.5, edges: 'worn' }),
    );
    cabinet.position.y = CABINET.h / 2;
    cabinet.castShadow = true;
    this.group.add(cabinet, this.trim(front));

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

    // chunky round feet
    const footMaterial = paint(palette.woodDark, {
      wood: true,
      roughness: 0.5,
    });
    for (const x of [-1, 1]) {
      for (const z of [-1, 1]) {
        const foot = new Mesh(
          new CylinderGeometry(0.035, 0.026, 0.03, 16),
          footMaterial,
        );
        foot.position.set(
          x * (CABINET.w / 2 - 0.1),
          -0.012,
          z * (CABINET.d / 2 - 0.1),
        );
        this.group.add(foot);
      }
    }
    this.group.add(this.topDecor());

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
      // grip ridges around the knob and a chrome cap
      const radius = 0.044 - i * 0.008;
      const ridge = new BoxGeometry(0.006, 0.006, 0.036);
      for (let r = 0; r < 18; r++) {
        const angle = (r / 18) * Math.PI * 2;
        const mesh = new Mesh(ridge, knobMaterial);
        mesh.position.set(
          panelX + Math.cos(angle) * radius,
          CABINET.h / 2 + y + Math.sin(angle) * radius,
          front + 0.02,
        );
        mesh.rotation.z = angle;
        group.add(mesh);
      }
      const cap = new Mesh(
        new CylinderGeometry(radius * 0.45, radius * 0.5, 0.008, 18),
        paint('#b9b6ae', { roughness: 0.2, metalness: 0.9, impasto: 0.05 }),
      );
      cap.rotation.x = Math.PI / 2;
      cap.position.set(panelX, CABINET.h / 2 + y, front + 0.041);
      group.add(knob, notch, cap);
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

  /** Thick overhanging lid and a dark veneer frame around the tube. */
  private trim(front: number): Group {
    const group = new Group();
    const dark = paint('#3d2516', {
      wood: true,
      roughness: 0.45,
      edges: 'worn',
    });
    const lid = new Mesh(
      new RoundedBoxGeometry(CABINET.w + 0.04, 0.05, CABINET.d + 0.03, 3, 0.02),
      dark,
    );
    lid.position.y = CABINET.h - 0.012;
    lid.castShadow = true;
    const base = new Mesh(
      new RoundedBoxGeometry(
        CABINET.w + 0.02,
        0.035,
        CABINET.d + 0.015,
        3,
        0.012,
      ),
      dark,
    );
    base.position.y = 0.012;
    // the veneer band framing the screen and the control panel
    const band = roundedRect(CABINET.w - 0.04, CABINET.h - 0.09, 0.05);
    band.holes.push(roundedRect(CABINET.w - 0.09, CABINET.h - 0.15, 0.04));
    const frame = new Mesh(
      new ExtrudeGeometry(band, {
        depth: 0.012,
        bevelEnabled: true,
        bevelSize: 0.004,
        bevelThickness: 0.004,
        bevelSegments: 2,
      }),
      dark,
    );
    frame.position.set(0, CABINET.h / 2, front - 0.006);
    group.add(lid, base, frame);
    return group;
  }

  /**
   * Rabbit ears, one arm bent at an angle and crowned with a ball of
   * kitchen foil — the classic fix for bad reception.
   */
  private antenna(): Group {
    const group = new Group();
    const metal = paint('#9a9aa4', { roughness: 0.3, metalness: 0.8 });
    const base = new Mesh(
      new SphereGeometry(0.06, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      paint(palette.plastic, { roughness: 0.4 }),
    );
    group.add(base);
    const rod = (length: number) => {
      const mesh = new Mesh(
        new CylinderGeometry(0.004, 0.005, length, 6),
        metal,
      );
      mesh.geometry.translate(0, length / 2, 0);
      mesh.castShadow = true;
      return mesh;
    };
    // straight arm
    const right = rod(0.62);
    right.rotation.set(-0.25, 0, -0.5);
    const tip = new Mesh(new SphereGeometry(0.009, 8, 6), metal);
    tip.position.y = 0.62;
    right.add(tip);
    // bent arm: a lower part, then a kink
    const lower = rod(0.3);
    lower.rotation.set(-0.2, 0, 0.55);
    const upper = rod(0.3);
    upper.position.y = 0.3;
    upper.rotation.set(0.1, 0, -0.75);
    lower.add(upper);
    const foil = new IcosahedronGeometry(0.03, 2);
    const position = foil.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const k = 0.75 + Math.random() * 0.4;
      position.setXYZ(
        i,
        position.getX(i) * k,
        position.getY(i) * k,
        position.getZ(i) * k,
      );
    }
    foil.computeVertexNormals();
    const ball = new Mesh(
      foil,
      paint('#d6d6dc', { roughness: 0.25, metalness: 0.95, impasto: 0.6 }),
    );
    ball.position.y = 0.3;
    ball.castShadow = true;
    upper.add(ball);
    group.add(right, lower);
    group.position.set(0.05, CABINET.h + 0.012, -0.08);
    return group;
  }

  /** A crocheted doily on the lid and a small framed photo. */
  private topDecor(): Group {
    const group = new Group();
    const lace = new CircleGeometry(0.13, 48);
    const position = lace.attributes.position;
    for (let i = 1; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      const angle = Math.atan2(y, x);
      // scalloped edge
      const k = 1 + Math.sin(angle * 16) * 0.06;
      position.setXY(i, x * k, y * k);
    }
    const doily = new Mesh(
      lace,
      paint('#e2d8c2', { roughness: 1, impasto: 0.4, repeat: 4 }),
    );
    doily.material.side = DoubleSide;
    doily.rotation.x = -Math.PI / 2;
    doily.position.y = 0.0015;
    const frame = new Group();
    const border = new Mesh(
      new BoxGeometry(0.1, 0.13, 0.012),
      paint(palette.brass, { roughness: 0.35, metalness: 0.6 }),
    );
    const photo = new Mesh(
      new PlaneGeometry(0.078, 0.104),
      paint('#6d5a48', { roughness: 0.6, repeat: 0.5 }),
    );
    photo.position.z = 0.0065;
    const stand = new Mesh(new BoxGeometry(0.012, 0.1, 0.004), border.material);
    stand.position.set(0, -0.01, -0.03);
    stand.rotation.x = 0.45;
    frame.add(border, photo, stand);
    frame.position.set(0.02, 0.068, 0.02);
    frame.rotation.set(-0.12, 0.35, 0);
    frame.castShadow = true;
    group.add(doily, frame);
    group.position.set(-0.24, CABINET.h + 0.013, 0.06);
    return group;
  }
}
