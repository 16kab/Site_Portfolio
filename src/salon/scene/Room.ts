import {
  BoxGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  type Material,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Shape,
  ShapeGeometry,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { layout } from './layout';
import { paint, palette } from './materials';

/** Walls, floor, window with the city outside, and the furniture. */
export class Room {
  readonly group = new Group();
  private city: ShaderMaterial;
  private readonly hands: Group[] = [];

  constructor() {
    const { minX, maxX, minZ, maxZ, height } = layout.room;
    const width = maxX - minX;
    const depth = maxZ - minZ;
    const wall = paint(palette.wall, { repeat: 3 });

    const floor = new Mesh(
      new PlaneGeometry(width, depth),
      paint(palette.floor, { wood: true, repeat: 4, roughness: 0.7 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((minX + maxX) / 2, 0, (minZ + maxZ) / 2);
    floor.receiveShadow = true;

    const ceiling = new Mesh(
      new PlaneGeometry(width, depth),
      paint(palette.ceiling, { repeat: 2 }),
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(floor.position.x, height, floor.position.z);

    const front = new Mesh(new PlaneGeometry(width, height), wall);
    front.position.set(floor.position.x, height / 2, minZ);
    front.receiveShadow = true;

    const back = new Mesh(new PlaneGeometry(width, height), wall);
    back.rotation.y = Math.PI;
    back.position.set(floor.position.x, height / 2, maxZ);

    const left = new Mesh(new PlaneGeometry(depth, height), wall);
    left.rotation.y = Math.PI / 2;
    left.position.set(minX, height / 2, floor.position.z);
    left.receiveShadow = true;

    this.group.add(floor, ceiling, front, back, left, this.rightWall(wall));
    this.group.add(this.skirting());

    this.city = cityMaterial();
    const city = new Mesh(new PlaneGeometry(9, 5), this.city);
    city.rotation.y = -Math.PI / 2;
    city.position.set(maxX + 3, 1.6, layout.window.z);
    this.group.add(city, this.windowFrame(), ...this.curtains());

    this.group.add(
      this.tvStand(),
      this.coffeeTable(),
      this.rug(),
      this.plant(),
      this.clock(),
      ...this.frames(),
    );

    this.group.traverse((object) => {
      if (object instanceof Mesh && object !== floor) {
        object.receiveShadow = true;
      }
    });
  }

  update(time: number): void {
    this.city.uniforms.uTime.value = time;
    // the wall clock shows the visitor's real time
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;
    const [hour, minute, second] = this.hands;
    hour.rotation.z = (-hours / 12) * Math.PI * 2;
    minute.rotation.z = (-minutes / 60) * Math.PI * 2;
    second.rotation.z = (-seconds / 60) * Math.PI * 2;
  }

  private rightWall(material: Material): Mesh {
    const { minZ, maxZ, height, maxX } = layout.room;
    const { z, width, bottom, top } = layout.window;
    // shape in (world z, world y), rotated to face -X
    const shape = new Shape();
    shape.moveTo(minZ, 0);
    shape.lineTo(maxZ, 0);
    shape.lineTo(maxZ, height);
    shape.lineTo(minZ, height);
    shape.lineTo(minZ, 0);
    const hole = new Shape();
    hole.moveTo(z - width / 2, bottom);
    hole.lineTo(z - width / 2, top);
    hole.lineTo(z + width / 2, top);
    hole.lineTo(z + width / 2, bottom);
    hole.lineTo(z - width / 2, bottom);
    shape.holes.push(hole);
    const mesh = new Mesh(new ShapeGeometry(shape), material);
    mesh.rotation.y = -Math.PI / 2;
    mesh.position.x = maxX;
    return mesh;
  }

  private skirting(): Group {
    const { minX, maxX, minZ } = layout.room;
    const group = new Group();
    const material = paint(palette.woodDark, { wood: true });
    const front = new Mesh(new BoxGeometry(maxX - minX, 0.1, 0.02), material);
    front.position.set((minX + maxX) / 2, 0.05, minZ + 0.01);
    group.add(front);
    return group;
  }

  private windowFrame(): Group {
    const { maxX } = layout.room;
    const { z, width, bottom, top } = layout.window;
    const group = new Group();
    const material = paint('#3a2a26', { wood: true });
    const h = top - bottom;
    const t = 0.06;
    const pieces: [number, number, number, number, number][] = [
      // [y, z, sizeY, sizeZ, depth]
      [bottom, z, t, width + t, 0.16],
      [top, z, t, width + t, 0.1],
      [(bottom + top) / 2, z - width / 2, h, t, 0.1],
      [(bottom + top) / 2, z + width / 2, h, t, 0.1],
      [(bottom + top) / 2, z, h, 0.035, 0.05],
      [bottom + h * 0.62, z, 0.035, width, 0.05],
    ];
    for (const [y, pz, sy, sz, d] of pieces) {
      const piece = new Mesh(new BoxGeometry(d, sy, sz), material);
      piece.position.set(maxX - d / 2 + 0.03, y, pz);
      group.add(piece);
    }
    return group;
  }

  private curtains(): Mesh[] {
    const { maxX } = layout.room;
    const { z, width, top } = layout.window;
    const material = paint(palette.curtain, { roughness: 1 });
    material.side = DoubleSide;
    const result: Mesh[] = [];
    for (const side of [-1, 1]) {
      const geometry = new PlaneGeometry(0.62, top + 0.25, 28, 1);
      const position = geometry.attributes.position;
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        position.setZ(i, Math.sin(x * 34 + side) * 0.035);
      }
      geometry.computeVertexNormals();
      const curtain = new Mesh(geometry, material);
      curtain.rotation.y = -Math.PI / 2;
      curtain.position.set(
        maxX - 0.12,
        (top + 0.25) / 2,
        z + side * (width / 2 + 0.12),
      );
      curtain.castShadow = true;
      result.push(curtain);
    }
    return result;
  }

  private tvStand(): Group {
    const group = new Group();
    const size = layout.tvStandSize;
    const wood = paint(palette.woodDark, { wood: true, roughness: 0.6 });
    const body = new Mesh(
      new RoundedBoxGeometry(size.x, size.y - 0.08, size.z, 2, 0.02),
      wood,
    );
    body.position.y = 0.08 + (size.y - 0.08) / 2;
    body.castShadow = true;
    group.add(body);
    // dark open shelf with a VCR
    const shelf = new Mesh(
      new BoxGeometry(size.x * 0.56, 0.2, 0.02),
      paint('#120c0e'),
    );
    shelf.position.set(-size.x * 0.17, 0.25, size.z / 2 + 0.001);
    group.add(shelf);
    const vcr = new Mesh(
      new RoundedBoxGeometry(0.42, 0.08, 0.3, 2, 0.01),
      paint(palette.plastic, { roughness: 0.4 }),
    );
    vcr.position.set(-size.x * 0.17, 0.2, size.z / 2 - 0.13);
    group.add(vcr);
    const clock = new Mesh(
      new PlaneGeometry(0.06, 0.018),
      new MeshStandardMaterial({
        color: 0x000000,
        emissive: '#5cff8a',
        emissiveIntensity: 2.5,
      }),
    );
    clock.position.set(-size.x * 0.17 + 0.12, 0.2, size.z / 2 + 0.021);
    group.add(clock);
    for (const x of [-1, 1]) {
      for (const z of [-1, 1]) {
        const leg = new Mesh(new CylinderGeometry(0.02, 0.015, 0.08), wood);
        leg.position.set(
          (x * size.x) / 2 - x * 0.08,
          0.04,
          (z * size.z) / 2 - z * 0.06,
        );
        group.add(leg);
      }
    }
    group.position.copy(layout.tvStand);
    return group;
  }

  private coffeeTable(): Group {
    const group = new Group();
    const wood = paint(palette.wood, { wood: true, roughness: 0.55 });
    const top = new Mesh(
      new RoundedBoxGeometry(1.05, 0.05, 0.58, 2, 0.02),
      wood,
    );
    top.position.y = 0.42;
    top.castShadow = true;
    group.add(top);
    for (const x of [-1, 1]) {
      for (const z of [-1, 1]) {
        const leg = new Mesh(new CylinderGeometry(0.025, 0.02, 0.4), wood);
        leg.position.set(x * 0.46, 0.2, z * 0.23);
        leg.castShadow = true;
        group.add(leg);
      }
    }
    const ceramic = paint('#c9b48f', { roughness: 0.35 });
    const mug = new Mesh(
      new CylinderGeometry(0.042, 0.038, 0.095, 20),
      ceramic,
    );
    mug.position.set(0.28, 0.492, 0.05);
    mug.castShadow = true;
    const handle = new Mesh(new TorusGeometry(0.026, 0.008, 8, 16), ceramic);
    handle.position.set(0.322, 0.495, 0.05);
    const coffee = new Mesh(
      new CylinderGeometry(0.036, 0.036, 0.002, 20),
      paint('#2a160c', { roughness: 0.2 }),
    );
    coffee.position.set(0.28, 0.53, 0.05);
    // the key "notice" left on the table
    const notice = new Mesh(
      new PlaneGeometry(0.16, 0.22),
      paint('#d8cdb4', { roughness: 1 }),
    );
    notice.rotation.set(-Math.PI / 2, 0, 0.35);
    notice.position.set(-0.22, 0.446, 0.08);
    group.add(mug, handle, coffee, notice);
    group.position.copy(layout.coffeeTable);
    return group;
  }

  private rug(): Group {
    const group = new Group();
    const outer = new Mesh(
      new PlaneGeometry(2.3, 1.6),
      paint(palette.rug, { repeat: 2, roughness: 1 }),
    );
    outer.rotation.x = -Math.PI / 2;
    const inner = new Mesh(
      new PlaneGeometry(1.9, 1.2),
      paint('#94553a', { repeat: 2, roughness: 1 }),
    );
    inner.rotation.x = -Math.PI / 2;
    inner.position.y = 0.002;
    group.add(outer, inner);
    group.position.set(layout.coffeeTable.x, 0.004, layout.coffeeTable.z - 0.1);
    return group;
  }

  private clock(): Group {
    const group = new Group();
    const rim = new Mesh(
      new CylinderGeometry(0.115, 0.115, 0.035, 32),
      paint(palette.woodDark, { wood: true, roughness: 0.5 }),
    );
    rim.rotation.x = Math.PI / 2;
    const face = new Mesh(
      new CylinderGeometry(0.098, 0.098, 0.004, 32),
      paint('#d8cba8', { roughness: 0.8 }),
    );
    face.rotation.x = Math.PI / 2;
    face.position.z = 0.017;
    group.add(rim, face);
    const ink = paint('#1c1612', { roughness: 0.6, impasto: 0 });
    for (let i = 0; i < 12; i++) {
      const mark = new Mesh(
        new BoxGeometry(0.006, i % 3 ? 0.012 : 0.02, 0.002),
        ink,
      );
      const angle = (i / 12) * Math.PI * 2;
      mark.position.set(Math.sin(angle) * 0.08, Math.cos(angle) * 0.08, 0.02);
      mark.rotation.z = -angle;
      group.add(mark);
    }
    const specs: [number, number, string][] = [
      [0.05, 0.008, '#1c1612'],
      [0.075, 0.005, '#1c1612'],
      [0.08, 0.002, '#9a2a1e'],
    ];
    for (const [i, [length, width, color]] of specs.entries()) {
      const pivot = new Group();
      const hand = new Mesh(
        new BoxGeometry(width, length, 0.002),
        paint(color, { roughness: 0.5, impasto: 0 }),
      );
      hand.position.y = length / 2 - 0.01;
      pivot.add(hand);
      pivot.position.z = 0.022 + i * 0.002;
      group.add(pivot);
      this.hands.push(pivot);
    }
    group.position.copy(layout.clock);
    group.position.z += 0.02;
    return group;
  }

  private plant(): Group {
    const group = new Group();
    const pot = new Mesh(
      new CylinderGeometry(0.17, 0.12, 0.34, 18),
      paint('#8a4a32', { roughness: 0.9 }),
    );
    pot.position.y = 0.17;
    pot.castShadow = true;
    group.add(pot);
    const leafMaterial = paint('#2f4a2c', { roughness: 0.8 });
    const leaf = new SphereGeometry(0.1, 10, 8);
    for (let i = 0; i < 9; i++) {
      const mesh = new Mesh(leaf, leafMaterial);
      const angle = (i / 9) * Math.PI * 2;
      const lean = 0.3 + (i % 3) * 0.2;
      mesh.scale.set(0.55, 2.6, 0.18);
      mesh.position.set(
        Math.cos(angle) * 0.1,
        0.55 + (i % 3) * 0.09,
        Math.sin(angle) * 0.1,
      );
      mesh.rotation.set(
        Math.sin(angle) * lean,
        -angle,
        -Math.cos(angle) * lean,
      );
      mesh.castShadow = true;
      group.add(mesh);
    }
    group.position.copy(layout.plant);
    return group;
  }

  private frames(): Group[] {
    const { minZ, minX } = layout.room;
    const specs: {
      w: number;
      h: number;
      x: number;
      y: number;
      z: number;
      ry: number;
      art: string;
    }[] = [
      { w: 0.5, h: 0.65, x: -1.0, y: 1.55, z: minZ, ry: 0, art: '#6a7a5a' },
      { w: 0.34, h: 0.28, x: 0.95, y: 1.7, z: minZ, ry: 0, art: '#a0583a' },
      {
        w: 0.7,
        h: 0.5,
        x: minX,
        y: 1.55,
        z: 0.3,
        ry: Math.PI / 2,
        art: '#3a4a6a',
      },
    ];
    const frameMaterial = paint('#2a1a12', { wood: true });
    return specs.map((spec) => {
      const group = new Group();
      const frame = new Mesh(
        new BoxGeometry(spec.w + 0.06, spec.h + 0.06, 0.03),
        frameMaterial,
      );
      const art = new Mesh(
        new PlaneGeometry(spec.w, spec.h),
        paint(spec.art, { repeat: 1.5 }),
      );
      art.position.z = 0.016;
      group.add(frame, art);
      group.rotation.y = spec.ry;
      group.position.set(
        spec.ry ? spec.x + 0.016 : spec.x,
        spec.y,
        spec.ry ? spec.z : spec.z + 0.016,
      );
      return group;
    });
  }
}

/** Night city seen through the window: sky gradient + lit windows. */
function cityMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      void main() {
        vec2 uv = vUv;
        vec3 sky = mix(vec3(0.05, 0.05, 0.12), vec3(0.012, 0.012, 0.04), uv.y);
        sky += vec3(0.09, 0.05, 0.08) * smoothstep(0.6, 0.0, uv.y); // sodium haze
        // two rows of building silhouettes
        vec3 col = sky;
        for (int layer = 0; layer < 2; layer++) {
          float f = float(layer);
          float cols = 9.0 + f * 7.0;
          float id = floor(uv.x * cols + f * 3.7);
          float h = 0.25 + hash(vec2(id, f)) * (0.4 - f * 0.15);
          if (uv.y < h) {
            vec2 cell = vec2(uv.x * cols * 6.0, uv.y * 40.0);
            float lit = step(0.72 + f * 0.1, hash(floor(cell) + id));
            float flick = 0.85 + 0.15 * sin(uTime * 0.3 + hash(floor(cell)) * 40.0);
            vec2 inCell = fract(cell);
            float pane = step(0.25, inCell.x) * step(inCell.x, 0.75) *
              step(0.3, inCell.y) * step(inCell.y, 0.8);
            vec3 warm = mix(vec3(1.0, 0.62, 0.3), vec3(0.6, 0.75, 1.0),
              hash(floor(cell) * 1.7));
            col = vec3(0.012, 0.01, 0.025) * (1.0 + f) +
              warm * lit * pane * flick * (0.9 - f * 0.4);
          }
        }
        gl_FragColor = vec4(col * 1.4, 1.0);
      }
    `,
  });
}
