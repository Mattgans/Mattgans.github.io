// World coordinates shared by the controls and the Three.js scene.
export const WORKSPACE = { minX: -2.5, maxX: 2.5, minZ: -0.1, maxZ: 1.8 };
export const GRAB_RADIUS = 0.46;
export const DELIVERY_COUNT = 3;
export const LEVEL_COUNT = 4;
export const STACK_COUNT = 3;
export const CARGO_SIZE = 0.48;
export const STACK_TOLERANCE = 0.16;
export const HEIGHT = { min: 0.84, max: 2.4, start: 1.55, grabMax: 0.99, clearance: 1.18, speed: 1.2 };
export const CARGO_FLOOR = 0.27;
const GRIP_OFFSET = 0.57;
const targets = [
  { x: -1.8, z: 1, radius: 0.58 },
  { x: -1.4, z: 1.55, radius: 0.5 },
  { x: 1.7, z: 1.4, radius: 0.43 },
  { x: -0.9, z: 1.1, radius: 0.55 },
];
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class RobotGame {
  constructor(random = Math.random) {
    this.random = random;
    this.lastSpawn = null;
    this.reset();
  }

  reset() {
    this.phase = 'ready';
    this.delivered = 0;
    this.stacked = [];
    this.carryHeight = HEIGHT.clearance;
    this.movementBlocked = false;
    this.retraction = null;
    this.elapsed = 0;
    this.held = false;
    this.closed = false;
    this.falling = false;
    this.fallVelocity = 0;
    this.hand = { x: 0.7, y: HEIGHT.start, z: 0.6 };
    this.aim = { x: this.hand.x, z: this.hand.z };
    this.loadRound();
  }

  loadRound() {
    const layout = targets[Math.min(this.delivered, DELIVERY_COUNT)];
    this.target = { x: layout.x, z: layout.z };
    this.targetRadius = layout.radius;
    const valid = point => distance(point, this.target) >= 1.5
      && (!this.lastSpawn || distance(point, this.lastSpawn) >= 0.6);
    let spawn;
    for (let attempt = 0; attempt < 32; attempt++) {
      const candidate = { x: -2.25 + this.random() * 4.5, z: 0.1 + this.random() * 1.45 };
      if (valid(candidate)) { spawn = candidate; break; }
    }
    // Keep spawning safe and bounded even if a supplied random source repeats.
    spawn ??= [{ x: -2.25, z: 0.1 }, { x: 2.25, z: 0.1 },
      { x: -2.25, z: 1.55 }, { x: 2.25, z: 1.55 }].find(valid);
    this.lastSpawn = { ...spawn };
    this.cargo = { ...spawn, y: CARGO_FLOOR };
    this.falling = false;
    this.fallVelocity = 0;
  }

  start() { this.reset(); this.phase = 'playing'; }

  get level() { return Math.min(this.delivered + 1, LEVEL_COUNT); }
  get stacking() { return this.delivered >= DELIVERY_COUNT; }
  get placementHeight() { return CARGO_FLOOR + this.stacked.length * CARGO_SIZE; }
  get retracting() { return this.retraction !== null; }

  retractHand() {
    if (this.held || this.phase === 'ready' || this.retraction) return;
    const clearHeight = Math.min(HEIGHT.max,
      Math.max(HEIGHT.start, this.hand.y, CARGO_FLOOR + this.stacked.length * CARGO_SIZE + 0.65));
    this.retraction = { elapsed: 0, from: { ...this.hand }, clearHeight };
    this.aim = { x: this.hand.x, z: this.hand.z };
    this.movementBlocked = false;
  }

  cancelRetraction() {
    if (!this.retraction) return;
    this.retraction = null;
    this.aim = { x: this.hand.x, z: this.hand.z };
  }

  advanceRetraction(dt) {
    const motion = this.retraction;
    motion.elapsed += dt;
    const smooth = value => {
      const t = clamp(value, 0, 1);
      return t * t * t * (t * (t * 6 - 15) + 10);
    };
    const mix = (a, b, t) => a + (b - a) * t;
    const home = { x: 0.45, y: HEIGHT.start, z: 0.25 };
    // Open first, lift clear of the cargo, swing back, then settle into idle.
    const lift = smooth((motion.elapsed - 0.12) / 0.26);
    const swing = smooth((motion.elapsed - 0.38) / 0.4);
    const settle = smooth((motion.elapsed - 0.78) / 0.22);
    this.hand.x = mix(motion.from.x, home.x, swing);
    this.hand.z = mix(motion.from.z, home.z, swing);
    this.hand.y = mix(mix(motion.from.y, motion.clearHeight, lift), home.y, settle);
    this.aim = { x: this.hand.x, z: this.hand.z };
    if (motion.elapsed >= 1) {
      this.hand = home;
      this.aim = { x: home.x, z: home.z };
      this.retraction = null;
    }
  }

  landingHeight(point) {
    let height = CARGO_FLOOR;
    for (const box of this.stacked) {
      if (Math.abs(point.x - box.x) < CARGO_SIZE && Math.abs(point.z - box.z) < CARGO_SIZE) {
        height = Math.max(height, box.y + CARGO_SIZE);
      }
    }
    return height;
  }

  aimAt(x, z) {
    if (this.phase === 'won') return;
    this.retraction = null;
    this.aim.x = clamp(x, WORKSPACE.minX, WORKSPACE.maxX);
    this.aim.z = clamp(z, WORKSPACE.minZ, WORKSPACE.maxZ);
  }

  adjustHeight(amount) {
    if (this.phase !== 'playing') return;
    if (amount !== 0) this.cancelRetraction();
    const minimum = this.held ? this.landingHeight(this.hand) + GRIP_OFFSET : HEIGHT.min;
    this.hand.y = clamp(this.hand.y + amount, minimum, HEIGHT.max);
    if (this.held) this.followHand();
  }

  followHand() {
    this.cargo = { x: this.hand.x, y: Math.max(CARGO_FLOOR, this.hand.y - GRIP_OFFSET), z: this.hand.z };
  }

  update(dt, direction = { x: 0, z: 0 }) {
    if (this.phase === 'won') {
      if (this.retracting) this.advanceRetraction(dt);
      return;
    }
    if (this.phase === 'playing') this.elapsed += dt;
    const returning = this.retracting && !direction.x && !direction.z && !direction.y;
    if (returning) this.advanceRetraction(dt);
    else {
      this.adjustHeight((direction.y || 0) * HEIGHT.speed * dt);
      if (direction.x || direction.z) {
        const length = Math.hypot(direction.x, direction.z);
        this.aimAt(this.hand.x + direction.x / length * 3 * dt,
          this.hand.z + direction.z / length * 3 * dt);
      }
      const gap = distance(this.hand, this.aim);
      const step = Math.min(1, 6 * dt / Math.max(gap, 0.001));
      const next = { x: this.hand.x + (this.aim.x - this.hand.x) * step,
        z: this.hand.z + (this.aim.z - this.hand.z) * step };
      // Prevent a carried cube from passing sideways through the existing stack.
      // Check the path as well as its endpoint, including on slow frames.
      const samples = Math.max(1, Math.ceil(distance(this.hand, next) / 0.1));
      this.movementBlocked = this.held && this.hand.y < this.carryHeight;
      for (let sample = 1; sample <= samples; sample++) {
        if (this.movementBlocked) break;
        const point = { x: this.hand.x + (next.x - this.hand.x) * sample / samples,
          z: this.hand.z + (next.z - this.hand.z) * sample / samples };
        if (this.held && this.hand.y - GRIP_OFFSET < this.landingHeight(point) - 0.00001) {
          this.movementBlocked = true;
        }
      }
      if (!this.movementBlocked) {
        this.hand.x = next.x;
        this.hand.z = next.z;
      }
    }
    if (this.held) this.followHand();
    else if (this.falling) {
      this.cargo.y += this.fallVelocity * dt - 3 * dt * dt;
      this.fallVelocity -= 6 * dt;
      const landingHeight = this.landingHeight(this.cargo);
      if (this.cargo.y <= landingHeight) {
        this.cargo.y = landingHeight;
        this.falling = false;
        return this.settleCargo();
      }
    }
  }

  get nearCargo() { return distance(this.hand, this.cargo) <= GRAB_RADIUS; }
  get overTarget() { return distance(this.hand, this.target) <= this.targetRadius; }
  get aligned() { return distance(this.hand, this.target) <= (this.stacking ? STACK_TOLERANCE : this.targetRadius); }
  get inRange() {
    return this.held
      ? this.aligned && Math.abs(this.cargo.y - this.placementHeight) <= 0.15
      : this.nearCargo && Math.abs(this.hand.y - GRIP_OFFSET - this.cargo.y) <= 0.15;
  }

  settleCargo() {
    if (distance(this.cargo, this.target) > this.targetRadius) return 'missed';
    if (this.stacking) {
      if (distance(this.cargo, this.target) > STACK_TOLERANCE
        || Math.abs(this.cargo.y - this.placementHeight) > 0.001) return 'misaligned';
      // A valid centered placement settles into a stable stack.
      this.stacked.push({ x: this.target.x, y: this.placementHeight, z: this.target.z });
      this.delivered += 1;
      if (this.stacked.length === STACK_COUNT) {
        this.phase = 'won';
        return 'won';
      }
      this.loadRound();
      return 'stacked';
    }
    this.delivered += 1;
    this.loadRound();
    return this.stacking ? 'level-four' : 'delivered';
  }

  grip() {
    if (this.phase !== 'playing') return 'inactive';
    this.cancelRetraction();
    if (!this.closed) {
      this.closed = true;
      if (!this.inRange) return 'too-far';
      this.held = true;
      this.carryHeight = Math.max(HEIGHT.clearance, this.cargo.y + GRIP_OFFSET + 0.34);
      this.falling = false;
      this.fallVelocity = 0;
      this.followHand();
      return 'grabbed';
    }
    this.closed = false;
    if (!this.held) return 'opened';
    this.held = false;
    this.falling = this.cargo.y > this.landingHeight(this.cargo) + 0.001;
    this.fallVelocity = 0;
    return this.falling ? 'released' : this.settleCargo();
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
