import { Vector3 } from 'three';

/**
 * Where everything sits in the room, in metres. The viewer sits on the sofa
 * looking toward -Z; +X is to their right.
 */
export const layout = {
  room: { minX: -2.3, maxX: 2.3, minZ: -1.7, maxZ: 2.2, height: 2.6 },
  eye: new Vector3(0.1, 1.08, 1.12),
  tvStand: new Vector3(0, 0, -1.25),
  tvStandSize: new Vector3(1.5, 0.48, 0.5),
  tv: new Vector3(0, 0.48, -1.2),
  lamp: new Vector3(-1.2, 0, -0.95),
  window: { z: -0.35, width: 1.7, bottom: 0.85, top: 2.25 },
  coffeeTable: new Vector3(0.05, 0, 0.0),
  plant: new Vector3(1.35, 0, -1.3),
};
