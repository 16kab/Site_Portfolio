import { CapsuleGeometry, Group, Mesh, Vector3 } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { layout } from './layout';
import { paint, palette } from './materials';

/**
 * The sofa the viewer sits on: armrests on the bottom edges of the frame,
 * and the legs, mostly below the field of view (they only rise into view
 * when the viewer is ejected from a project, Phase 2).
 */
export class Sofa {
  readonly group = new Group();
  /** Legs pivot at the hips so they can be lifted later. */
  readonly legs = new Group();

  constructor() {
    const fabric = paint(palette.sofa, { roughness: 1, repeat: 2 });
    const dark = paint(palette.sofaDark, { roughness: 1, repeat: 2 });
    const eye = layout.eye;

    for (const side of [-1, 1]) {
      const arm = new Mesh(
        new RoundedBoxGeometry(0.26, 0.3, 1.0, 4, 0.11),
        fabric,
      );
      arm.position.set(eye.x + side * 0.6, 0.6, eye.z + 0.05);
      arm.castShadow = true;
      arm.receiveShadow = true;
      this.group.add(arm);
    }
    const seat = new Mesh(
      new RoundedBoxGeometry(1.0, 0.18, 0.75, 4, 0.07),
      dark,
    );
    seat.position.set(eye.x, 0.4, eye.z + 0.05);
    seat.receiveShadow = true;
    this.group.add(seat);

    const jeans = paint(palette.jeans, { roughness: 1 });
    const socks = paint('#8a7f6e', { roughness: 1 });
    const hip = new Vector3(eye.x, 0.56, eye.z - 0.05);
    this.legs.position.copy(hip);
    for (const side of [-1, 1]) {
      const thigh = new Mesh(new CapsuleGeometry(0.075, 0.42, 6, 12), jeans);
      thigh.rotation.x = Math.PI / 2 - 0.08;
      thigh.position.set(side * 0.11, 0.02, -0.22);
      const shin = new Mesh(new CapsuleGeometry(0.06, 0.38, 6, 12), jeans);
      shin.position.set(side * 0.12, -0.2, -0.48);
      shin.rotation.x = 0.25;
      const foot = new Mesh(new CapsuleGeometry(0.05, 0.14, 6, 10), socks);
      foot.rotation.x = Math.PI / 2;
      foot.position.set(side * 0.125, -0.46, -0.6);
      for (const mesh of [thigh, shin, foot]) {
        mesh.castShadow = true;
        this.legs.add(mesh);
      }
    }
    this.group.add(this.legs);
  }
}
