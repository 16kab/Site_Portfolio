import {
  BoxGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
  Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { spines } from './decorTextures';
import { layout } from './layout';
import { paint, palette } from './materials';
import { TaperedTube } from './TaperedTube';

const BOOKS = ['#6b2a22', '#2d3e4a', '#7a6234', '#3c4a2a', '#5a2a40'];

/**
 * The mess that tells who lives here (No Rest for the Wicked's dense,
 * storytelling surfaces): books and a TV guide on the coffee table, VHS
 * tapes by the VCR, a pizza box, the TV cable, slippers. Positions keep
 * the cat's paths and resting spots free (see CatBrain).
 */
export class Clutter {
  readonly group = new Group();

  constructor() {
    this.group.add(
      this.bookStack(new Vector3(0.43, 0.445, -0.19), 3, 0.25),
      this.tvGuide(),
      this.tapes(),
      this.pizzaBox(),
      this.cable(),
      this.slippers(),
    );
    this.group.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }

  private bookStack(at: Vector3, count: number, turn: number): Group {
    const group = new Group();
    let y = 0;
    for (let i = 0; i < count; i++) {
      const w = 0.15 + Math.random() * 0.05;
      const d = 0.21 + Math.random() * 0.05;
      const h = 0.025 + Math.random() * 0.02;
      const cover = paint(BOOKS[(i * 2 + 1) % BOOKS.length], {
        roughness: 0.75,
      });
      const pages = paint('#d8cba8', { roughness: 1, impasto: 0.05 });
      // covers on top/bottom/spine, pages on the three other sides
      const book = new Mesh(new BoxGeometry(w, h, d), [
        pages,
        cover,
        cover,
        cover,
        pages,
        pages,
      ]);
      book.position.set((Math.random() - 0.5) * 0.02, y + h / 2, 0);
      book.rotation.y = (Math.random() - 0.5) * 0.4;
      group.add(book);
      y += h;
    }
    group.position.copy(at);
    group.rotation.y = turn;
    return group;
  }

  /** A crumpled TV guide, open, lying askew. */
  private tvGuide(): Group {
    const group = new Group();
    const paper = paint('#cfc2a2', { roughness: 1, impasto: 0.2 });
    const geometry = new PlaneGeometry(0.2, 0.26, 6, 6);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      // a soft fold in the middle, curled corners
      position.setZ(i, Math.abs(x) * 0.06 + (x * y > 0.01 ? 0.008 : 0));
    }
    geometry.computeVertexNormals();
    const magazine = new Mesh(geometry, paper);
    magazine.rotation.set(-Math.PI / 2, 0, -0.5);
    const cover = new Mesh(
      new PlaneGeometry(0.09, 0.12),
      paint('#a3342a', { roughness: 0.6 }),
    );
    cover.rotation.set(-Math.PI / 2, 0, -0.5);
    cover.position.set(0.04, 0.012, -0.03);
    group.add(magazine, cover);
    group.position.set(-0.3, 0.448, -0.17);
    return group;
  }

  /** Stack of VHS tapes next to the VCR, labels hand-written. */
  private tapes(): Group {
    const group = new Group();
    const body = paint('#151314', { roughness: 0.45 });
    const labels = spines(['#d8cba8', '#e0d6b8', '#cfc0a0', '#e6dcc2'], 4);
    for (let i = 0; i < 5; i++) {
      const label = new MeshStandardMaterial({ map: labels, roughness: 0.8 });
      const tape = new Mesh(new BoxGeometry(0.19, 0.025, 0.105), [
        label,
        body,
        body,
        body,
        label,
        body,
      ]);
      tape.position.set((Math.random() - 0.5) * 0.015, 0.0125 + i * 0.026, 0);
      tape.rotation.y = (Math.random() - 0.5) * 0.12;
      group.add(tape);
    }
    const stand = layout.tvStand;
    group.position.set(stand.x - 0.64, layout.tvStandSize.y, stand.z + 0.06);
    group.rotation.y = 0.15;
    return group;
  }

  /** An open pizza box left on the floor by the sofa. */
  private pizzaBox(): Group {
    const group = new Group();
    const card = paint('#b08a5a', { roughness: 1, impasto: 0.3 });
    const base = new Mesh(new BoxGeometry(0.33, 0.035, 0.33), card);
    base.position.y = 0.0175;
    const lid = new Mesh(new BoxGeometry(0.33, 0.006, 0.33), card);
    lid.geometry.translate(0, 0, -0.165);
    lid.position.set(0, 0.035, -0.165);
    lid.rotation.x = -1.9;
    const grease = new Mesh(
      new CylinderGeometry(0.13, 0.13, 0.002, 20),
      paint('#6e4320', { roughness: 0.5 }),
    );
    grease.position.y = 0.036;
    const slice = new Mesh(
      new CylinderGeometry(0.11, 0.11, 0.012, 20, 1, false, 0, 1.2),
      paint('#c9862e', { roughness: 0.7, impasto: 0.4 }),
    );
    slice.position.set(0.02, 0.042, 0.02);
    group.add(base, lid, grease, slice);
    group.position.set(0.58, 0, 0.52);
    group.rotation.y = 0.3;
    return group;
  }

  /** The TV's power cable, down behind the stand and along to the socket. */
  private cable(): Group {
    const group = new Group();
    const { minZ } = layout.room;
    const stand = layout.tvStand;
    const tube = new TaperedTube(24, 6, 2);
    tube.update(
      new CatmullRomCurve3([
        new Vector3(0.25, 0.62, stand.z - 0.25),
        new Vector3(0.45, 0.25, minZ + 0.06),
        new Vector3(0.72, 0.008, minZ + 0.1),
        new Vector3(0.95, 0.008, minZ + 0.06),
        new Vector3(1.05, 0.2, minZ + 0.012),
      ]),
      () => 0.0045,
    );
    group.add(
      new Mesh(tube.geometry, paint('#141114', { roughness: 0.5, impasto: 0 })),
    );
    const socket = new Mesh(
      new RoundedBoxGeometry(0.08, 0.08, 0.02, 2, 0.008),
      paint('#cfc6b0', { roughness: 0.5 }),
    );
    socket.position.set(1.05, 0.22, minZ + 0.01);
    group.add(socket);
    return group;
  }

  /** Worn slippers kicked off in front of the sofa. */
  private slippers(): Group {
    const group = new Group();
    const felt = paint(palette.sweater, { roughness: 1, impasto: 0.5 });
    const sole = new MeshStandardMaterial({ color: '#1a1412', roughness: 0.9 });
    const shape = new SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    for (const [x, z, turn] of [
      [-0.12, 0.62, 0.4],
      [0.12, 0.7, -0.9],
    ] as const) {
      const slipper = new Group();
      const top = new Mesh(shape, felt);
      top.scale.set(0.05, 0.045, 0.13);
      const bottom = new Mesh(new CylinderGeometry(1, 1, 1, 16), sole);
      bottom.scale.set(0.05, 0.012, 0.13);
      bottom.position.y = -0.004;
      slipper.add(top, bottom);
      slipper.position.set(layout.eye.x + x, 0.012, z);
      slipper.rotation.y = turn;
      group.add(slipper);
    }
    return group;
  }
}
