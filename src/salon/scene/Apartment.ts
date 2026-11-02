import { Box3, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { config } from '../config';

/**
 * A downloaded apartment (glTF, CC BY, see ATTRIBUTIONS.md) replacing the
 * room built in code: our TV, sofa, hand, lamp, cat and lights go inside it.
 *
 * Its colour textures were painted beforehand (scripts/build-apartment.mjs
 * bakes a Kuwahara filter into them), so the paint lives in the material
 * and the real lights of the room do the rest, like everything else here.
 */
export class Apartment {
  readonly group = new Group();
  loaded = false;
  /** Size of the model as loaded, before our transform (debug). */
  readonly size = new Vector3();

  /** Resolves false when the model is missing or broken (room stays). */
  async load(): Promise<boolean> {
    const settings = config.apartment;
    if (!settings.enabled) return false;
    try {
      const gltf = await new GLTFLoader().loadAsync(settings.url);
      const lights: { removeFromParent(): void }[] = [];
      gltf.scene.traverse((object) => {
        // the model's own lights would fight ours
        if ('isLight' in object && object.isLight) lights.push(object);
        if (!(object instanceof Mesh)) return;
        object.castShadow = true;
        object.receiveShadow = true;
        const material = object.material;
        if (material instanceof MeshStandardMaterial) {
          // painted surfaces are matte; no plastic sheen from the TV
          material.roughness = Math.max(material.roughness, 0.6);
        }
      });
      for (const light of lights) light.removeFromParent();
      for (const name of settings.hide) {
        gltf.scene.getObjectByName(name)?.removeFromParent();
      }
      new Box3().setFromObject(gltf.scene).getSize(this.size);
      this.group.add(gltf.scene);
      this.applyTransform();
      this.loaded = true;
      return true;
    } catch (error) {
      console.info(
        '[salon] apartment not loaded, keeping the code room',
        error,
      );
      return false;
    }
  }

  /** Places the model around the viewer (tuned in the dev panel). */
  applyTransform(): void {
    const { position, rotationY, scale } = config.apartment;
    this.group.position.set(position[0], position[1], position[2]);
    this.group.rotation.y = (rotationY * Math.PI) / 180;
    this.group.scale.setScalar(scale);
  }
}
