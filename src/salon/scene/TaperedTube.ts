import { BufferAttribute, BufferGeometry, type Curve, Vector3 } from 'three';

/**
 * A tube of varying radius along a curve, closed by hemispherical caps,
 * with analytic normals: one smooth volume per finger / limb, so parts
 * meet cleanly instead of capsules and spheres poking through each other.
 * The topology is fixed; `update` rewrites the vertices in place (cheap
 * enough to animate the thumb every frame).
 */
export class TaperedTube {
  readonly geometry = new BufferGeometry();
  private readonly positions: Float32Array;
  private readonly normals: Float32Array;
  private readonly points: Vector3[] = [];
  private readonly tangents: Vector3[] = [];
  private readonly frameN: Vector3[] = [];
  private readonly frameB: Vector3[] = [];
  private readonly radial = new Vector3();
  private readonly center = new Vector3();

  constructor(
    private readonly segments = 16,
    private readonly sides = 12,
    private readonly capRings = 4,
  ) {
    for (let i = 0; i <= segments; i++) {
      this.points.push(new Vector3());
      this.tangents.push(new Vector3());
      this.frameN.push(new Vector3());
      this.frameB.push(new Vector3());
    }
    const rings = this.ringCount();
    const count = rings * sides + 2;
    this.positions = new Float32Array(count * 3);
    this.normals = new Float32Array(count * 3);
    const uvs = new Float32Array(count * 2);
    const indices: number[] = [];

    for (let r = 0; r < rings; r++) {
      for (let s = 0; s < sides; s++) {
        const i = r * sides + s;
        uvs[i * 2] = s / sides;
        uvs[i * 2 + 1] = r / (rings - 1);
        if (r === rings - 1) continue;
        const a = i;
        const b = r * sides + ((s + 1) % sides);
        const c = a + sides;
        const d = b + sides;
        // counter-clockwise seen from outside (radial × tangent)
        indices.push(a, b, c, b, d, c);
      }
    }
    const startPole = rings * sides;
    const endPole = startPole + 1;
    for (let s = 0; s < sides; s++) {
      const next = (s + 1) % sides;
      indices.push(startPole, next, s);
      const last = (rings - 1) * sides;
      indices.push(endPole, last + s, last + next);
    }

    this.geometry.setAttribute(
      'position',
      new BufferAttribute(this.positions, 3),
    );
    this.geometry.setAttribute('normal', new BufferAttribute(this.normals, 3));
    this.geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
    this.geometry.setIndex(indices);
  }

  /** @param radius radius at t ∈ [0, 1] along the curve */
  update(curve: Curve<Vector3>, radius: (t: number) => number): void {
    const { segments, sides, capRings, points, tangents, frameN, frameB } =
      this;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      curve.getPoint(t, points[i]);
      curve.getTangent(t, tangents[i]);
    }
    // parallel-transport frames: no twisting along the tube
    const t0 = tangents[0];
    frameN[0].set(0, 1, 0);
    if (Math.abs(t0.y) > 0.9) frameN[0].set(1, 0, 0);
    frameN[0].addScaledVector(t0, -frameN[0].dot(t0)).normalize();
    frameB[0].crossVectors(t0, frameN[0]);
    for (let i = 1; i <= segments; i++) {
      const t = tangents[i];
      frameN[i]
        .copy(frameN[i - 1])
        .addScaledVector(t, -frameN[i - 1].dot(t))
        .normalize();
      frameB[i].crossVectors(t, frameN[i]);
    }

    let ring = 0;
    const r0 = radius(0);
    const r1 = radius(1);
    // start cap: from the pole side toward the first body ring
    for (let k = 1; k < capRings; k++) {
      const phi = -Math.PI / 2 + (k / capRings) * (Math.PI / 2);
      this.center.copy(points[0]).addScaledVector(t0, r0 * Math.sin(phi));
      this.writeRing(
        ring++,
        0,
        r0 * Math.cos(phi),
        Math.cos(phi),
        Math.sin(phi),
      );
    }
    for (let i = 0; i <= segments; i++) {
      this.center.copy(points[i]);
      this.writeRing(ring++, i, radius(i / segments), 1, 0);
    }
    const tEnd = tangents[segments];
    for (let k = 1; k < capRings; k++) {
      const phi = (k / capRings) * (Math.PI / 2);
      this.center
        .copy(points[segments])
        .addScaledVector(tEnd, r1 * Math.sin(phi));
      this.writeRing(
        ring++,
        segments,
        r1 * Math.cos(phi),
        Math.cos(phi),
        Math.sin(phi),
      );
    }

    const poles = this.ringCount() * sides * 3;
    this.center.copy(points[0]).addScaledVector(t0, -r0);
    this.center.toArray(this.positions, poles);
    t0.clone().negate().toArray(this.normals, poles);
    this.center.copy(points[segments]).addScaledVector(tEnd, r1);
    this.center.toArray(this.positions, poles + 3);
    tEnd.toArray(this.normals, poles + 3);

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.normal.needsUpdate = true;
    this.geometry.computeBoundingSphere();
  }

  private ringCount(): number {
    return this.segments + 1 + (this.capRings - 1) * 2;
  }

  /**
   * One ring around `this.center` in the frame of sample `i`; the normal
   * mixes the radial direction (weight `cos`) and the tangent (`sin`).
   */
  private writeRing(
    ring: number,
    i: number,
    r: number,
    cos: number,
    sin: number,
  ): void {
    const sides = this.sides;
    const radial = this.radial;
    const center = this.center;
    const n = this.frameN[i];
    const b = this.frameB[i];
    const t = this.tangents[i];
    for (let s = 0; s < sides; s++) {
      const angle = (s / sides) * Math.PI * 2;
      radial
        .copy(n)
        .multiplyScalar(Math.cos(angle))
        .addScaledVector(b, Math.sin(angle));
      const o = (ring * sides + s) * 3;
      this.positions[o] = center.x + radial.x * r;
      this.positions[o + 1] = center.y + radial.y * r;
      this.positions[o + 2] = center.z + radial.z * r;
      this.normals[o] = radial.x * cos + t.x * sin;
      this.normals[o + 1] = radial.y * cos + t.y * sin;
      this.normals[o + 2] = radial.z * cos + t.z * sin;
    }
  }
}
