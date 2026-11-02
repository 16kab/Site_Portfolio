import {
  type Bone,
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  Quaternion,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { config } from '../config';

/** Bones of the right hand (names as sanitised by the glTF loader). */
const RIGHT = {
  wrist: 'Bone002_025',
  fingers: [
    ['Bone012_035', 'Bone013_036', 'Bone014_037'],
    ['Bone009_032', 'Bone010_033', 'Bone011_034'],
    ['Bone006_029', 'Bone007_030', 'Bone008_031'],
    ['Bone003_026', 'Bone004_027', 'Bone005_028'],
  ],
  thumb: ['Bone015_038', 'Bone016_039', 'Bone017_040'],
  thumbTip: 'Bone017_end_052',
  /** Root of the hand, at the wrist (the forearm chain ends here). */
  hand: 'Bone020_024',
  /** Upper arm, forearm (two twist segments), from the shoulder side. */
  arm: ['Bone_02', 'Bone001_03', 'Bone018_04'],
};
/** The whole left arm and hand, collapsed out of sight. */
const LEFT = ['Bone1_05', 'Bone182_07'];

const scratch = {
  a: new Vector3(),
  b: new Vector3(),
  c: new Vector3(),
  q: new Quaternion(),
  q2: new Quaternion(),
  m: new Matrix4(),
  origin: new Vector3(),
  axis: new Vector3(),
};

/** Rotates a bone about an axis given in world space. */
function rotateOnWorld(bone: Object3D, axis: Vector3, angle: number): void {
  const parent = bone.parent;
  const local = scratch.a.copy(axis);
  if (parent) {
    parent.getWorldQuaternion(scratch.q2);
    local.applyQuaternion(scratch.q2.invert());
  }
  scratch.q.setFromAxisAngle(local.normalize(), angle);
  bone.quaternion.premultiply(scratch.q);
  bone.updateMatrixWorld(true);
}

/**
 * "Hands model rigged" by SomeOne34321 (CC BY, see ATTRIBUTIONS.md): a pair
 * of skinned forearms. Only the right one is kept. Its palm is fitted onto
 * the grip of the remote (grip space, see Hand.ts), the four fingers wrap
 * round it, and the thumb follows the button target with a small CCD IK on
 * its three joints — the palm never moves, like the code hand.
 */
export class HandModel {
  /** Placed in grip space by Hand. */
  readonly root = new Group();
  readonly bones = new Map<string, Bone>();
  loaded = false;
  private thumb: Bone[] = [];
  private thumbTip: Bone | null = null;
  private readonly rest: Quaternion[] = [];
  /** Every bone as modelled, restored before each fit. */
  private readonly bind = new Map<Bone, [Vector3, Quaternion, Vector3]>();

  async load(url: string): Promise<boolean> {
    try {
      const gltf = await new GLTFLoader().loadAsync(url);
      gltf.scene.traverse((object) => {
        if ((object as Bone).isBone)
          this.bones.set(object.name, object as Bone);
        if (object instanceof Mesh) {
          object.castShadow = true;
          object.frustumCulled = false;
          const material = object.material;
          if (material instanceof MeshStandardMaterial) {
            // skin, not metal (the file leaves the metal factor at 1)
            material.metalness = 0;
            material.metalnessMap = null;
            material.roughness = Math.max(material.roughness, 0.55);
          }
        }
      });
      this.root.add(gltf.scene);
      for (const name of LEFT) this.bone(name).scale.setScalar(1e-4);
      for (const bone of this.bones.values()) {
        this.bind.set(bone, [
          bone.position.clone(),
          bone.quaternion.clone(),
          bone.scale.clone(),
        ]);
      }
      this.thumb = RIGHT.thumb.map((name) => this.bone(name));
      this.thumbTip = this.bone(RIGHT.thumbTip);
      this.fitGrip();
      this.loaded = true;
      return true;
    } catch (error) {
      console.info(
        '[salon] hand model not loaded, keeping the code hand',
        error,
      );
      return false;
    }
  }

  private bone(name: string): Bone {
    const bone = this.bones.get(name);
    if (!bone) throw new Error(`hand bone missing: ${name}`);
    return bone;
  }

  /**
   * Places the palm on the grip and curls the fingers (config.handModel).
   * Callable again from the dev panel while tuning.
   */
  fitGrip(): void {
    const settings = config.handModel;
    const root = this.root;
    for (const [bone, [position, quaternion, scale]] of this.bind) {
      bone.position.copy(position);
      bone.quaternion.copy(quaternion);
      bone.scale.copy(scale);
    }
    root.position.set(0, 0, 0);
    root.quaternion.identity();
    root.scale.setScalar(1);
    // parents too: reading a bone position would refresh them midway
    root.updateWorldMatrix(true, true);
    // the palm frame of the model, in the root's space (rest pose)
    const inverse = scratch.m.copy(root.matrixWorld).invert();
    const at = (name: string, out: Vector3) =>
      this.bone(name).getWorldPosition(out).applyMatrix4(inverse);
    const wrist = at(RIGHT.wrist, new Vector3());
    const index = at(RIGHT.fingers[0][0], new Vector3());
    const pinky = at(RIGHT.fingers[3][0], new Vector3());
    const knuckles = index.clone().add(pinky).multiplyScalar(0.5);
    const forward = knuckles.clone().sub(wrist).normalize();
    const side = index.clone().sub(pinky);
    side.addScaledVector(forward, -side.dot(forward)).normalize();
    // right hand: forward × side points out of the back of the hand
    const back = new Vector3().crossVectors(forward, side);
    const model = new Matrix4().makeBasis(side, back, forward);
    // how the forearm bones sit relative to the hand, as modelled
    const handBone = this.bone(RIGHT.hand);
    const handRest = handBone.getWorldQuaternion(new Quaternion()).invert();
    const armRest = RIGHT.arm.map((name) =>
      handRest
        .clone()
        .multiply(this.bone(name).getWorldQuaternion(new Quaternion())),
    );
    // the same frame wanted in grip space
    const wantForward = new Vector3().fromArray(settings.forward).normalize();
    const wantBack = new Vector3().fromArray(settings.back);
    wantBack
      .addScaledVector(wantForward, -wantBack.dot(wantForward))
      .normalize();
    const wantSide = new Vector3().crossVectors(wantBack, wantForward);
    const target = new Matrix4().makeBasis(wantSide, wantBack, wantForward);
    const rotation = target.multiply(model.transpose());
    root.quaternion.setFromRotationMatrix(rotation);
    root.scale.setScalar(settings.scale);
    root.updateMatrixWorld(true);
    // put the wrist where the grip wants it
    const placed = wrist
      .clone()
      .multiplyScalar(settings.scale)
      .applyQuaternion(root.quaternion);
    root.position.fromArray(settings.wrist).sub(placed);
    root.updateMatrixWorld(true);
    this.straightenArm(armRest);

    // curl the four fingers round the remote (positive = toward the palm)
    for (const [f, chain] of RIGHT.fingers.entries()) {
      chain.forEach((name, joint) => {
        const bone = this.bone(name);
        bone.updateMatrixWorld(true);
        const axis = scratch.b
          .copy(side)
          .applyQuaternion(root.getWorldQuaternion(scratch.q2));
        const angle = settings.curl[joint] * (1 - 0.06 * f);
        rotateOnWorld(bone, axis, (angle * Math.PI) / 180);
      });
    }
    this.rest.length = 0;
    for (const bone of this.thumb) this.rest.push(bone.quaternion.clone());
  }

  /**
   * The modelled arm is bent up at the elbow: lay it straight from the
   * wrist along config.handModel.forearm (grip space), under the sleeve.
   * Each bone keeps the twist it had relative to the hand, so the wrist
   * does not wring.
   */
  private straightenArm(armRest: Quaternion[]): void {
    const grip = this.root.parent;
    if (!grip) return;
    const hand = this.bone(RIGHT.hand);
    const handWorld = hand.getWorldQuaternion(new Quaternion());
    const along = new Vector3()
      .fromArray(config.handModel.forearm)
      .normalize()
      .transformDirection(grip.matrixWorld);
    // bones point down their local +Y; the chain runs shoulder → wrist
    const toWrist = along.clone().negate();
    const bones = RIGHT.arm.map((name) => this.bone(name));
    let length = 0;
    bones.forEach((bone, i) => {
      const world = handWorld.clone().multiply(armRest[i]);
      const y = new Vector3(0, 1, 0).applyQuaternion(world);
      world.premultiply(new Quaternion().setFromUnitVectors(y, toWrist));
      const parent = bone.parent?.getWorldQuaternion(new Quaternion());
      bone.quaternion.copy(parent ? parent.invert().multiply(world) : world);
      bone.updateMatrixWorld(true);
      // the last bone ends at its child, the wrist end of the chain
      const next = bones[i + 1] ?? bone.children[0];
      length += next
        .getWorldPosition(new Vector3())
        .distanceTo(bone.getWorldPosition(new Vector3()));
    });
    // slide the chain so it ends exactly at the wrist
    const wrist = hand.getWorldPosition(new Vector3());
    const start = wrist.addScaledVector(along, length);
    const first = bones[0];
    first.parent?.worldToLocal(start);
    first.position.copy(start);
    first.updateMatrixWorld(true);
  }

  /** CCD IK: bend the thumb so its tip reaches `target` (world space). */
  reach(target: Vector3): void {
    const tip = this.thumbTip;
    if (!this.loaded || !tip) return;
    this.thumb.forEach((bone, i) => {
      bone.quaternion.copy(this.rest[i]);
    });
    this.thumb[0].updateMatrixWorld(true);
    const effector = scratch.c;
    for (let iteration = 0; iteration < 6; iteration++) {
      for (let i = this.thumb.length - 1; i >= 0; i--) {
        const bone = this.thumb[i];
        const origin = bone.getWorldPosition(scratch.origin);
        tip.getWorldPosition(effector);
        const toTip = effector.sub(origin).normalize();
        const toTarget = scratch.b.copy(target).sub(origin).normalize();
        const angle = Math.min(toTip.angleTo(toTarget), 0.4);
        if (angle < 1e-4) continue;
        const axis = scratch.axis.crossVectors(toTip, toTarget).normalize();
        rotateOnWorld(bone, axis, angle);
      }
    }
  }
}
