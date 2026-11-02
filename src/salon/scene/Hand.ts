import gsap from 'gsap';
import {
  CatmullRomCurve3,
  CylinderGeometry,
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three';
import { config } from '../config';
import { knit } from './decorTextures';
import { HandModel } from './HandModel';
import { paint, palette } from './materials';
import { type ButtonId, Remote } from './Remote';
import { TaperedTube } from './TaperedTube';

/** Thumb bones (metres) and radii at base / tip. */
const THUMB = { l1: 0.046, l2: 0.04, base: 0.0128, tip: 0.0096 };
/**
 * The hand holds the remote around its middle (grip space is shifted toward
 * the tip), so the thumb alone reaches every button, from POWER to CH−,
 * while the palm never moves — like a real hand.
 */
const GRIP_Z = -0.058;
/** Where the thumb leaves the thenar mound, and a point buried inside it. */
const ROOT = new Vector3(0.03, 0.006, 0.048);
const ROOT_INSIDE = new Vector3(0.04, -0.012, 0.065);
/** Resting along the remote, over the lower digits (grip space). */
const REST = new Vector3(0.004, 0.0235, 0.012);
/** Bend direction hint for the thumb joint (outward and a bit up). */
const POLE = new Vector3(1, 0.5, 0.2).normalize();
const Z = new Vector3(0, 0, 1);
const Y = new Vector3(0, 1, 0);
const sphere = new SphereGeometry(1, 16, 10);

/** Smooth bump centred on `at`, for knuckles. */
function bump(t: number, at: number, width = 0.09): number {
  const d = (t - at) / width;
  return Math.exp(-d * d);
}

/**
 * Right hand holding the remote. Every part is one smooth volume (tapered
 * tubes with rounded ends, ellipsoids) whose base is buried inside the palm,
 * so the joins stay clean. The thumb is a two-bone chain solved with an
 * analytic IK every frame; its tip is animated by GSAP. The palm and the
 * fingers never move: only the thumb stretches or folds to reach a button.
 */
export class Hand {
  readonly group = new Group();
  readonly remote = new Remote();
  readonly model = new HandModel();
  /** Everything made of flesh and wool, placed around the remote's middle. */
  private readonly grip = new Group();
  private readonly thumb = new TaperedTube(18, 14, 5);
  private readonly thumbCurve = new CatmullRomCurve3(
    [ROOT_INSIDE.clone(), ROOT.clone(), new Vector3(), new Vector3()],
    false,
    'centripetal',
  );
  private readonly tip = REST.clone();
  private timeline: gsap.core.Timeline | null = null;
  /** Materials of the code hand, hidden once the downloaded hand is in. */
  private readonly flesh: MeshStandardMaterial[];
  private readonly tipWorld = new Vector3();

  // scratch vectors, reused every frame
  private readonly dir = new Vector3();
  private readonly bend = new Vector3();
  private readonly target = new Vector3();
  private readonly thumbNail: Mesh;
  private readonly nailBasis = new Matrix4();
  private readonly nailSide = new Vector3();
  private readonly nailNormal = new Vector3();
  private readonly nailTangent = new Vector3();

  constructor() {
    const skin = paint(palette.skin, { roughness: 0.6, impasto: 0.12 });
    const sweater = paint(palette.sweater, { roughness: 1, impasto: 0.45 });
    // ribbed knit along the sleeve
    const ribs = knit().clone();
    ribs.repeat.set(10, 3);
    sweater.map = ribs;
    sweater.color.set(palette.sweater);
    const nail = paint('#e3bfae', { roughness: 0.3, impasto: 0 });
    const knuckle = paint('#c27560', { roughness: 0.6, impasto: 0.1 });
    this.grip.position.z = GRIP_Z;
    this.group.add(this.remote.group, this.grip);
    this.grip.add(this.model.root);
    this.flesh = [skin, nail, knuckle];

    // palm cradling the base of the remote (mostly hidden under it)
    const palm = this.ellipsoid(
      skin,
      [0.012, -0.026, 0.03],
      [0.042, 0.024, 0.07],
    );
    palm.rotation.z = 0.2;
    // thenar mound: bridges the palm and the base of the thumb
    this.ellipsoid(skin, [0.034, -0.008, 0.055], [0.02, 0.022, 0.03]);

    // four fingers wrapping the left side, tips resting on the top edge
    const fingers: [number, number][] = [
      [-0.028, 0.0102],
      [-0.006, 0.0106],
      [0.016, 0.0099],
      [0.036, 0.0086],
    ];
    for (const [z, r] of fingers) {
      const curve = new CatmullRomCurve3(
        [
          new Vector3(0.004, -0.03, z + 0.012),
          new Vector3(-0.02, -0.027, z + 0.006),
          new Vector3(-0.035, -0.011, z + 0.002),
          new Vector3(-0.035, 0.008, z),
          new Vector3(-0.028, 0.017, z - 0.002),
        ],
        false,
        'centripetal',
      );
      this.tube(curve, skin, (t) => {
        const knuckles = 0.09 * (bump(t, 0.42) + bump(t, 0.7));
        return r * (1.06 - 0.2 * t + knuckles);
      });
      // the nail on the back of the fingertip, a reddened knuckle
      const end = curve.getPoint(1);
      const tangent = curve.getTangent(1);
      const outward = new Vector3(end.x, end.y, 0).normalize();
      this.attachNail(new Mesh(sphere, nail), end, tangent, outward, r * 0.86);
      const k = curve.getPoint(0.42);
      const out = new Vector3(k.x, k.y, 0).normalize();
      const pad = new Mesh(sphere, knuckle);
      pad.position.copy(k).addScaledVector(out, r * 0.55);
      pad.scale.setScalar(r * 0.62);
      this.grip.add(pad);
    }

    this.thumbMesh(skin);
    this.thumbNail = new Mesh(sphere, nail);
    this.grip.add(this.thumbNail);

    // forearm leaving the frame bottom-right, then the sweater sleeve
    const forearm = new CatmullRomCurve3([
      new Vector3(0.02, -0.03, 0.075),
      new Vector3(0.05, -0.095, 0.26),
      new Vector3(0.09, -0.17, 0.5),
    ]);
    this.tube(forearm, skin, (t) => 0.024 + 0.012 * t);
    this.watch(forearm);
    const sleeve = new CatmullRomCurve3([
      new Vector3(0.044, -0.082, 0.215),
      new Vector3(0.065, -0.125, 0.36),
      new Vector3(0.11, -0.21, 0.62),
    ]);
    this.tube(sleeve, sweater, (t) => 0.045 + 0.011 * t);
    // rolled cuff hides where the sleeve ends on the wrist
    const cuff = new Mesh(new TorusGeometry(0.046, 0.0095, 10, 28), sweater);
    cuff.position.copy(sleeve.getPoint(0));
    cuff.quaternion.setFromUnitVectors(Z, sleeve.getTangent(0));
    this.grip.add(cuff);

    this.solveThumb();
  }

  /**
   * Animates the thumb onto a button. `onPress` fires when the button
   * bottoms out: that is when the TV reacts and the click sounds.
   * A new press interrupts the current one smoothly.
   */
  press(id: ButtonId, onPress: () => void, nervous = 0): void {
    this.timeline?.kill();
    const speed = 1 + nervous;
    // button position in grip space
    const button = this.remote.buttonTop(id, this.target);
    button.z -= GRIP_Z;
    const contactY = button.y + THUMB.tip * 0.8;
    const hover = contactY + 0.012;
    const t = this.tip;

    this.timeline = gsap
      .timeline()
      .to(
        t,
        {
          x: button.x,
          y: hover,
          z: button.z,
          duration: 0.08 / speed,
          ease: 'power2.out',
        },
        0,
      )
      .to(t, {
        y: contactY,
        duration: 0.04 / speed,
        ease: 'power2.in',
        onStart: () => this.remote.depress(id),
        onComplete: onPress,
      })
      .to(t, { y: hover, duration: 0.07 / speed, ease: 'power1.out' }, '+=0.04')
      .to(
        t,
        {
          x: REST.x,
          y: REST.y,
          z: REST.z,
          duration: 0.24,
          ease: 'power2.inOut',
        },
        '+=0.12',
      );
  }

  /**
   * Swaps the code hand for the downloaded one when it loads (the sleeve,
   * cuff and watch stay). Resolves false and keeps the code hand otherwise.
   */
  async loadModel(): Promise<boolean> {
    const settings = config.handModel;
    if (!settings.enabled || !(await this.model.load(settings.url))) {
      return false;
    }
    for (const child of this.grip.children) {
      if (child instanceof Mesh && this.flesh.includes(child.material)) {
        child.visible = false;
      }
    }
    return true;
  }

  update(): void {
    if (this.model.loaded) {
      this.model.reach(this.grip.localToWorld(this.tipWorld.copy(this.tip)));
      return;
    }
    this.solveThumb();
  }

  private ellipsoid(
    material: MeshStandardMaterial,
    position: [number, number, number],
    scale: [number, number, number],
  ): Mesh {
    const mesh = new Mesh(new SphereGeometry(1, 24, 16), material);
    mesh.position.fromArray(position);
    mesh.scale.fromArray(scale);
    mesh.castShadow = true;
    this.grip.add(mesh);
    return mesh;
  }

  private tube(
    curve: CatmullRomCurve3,
    material: MeshStandardMaterial,
    radius: (t: number) => number,
  ): Mesh {
    const tube = new TaperedTube(16, 12, 4);
    tube.update(curve, radius);
    const mesh = new Mesh(tube.geometry, material);
    mesh.castShadow = true;
    this.grip.add(mesh);
    return mesh;
  }

  private thumbMesh(material: MeshStandardMaterial): void {
    const mesh = new Mesh(this.thumb.geometry, material);
    mesh.castShadow = true;
    // the geometry is rewritten every frame: keep its bounds conservative
    mesh.frustumCulled = false;
    this.grip.add(mesh);
  }

  private thumbRadius = (t: number): number =>
    THUMB.base + (THUMB.tip - THUMB.base) * t + 0.0011 * bump(t, 0.55, 0.12);

  /** Two-bone IK from ROOT to the animated tip, then rebuild the tube. */
  private solveThumb(): void {
    const { l1, l2 } = THUMB;
    const [, , joint, end] = this.thumbCurve.points;
    this.dir.subVectors(this.tip, ROOT);
    const distance = Math.min(
      Math.max(this.dir.length(), Math.abs(l1 - l2) + 1e-4),
      l1 + l2 - 1e-4,
    );
    this.dir.normalize();
    const a = (l1 * l1 - l2 * l2 + distance * distance) / (2 * distance);
    const h = Math.sqrt(Math.max(l1 * l1 - a * a, 0));
    this.bend
      .copy(POLE)
      .addScaledVector(this.dir, -POLE.dot(this.dir))
      .normalize();
    joint.copy(ROOT).addScaledVector(this.dir, a).addScaledVector(this.bend, h);
    end.copy(ROOT).addScaledVector(this.dir, distance);
    this.thumb.update(this.thumbCurve, this.thumbRadius);
    // the thumbnail rides on top of the tip
    this.thumbCurve.getTangent(1, this.nailTangent);
    this.nailNormal
      .copy(Y)
      .addScaledVector(this.nailTangent, -Y.dot(this.nailTangent))
      .normalize();
    this.attachNail(
      this.thumbNail,
      end,
      this.nailTangent,
      this.nailNormal,
      THUMB.tip,
    );
  }

  /**
   * Places a nail on a fingertip: thin along `normal` (the back of the
   * finger), long along `tangent`, set back a little from the tip.
   */
  private attachNail(
    mesh: Mesh,
    tip: Vector3,
    tangent: Vector3,
    normal: Vector3,
    radius: number,
  ): void {
    this.nailNormal
      .copy(normal)
      .addScaledVector(tangent, -normal.dot(tangent))
      .normalize();
    this.nailSide.crossVectors(this.nailNormal, tangent).normalize();
    this.nailBasis.makeBasis(this.nailSide, this.nailNormal, tangent);
    mesh.quaternion.setFromRotationMatrix(this.nailBasis);
    mesh.scale.set(radius * 0.72, radius * 0.22, radius * 0.95);
    mesh.position
      .copy(tip)
      .addScaledVector(this.nailNormal, radius * 0.82)
      .addScaledVector(tangent, -radius * 0.25);
    if (!mesh.parent) this.grip.add(mesh);
  }

  /** An old watch with a leather strap, just below the cuff. */
  private watch(forearm: CatmullRomCurve3): void {
    const t = 0.22;
    const at = forearm.getPoint(t);
    const along = forearm.getTangent(t);
    const radius = 0.024 + 0.012 * t;
    const leather = paint('#3a2216', { roughness: 0.7, impasto: 0.2 });
    const strap = new Mesh(
      new TorusGeometry(radius + 0.002, 0.0042, 8, 28),
      leather,
    );
    strap.position.copy(at);
    strap.quaternion.setFromUnitVectors(Z, along);
    strap.scale.set(1, 1, 2.2);
    // the face sits on the back of the wrist (up and outward)
    const back = new Vector3(0.6, 1, 0)
      .addScaledVector(along, -new Vector3(0.6, 1, 0).dot(along))
      .normalize();
    const face = new Mesh(
      new CylinderGeometry(0.014, 0.014, 0.006, 20),
      paint('#b9b19c', { roughness: 0.25, metalness: 0.85, impasto: 0 }),
    );
    face.quaternion.setFromUnitVectors(Y, back);
    face.position.copy(at).addScaledVector(back, radius + 0.004);
    const glass = new Mesh(
      new CylinderGeometry(0.011, 0.011, 0.002, 20),
      new MeshStandardMaterial({
        color: '#2a2a24',
        roughness: 0.05,
        metalness: 0.2,
      }),
    );
    glass.quaternion.copy(face.quaternion);
    glass.position.copy(at).addScaledVector(back, radius + 0.0075);
    for (const mesh of [strap, face, glass]) {
      mesh.castShadow = true;
      this.grip.add(mesh);
    }
  }
}
