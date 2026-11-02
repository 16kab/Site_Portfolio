import gsap from 'gsap';
import {
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  type Material,
  Mesh,
  MeshStandardMaterial,
  Shape,
  ShapeGeometry,
  Vector2,
  type Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { wornPlastic } from './decorTextures';
import { paint } from './materials';

export type ButtonId =
  | 'power'
  | 'mute'
  | 'chUp'
  | 'chDown'
  | 'volUp'
  | 'volDown'
  | 'ok'
  | `digit${number}`;

/** Remote body: length along Z (tip toward the TV at -Z), buttons on +Y. */
const BODY = { tipW: 0.046, baseW: 0.054, l: 0.2, h: 0.024, bevel: 0.0045 };
const TOP = BODY.h / 2;
const BUTTON_H = 0.0045;
const TRAVEL = 0.003;

/** Polygon with rounded corners (quadratic fillets). */
function roundedPolygon(points: Vector2[], radius: number): Shape {
  const shape = new Shape();
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const prev = points[(i + n - 1) % n];
    const corner = points[i];
    const next = points[(i + 1) % n];
    const a = corner.clone().add(prev.clone().sub(corner).setLength(radius));
    const b = corner.clone().add(next.clone().sub(corner).setLength(radius));
    if (i === 0) shape.moveTo(a.x, a.y);
    else shape.lineTo(a.x, a.y);
    shape.quadraticCurveTo(corner.x, corner.y, b.x, b.y);
  }
  shape.closePath();
  return shape;
}

/** Rubber dome: flat top, rounded shoulder. Unit radius, scaled per button. */
const dome = new LatheGeometry(
  [
    new Vector2(1, 0),
    new Vector2(1, BUTTON_H * 0.45),
    new Vector2(0.9, BUTTON_H * 0.82),
    new Vector2(0.62, BUTTON_H),
    new Vector2(0, BUTTON_H),
  ],
  20,
);

type ButtonSpec = {
  id: ButtonId;
  x: number;
  z: number;
  /** Half sizes along X and Z. */
  rx: number;
  rz: number;
  material: Material;
};

/**
 * 90s TV remote: extruded body with soft bevels, slightly wider at the
 * palm end, inset button panel, rubber domes, a CH/VOL cross around OK and
 * an infrared window that glows on every press.
 */
export class Remote {
  readonly group = new Group();
  private readonly buttons = new Map<ButtonId, Mesh>();
  private readonly restY = new Map<ButtonId, number>();
  private readonly infrared: MeshStandardMaterial;

  constructor() {
    const { tipW, baseW, l, h, bevel } = BODY;
    // outline seen from above (x, z); the bevel grows it back to size
    const outline = roundedPolygon(
      [
        new Vector2(-tipW / 2 + bevel, -l / 2 + bevel),
        new Vector2(tipW / 2 - bevel, -l / 2 + bevel),
        new Vector2(baseW / 2 - bevel, l / 2 - bevel),
        new Vector2(-baseW / 2 + bevel, l / 2 - bevel),
      ],
      0.011,
    );
    const depth = h - bevel * 2;
    const geometry = new ExtrudeGeometry(outline, {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 5,
      curveSegments: 10,
    });
    // shape plane → horizontal, extrusion → downward, then centred
    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, depth / 2, 0);
    const body = new Mesh(
      geometry,
      // years in the hand: scratches, rubbed edges (extrude UVs are in metres)
      (() => {
        const material = paint('#2a2522', { roughness: 0.45, impasto: 0.08 });
        const map = wornPlastic().clone();
        map.repeat.set(9, 9);
        material.map = map;
        material.color.set('#2a2522');
        return material;
      })(),
    );
    body.castShadow = true;
    this.group.add(body);

    // masking tape wrapped round the base: it holds the battery cover
    const tape = new Mesh(
      new RoundedBoxGeometry(
        BODY.baseW + 0.004,
        BODY.h + 0.003,
        0.02,
        2,
        0.003,
      ),
      paint('#c7b27c', { roughness: 0.9, impasto: 0.3 }),
    );
    tape.position.set(0, 0, 0.086);
    tape.rotation.y = 0.06;
    this.group.add(tape);

    // slightly lighter inset panel behind the buttons
    const panel = new Mesh(
      new ShapeGeometry(
        roundedPolygon(
          [
            new Vector2(-0.0215, 0.088),
            new Vector2(0.0215, 0.088),
            new Vector2(0.023, -0.042),
            new Vector2(-0.023, -0.042),
          ],
          0.008,
        ),
        6,
      ),
      paint('#3a3431', { roughness: 0.7, impasto: 0.05 }),
    );
    panel.rotation.x = -Math.PI / 2;
    panel.position.y = TOP + 0.0002;
    this.group.add(panel);

    // silver strip near the palm end
    const strip = new Mesh(
      new RoundedBoxGeometry(0.044, 0.0012, 0.012, 1, 0.0005),
      paint('#8f8a84', { roughness: 0.3, metalness: 0.7, impasto: 0 }),
    );
    strip.position.set(0, TOP + 0.0004, 0.068);
    this.group.add(strip);

    this.infrared = new MeshStandardMaterial({
      color: '#3a0808',
      roughness: 0.15,
      emissive: '#ff2a14',
      emissiveIntensity: 0,
    });
    const window = new Mesh(
      new RoundedBoxGeometry(0.02, 0.009, 0.006, 2, 0.002),
      this.infrared,
    );
    window.position.set(0, 0.001, -l / 2 - 0.0005);
    this.group.add(window);

    // rubber yellowed with age
    const rubber = paint('#6c6352', { roughness: 0.75, impasto: 0.05 });
    const red = paint('#b3261b', { roughness: 0.5, impasto: 0.05 });
    const light = paint('#8a837b', { roughness: 0.6, impasto: 0.05 });
    const specs: ButtonSpec[] = [
      {
        id: 'power',
        x: 0.0135,
        z: -0.077,
        rx: 0.0062,
        rz: 0.0062,
        material: red,
      },
      {
        id: 'mute',
        x: -0.0135,
        z: -0.077,
        rx: 0.0048,
        rz: 0.0048,
        material: light,
      },
    ];
    for (let i = 1; i <= 9; i++) {
      specs.push({
        id: `digit${i}`,
        x: ((i - 1) % 3) * 0.0135 - 0.0135,
        z: -0.058 + Math.floor((i - 1) / 3) * 0.0125,
        rx: 0.0052,
        rz: 0.0042,
        material: rubber,
      });
    }
    specs.push(
      {
        id: 'digit0',
        x: 0,
        z: -0.0205,
        rx: 0.0052,
        rz: 0.0042,
        material: rubber,
      },
      // CH on the vertical axis, VOL on the horizontal one, OK in the middle
      { id: 'chUp', x: 0, z: 0.004, rx: 0.0062, rz: 0.0048, material: light },
      { id: 'chDown', x: 0, z: 0.03, rx: 0.0062, rz: 0.0048, material: light },
      {
        id: 'volDown',
        x: -0.0135,
        z: 0.017,
        rx: 0.0048,
        rz: 0.0062,
        material: light,
      },
      {
        id: 'volUp',
        x: 0.0135,
        z: 0.017,
        rx: 0.0048,
        rz: 0.0062,
        material: light,
      },
      { id: 'ok', x: 0, z: 0.017, rx: 0.0055, rz: 0.0055, material: red },
    );

    // dark ring under the cross pad
    const pad = new Mesh(
      new LatheGeometry(
        [
          new Vector2(0.0215, 0),
          new Vector2(0.021, 0.0008),
          new Vector2(0, 0.0008),
        ],
        32,
      ),
      paint('#151213', { roughness: 0.6, impasto: 0 }),
    );
    pad.position.set(0, TOP + 0.0002, 0.017);
    this.group.add(pad);

    for (const spec of specs) {
      const mesh = new Mesh(dome, spec.material);
      mesh.scale.set(spec.rx, 1, spec.rz);
      mesh.position.set(spec.x, TOP + 0.0005, spec.z);
      mesh.castShadow = true;
      this.group.add(mesh);
      this.buttons.set(spec.id, mesh);
      this.restY.set(spec.id, mesh.position.y);
    }
  }

  /** Top of a button, in the remote's local space. */
  buttonTop(id: ButtonId, out: Vector3): Vector3 {
    const mesh = this.buttons.get(id);
    if (!mesh) return out.set(0, TOP, 0);
    return out.set(mesh.position.x, TOP + 0.0005 + BUTTON_H, mesh.position.z);
  }

  /** Physically pushes the button down, then releases it; the IR blinks. */
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
    gsap.killTweensOf(this.infrared);
    gsap.fromTo(
      this.infrared,
      { emissiveIntensity: 3 },
      { emissiveIntensity: 0, duration: 0.25, ease: 'power2.out' },
    );
  }
}
