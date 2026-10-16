import test from 'node:test';
import assert from 'node:assert/strict';
import { RobotGame, solveArm, WORKSPACE } from '../robot-game-logic.mjs';

function travel(game, point) {
  game.aimAt(point.x, point.z);
  for (let step = 0; step < 80; step++) game.update(1 / 60);
}

test('the arm follows before a run without starting the timer or allowing grabs', () => {
  const game = new RobotGame();
  game.aimAt(2, 1);
  game.update(10);
  assert.deepEqual(game.hand, { x: 2, z: 1 });
  assert.equal(game.phase, 'ready');
  assert.equal(game.delivered, 0);
  assert.equal(game.elapsed, 0);
  assert.equal(game.grip(), 'inactive');
  game.start();
  assert.equal(game.grip(), 'too-far');
  assert.equal(game.delivered, 0);
});

test('missed cargo remains recoverable without earning a delivery', () => {
  const game = new RobotGame();
  game.start();
  travel(game, game.cargo);
  assert.equal(game.grip(), 'grabbed');
  travel(game, { x: 0, z: 0.3 });
  assert.equal(game.grip(), 'missed');
  assert.deepEqual(game.cargo, game.hand);
  assert.equal(game.delivered, 0);
  assert.equal(game.grip(), 'grabbed');
  travel(game, game.target);
  assert.equal(game.grip(), 'delivered');
  assert.equal(game.delivered, 1);
});

test('three deliveries win, tighten the target, stop the clock, and allow a clean restart', () => {
  const game = new RobotGame();
  game.start();
  const radii = [];
  for (let round = 0; round < 3; round++) {
    radii.push(game.targetRadius);
    travel(game, game.cargo);
    assert.equal(game.grip(), 'grabbed');
    travel(game, game.target);
    assert.equal(game.grip(), round === 2 ? 'won' : 'delivered');
  }
  assert.ok(radii[0] > radii[1] && radii[1] > radii[2]);
  assert.equal(game.phase, 'won');
  const finishTime = game.elapsed;
  game.update(10);
  assert.equal(game.elapsed, finishTime);
  const finalHand = { ...game.hand };
  game.aimAt(0, 0);
  game.update(10);
  assert.deepEqual(game.hand, finalHand);
  assert.equal(game.grip(), 'inactive');
  game.start();
  assert.equal(game.delivered, 0);
  assert.equal(game.elapsed, 0);
  assert.equal(game.held, false);
  assert.equal(game.targetRadius, radii[0]);
});

test('pointer and keyboard movement stay inside the reachable workspace', () => {
  const game = new RobotGame();
  game.start();
  travel(game, { x: 100, z: -100 });
  assert.deepEqual(game.hand, { x: WORKSPACE.maxX, z: WORKSPACE.minZ });
  for (let step = 0; step < 600; step++) game.update(1 / 60, { x: -1, z: 1 });
  assert.deepEqual(game.hand, { x: WORKSPACE.minX, z: WORKSPACE.maxZ });
});

test('arm links keep their physical length across the full workspace and both grip heights', () => {
  const length = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  for (const x of [-2.5, 0, 2.5]) {
    for (const z of [-0.1, 0.8, 1.8]) {
      for (const height of [0.92, 1.75]) {
        const { base, elbow, wrist } = solveArm({ x, z }, height);
        assert.ok(Math.abs(length(base, elbow) - 2.25) < 1e-8);
        assert.ok(Math.abs(length(elbow, wrist) - 2.05) < 1e-8);
        assert.deepEqual(wrist, { x, y: height, z });
      }
    }
  }
});
