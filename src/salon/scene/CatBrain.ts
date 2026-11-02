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
const NODES: Record<NodeId, Vector3> = {
  entryLeft: new Vector3(-2.0, 0, 0.45),
  entryRight: new Vector3(2.0, 0, 0.3),
  left: new Vector3(-0.85, 0, 0.15),
  lamp: new Vector3(-0.85, 0, -0.5),
  front: new Vector3(0.05, 0, -0.68),
  rug: new Vector3(0.75, 0, -0.55),
  right: new Vector3(0.95, 0, 0.15),
  table: new Vector3(-0.02, 0.445, -0.06),
  stand: new Vector3(0.6, layout.tvStandSize.y, -1.18),
};

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
  | { kind: 'jump'; from: Vector3; to: Vector3; time: number; next: NodeId[] }
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
      window.setTimeout(() => this.voice()?.meow(0.7), 1200);
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

  private jump(dt: number): void {
    if (this.mode.kind !== 'jump') return;
    const mode = this.mode;
    const cat = this.cat;
    const crouchTime = 0.28;
    const flight = 0.5;
    mode.time += dt;
    cat.walk(0, dt);

    const dx = mode.to.x - mode.from.x;
    const dz = mode.to.z - mode.from.z;
    const facing = Math.atan2(dx, dz);
    const turn = Math.atan2(
      Math.sin(facing - cat.group.rotation.y),
      Math.cos(facing - cat.group.rotation.y),
    );
    cat.group.rotation.y += MathUtils.clamp(turn, -8 * dt, 8 * dt);

    if (mode.time < crouchTime) {
      cat.target.crouch = 1;
      return;
    }
    const u = Math.min(1, (mode.time - crouchTime) / flight);
    cat.target.crouch = 0;
    const height = Math.abs(mode.to.y - mode.from.y) + 0.16;
    cat.group.position.lerpVectors(mode.from, mode.to, u);
    cat.group.position.y += height * 4 * u * (1 - u);
    const up = mode.to.y > mode.from.y ? 1 : -1;
    cat.jumpPitch = Math.sin(Math.PI * u) * -0.35 * up;
    cat.airborne = Math.sin(Math.PI * u);
    if (u >= 1) {
      cat.jumpPitch = 0;
      cat.airborne = 0;
      cat.pose.crouch = 0.8;
      this.voice()?.land();
      this.at = this.nodeAt(mode.to);
      if (mode.next.length > 0) {
        this.mode = { kind: 'walk', path: mode.next };
      } else {
        this.arrivedAt(this.at);
      }
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
