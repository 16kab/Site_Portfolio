import gsap from 'gsap';
import {
  CylinderGeometry,
  Group,
  Mesh,
  type Material,
  type Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { paint, palette } from './materials';

export type ButtonId =
  | 'power'
  | 'mute'
  | 'chUp'
  | 'chDown'
  | 'volUp'
  | 'volDown'
  | 'ok'
  | `digit${number}`;

/** Remote body: length along -Z (tip toward the TV), buttons on +Y. */
const BODY = { w: 0.054, h: 0.024, l: 0.2 };
const TRAVEL = 0.0035;

type ButtonSpec = {
  id: ButtonId;
  x: number;
  z: number;
  w: number;
  l: number;
  material: Material;
};

export class Remote {
  readonly group = new Group();
  private readonly buttons = new Map<ButtonId, Mesh>();
  private readonly restY = new Map<ButtonId, number>();

  constructor() {
    const body = new Mesh(
      new RoundedBoxGeometry(BODY.w, BODY.h, BODY.l, 3, 0.011),
      paint('#262126', { roughness: 0.5 }),
    );
    body.castShadow = true;
    this.group.add(body);

    // tapered nose, like the 90s remotes
    const nose = new Mesh(
      new RoundedBoxGeometry(BODY.w * 0.9, BODY.h * 0.8, 0.03, 2, 0.009),
      paint(palette.plastic, { roughness: 0.3 }),
    );
    nose.position.set(0, -0.002, -BODY.l / 2 - 0.006);
    this.group.add(nose);

    const rubber = paint('#4a4448', { roughness: 0.7 });
    const red = paint('#c0281e', { roughness: 0.5 });
    const grey = paint('#77707a', { roughness: 0.6 });
    const specs: ButtonSpec[] = [
      { id: 'power', x: 0.015, z: -0.082, w: 0.013, l: 0.013, material: red },
      { id: 'mute', x: -0.015, z: -0.082, w: 0.012, l: 0.01, material: grey },
    ];
    for (let i = 1; i <= 9; i++) {
      specs.push({
        id: `digit${i}`,
        x: ((i - 1) % 3) * 0.015 - 0.015,
        z: -0.062 + Math.floor((i - 1) / 3) * 0.0135,
        w: 0.011,
        l: 0.009,
        material: rubber,
      });
    }
    specs.push(
      { id: 'digit0', x: 0, z: -0.0215, w: 0.011, l: 0.009, material: rubber },
      { id: 'chUp', x: 0.014, z: 0.0, w: 0.014, l: 0.016, material: grey },
      { id: 'chDown', x: 0.014, z: 0.021, w: 0.014, l: 0.016, material: grey },
      { id: 'volUp', x: -0.014, z: 0.0, w: 0.014, l: 0.016, material: grey },
      {
        id: 'volDown',
        x: -0.014,
        z: 0.021,
        w: 0.014,
        l: 0.016,
        material: grey,
      },
      { id: 'ok', x: 0, z: 0.0105, w: 0.01, l: 0.01, material: red },
    );

    const top = BODY.h / 2;
    for (const spec of specs) {
      const geometry =
        spec.id === 'power' || spec.id === 'ok'
          ? new CylinderGeometry(spec.w / 2, spec.w / 2, 0.006, 14)
          : new RoundedBoxGeometry(spec.w, 0.006, spec.l, 2, 0.0025);
      const mesh = new Mesh(geometry, spec.material);
      mesh.position.set(spec.x, top + 0.0015, spec.z);
      this.group.add(mesh);
      this.buttons.set(spec.id, mesh);
      this.restY.set(spec.id, mesh.position.y);
    }
  }

  /** Top of a button, in the remote's local space. */
  buttonTop(id: ButtonId, out: Vector3): Vector3 {
    const mesh = this.buttons.get(id);
    if (!mesh) return out.set(0, BODY.h / 2, 0);
    return out.set(mesh.position.x, BODY.h / 2 + 0.006, mesh.position.z);
  }

  /** Physically pushes the button down then releases it. */
  depress(id: ButtonId, hold = 0.06): void {
    const mesh = this.buttons.get(id);
    const rest = this.restY.get(id);
    if (!mesh || rest === undefined) return;
    gsap.killTweensOf(mesh.position);
    gsap
      .timeline()
      .to(mesh.position, {
        y: rest - TRAVEL,
        duration: 0.03,
        ease: 'power2.in',
      })
      .to(mesh.position, {
        y: rest,
        duration: 0.08,
        delay: hold,
        ease: 'power2.out',
      });
  }
}
