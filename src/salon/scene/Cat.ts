import {
  CanvasTexture,
  CatmullRomCurve3,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  RepeatWrapping,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  type Texture,
  Vector3,
} from 'three';
import { paint } from './materials';
import { TaperedTube } from './TaperedTube';

const { lerp, clamp, damp, smoothstep } = MathUtils;

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

const sphere = new SphereGeometry(1, 24, 16);
const STRIDE = 0.17;
const FUR = '#c46a2f';
const CREAM = '#e3c49c';

/**
 * Ginger tabby stripes, painted on a canvas: vertical wavy bands (they run
 * down the flanks on the ellipsoids) over brush dabs. Rotated by 90° the
 * same texture gives rings on the legs and the tail.
 */
function tabby(rings: boolean, repeat: number): Texture {
  const width = 512;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  ctx.fillStyle = '#d0d0d0';
  ctx.fillRect(0, 0, width, height);
  ctx.lineCap = 'round';
  for (let i = 0; i < 260; i++) {
    const light = Math.random() > 0.5;
    const v = light ? 245 : 170;
    ctx.strokeStyle = `rgba(${v},${v},${v},${0.15 + Math.random() * 0.2})`;
    ctx.lineWidth = 6 + Math.random() * 10;
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 10, y + 20 + Math.random() * 30);
    ctx.stroke();
  }
  const stripes = 9;
  for (let i = 0; i < stripes; i++) {
    const x0 = ((i + Math.random() * 0.3) / stripes) * width;
    const thickness = 7 + Math.random() * 8;
    ctx.strokeStyle = 'rgba(105, 60, 35, 0.5)';
    for (let pass = 0; pass < 3; pass++) {
      ctx.lineWidth = thickness * (1 - pass * 0.25);
      ctx.beginPath();
      for (let y = -10; y <= height + 10; y += 16) {
        const x = x0 + Math.sin(y * 0.045 + i) * 9 + (Math.random() - 0.5) * 4;
        if (y === -10) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  if (rings) {
    texture.center.set(0.5, 0.5);
    texture.rotation = Math.PI / 2;
    texture.repeat.set(repeat, 1);
  }
  return texture;
}

/** Slightly curved triangular ear, thick enough to read in silhouette. */
function earGeometry(width: number, height: number): ExtrudeGeometry {
  const shape = new Shape();
  shape.moveTo(-width / 2, 0);
  shape.quadraticCurveTo(-width * 0.32, height * 0.62, 0, height);
  shape.quadraticCurveTo(width * 0.36, height * 0.55, width / 2, 0);
  shape.quadraticCurveTo(0, -height * 0.08, -width / 2, 0);
  const geometry = new ExtrudeGeometry(shape, {
    depth: 0.004,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.0025,
    bevelSegments: 3,
    curveSegments: 10,
  });
  geometry.translate(0, 0, -0.002);
  return geometry;
}

/**
 * A ginger tabby with some character, built in code like the hand (smooth
 * tapered tubes, ellipsoids, a striped painted coat). Local frame: +Z
 * forward, origin on the ground under the body. Procedural animation only:
 * a walk cycle driven by distance, pose blending (stand / sit / lie / groom
 * / crouch), jump phases, head look-at, tail, blinks, ears, breathing and
 * eyeshine in the TV light. Behaviour lives in CatBrain.
 */
export class Cat {
  readonly group = new Group();
  readonly pose: CatPose = { sit: 0, lie: 0, groom: 0, crouch: 0 };
  readonly target: CatPose = { sit: 0, lie: 0, groom: 0, crouch: 0 };
  /** Head world position (for sounds and the look-at test). */
  readonly headPosition = new Vector3();
  /** World point the cat looks at, or null to look straight ahead. */
  lookTarget: Vector3 | null = null;
  /** Extra body pitch during a jump (radians, negative = nose up). */
  jumpPitch = 0;
  /** 0..1: weight of the in-air leg poses. */
  airborne = 0;
  /** 0..1 progress of the flight (takeoff → landing). */
  jumpProgress = 0;
  /** 0..1: the little hips wiggle before a jump. */
  wiggle = 0;
  slowBlink = false;

  private readonly hips = new Group();
  private readonly belly: Mesh;
  private readonly neck = new Group();
  private readonly head = new Group();
  private readonly eyes = new Group();
  private readonly ears: Group[] = [];
  private readonly eyeMaterial: MeshStandardMaterial;
  private readonly legs: Leg[] = [];
  private readonly tailRoot = new Object3D();
  private readonly tail = new TaperedTube(24, 10, 4);
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
    const coat = new MeshStandardMaterial({
      color: FUR,
      map: tabby(false, 1),
      roughness: 0.95,
    });
    const ringed = (repeat: number) =>
      new MeshStandardMaterial({
        color: FUR,
        map: tabby(true, repeat),
        roughness: 0.95,
      });
    const cream = paint(CREAM, { roughness: 0.95, impasto: 0.12, repeat: 1 });
    const plainFur = paint(FUR, { roughness: 0.95, impasto: 0.25, repeat: 3 });
    const pink = paint('#c98276', { roughness: 0.7, impasto: 0.05 });

    // body: chest, waist, haunch — a tapered, readable silhouette
    this.group.add(this.hips);
    this.blob(this.hips, coat, [0, 0.012, 0.17], [0.068, 0.078, 0.085]);
    this.belly = this.blob(
      this.hips,
      coat,
      [0, 0.004, 0.07],
      [0.06, 0.068, 0.12],
    );
    this.blob(this.hips, coat, [0, 0.006, -0.025], [0.073, 0.08, 0.08]);
    for (const side of [1, -1]) {
      // shoulder blades and thighs give the top line some structure
      this.blob(
        this.hips,
        coat,
        [side * 0.032, 0.048, 0.19],
        [0.03, 0.03, 0.04],
      );
      this.blob(
        this.hips,
        coat,
        [side * 0.045, -0.01, -0.03],
        [0.04, 0.06, 0.06],
      );
    }
    this.blob(this.hips, cream, [0, -0.022, 0.2], [0.042, 0.058, 0.032]);
    this.blob(this.hips, cream, [0, -0.045, 0.09], [0.045, 0.03, 0.1]);

    // head
    this.neck.position.set(0, 0.05, 0.215);
    this.hips.add(this.neck);
    this.head.position.set(0, 0.06, 0.05);
    this.neck.add(this.head);
    this.blob(this.head, coat, [0, 0.004, 0], [0.062, 0.056, 0.058]);
    this.blob(this.head, plainFur, [0, 0.022, 0.012], [0.05, 0.03, 0.045]);
    for (const side of [1, -1]) {
      // fluffy cheeks
      this.blob(
        this.head,
        plainFur,
        [side * 0.036, -0.02, 0.018],
        [0.034, 0.029, 0.032],
      );
      // whisker pads
      this.blob(
        this.head,
        cream,
        [side * 0.0125, -0.027, 0.048],
        [0.0165, 0.0135, 0.0145],
      );
    }
    this.blob(this.head, cream, [0, -0.04, 0.04], [0.016, 0.011, 0.014]);
    this.blob(this.head, pink, [0, -0.0145, 0.0605], [0.0075, 0.0055, 0.005]);

    // ears: curved triangles with a pink inside
    const earShell = earGeometry(0.046, 0.054);
    const earInner = earGeometry(0.03, 0.038);
    for (const side of [1, -1] as const) {
      const ear = new Group();
      ear.position.set(side * 0.034, 0.038, -0.004);
      ear.rotation.set(-0.25, side * 0.35, -side * 0.42);
      const shell = new Mesh(earShell, plainFur);
      const inner = new Mesh(earInner, pink);
      inner.position.set(0, 0.004, 0.0045);
      shell.castShadow = true;
      ear.add(shell, inner);
      this.head.add(ear);
      this.ears.push(ear);
    }

    // eyes: slanted almonds, amber iris, slit pupil, a catchlight
    this.eyeMaterial = new MeshStandardMaterial({
      color: '#d49a2a',
      roughness: 0.1,
      emissive: '#e3d65a',
      emissiveIntensity: 0.2,
    });
    const pupil = new MeshStandardMaterial({
      color: '#0b0907',
      roughness: 0.05,
    });
    const spark = new MeshStandardMaterial({
      color: '#ffffff',
      emissive: '#ffffff',
      emissiveIntensity: 1.2,
    });
    this.eyes.position.set(0, 0.004, 0.047);
    this.head.add(this.eyes);
    for (const side of [1, -1]) {
      const eye = new Group();
      eye.position.set(side * 0.024, 0, 0);
      eye.rotation.z = side * 0.28;
      const iris = new Mesh(sphere, this.eyeMaterial);
      iris.scale.set(0.0145, 0.0115, 0.008);
      const slit = new Mesh(sphere, pupil);
      slit.scale.set(0.0032, 0.0098, 0.003);
      slit.position.z = 0.0062;
      const light = new Mesh(sphere, spark);
      light.scale.setScalar(0.0022);
      light.position.set(side * 0.005, 0.0045, 0.0075);
      eye.add(iris, slit, light);
      this.eyes.add(eye);
      // brow: a soft fur ridge over each eye, gives a calm look
      this.blob(
        this.head,
        plainFur,
        [side * 0.025, 0.0135, 0.045],
        [0.0175, 0.006, 0.011],
      ).rotation.z = -side * 0.25;
    }

    // whiskers
    const whisker = new CylinderGeometry(0.0006, 0.0003, 0.075, 4);
    whisker.translate(0, 0.0375, 0);
    const whiskerMaterial = new MeshStandardMaterial({
      color: '#efe6d6',
      roughness: 0.4,
    });
    for (const side of [1, -1]) {
      for (let i = 0; i < 3; i++) {
        const mesh = new Mesh(whisker, whiskerMaterial);
        mesh.position.set(side * 0.02, -0.026 - i * 0.004, 0.052);
        mesh.rotation.set(0.25, 0, -side * (1.35 + i * 0.12));
        this.head.add(mesh);
      }
    }

    // legs: tubes in the cat's local space, rebuilt every frame
    const legMaterial = ringed(2);
    const legSpecs: [boolean, 1 | -1, number][] = [
      [true, 1, 0.25],
      [true, -1, 0.75],
      [false, 1, 0],
      [false, -1, 0.5],
    ];
    for (const [front, side, phase] of legSpecs) {
      const root = new Object3D();
      root.position.set(
        side * (front ? 0.036 : 0.045),
        -0.035,
        front ? 0.18 : -0.03,
      );
      this.hips.add(root);
      const tube = new TaperedTube(12, 10, 3);
      const mesh = new Mesh(tube.geometry, legMaterial);
      mesh.castShadow = true;
      mesh.frustumCulled = false;
      // white socks
      const paw = new Mesh(sphere, cream);
      paw.scale.set(0.022, 0.015, 0.03);
      paw.castShadow = true;
      this.group.add(mesh, paw);
      const top = front ? 0.026 : 0.036;
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
        radius: (t) => lerp(top, 0.016, t),
      });
    }

    this.tailRoot.position.set(0, 0.035, -0.085);
    this.hips.add(this.tailRoot);
    this.tailCurve = new CatmullRomCurve3(
      Array.from({ length: 6 }, () => new Vector3()),
      false,
      'centripetal',
    );
    const tailMesh = new Mesh(this.tail.geometry, ringed(5));
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
      p[key] = damp(p[key], this.target[key], key === 'crouch' ? 12 : 3.2, dt);
    }
    const sit = p.sit;
    const lie = p.lie;
    const stand = Math.max(0, 1 - sit - lie);
    const walk = this.walkAmount * stand;
    const t = this.time;

    // body: height, position and pitch blended between the poses
    const bob = Math.sin(this.gait * Math.PI * 4) * 0.007 * walk;
    const breathe = Math.sin(t * (lie > 0.5 ? 1.6 : 2.4)) * 0.02;
    const wiggle = Math.sin(t * 15) * this.wiggle;
    this.hips.position.set(
      wiggle * 0.008,
      stand * 0.19 + sit * 0.088 + lie * 0.083 - p.crouch * 0.065 + bob,
      stand * -0.085 + sit * -0.08 + lie * -0.1,
    );
    this.hips.rotation.set(
      sit * -0.78 + lie * 0.02 + this.jumpPitch + p.crouch * 0.12,
      wiggle * 0.1,
      0,
    );
    this.belly.scale.y = 0.068 * (1 + breathe);

    // head: level it, then look around / groom
    this.updateLook(dt);
    const groom = p.groom * sit;
    const lick = Math.sin(t * 9) * 0.08 * groom;
    this.neck.rotation.set(
      sit * 0.74 -
        lie * 0.1 -
        this.jumpPitch * 0.6 +
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
      this.blinkTimer = this.slowBlink ? 2.4 : MathUtils.randFloat(2.5, 6);
    }
    this.blink = Math.max(0, this.blink - dt * (this.slowBlink ? 1.4 : 7));
    const closed = Math.sin(this.blink * Math.PI);
    // relaxed cats keep their eyes a bit narrowed
    const relaxed = 0.95 - this.pose.lie * 0.3;
    this.eyes.scale.y = Math.max(0.08, relaxed - closed * relaxed);

    this.earTimer -= dt;
    if (this.earTimer <= 0) {
      const ear = this.ears[Math.random() < 0.5 ? 0 : 1];
      ear.rotation.x -= 0.5;
      this.earTimer = MathUtils.randFloat(1.5, 5);
    }
    for (const ear of this.ears) {
      ear.rotation.x = damp(ear.rotation.x, -0.25, 6, dt);
    }
    this.eyeMaterial.emissiveIntensity = 0.1 + glow * 0.8;
  }

  private updateLegs(
    stand: number,
    sit: number,
    lie: number,
    walk: number,
    groom: number,
  ): void {
    const crouch = this.pose.crouch;
    const u = this.jumpProgress;
    // takeoff: hind legs push back; landing: front legs reach down first
    const tuck = smoothstep(u, 0.25, 0.75);
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
        const k = (s - 0.6) / 0.4;
        dz = lerp(-STRIDE / 2, STRIDE / 2, k * k * (3 - 2 * k));
        lift = Math.sin(Math.PI * k) * 0.045;
      }
      const standZ = front ? 0.12 : -0.1;
      const x = side * (front ? 0.037 : 0.046);
      this.foot.set(
        x * stand +
          side * (front ? 0.034 : 0.06) * sit +
          side * (front ? 0.036 : 0.066) * lie,
        lift * walk + lie * 0.012,
        (standZ + dz * walk) * stand +
          (front ? 0.14 : 0.035) * sit +
          (front ? 0.21 : -0.03) * lie,
      );
      // grooming: the left front paw comes up to the mouth
      if (front && side === 1 && groom > 0.01) {
        this.w.set(0.018, 0.27 + Math.sin(this.time * 9) * 0.01, 0.2);
        this.foot.lerp(this.w, groom);
      }

      const [root, knee, end] = leg.curve.points;
      leg.root.getWorldPosition(root);
      this.group.worldToLocal(root);
      // in the air the legs follow the body, not the ground
      if (this.airborne > 0.001) {
        if (front) {
          this.w.set(x, -0.1 + 0.03 * (1 - tuck), 0.07 + 0.03 * tuck);
        } else {
          this.w.set(x, -0.11 + 0.07 * tuck, -0.11 + 0.08 * tuck);
        }
        this.w.applyEuler(this.hips.rotation).add(root);
        this.foot.lerp(this.w, this.airborne);
      }
      end.copy(this.foot);
      // elbows and hocks point back; legs splay a bit when lying
      knee.lerpVectors(root, end, 0.5);
      knee.z -= front ? 0.02 + crouch * 0.03 : 0.05 + crouch * 0.035;
      knee.x += side * (0.025 * lie + 0.008 * sit);
      if (front) knee.y += 0.008;
      leg.tube.update(leg.curve, leg.radius);
      leg.paw.position.copy(end);
      leg.paw.position.y += 0.009;
    }
  }

  private updateTail(rest: number, walk: number): void {
    const [p0, p1, p2, p3, p4, p5] = this.tailCurve.points;
    this.tailRoot.getWorldPosition(p0);
    this.group.worldToLocal(p0);
    const t = this.time;
    const sway = Math.sin(t * 1.3) * 0.7 + Math.sin(t * 0.37) * 0.3;
    const flick = Math.sin(t * 2.7) * 0.5;
    const up = 0.95 + walk * 0.15 + this.airborne * -0.4;
    const r = clamp(rest, 0, 1);
    // standing: a high question-mark tail; resting: wrapped round the body
    const ring: [number, number, number][] = [
      [0.04, 0.03, -0.13],
      [0.1, 0.018, -0.1],
      [0.13, 0.016, -0.01],
      [0.12, 0.016, 0.08],
      [0.07 + flick * 0.02, 0.018, 0.15],
    ];
    const high: [number, number, number][] = [
      [sway * 0.01, 0.05 * up, -0.06],
      [sway * 0.04, 0.12 * up, -0.11],
      [sway * 0.08, 0.2 * up, -0.12],
      [sway * 0.12, 0.27 * up, -0.08],
      [sway * 0.14 + flick * 0.03, 0.3 * up, -0.02],
    ];
    for (const [i, point] of [p1, p2, p3, p4, p5].entries()) {
      point.copy(p0).add(this.v.fromArray(high[i]));
      point.lerp(this.w.fromArray(ring[i]), r);
    }
    this.tail.update(this.tailCurve, (u) => lerp(0.024, 0.013, u));
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
