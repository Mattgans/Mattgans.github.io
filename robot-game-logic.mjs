// World coordinates shared by the controls and the Three.js scene.
export const WORKSPACE = { minX: -2.5, maxX: 2.5, minZ: -0.1, maxZ: 1.8 };
export const GRAB_RADIUS = 0.46;
export const DELIVERY_COUNT = 3;
const layouts = [
  { cargo: { x: 1.8, z: 1.1 }, target: { x: -1.8, z: 1 }, radius: 0.58 },
  { cargo: { x: 1.9, z: 0.2 }, target: { x: -1.4, z: 1.55 }, radius: 0.5 },
  { cargo: { x: -2, z: 0.25 }, target: { x: 1.7, z: 1.4 }, radius: 0.43 },
];
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class RobotGame {
  constructor() { this.reset(); }

  reset() {
    this.phase = 'ready';
    this.delivered = 0;
    this.elapsed = 0;
    this.held = false;
    this.hand = { x: 0.7, z: 0.6 };
    this.aim = { ...this.hand };
    this.loadRound();
  }

  loadRound() {
    const layout = layouts[this.delivered];
    this.cargo = { ...layout.cargo };
    this.target = { ...layout.target };
    this.targetRadius = layout.radius;
  }

  start() { this.reset(); this.phase = 'playing'; }

  aimAt(x, z) {
    if (this.phase === 'won') return;
    this.aim.x = clamp(x, WORKSPACE.minX, WORKSPACE.maxX);
    this.aim.z = clamp(z, WORKSPACE.minZ, WORKSPACE.maxZ);
  }

  update(dt, direction = { x: 0, z: 0 }) {
    if (this.phase === 'won') return;
    if (this.phase === 'playing') this.elapsed += dt;
    if (direction.x || direction.z) {
      const length = Math.hypot(direction.x, direction.z);
      this.aimAt(this.hand.x + direction.x / length * 3 * dt,
        this.hand.z + direction.z / length * 3 * dt);
    }
    const gap = distance(this.hand, this.aim);
    const step = Math.min(1, 6 * dt / Math.max(gap, 0.001));
    this.hand.x += (this.aim.x - this.hand.x) * step;
    this.hand.z += (this.aim.z - this.hand.z) * step;
    if (this.held) this.cargo = { ...this.hand };
  }

  get inRange() {
    return this.held
      ? distance(this.hand, this.target) <= this.targetRadius
      : distance(this.hand, this.cargo) <= GRAB_RADIUS;
  }

  grip() {
    if (this.phase !== 'playing') return 'inactive';
    if (!this.held) {
      if (!this.inRange) return 'too-far';
      this.held = true;
      this.cargo = { ...this.hand };
      return 'grabbed';
    }
    const delivered = this.inRange;
    this.held = false;
    this.cargo = { ...this.hand };
    if (!delivered) return 'missed';
    this.delivered += 1;
    if (this.delivered === DELIVERY_COUNT) {
      this.phase = 'won';
      return 'won';
    }
    this.loadRound();
    return 'delivered';
  }
}

// Solve a two-link arm in the vertical plane between its base and wrist.
export function solveArm(hand, wristHeight) {
  const base = { x: 0, y: 0.55, z: -1.05 };
  const upper = 2.25, lower = 2.05;
  const horizontal = Math.hypot(hand.x - base.x, hand.z - base.z);
  const vertical = wristHeight - base.y;
  const reach = clamp(Math.hypot(horizontal, vertical), 0.21, upper + lower - 0.001);
  const shoulder = Math.atan2(vertical, horizontal)
    + Math.acos(clamp((upper ** 2 + reach ** 2 - lower ** 2) / (2 * upper * reach), -1, 1));
  const extension = Math.cos(shoulder) * upper;
  const elbow = {
    x: base.x + (hand.x - base.x) / Math.max(horizontal, 0.001) * extension,
    y: base.y + Math.sin(shoulder) * upper,
    z: base.z + (hand.z - base.z) / Math.max(horizontal, 0.001) * extension,
  };
  return { base, elbow, wrist: { x: hand.x, y: wristHeight, z: hand.z } };
}
