import {
  CatmullRomCurve3,
  ConeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  Vector3,
} from 'three';
import { paint } from './materials';
import { TaperedTube } from './TaperedTube';

const { lerp, clamp, damp } = MathUtils;

/** Pose weights, all in 0..1; the cat blends between them. */
export type CatPose = {
  sit: number;
  lie: number;
  groom: number;
  /** Bent legs before a jump / after a landing. */
  crouch: number;
};

type Leg = {
  root: Object3D;
  tube: TaperedTube;
  curve: CatmullRomCurve3;
  paw: Mesh;
  front: boolean;
  side: 1 | -1;
  /** Gait phase offset (lateral sequence walk). */
  phase: number;
  radius: (t: number) => number;
};

const sphere = new SphereGeometry(1, 20, 14);
const STRIDE = 0.15;

/**
 * A chunky cartoon tabby, built in code like the hand (smooth tapered
 * tubes, ellipsoids). Local frame: +Z forward, origin on the ground under
 * the body. Procedural animation only: a walk cycle driven by distance,
 * pose blending (stand / sit / lie / groom / crouch), head look-at, tail
 * sway, blinks, ear twitches, breathing, eyeshine in the TV light.
 * Behaviour lives in CatBrain.
 */
export class Cat {
  readonly group = new Group();
  readonly pose: CatPose = { sit: 0, lie: 0, groom: 0, crouch: 0 };
  readonly target: CatPose = { sit: 0, lie: 0, groom: 0, crouch: 0 };
  /** Head world position (for sounds and the look-at test). */
  readonly headPosition = new Vector3();
  /** World point the cat looks at, or null to look straight ahead. */
  lookTarget: Vector3 | null = null;
  /** Extra body pitch during a jump (radians). */
  jumpPitch = 0;
  /** 0..1, how stretched the legs are in the air. */
  airborne = 0;
  slowBlink = false;

  private readonly hips = new Group();
  private readonly torso: Mesh;
  private readonly neck = new Group();
  private readonly head = new Group();
  private readonly eyes = new Group();
  private readonly ears: Mesh[] = [];
  private readonly eyeMaterial: MeshStandardMaterial;
  private readonly legs: Leg[] = [];
  private readonly tailRoot = new Object3D();
  private readonly tail = new TaperedTube(20, 10, 4);
  private readonly tailCurve: CatmullRomCurve3;

  private gait = 0;
  private walkAmount = 0;
  private time = 0;
  private blinkTimer = 2;
  private blink = 0;
  private earTimer = 1;
  private lookYaw = 0;
  private lookPitch = 0;

  // scratch
  private readonly v = new Vector3();
  private readonly w = new Vector3();
  private readonly foot = new Vector3();

  constructor() {
    const fur = paint('#b4622c', { roughness: 0.95, impasto: 0.35, repeat: 3 });
    const cream = paint('#dcb48a', {
      roughness: 0.95,
      impasto: 0.3,
      repeat: 3,
    });
    const pink = paint('#c27a72', { roughness: 0.7, impasto: 0.05 });

    this.group.add(this.hips);
    this.torso = this.blob(
      this.hips,
      fur,
      [0, 0.015, 0.1],
      [0.082, 0.078, 0.165],
    );
    this.blob(this.hips, fur, [0, 0, -0.005], [0.086, 0.086, 0.088]);
    this.blob(this.hips, fur, [0, 0.0, 0.2], [0.076, 0.082, 0.078]);
    this.blob(this.hips, cream, [0, -0.032, 0.11], [0.066, 0.052, 0.13]);
    this.blob(this.hips, cream, [0, -0.01, 0.245], [0.05, 0.06, 0.04]);

    // head
    this.neck.position.set(0, 0.04, 0.235);
    this.hips.add(this.neck);
    this.head.position.set(0, 0.065, 0.05);
    this.neck.add(this.head);
    this.blob(this.head, fur, [0, 0, 0], [0.08, 0.068, 0.072]);
    this.blob(this.head, fur, [0.042, -0.024, 0.03], [0.04, 0.034, 0.036]);
    this.blob(this.head, fur, [-0.042, -0.024, 0.03], [0.04, 0.034, 0.036]);
    this.blob(this.head, cream, [0, -0.03, 0.055], [0.038, 0.026, 0.03]);
    this.blob(this.head, pink, [0, -0.012, 0.083], [0.01, 0.007, 0.006]);
    for (const side of [1, -1]) {
      const ear = new Mesh(new ConeGeometry(0.032, 0.062, 4, 1), fur);
      ear.position.set(side * 0.044, 0.062, -0.006);
      ear.rotation.set(-0.15, side * 0.6, -side * 0.38);
      const inner = new Mesh(new ConeGeometry(0.019, 0.04, 4, 1), pink);
      inner.position.set(0, -0.006, 0.012);
      ear.add(inner);
      ear.castShadow = true;
      this.head.add(ear);
      this.ears.push(ear);
    }
    this.eyeMaterial = new MeshStandardMaterial({
      color: '#b8a43a',
      roughness: 0.15,
      emissive: '#d9e45c',
      emissiveIntensity: 0.2,
    });
    const pupil = new MeshStandardMaterial({
      color: '#0d0b09',
      roughness: 0.1,
    });
    this.eyes.position.set(0, 0.008, 0.06);
    this.head.add(this.eyes);
    for (const side of [1, -1]) {
      const eye = new Mesh(sphere, this.eyeMaterial);
      eye.scale.set(0.016, 0.017, 0.01);
      eye.position.set(side * 0.03, 0, 0);
      const slit = new Mesh(sphere, pupil);
      slit.scale.set(0.0045, 0.014, 0.004);
      slit.position.set(side * 0.03, 0, 0.0085);
      this.eyes.add(eye, slit);
    }

    // legs (tubes live in the cat's local space, rebuilt every frame)
    const legSpecs: [boolean, 1 | -1, number][] = [
      [true, 1, 0.25],
      [true, -1, 0.75],
      [false, 1, 0],
      [false, -1, 0.5],
    ];
    for (const [front, side, phase] of legSpecs) {
      const root = new Object3D();
      root.position.set(side * (front ? 0.044 : 0.05), -0.03, front ? 0.21 : 0);
      this.hips.add(root);
      const tube = new TaperedTube(10, 10, 3);
      const mesh = new Mesh(tube.geometry, fur);
      mesh.castShadow = true;
      mesh.frustumCulled = false;
      const paw = new Mesh(sphere, cream);
      paw.scale.set(0.027, 0.016, 0.034);
      paw.castShadow = true;
      this.group.add(mesh, paw);
      const top = front ? 0.031 : 0.042;
      this.legs.push({
        root,
        tube,
        curve: new CatmullRomCurve3([
          new Vector3(),
          new Vector3(),
          new Vector3(),
        ]),
        paw,
        front,
        side,
        phase,
        radius: (t) => lerp(top, 0.022, t),
      });
    }

    this.tailRoot.position.set(0, 0.03, -0.075);
    this.hips.add(this.tailRoot);
    this.tailCurve = new CatmullRomCurve3(
      Array.from({ length: 5 }, () => new Vector3()),
      false,
      'centripetal',
    );
    const tailMesh = new Mesh(this.tail.geometry, fur);
    tailMesh.castShadow = true;
    tailMesh.frustumCulled = false;
    this.group.add(tailMesh);

    this.update(0, 0);
  }

  /** Advances the walk cycle by the distance travelled this frame. */
  walk(distance: number, dt: number): void {
    this.gait = (this.gait + (distance * 0.6) / STRIDE) % 1;
    const moving = distance / Math.max(dt, 1e-4) > 0.02 ? 1 : 0;
    this.walkAmount = damp(this.walkAmount, moving, 8, dt);
  }

  /** @param glow TV light power, for the eyeshine */
  update(dt: number, glow: number): void {
    this.time += dt;
    const p = this.pose;
    for (const key of ['sit', 'lie', 'groom', 'crouch'] as const) {
      p[key] = damp(p[key], this.target[key], key === 'crouch' ? 14 : 3.2, dt);
    }
    const sit = p.sit;
    const lie = p.lie;
    const stand = Math.max(0, 1 - sit - lie);
    const walk = this.walkAmount * stand;
    const t = this.time;

    // body: height, position and pitch blended between the poses
    const bob = Math.sin(this.gait * Math.PI * 4) * 0.006 * walk;
    const breathe = Math.sin(t * (lie > 0.5 ? 1.6 : 2.4)) * 0.018;
    this.hips.position.set(
      0,
      stand * 0.15 + sit * 0.08 + lie * 0.075 - p.crouch * 0.045 + bob,
      stand * -0.08 + sit * -0.07 + lie * -0.09,
    );
    this.hips.rotation.x = sit * -0.72 + lie * 0.02 + this.jumpPitch;
    this.torso.scale.y = 0.078 * (1 + breathe);

    // head: level it, then look around / groom
    this.updateLook(dt);
    const groom = p.groom * sit;
    const lick = Math.sin(t * 9) * 0.08 * groom;
    this.neck.rotation.set(
      sit * 0.68 -
        lie * 0.12 +
        this.lookPitch * (1 - groom) +
        groom * 0.55 +
        lick,
      this.lookYaw * (1 - groom) + groom * 0.45,
      0,
    );

    this.updateFace(dt, glow);
    this.group.updateMatrixWorld(true);
    this.updateLegs(stand, sit, lie, walk, groom);
    this.updateTail(sit + lie, walk);
    this.head.getWorldPosition(this.headPosition);
  }

  private updateLook(dt: number): void {
    let yaw = 0;
    let pitch = 0;
    if (this.lookTarget) {
      this.neck.parent?.worldToLocal(this.v.copy(this.lookTarget));
      this.v.sub(this.neck.position);
      yaw = clamp(Math.atan2(this.v.x, this.v.z), -1.1, 1.1);
      pitch = clamp(
        -Math.atan2(this.v.y, Math.hypot(this.v.x, this.v.z)),
        -0.7,
        0.5,
      );
    }
    this.lookYaw = damp(this.lookYaw, yaw, 4, dt);
    this.lookPitch = damp(this.lookPitch, pitch, 4, dt);
  }

  private updateFace(dt: number, glow: number): void {
    // blinks, and the slow "I trust you" blink when the viewer stares
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.blink = 1;
      this.blinkTimer = this.slowBlink ? 2.2 : MathUtils.randFloat(2.5, 6);
    }
    this.blink = Math.max(0, this.blink - dt * (this.slowBlink ? 1.6 : 7));
    const closed = Math.sin(this.blink * Math.PI);
    this.eyes.scale.y = Math.max(0.08, 1 - closed);

    this.earTimer -= dt;
    if (this.earTimer <= 0) {
      const ear = this.ears[Math.random() < 0.5 ? 0 : 1];
      ear.rotation.y += (Math.random() - 0.5) * 0.9;
      this.earTimer = MathUtils.randFloat(1.5, 5);
    }
    for (const [i, ear] of this.ears.entries()) {
      const side = i === 0 ? 1 : -1;
      ear.rotation.y = damp(ear.rotation.y, side * 0.6, 5, dt);
    }
    this.eyeMaterial.emissiveIntensity = 0.12 + glow * 0.9;
  }

  private updateLegs(
    stand: number,
    sit: number,
    lie: number,
    walk: number,
    groom: number,
  ): void {
    const crouch = this.pose.crouch;
    for (const leg of this.legs) {
      const { front, side } = leg;
      // gait: 60% stance (foot slides back), 40% swing (foot lifted)
      const s = (this.gait + leg.phase) % 1;
      let dz: number;
      let lift: number;
      if (s < 0.6) {
        dz = lerp(STRIDE / 2, -STRIDE / 2, s / 0.6);
        lift = 0;
      } else {
        const u = (s - 0.6) / 0.4;
        dz = lerp(-STRIDE / 2, STRIDE / 2, u * u * (3 - 2 * u));
        lift = Math.sin(Math.PI * u) * 0.04;
      }
      const standZ = front ? 0.135 : -0.085;
      const x = side * (front ? 0.045 : 0.052);
      this.foot.set(
        x * stand +
          side * (front ? 0.04 : 0.062) * sit +
          side * (front ? 0.04 : 0.068) * lie,
        lift * walk + lie * 0.012,
        (standZ + dz * walk) * stand +
          (front ? 0.13 : 0.03) * sit +
          (front ? 0.19 : -0.02) * lie,
      );
      // in the air, legs reach forward / back
      this.foot.z += this.airborne * (front ? 0.06 : -0.06);
      this.foot.y += this.airborne * 0.05;
      // grooming: the left front paw comes up to the mouth
      if (front && side === 1 && groom > 0.01) {
        this.w.set(0.02, 0.2 + Math.sin(this.time * 9) * 0.01, 0.2);
        this.foot.lerp(this.w, groom);
      }

      const [root, knee, end] = leg.curve.points;
      leg.root.getWorldPosition(root);
      this.group.worldToLocal(root);
      end.copy(this.foot);
      // elbows point back, hocks point back too; tuck sideways when lying
      knee.lerpVectors(root, end, 0.5);
      knee.z -= front ? 0.025 + crouch * 0.02 : 0.045 + crouch * 0.03;
      knee.x += side * (0.025 * lie + 0.01 * sit);
      if (front) knee.y += 0.01;
      leg.tube.update(leg.curve, leg.radius);
      leg.paw.position.copy(end);
      leg.paw.position.y += 0.008;
    }
  }

  private updateTail(rest: number, walk: number): void {
    const [p0, p1, p2, p3, p4] = this.tailCurve.points;
    this.tailRoot.getWorldPosition(p0);
    this.group.worldToLocal(p0);
    const t = this.time;
    const sway = Math.sin(t * 1.3) * 0.7 + Math.sin(t * 0.37) * 0.3;
    const tipFlick = Math.sin(t * 2.7) * 0.5;
    const up = 0.9 + walk * 0.2;
    const r = MathUtils.clamp(rest, 0, 1);
    // standing: a question-mark tail; resting: wrapped on the ground
    this.v.set(sway * 0.02, 0.05 * up, -0.07);
    p1.copy(p0)
      .add(this.v)
      .lerp(this.w.set(0.07, 0.03, -0.12), r);
    this.v.set(sway * 0.07, 0.14 * up, -0.11);
    p2.copy(p0)
      .add(this.v)
      .lerp(this.w.set(0.12, 0.016, -0.02), r);
    this.v.set(sway * 0.12, 0.22 * up, -0.08);
    p3.copy(p0)
      .add(this.v)
      .lerp(this.w.set(0.11, 0.016, 0.09), r);
    this.v.set(sway * 0.14 + tipFlick * 0.03, 0.26 * up, -0.03);
    p4.copy(p0)
      .add(this.v)
      .lerp(this.w.set(0.06 + tipFlick * 0.02, 0.02, 0.15), r);
    this.tail.update(this.tailCurve, (u) => lerp(0.022, 0.011, u));
  }

  private blob(
    parent: Object3D,
    material: MeshStandardMaterial,
    position: [number, number, number],
    scale: [number, number, number],
  ): Mesh {
    const mesh = new Mesh(sphere, material);
    mesh.position.fromArray(position);
    mesh.scale.fromArray(scale);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }
}
