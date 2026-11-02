import { Group, MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { config } from '../config';
import { layout } from './layout';

/**
 * Seated viewer: fixed eye position, the mouse only turns the head.
 * Yaw and pitch follow their target through a damped spring so the motion
 * feels like a neck, never like a rigid camera.
 *
 * Transitions (being sucked into the TV, thrown back on the sofa) drive the
 * public override fields below; they are all neutral at rest.
 */
export class HeadCamera {
  readonly camera: PerspectiveCamera;
  /** Body-space rig for things held in hand; follows the head partially. */
  readonly rig = new Group();
  /** 0..1: how far the camera has travelled toward `travelTarget`. */
  travel = 0;
  readonly travelTarget = new Vector3();
  /** Extra field of view, in degrees (the room stretching). */
  fovBoost = 0;
  /** 0..1: forces the head back to the centre, ignoring the mouse. */
  recenter = 0;
  /** Whole-body offset (thrown into the cushions). */
  readonly offset = new Vector3();
  /** Extra head pitch, radians (positive = looking up). */
  pitchOffset = 0;

  private yaw = 0;
  private pitch = 0;
  private yawVelocity = 0;
  private pitchVelocity = 0;
  private time = 0;
  private shakeAmount = 0;
  private readonly reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  constructor(aspect: number) {
    this.camera = new PerspectiveCamera(config.head.fov, aspect, 0.03, 30);
    this.camera.rotation.order = 'YXZ';
    this.camera.position.copy(layout.eye);
    this.rig.rotation.order = 'YXZ';
    this.rig.position.copy(layout.eye);
  }

  /** Adds a decaying random shake (used by transitions). */
  shake(amount: number): void {
    const scaled = this.reducedMotion ? amount * 0.2 : amount;
    this.shakeAmount = Math.max(this.shakeAmount, scaled);
  }

  /** @param head normalised target in [-1, 1] */
  update(dt: number, head: { x: number; y: number }): void {
    const { head: h } = config;
    this.time += dt;
    const free = 1 - this.recenter;
    const targetYaw = -head.x * MathUtils.degToRad(h.maxYaw) * free;
    const targetPitch = head.y * MathUtils.degToRad(h.maxPitch) * free;

    // semi-implicit Euler spring, stable for the dt we clamp to
    this.yawVelocity +=
      (h.stiffness * (targetYaw - this.yaw) - h.damping * this.yawVelocity) *
      dt;
    this.pitchVelocity +=
      (h.stiffness * (targetPitch - this.pitch) -
        h.damping * this.pitchVelocity) *
      dt;
    this.yaw += this.yawVelocity * dt;
    this.pitch += this.pitchVelocity * dt;

    const breath = Math.sin(this.time * Math.PI * 2 * h.breathSpeed);
    const amplitude = this.reducedMotion ? 0.3 : 1;
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeAmount > 0.0001) {
      shakeX = (Math.random() - 0.5) * this.shakeAmount;
      shakeY = (Math.random() - 0.5) * this.shakeAmount;
      this.shakeAmount *= Math.exp(-dt * 6);
    }

    const rest = MathUtils.degToRad(h.restPitch) * (1 - this.travel);
    this.camera.rotation.set(
      rest +
        this.pitch +
        this.pitchOffset +
        breath * h.breathAmplitude * amplitude +
        shakeY,
      this.yaw + shakeX,
      0,
    );
    const breathing = breath * h.breathAmplitude * 2 * amplitude;
    this.camera.position
      .copy(layout.eye)
      .add(this.offset)
      .setY(layout.eye.y + this.offset.y + breathing)
      .lerp(this.travelTarget, this.travel);
    const fov = h.fov + this.fovBoost;
    if (this.camera.fov !== fov) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }

    this.rig.rotation.set(
      rest + this.pitch * h.handFollow + this.pitchOffset * 0.5,
      this.yaw * h.handFollow,
      0,
    );
    this.rig.position.copy(layout.eye).add(this.offset);
    this.rig.position.y += breathing;
  }
}
