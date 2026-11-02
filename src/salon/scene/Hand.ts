import gsap from 'gsap';
import {
  CapsuleGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import { paint, palette } from './materials';
import { type ButtonId, Remote } from './Remote';

const THUMB = { l1: 0.046, l2: 0.04, r: 0.0098 };
const ROOT = new Vector3(0.034, 0.008, 0.05);
const REST = new Vector3(0.006, 0.026, -0.008);
/** Bend direction hint for the thumb joint (up and outward). */
const POLE = new Vector3(1, 0.45, 0).normalize();
const UP = new Vector3(0, 1, 0);

/**
 * Right hand holding the remote. The thumb is a two-bone chain solved with
 * a tiny analytic IK every frame; its tip is animated by GSAP. Far buttons
 * make the remote slide back in the palm, like a real thumb would.
 */
export class Hand {
  readonly group = new Group();
  readonly remote = new Remote();
  private readonly proximal: Mesh;
  private readonly distal: Mesh;
  private readonly knuckle: Mesh;
  private readonly tip = REST.clone();
  private readonly slide = { z: 0 };
  private timeline: gsap.core.Timeline | null = null;

  // scratch vectors, reused every frame
  private readonly joint = new Vector3();
  private readonly end = new Vector3();
  private readonly dir = new Vector3();
  private readonly bend = new Vector3();
  private readonly target = new Vector3();

  constructor() {
    const skin = paint(palette.skin, { roughness: 0.65 });
    this.group.add(this.remote.group);

    const palm = new Mesh(new SphereGeometry(1, 20, 14), skin);
    palm.scale.set(0.05, 0.03, 0.068);
    palm.position.set(0.01, -0.032, 0.04);
    const thenar = new Mesh(new SphereGeometry(0.027, 14, 10), skin);
    thenar.position.copy(ROOT).add(new Vector3(-0.004, -0.014, 0.008));
    this.group.add(palm, thenar);

    // four fingers curling around the left side of the remote
    const fingers: [number, number][] = [
      [-0.032, 0.0098],
      [-0.01, 0.0102],
      [0.012, 0.0098],
      [0.032, 0.0085],
    ];
    for (const [z, r] of fingers) {
      const curve = new CatmullRomCurve3([
        new Vector3(0.012, -0.036, z + 0.012),
        new Vector3(-0.024, -0.03, z + 0.004),
        new Vector3(-0.04, -0.008, z),
        new Vector3(-0.036, 0.014, z - 0.002),
        new Vector3(-0.022, 0.02, z - 0.004),
      ]);
      const finger = new Mesh(new TubeGeometry(curve, 16, r, 10), skin);
      const fingertip = new Mesh(new SphereGeometry(r, 10, 8), skin);
      fingertip.position.copy(curve.getPoint(1));
      finger.castShadow = true;
      this.group.add(finger, fingertip);
    }

    this.proximal = new Mesh(
      new CapsuleGeometry(THUMB.r * 1.15, THUMB.l1, 6, 12),
      skin,
    );
    this.distal = new Mesh(new CapsuleGeometry(THUMB.r, THUMB.l2, 6, 12), skin);
    this.knuckle = new Mesh(new SphereGeometry(THUMB.r * 1.1, 10, 8), skin);
    this.proximal.castShadow = true;
    this.distal.castShadow = true;
    this.group.add(this.proximal, this.distal, this.knuckle);

    // forearm and sweater sleeve, leaving the frame bottom-right
    const wrist = new Vector3(0.026, -0.04, 0.1);
    const elbow = new Vector3(0.085, -0.17, 0.46);
    const arm = new Mesh(new CylinderGeometry(0.03, 0.042, 1, 14), skin);
    placeBetween(arm, wrist, elbow);
    const sleeveStart = wrist.clone().lerp(elbow, 0.3);
    const sleeve = new Mesh(
      new CylinderGeometry(0.052, 0.06, 1, 16),
      paint(palette.sweater, { roughness: 1 }),
    );
    placeBetween(sleeve, sleeveStart, elbow.clone().multiplyScalar(1.3));
    const cuff = new Mesh(
      new CylinderGeometry(0.054, 0.054, 0.03, 16),
      paint('#5a2226', { roughness: 1 }),
    );
    placeBetween(cuff, sleeveStart, sleeveStart.clone().lerp(elbow, 0.08));
    this.group.add(arm, sleeve, cuff);

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
    const slideZ = Math.max(0, -0.012 - button.z);
    const contactY = button.y + THUMB.r * 0.85;
    const hover = contactY + 0.013;
    const t = this.tip;

    this.timeline = gsap
      .timeline({ defaults: { overwrite: false } })
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

  private solveThumb(): void {
    const { l1, l2 } = THUMB;
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
    this.joint
      .copy(ROOT)
      .addScaledVector(this.dir, a)
      .addScaledVector(this.bend, h);
    this.end.copy(ROOT).addScaledVector(this.dir, distance);
    orient(this.proximal, ROOT, this.joint, this.target);
    orient(this.distal, this.joint, this.end, this.target);
    this.knuckle.position.copy(this.joint);
  }
}

/** Centres a Y-aligned mesh between a and b (no scaling). */
function orient(mesh: Mesh, a: Vector3, b: Vector3, scratch: Vector3): void {
  mesh.position.addVectors(a, b).multiplyScalar(0.5);
  scratch.subVectors(b, a).normalize();
  mesh.quaternion.setFromUnitVectors(UP, scratch);
}

/** Stretches a unit-height Y-aligned mesh between a and b. */
function placeBetween(mesh: Mesh, a: Vector3, b: Vector3): void {
  const direction = new Vector3().subVectors(b, a);
  mesh.scale.y = direction.length();
  mesh.position.addVectors(a, b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, direction.normalize());
}
