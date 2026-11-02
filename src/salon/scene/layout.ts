import { Vector3 } from 'three';
import { config } from '../config';

/**
 * Where everything sits in the room, in metres. The viewer sits on the sofa
 * looking toward -Z; +X is to their right.
 *
 * Modules read these values when they are built, and keep references to the
 * vectors: `applyApartmentLayout()` rewrites them in place, before the scene
 * is built, when the downloaded apartment replaces the code room.
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
  clock: new Vector3(-0.45, 1.72, -1.7),
  fridge: new Vector3(2.2, 0.9, 2.4),
  /** The street behind the window: moonlight, car headlights, city sound. */
  street: {
    light: new Vector3(3.5, 2.4, -0.35),
    target: new Vector3(0.8, 0.5, -1.1),
    headlight: new Vector3(3.1, 0.9, -0.35),
    shaftFrom: new Vector3(2.35, 1.75, -0.35),
    shaftTo: new Vector3(0.35, 0, 0.05),
    sound: new Vector3(2.6, 1.5, -0.35),
    siren: new Vector3(27.3, 4, -20.35),
    city: new Vector3(5.3, 1.6, -0.35),
    cityTurn: -Math.PI / 2,
  },
  /** Cat waypoints on the floor and on furniture (y = surface height). */
  cat: {
    entryLeft: new Vector3(-2.0, 0, 0.45),
    entryRight: new Vector3(2.0, 0, 0.3),
    left: new Vector3(-0.85, 0, 0.15),
    lamp: new Vector3(-0.85, 0, -0.5),
    front: new Vector3(0.05, 0, -0.68),
    rug: new Vector3(0.75, 0, -0.55),
    right: new Vector3(0.95, 0, 0.15),
    table: new Vector3(-0.02, 0.445, -0.06),
    stand: new Vector3(0.6, 0.48, -1.18),
  },
};

/**
 * "An Old Cheap Room in Chinatown" (scene/Apartment.ts), turned so that the
 * desk under its window faces the sofa: the TV stands on the desk, the bed
 * is on the left, the bathroom on the right, the kitchen behind.
 */
export function applyApartmentLayout(): void {
  Object.assign(layout.room, {
    minX: -2.65,
    maxX: 5.34,
    minZ: -1.69,
    maxZ: 4.78,
    height: 2.86,
  });
  layout.tv.set(0, 0.82, -1.15);
  layout.tvStand.set(0, 0, -1.2);
  layout.tvStandSize.y = 0.82;
  // the TV is at eye level now: look straight rather than down
  config.head.restPitch = 2;
  // away from the wall, or it burns the posters white
  layout.lamp.set(-0.85, 0, -0.75);
  layout.clock.set(1.89, 2.16, -1.65);
  layout.fridge.set(3.7, 0.9, 4.2);
  const street = layout.street;
  street.light.set(0.3, 2.3, -2.9);
  street.target.set(0.4, 0, 0.4);
  street.headlight.set(0.3, 0.9, -2.6);
  street.shaftFrom.set(0.75, 1.85, -1.72);
  street.shaftTo.set(0.95, 0, -0.1);
  street.sound.set(0.25, 1.5, -2);
  street.siren.set(-6, 4, -30);
  street.city.set(0.25, 1.6, -4.5);
  street.cityTurn = 0;
  const cat = layout.cat;
  cat.entryLeft.set(-1, 0, 1.6);
  cat.entryRight.set(1.6, 0, 1.4);
  cat.left.set(-0.8, 0, 0.3);
  cat.lamp.set(-0.45, 0, -0.45);
  cat.front.set(0.05, 0, -0.6);
  cat.rug.set(1.6, 0, -0.45);
  cat.right.set(0.95, 0, 0.15);
  // on top of the chest of drawers, right of the desk
  cat.stand.set(1.9, 0.91, -1.25);
}
