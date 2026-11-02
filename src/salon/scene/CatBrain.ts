import { MathUtils, Vector3 } from 'three';
import type { CatVoice } from '../audio/CatVoice';
import type { Cat } from './Cat';
import { layout } from './layout';

const { randFloat } = MathUtils;

type NodeId =
  | 'entryLeft'
  | 'entryRight'
  | 'left'
  | 'lamp'
  | 'front'
  | 'rug'
  | 'right'
  | 'table'
  | 'stand';

/** Waypoints on the floor and on furniture (y = surface height). */
const NODES: Record<NodeId, Vector3> = layout.cat;

/** Walkable links; `jump` ones go up or down a piece of furniture. */
const EDGES: [NodeId, NodeId, boolean][] = [
  ['entryLeft', 'left', false],
  ['left', 'lamp', false],
  ['lamp', 'front', false],
  ['front', 'rug', false],
  ['rug', 'right', false],
  ['right', 'entryRight', false],
  ['front', 'table', true],
  ['rug', 'stand', true],
];

/** Places where the cat settles, with how much it likes each one. */
const SPOTS: { id: NodeId; weight: number }[] = [
  { id: 'table', weight: 0.35 },
  { id: 'lamp', weight: 0.25 },
  { id: 'stand', weight: 0.2 },
  { id: 'rug', weight: 0.2 },
];

type Activity = { pose: 'sit' | 'groom' | 'lie' | 'stand'; duration: number };

type Mode =
  | { kind: 'away'; timer: number }
  | { kind: 'walk'; path: NodeId[] }
  | {
      kind: 'jump';
      from: Vector3;
      to: Vector3;
      time: number;
      next: NodeId[];
      landed: boolean;
    }
  | {
      kind: 'rest';
      spot: NodeId;
      facing: number;
      activities: Activity[];
      timer: number;
    };

function neighbours(id: NodeId): { id: NodeId; jump: boolean }[] {
  const result: { id: NodeId; jump: boolean }[] = [];
  for (const [a, b, jump] of EDGES) {
    if (a === id) result.push({ id: b, jump });
    if (b === id) result.push({ id: a, jump });
  }
  return result;
}

/** Breadth-first search on the tiny waypoint graph. */
function route(from: NodeId, to: NodeId): NodeId[] {
  const previous = new Map<NodeId, NodeId | null>([[from, null]]);
  const queue: NodeId[] = [from];
  while (queue.length > 0) {
    const id = queue.shift() as NodeId;
    if (id === to) break;
    for (const next of neighbours(id)) {
      if (previous.has(next.id)) continue;
      previous.set(next.id, id);
      queue.push(next.id);
    }
  }
  const path: NodeId[] = [];
  for (let id: NodeId | null | undefined = to; id; id = previous.get(id)) {
    path.unshift(id);
  }
  return path;
}

function isJump(a: NodeId, b: NodeId): boolean {
  return EDGES.some(
    ([x, y, jump]) => jump && ((x === a && y === b) || (x === b && y === a)),
  );
}

function pick<T extends { weight: number }>(items: T[]): T {
  let r = Math.random() * items.reduce((sum, item) => sum + item.weight, 0);
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

/**
 * What the cat does (CLAUDE.md §4.8): it shows up from time to time, walks
 * around the coffee table, jumps on the table or the TV stand, sits, grooms,
 * lies down and purrs, then leaves. On the table it sits facing the TV, its
 * silhouette cut out against the screen. Stare at it for a couple of
 * seconds and it turns its head to you, slow-blinks, and may meow.
 */
export class CatBrain {
  private mode: Mode = { kind: 'away', timer: randFloat(9, 14) };
  private at: NodeId = 'entryLeft';
  private stareTime = 0;
  private meowedAtViewer = false;
  private glanceTimer = 3;
  private glance: Vector3 | null = null;

  // scratch
  private readonly toCat = new Vector3();
  private readonly jumpLook = new Vector3();

  constructor(
    private readonly cat: Cat,
    private readonly voice: () => CatVoice | null,
    private readonly screen: Vector3,
  ) {
    cat.group.visible = false;
  }

  /**
   * @param eye viewer head position
   * @param forward viewer gaze direction (normalised)
   */
  update(dt: number, glow: number, eye: Vector3, forward: Vector3): void {
    const cat = this.cat;
    switch (this.mode.kind) {
      case 'away':
        this.mode.timer -= dt;
        if (this.mode.timer <= 0) this.arrive();
        break;
      case 'walk':
        this.walk(dt);
        break;
      case 'jump':
        this.jump(dt);
        break;
      case 'rest':
        this.rest(dt);
        break;
    }
    if (!cat.group.visible) return;

    this.watchViewer(dt, eye, forward);
    cat.update(dt, glow);
    this.voice()?.follow(cat.headPosition);
  }

  private arrive(): void {
    const fromLeft = Math.random() < 0.5;
    this.at = fromLeft ? 'entryLeft' : 'entryRight';
    const cat = this.cat;
    cat.group.position.copy(NODES[this.at]);
    cat.group.rotation.y = fromLeft ? Math.PI / 2 : -Math.PI / 2;
    cat.group.visible = true;
    cat.target.sit = 0;
    cat.target.lie = 0;
    cat.target.groom = 0;
    this.meowedAtViewer = false;
    this.goTo(pick(SPOTS).id);
    if (Math.random() < 0.35) {
      window.setTimeout(() => this.voice()?.trill(), 1200);
    }
  }

  private goTo(id: NodeId): void {
    const path = route(this.at, id);
    path.shift();
    this.mode = { kind: 'walk', path };
  }

  private leave(): void {
    const left = route(this.at, 'entryLeft').length;
    const right = route(this.at, 'entryRight').length;
    this.goTo(left <= right ? 'entryLeft' : 'entryRight');
  }

  private walk(dt: number): void {
    if (this.mode.kind !== 'walk') return;
    const { path } = this.mode;
    const next = path[0];
    if (!next) {
      this.arrivedAt(this.at);
      return;
    }
    const cat = this.cat;
    const target = NODES[next];
    if (isJump(this.at, next)) {
      this.mode = {
        kind: 'jump',
        from: cat.group.position.clone(),
        to: target.clone(),
        time: 0,
        next: path.slice(1),
        landed: false,
      };
      return;
    }

    const position = cat.group.position;
    const dx = target.x - position.x;
    const dz = target.z - position.z;
    const distance = Math.hypot(dx, dz);
    if (distance < 0.04) {
      this.at = next;
      path.shift();
      if (path.length === 0) this.arrivedAt(next);
      return;
    }
    // turn toward the waypoint, slow down while turning
    const desired = Math.atan2(dx, dz);
    const diff = Math.atan2(
      Math.sin(desired - cat.group.rotation.y),
      Math.cos(desired - cat.group.rotation.y),
    );
    cat.group.rotation.y += MathUtils.clamp(diff, -4 * dt, 4 * dt);
    const speed = 0.3 * MathUtils.clamp(1 - Math.abs(diff) / 1.4, 0.15, 1);
    const step = Math.min(distance, speed * dt);
    position.x += Math.sin(cat.group.rotation.y) * step;
    position.z += Math.cos(cat.group.rotation.y) * step;
    cat.walk(step, dt);
  }

  /**
   * A cat jump in four beats: it eyes the target and crouches (a little
   * hips wiggle before jumping up, a peek over the edge before jumping
   * down), pushes off, flies along a ballistic arc with the body following
   * the trajectory, then lands front paws first and absorbs.
   */
  private jump(dt: number): void {
    if (this.mode.kind !== 'jump') return;
    const mode = this.mode;
    const cat = this.cat;
    const { from, to } = mode;
    const up = to.y > from.y + 0.05;
    const down = to.y < from.y - 0.05;
    const horizontal = Math.hypot(to.x - from.x, to.z - from.z);
    const crouchTime = up ? 0.75 : down ? 0.55 : 0.35;
    const flight = 0.3 + horizontal * 0.3;
    const landing = 0.35;
    mode.time += dt;
    cat.walk(0, dt);
    this.jumpLook.copy(to);
    this.jumpLook.y += 0.05;

    const facing = Math.atan2(to.x - from.x, to.z - from.z);
    const turn = Math.atan2(
      Math.sin(facing - cat.group.rotation.y),
      Math.cos(facing - cat.group.rotation.y),
    );
    cat.group.rotation.y += MathUtils.clamp(turn, -6 * dt, 6 * dt);

    // 1. eye the target, crouch, wiggle
    if (mode.time < crouchTime) {
      const k = mode.time / crouchTime;
      cat.target.crouch = 1;
      cat.wiggle = up ? Math.sin(Math.PI * k) : 0;
      cat.jumpPitch = up ? -0.12 * k : down ? 0.3 * k : 0;
      return;
    }
    cat.wiggle = 0;

    // 2-3. push off and fly: quadratic arc whose apex sits above the
    // higher end, body pitched along the velocity
    const u = Math.min(1, (mode.time - crouchTime) / flight);
    if (u < 1) {
      cat.target.crouch = 0;
      cat.pose.crouch *= 0.6;
      const apex = Math.max(from.y, to.y) + (up ? 0.12 : 0.07);
      const along = u * u * (3 - 2 * u) * 0.35 + u * 0.65;
      cat.group.position.x = MathUtils.lerp(from.x, to.x, along);
      cat.group.position.z = MathUtils.lerp(from.z, to.z, along);
      cat.group.position.y =
        (1 - u) * (1 - u) * from.y + 2 * u * (1 - u) * apex + u * u * to.y;
      const vertical = 2 * (1 - u) * (apex - from.y) + 2 * u * (to.y - apex);
      cat.jumpPitch = MathUtils.clamp(
        -Math.atan2(vertical, Math.max(horizontal, 0.05)) * 0.7,
        -0.8,
        0.8,
      );
      cat.jumpProgress = u;
      cat.airborne =
        Math.min(1, u / 0.12) * (1 - MathUtils.smoothstep(u, 0.82, 1));
      if (!mode.landed && u > 0.97) {
        mode.landed = true;
        this.voice()?.land();
      }
      return;
    }

    // 4. land on the front paws, absorb, straighten up
    if (!mode.landed) {
      mode.landed = true;
      this.voice()?.land();
    }
    cat.group.position.copy(to);
    cat.airborne = 0;
    cat.jumpProgress = 0;
    const k = (mode.time - crouchTime - flight) / landing;
    cat.target.crouch = k < 0.35 ? 0.9 : 0;
    cat.jumpPitch = 0.22 * (1 - Math.min(1, k)) ** 2;
    if (k < 1) return;
    cat.jumpPitch = 0;
    this.at = this.nodeAt(to);
    if (mode.next.length > 0) {
      this.mode = { kind: 'walk', path: mode.next };
    } else {
      this.arrivedAt(this.at);
    }
  }

  private nodeAt(position: Vector3): NodeId {
    let best: NodeId = 'front';
    let distance = Number.POSITIVE_INFINITY;
    for (const [id, node] of Object.entries(NODES) as [NodeId, Vector3][]) {
      const d = node.distanceTo(position);
      if (d < distance) {
        distance = d;
        best = id;
      }
    }
    return best;
  }

  private arrivedAt(id: NodeId): void {
    if (id === 'entryLeft' || id === 'entryRight') {
      this.cat.group.visible = false;
      this.voice()?.purr(false);
      this.mode = { kind: 'away', timer: randFloat(30, 75) };
      return;
    }
    const cat = this.cat;
    // where to face: the TV from the table, the viewer elsewhere (mostly)
    const toward =
      id === 'table' && Math.random() < 0.75
        ? this.screen
        : Math.random() < 0.6
          ? layout.eye
          : this.screen;
    const facing = Math.atan2(
      toward.x - cat.group.position.x,
      toward.z - cat.group.position.z,
    );
    const activities: Activity[] = [{ pose: 'sit', duration: randFloat(3, 7) }];
    if (Math.random() < 0.55)
      activities.push({ pose: 'groom', duration: randFloat(3, 6) });
    if (Math.random() < 0.65) {
      activities.push({ pose: 'lie', duration: randFloat(14, 32) });
      activities.push({ pose: 'sit', duration: randFloat(1.5, 3) });
    }
    activities.push({ pose: 'stand', duration: 0.6 });
    this.mode = { kind: 'rest', spot: id, facing, activities, timer: 0 };
  }

  private rest(dt: number): void {
    if (this.mode.kind !== 'rest') return;
    const mode = this.mode;
    const cat = this.cat;
    cat.walk(0, dt);
    const diff = Math.atan2(
      Math.sin(mode.facing - cat.group.rotation.y),
      Math.cos(mode.facing - cat.group.rotation.y),
    );
    // turn on the spot first (small steps), then settle
    if (Math.abs(diff) > 0.08 && mode.timer === 0) {
      cat.group.rotation.y += MathUtils.clamp(diff, -2.5 * dt, 2.5 * dt);
      cat.walk(0.12 * dt, dt);
      return;
    }
    const activity = mode.activities[0];
    if (!activity) {
      this.voice()?.purr(false);
      if (Math.random() < 0.4) {
        const others = SPOTS.filter((spot) => spot.id !== mode.spot);
        this.goTo(pick(others).id);
      } else {
        this.leave();
      }
      return;
    }
    mode.timer += dt;
    cat.target.sit =
      activity.pose === 'sit' || activity.pose === 'groom' ? 1 : 0;
    cat.target.groom = activity.pose === 'groom' ? 1 : 0;
    cat.target.lie = activity.pose === 'lie' ? 1 : 0;
    this.voice()?.purr(activity.pose === 'lie');
    if (mode.timer >= activity.duration) {
      mode.activities.shift();
      mode.timer = 0.0001;
    }
  }

  /** Easter egg: stare at the cat and it notices you. */
  private watchViewer(dt: number, eye: Vector3, forward: Vector3): void {
    const cat = this.cat;
    if (this.mode.kind === 'jump') {
      cat.lookTarget = this.jumpLook;
      cat.slowBlink = false;
      return;
    }
    this.toCat.subVectors(cat.headPosition, eye);
    const distance = this.toCat.length();
    const angle = this.toCat.angleTo(forward);
    const staring = angle < 0.16 + 0.1 / Math.max(distance, 0.5);
    this.stareTime = staring
      ? this.stareTime + dt
      : Math.max(0, this.stareTime - dt * 2);

    const resting = this.mode.kind === 'rest';
    if (this.stareTime > 1.8 && resting) {
      cat.lookTarget = eye;
      cat.slowBlink = true;
      if (!this.meowedAtViewer && this.stareTime > 3) {
        this.meowedAtViewer = true;
        if (Math.random() < 0.75) this.voice()?.meow(0.9);
      }
      return;
    }
    cat.slowBlink = false;
    // otherwise: glance around now and then (the TV, the viewer, the window)
    this.glanceTimer -= dt;
    if (this.glanceTimer <= 0) {
      const options = [null, this.screen, eye, NODES.entryRight];
      this.glance = resting
        ? options[Math.floor(Math.random() * options.length)]
        : null;
      this.glanceTimer = randFloat(2, 6);
    }
    cat.lookTarget = this.glance;
  }
}
