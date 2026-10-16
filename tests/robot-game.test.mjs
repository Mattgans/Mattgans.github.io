import test from 'node:test';
import assert from 'node:assert/strict';
import { RobotGame, solveArm, WORKSPACE, HEIGHT, CARGO_FLOOR, CARGO_SIZE, STACK_TOLERANCE } from '../robot-game-logic.mjs';

function seededRandom(seed = 42) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
}
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
function travel(game, point) {
  game.aimAt(point.x, point.z);
  for (let step = 0; step < 80; step++) game.update(1 / 60);
}
function pickup(game) {
  travel(game, game.cargo);
  game.adjustHeight(-100);
  assert.equal(game.grip(), 'grabbed');
}
function deliver(game) {
  pickup(game);
  game.adjustHeight(100);
  travel(game, game.target);
  game.adjustHeight(-100);
  return game.grip();
}

test('preview movement leaves the clock and cargo inactive', () => {
  const game = new RobotGame(seededRandom());
  game.aimAt(2, 1);
  game.update(10);
  assert.deepEqual(game.hand, { x: 2, y: HEIGHT.start, z: 1 });
  game.adjustHeight(-100);
  assert.equal(game.hand.y, HEIGHT.start);
  assert.equal(game.elapsed, 0);
  assert.equal(game.grip(), 'inactive');
});

test('random spawns vary across rounds and replays, stay reachable, and avoid targets and previous spawns', () => {
  const game = new RobotGame(seededRandom());
  const positions = new Set();
  let previous = null;
  for (let run = 0; run < 30; run++) {
    game.start();
    for (let round = 0; round < 6; round++) {
      const spawn = { ...game.cargo };
      assert.ok(spawn.x >= -2.25 && spawn.x <= 2.25);
      assert.ok(spawn.z >= 0.1 && spawn.z <= 1.55);
      assert.equal(spawn.y, CARGO_FLOOR);
      assert.ok(distance(spawn, game.target) >= 1.5);
      if (previous) assert.ok(distance(spawn, previous) >= 0.6);
      positions.add(`${spawn.x},${spawn.z}`);
      previous = spawn;
      assert.equal(deliver(game), round < 2 ? 'delivered' : round === 2 ? 'level-four' : round < 5 ? 'stacked' : 'won');
    }
  }
  assert.equal(positions.size, 180);
});

test('a repeating random source cannot hang spawning or create overlapping cargo', () => {
  const game = new RobotGame(() => 0);
  for (let run = 0; run < 5; run++) {
    game.start();
    for (let round = 0; round < 6; round++) {
      assert.ok(distance(game.cargo, game.target) >= 1.5);
      assert.equal(deliver(game), round < 2 ? 'delivered' : round === 2 ? 'level-four' : round < 5 ? 'stacked' : 'won');
    }
  }
});

test('closing the gripper is manual and cannot pick up cargo from above', () => {
  const game = new RobotGame(seededRandom());
  game.start();
  travel(game, game.cargo);
  assert.equal(game.nearCargo, true);
  assert.equal(game.inRange, false);
  assert.equal(game.grip(), 'too-far');
  assert.equal(game.closed, true);
  assert.equal(game.held, false);
  assert.equal(game.grip(), 'opened');
  game.adjustHeight(-100);
  assert.equal(game.inRange, true);
  assert.equal(game.grip(), 'grabbed');
  assert.equal(game.hand.y, HEIGHT.min, 'Grabbing must not automatically lift');
});

test('cargo must be lifted before it can move sideways', () => {
  const game = new RobotGame(seededRandom());
  game.start(); pickup(game);
  const pickupPosition = { ...game.hand };
  game.aimAt(game.target.x, game.target.z);
  game.update(0.2);
  assert.deepEqual(game.hand, pickupPosition);
  game.adjustHeight(100);
  travel(game, game.target);
  assert.ok(distance(game.hand, game.target) < 1e-8);
  assert.ok(game.cargo.y > CARGO_FLOOR);
});

test('missed drops stay recoverable without earning a delivery', () => {
  const game = new RobotGame(seededRandom());
  game.start(); pickup(game);
  game.adjustHeight(100);
  travel(game, { x: 0, z: 0.3 });
  game.adjustHeight(-100);
  assert.equal(game.grip(), 'missed');
  assert.equal(game.cargo.y, CARGO_FLOOR);
  assert.equal(game.delivered, 0);
  assert.equal(game.grip(), 'grabbed');
  game.adjustHeight(100);
  travel(game, game.target);
  game.adjustHeight(-100);
  assert.equal(game.grip(), 'delivered');
});

test('releasing in the air drops cargo under gravity and scores only when it lands', () => {
  const game = new RobotGame(seededRandom());
  game.start(); pickup(game);
  game.adjustHeight(100);
  travel(game, game.target);
  const releaseHeight = game.cargo.y;
  assert.equal(game.grip(), 'released');
  assert.equal(game.held, false);
  assert.equal(game.closed, false);
  assert.equal(game.delivered, 0);
  game.update(0.1);
  assert.ok(game.cargo.y < releaseHeight && game.cargo.y > CARGO_FLOOR);
  assert.equal(game.delivered, 0);
  assert.equal(game.update(1), 'delivered');
  assert.equal(game.delivered, 1);
  assert.equal(game.falling, false);
});

test('three deliveries unlock level four and a three-box stack wins the game', () => {
  const game = new RobotGame(seededRandom());
  game.start();
  const radii = [];
  for (let round = 0; round < 3; round++) {
    radii.push(game.targetRadius);
    assert.equal(deliver(game), round === 2 ? 'level-four' : 'delivered');
  }
  assert.ok(radii[0] > radii[1] && radii[1] > radii[2]);
  assert.equal(game.phase, 'playing');
  assert.equal(game.level, 4);
  assert.equal(game.stacking, true);
  assert.equal(game.stacked.length, 0);
  for (let box = 0; box < 3; box++) {
    assert.equal(deliver(game), box === 2 ? 'won' : 'stacked');
    assert.equal(game.stacked.length, box + 1);
    assert.deepEqual(game.stacked[box], { x: game.target.x, y: CARGO_FLOOR + box * CARGO_SIZE, z: game.target.z });
  }
  assert.equal(game.delivered, 6);
  const finishTime = game.elapsed, finalHand = { ...game.hand };
  game.aimAt(0, 0);
  game.adjustHeight(100);
  game.update(10, { x: 1, z: 1, y: 1 });
  assert.equal(game.elapsed, finishTime);
  assert.deepEqual(game.hand, finalHand);
  assert.equal(game.grip(), 'inactive');
  game.start();
  assert.equal(game.delivered, 0);
  assert.equal(game.elapsed, 0);
  assert.equal(game.held, false);
  assert.equal(game.closed, false);
  assert.equal(game.stacked.length, 0);
  assert.equal(game.level, 1);
  assert.equal(game.hand.y, HEIGHT.start);
});

test('off-center stack placements do not count and can be picked up and corrected', () => {
  const game = new RobotGame(seededRandom());
  game.start();
  for (let round = 0; round < 3; round++) deliver(game);
  deliver(game);
  const firstBox = { ...game.stacked[0] };
  pickup(game);
  game.adjustHeight(100);
  travel(game, { x: game.target.x + STACK_TOLERANCE + 0.08, z: game.target.z });
  game.adjustHeight(-100);
  assert.equal(game.grip(), 'misaligned');
  assert.equal(game.delivered, 4);
  assert.equal(game.stacked.length, 1);
  assert.ok(Math.abs(game.cargo.y - (CARGO_FLOOR + CARGO_SIZE)) < 1e-8);
  assert.equal(game.grip(), 'grabbed');
  game.adjustHeight(100);
  travel(game, game.target);
  game.adjustHeight(-100);
  assert.equal(game.grip(), 'stacked');
  assert.equal(game.stacked.length, 2);
  assert.deepEqual(game.stacked[0], firstBox);
});

test('the existing tower blocks low cargo, supports lowering, and catches an airborne final box', () => {
  const game = new RobotGame(seededRandom());
  game.start();
  for (let box = 0; box < 5; box++) deliver(game);
  assert.equal(game.stacked.length, 2);
  const tower = game.stacked.map(box => ({ ...box }));
  pickup(game);
  game.adjustHeight(HEIGHT.start - HEIGHT.min);
  travel(game, game.target);
  assert.equal(game.movementBlocked, true);
  assert.ok(distance(game.hand, game.target) > 0.1);
  game.adjustHeight(100);
  travel(game, game.target);
  game.adjustHeight(-100);
  assert.ok(Math.abs(game.cargo.y - game.placementHeight) < 1e-8);
  assert.ok(Math.abs(game.hand.y - (game.placementHeight + 0.57)) < 1e-8);
  game.adjustHeight(100);
  assert.equal(game.grip(), 'released');
  assert.equal(game.update(1), 'won');
  assert.equal(game.stacked.length, 3);
  assert.deepEqual(game.stacked.slice(0, 2), tower);
  assert.ok(Math.abs(game.stacked[2].y - (CARGO_FLOOR + CARGO_SIZE * 2)) < 1e-8);
});

test('pointer, keyboard, and height movement stay within the workspace', () => {
  const game = new RobotGame(seededRandom());
  game.start();
  travel(game, { x: 100, z: -100 });
  assert.equal(game.hand.x, WORKSPACE.maxX);
  assert.equal(game.hand.z, WORKSPACE.minZ);
  for (let step = 0; step < 600; step++) game.update(1 / 60, { x: -1, z: 1, y: -1 });
  assert.deepEqual(game.hand, { x: WORKSPACE.minX, y: HEIGHT.min, z: WORKSPACE.maxZ });
  game.update(10, { y: 1 });
  assert.equal(game.hand.y, HEIGHT.max);
});

test('the arm preserves link lengths at every workspace corner and height limit', () => {
  const length = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  for (const x of [-2.5, 0, 2.5]) {
    for (const z of [-0.1, 0.8, 1.8]) {
      for (const height of [HEIGHT.min, HEIGHT.start, HEIGHT.max]) {
        const { base, elbow, wrist } = solveArm({ x, z }, height);
        assert.ok(Math.abs(length(base, elbow) - 2.25) < 1e-8);
        assert.ok(Math.abs(length(elbow, wrist) - 2.05) < 1e-8);
        assert.deepEqual(wrist, { x, y: height, z });
      }
    }
  }
});

test('drop reset opens with a pause, rises before swinging, then settles into a stable neutral pose', () => {
  const game = new RobotGame(seededRandom());
  game.start(); pickup(game);
  game.adjustHeight(100); travel(game, game.target); game.adjustHeight(-100);
  const from = { ...game.hand };
  assert.equal(game.grip(), 'delivered');
  const cargo = { ...game.cargo };
  game.retractHand();
  assert.equal(game.retracting, true);
  game.update(0.1);
  assert.deepEqual(game.hand, from);
  game.update(0.2);
  assert.equal(game.hand.x, from.x);
  assert.equal(game.hand.z, from.z);
  assert.ok(game.hand.y > from.y);
  game.update(0.3);
  assert.ok(Math.abs(game.hand.x - from.x) > 0.1);
  assert.ok(game.hand.y >= HEIGHT.start);
  game.update(0.4);
  assert.equal(game.retracting, false);
  assert.deepEqual(game.hand, { x: 0.45, y: HEIGHT.start, z: 0.25 });
  game.update(0.1);
  assert.deepEqual(game.hand, { x: 0.45, y: HEIGHT.start, z: 0.25 });
  assert.deepEqual(game.cargo, cargo);
});

test('mouse, keyboard, height, and grip actions can interrupt an automatic return', () => {
  for (const input of ['mouse', 'keyboard', 'height', 'grip']) {
    const game = new RobotGame(seededRandom());
    game.start();
    game.retractHand(); game.update(0.2);
    if (input === 'mouse') game.aimAt(2, 1);
    if (input === 'keyboard') game.update(0.1, { x: 1, z: 0 });
    if (input === 'height') game.adjustHeight(0.1);
    if (input === 'grip') game.grip();
    assert.equal(game.retracting, false, input);
  }
  const carrying = new RobotGame(seededRandom());
  carrying.start(); pickup(carrying);
  carrying.retractHand();
  assert.equal(carrying.retracting, false, 'A grab must never automatically lift held cargo');
  assert.equal(carrying.hand.y, HEIGHT.min);
});

test('reset animation does not interrupt falling cargo or disturb a completed tower', () => {
  const game = new RobotGame(seededRandom());
  game.start(); pickup(game);
  game.adjustHeight(100); travel(game, game.target);
  assert.equal(game.grip(), 'released');
  game.retractHand();
  assert.equal(game.update(1), 'delivered');
  assert.equal(game.delivered, 1);
  for (let box = 1; box < 6; box++) deliver(game);
  const tower = game.stacked.map(box => ({ ...box }));
  const finishTime = game.elapsed;
  game.retractHand();
  game.update(0.5);
  assert.equal(game.phase, 'won');
  assert.equal(game.elapsed, finishTime);
  assert.ok(game.hand.y > 1.9, 'Return must lift clear of the completed stack');
  game.update(0.5);
  assert.equal(game.retracting, false);
  assert.deepEqual(game.stacked, tower);
  assert.equal(game.elapsed, finishTime);
});
