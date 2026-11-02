import { Group, MathUtils, PerspectiveCamera } from 'three';
import { config } from '../config';
import { layout } from './layout';

/**
 * Seated viewer: fixed eye position, the mouse only turns the head.
 * Yaw and pitch follow their target through a damped spring so the motion
 * feels like a neck, never like a rigid camera.
 */
export class HeadCamera {
  readonly camera: PerspectiveCamera;
  /** Body-space rig for things held in hand; follows the head partially. */
  readonly rig = new Group();
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
    if (this.reducedMotion) return;
    this.shakeAmount = Math.max(this.shakeAmount, amount);
  }

  /** @param head normalised target in [-1, 1] */
  update(dt: number, head: { x: number; y: number }): void {
    const { head: h } = config;
    this.time += dt;
    const targetYaw = -head.x * MathUtils.degToRad(h.maxYaw);
    const targetPitch = head.y * MathUtils.degToRad(h.maxPitch);

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

    const rest = MathUtils.degToRad(h.restPitch);
    this.camera.rotation.set(
      rest + this.pitch + breath * h.breathAmplitude * amplitude + shakeY,
      this.yaw + shakeX,
      0,
    );
    this.camera.position.y =
      layout.eye.y + breath * h.breathAmplitude * 2 * amplitude;
    if (this.camera.fov !== h.fov) {
      this.camera.fov = h.fov;
      this.camera.updateProjectionMatrix();
    }

    this.rig.rotation.set(
      rest + this.pitch * h.handFollow,
      this.yaw * h.handFollow,
      0,
    );
    this.rig.position.y = this.camera.position.y;
  }
}
