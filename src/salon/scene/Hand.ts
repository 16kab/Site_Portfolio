import gsap from 'gsap';
import {
  CatmullRomCurve3,
  Group,
  Mesh,
  type MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three';
import { paint, palette } from './materials';
import { type ButtonId, Remote } from './Remote';
import { TaperedTube } from './TaperedTube';

/** Thumb bones (metres) and radii at base / tip. */
const THUMB = { l1: 0.042, l2: 0.036, base: 0.0128, tip: 0.0096 };
/** Where the thumb leaves the thenar mound, and a point buried inside it. */
const ROOT = new Vector3(0.03, 0.006, 0.048);
const ROOT_INSIDE = new Vector3(0.04, -0.012, 0.065);
/** Resting on the cross pad. */
const REST = new Vector3(0.002, 0.0235, 0.012);
/** Bend direction hint for the thumb joint (outward and a bit up). */
const POLE = new Vector3(1, 0.5, 0.2).normalize();
const Z = new Vector3(0, 0, 1);

/** Smooth bump centred on `at`, for knuckles. */
function bump(t: number, at: number, width = 0.09): number {
  const d = (t - at) / width;
  return Math.exp(-d * d);
}

/**
 * Right hand holding the remote. Every part is one smooth volume (tapered
 * tubes with rounded ends, ellipsoids) whose base is buried inside the palm,
 * so the joins stay clean. The thumb is a two-bone chain solved with an
 * analytic IK every frame; its tip is animated by GSAP. Far buttons make
 * the remote slide back in the palm, like a real thumb would.
 */
export class Hand {
  readonly group = new Group();
  readonly remote = new Remote();
  private readonly thumb = new TaperedTube(18, 14, 5);
  private readonly thumbCurve = new CatmullRomCurve3(
    [ROOT_INSIDE.clone(), ROOT.clone(), new Vector3(), new Vector3()],
    false,
    'centripetal',
  );
  private readonly tip = REST.clone();
  private readonly slide = { z: 0 };
  private timeline: gsap.core.Timeline | null = null;

  // scratch vectors, reused every frame
  private readonly dir = new Vector3();
  private readonly bend = new Vector3();
  private readonly target = new Vector3();

  constructor() {
    const skin = paint(palette.skin, { roughness: 0.6, impasto: 0.12 });
    const sweater = paint(palette.sweater, { roughness: 1, impasto: 0.45 });
    this.group.add(this.remote.group);

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
    }

    this.thumbMesh(skin);

    // forearm leaving the frame bottom-right, then the sweater sleeve
    const forearm = new CatmullRomCurve3([
      new Vector3(0.02, -0.03, 0.075),
      new Vector3(0.05, -0.095, 0.26),
      new Vector3(0.09, -0.17, 0.5),
    ]);
    this.tube(forearm, skin, (t) => 0.024 + 0.012 * t);
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
    this.group.add(cuff);

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
    const button = this.remote.buttonTop(id, this.target);
    const slideZ = Math.max(0, -0.014 - button.z);
    const contactY = button.y + THUMB.tip * 0.8;
    const hover = contactY + 0.012;
    const t = this.tip;

    this.timeline = gsap
      .timeline()
      .to(
        this.slide,
        { z: slideZ, duration: 0.09 / speed, ease: 'power2.out' },
        0,
      )
      .to(
        t,
        {
          x: button.x,
          y: hover,
          z: button.z + slideZ,
          duration: 0.07 / speed,
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
      )
      .to(this.slide, { z: 0, duration: 0.3, ease: 'power2.inOut' }, '<');
  }

  update(): void {
    this.remote.group.position.z = this.slide.z;
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
    this.group.add(mesh);
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
    this.group.add(mesh);
    return mesh;
  }

  private thumbMesh(material: MeshStandardMaterial): void {
    const mesh = new Mesh(this.thumb.geometry, material);
    mesh.castShadow = true;
    // the geometry is rewritten every frame: keep its bounds conservative
    mesh.frustumCulled = false;
    this.group.add(mesh);
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
  }
}
