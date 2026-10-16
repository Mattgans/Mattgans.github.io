import { RobotGame, solveArm, LEVEL_COUNT, STACK_COUNT, CARGO_SIZE, HEIGHT } from './robot-game-logic.mjs?v=reset-motion-1';

const root = document.getElementById('robot-game');
const stage = root.querySelector('.robot-game-stage');
const canvas = root.querySelector('canvas');
const overlay = root.querySelector('.robot-game-overlay');
const gripButton = root.querySelector('[data-game-grip]');
const resetButton = root.querySelector('[data-game-reset]');
const liftButtons = root.querySelectorAll('[data-game-lift]');
const heightText = root.querySelector('[data-game-height]');
const heightMeter = root.querySelector('[data-game-height-meter]');
const message = root.querySelector('[data-game-message]');
const score = root.querySelector('[data-game-score]');
const objective = root.querySelector('[data-game-objective]');
const timer = root.querySelector('[data-game-time]');
const range = root.querySelector('[data-game-range]');
const bestLabel = root.querySelector('[data-game-best]');
const controlPicker = root.querySelector('.robot-game-controls');
const controlButtons = controlPicker.querySelectorAll('[data-game-control]');
const help = root.querySelector('.robot-game-help');
const controlModes = {
  mouse: {
    running: 'Aim over the blue cube, lower the gripper, then grab. Lift before moving.',
    help: 'Mouse / drag: aim · Wheel or Q/E: lift / lower · Space: open / close',
  },
  keyboard: {
    running: 'Use arrows / WASD to aim, E to lower, and Space to grab. Q lifts the cargo.',
    help: 'Arrows / WASD: aim · Q: lift · E: lower · Space / Enter: open / close',
  },
};
let controlMode = 'mouse';
function showControlInstructions() {
  root.dataset.controls = controlMode;
  help.textContent = game.phase === 'ready' ? 'Choose your controls to begin.' : controlModes[controlMode].help;
  if (game.phase === 'ready') {
    message.textContent = 'Choose Mouse or Keyboard on the board to start. There’s no time limit.';
  } else if (game.phase === 'playing') {
    message.textContent = controlModes[controlMode].running;
  }
}
const game = new RobotGame();
const keys = new Set();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let liftInput = 0;
let best = null;
try {
  const saved = Number(localStorage.getItem('robot-lab-best-stack-v3'));
  if (Number.isFinite(saved) && saved > 0) best = saved;
} catch { /* Private browsing may disable storage. */ }
const formatTime = value => `${value.toFixed(1)}s`;
bestLabel.textContent = best ? `BEST ${formatTime(best)}` : '4 LEVELS / NO TIME LIMIT';

function unavailable() {
  root.dataset.state = 'unavailable';
  overlay.hidden = false;
  root.querySelector('[data-game-overlay-title]').textContent = 'The robot is taking a break.';
  root.querySelector('[data-game-overlay-copy]').textContent = 'The 3D game needs WebGL 2. Try a browser with hardware acceleration enabled.';
  controlPicker.hidden = true;
  gripButton.disabled = true;
  resetButton.disabled = true;
  liftButtons.forEach(button => { button.disabled = true; });
  controlButtons.forEach(button => { button.disabled = true; });
  range.textContent = 'OFFLINE';
  message.textContent = 'You can still explore all of my work below.';
}

async function init() {
  const THREE = await import('./vendor/three/three.module.min.js');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera();
  camera.position.set(4.8, 6.5, 8.5);
  camera.lookAt(0, 0.65, 0.2);
  scene.add(new THREE.HemisphereLight(0xc9e2ff, 0x16243b, 1.9));
  const keyLight = new THREE.DirectionalLight(0xf0f5ff, 3);
  keyLight.position.set(-3, 7, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  Object.assign(keyLight.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
  keyLight.shadow.normalBias = 0.035;
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0x8b8cff, 1.4);
  fillLight.position.set(4, 3, -3);
  scene.add(fillLight);

  const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, ...extra });
  const silver = material(0xcbd5e1, { roughness: 0.3, metalness: 0.65 });
  const dark = material(0x16243b, { roughness: 0.45, metalness: 0.6 });
  const blue = material(0x2563eb, { emissive: 0x1d4ed8, emissiveIntensity: 0.3, roughness: 0.35 });
  const mint = new THREE.MeshBasicMaterial({ color: 0x6ee7b7, toneMapped: false });
  function mesh(geometry, surface, parent = scene) {
    const object = new THREE.Mesh(geometry, surface);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  const platform = mesh(new THREE.BoxGeometry(6.2, 0.18, 4.1), material(0x142038));
  platform.position.set(0, -0.1, 0.25);
  const grid = new THREE.GridHelper(6, 12, 0x41618d, 0x263d5c);
  grid.position.y = 0.005;
  grid.scale.z = 0.64;
  grid.position.z = 0.25;
  scene.add(grid);
  const base = mesh(new THREE.CylinderGeometry(0.46, 0.6, 0.3, 32), dark);
  base.position.set(0, 0.15, -1.05);
  const baseAccent = mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.07, 32), blue);
  baseAccent.position.set(0, 0.32, -1.05);
  const pedestal = mesh(new THREE.CylinderGeometry(0.27, 0.36, 0.32, 24), silver);
  pedestal.position.set(0, 0.43, -1.05);
  const links = [0, 1].map(() => mesh(new THREE.CylinderGeometry(0.13, 0.17, 1, 16), silver));
  const linkStripes = links.map(() => mesh(new THREE.CylinderGeometry(0.137, 0.177, 0.15, 16), blue));
  const joints = [0, 1, 2].map((_, i) => mesh(new THREE.SphereGeometry(i === 2 ? 0.19 : 0.25, 20, 12), dark));
  const jointLights = joints.map(() => mesh(new THREE.SphereGeometry(0.13, 16, 10), blue));
  const gripper = new THREE.Group();
  scene.add(gripper);
  mesh(new THREE.BoxGeometry(0.48, 0.18, 0.3), dark, gripper);
  const fingers = [-1, 1].map(() => {
    const finger = mesh(new THREE.BoxGeometry(0.085, 0.4, 0.18), silver, gripper);
    finger.position.y = -0.25;
    const tip = mesh(new THREE.BoxGeometry(0.13, 0.1, 0.2), blue, finger);
    tip.position.set(0, -0.16, 0);
    return finger;
  });
  const cargoMaterial = blue.clone();
  cargoMaterial.transparent = true;
  const cargo = mesh(new THREE.BoxGeometry(CARGO_SIZE, CARGO_SIZE, CARGO_SIZE), cargoMaterial);
  const cargoEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(cargo.geometry), new THREE.LineBasicMaterial({ color: 0xdbeafe }));
  cargo.add(cargoEdges);
  cargoEdges.material.transparent = true;
  const outgoingMaterial = cargoMaterial.clone();
  outgoingMaterial.depthWrite = false;
  const outgoingCargo = mesh(cargo.geometry, outgoingMaterial);
  outgoingCargo.visible = false;
  const outgoingEdges = new THREE.LineSegments(cargoEdges.geometry,
    new THREE.LineBasicMaterial({ color: 0xdbeafe, transparent: true }));
  outgoingCargo.add(outgoingEdges);
  const contactMaterial = new THREE.MeshBasicMaterial({ color: 0x6ee7b7, transparent: true, opacity: 0, depthWrite: false });
  const contactRing = mesh(new THREE.TorusGeometry(0.3, 0.02, 8, 48), contactMaterial);
  contactRing.rotation.x = -Math.PI / 2;
  contactRing.castShadow = false;
  contactRing.receiveShadow = false;
  contactRing.visible = false;
  const stackMaterial = material(0x3b82f6, { roughness: 0.5, metalness: 0.2 });
  const stackedCargo = Array.from({ length: STACK_COUNT }, () => {
    const box = mesh(cargo.geometry, stackMaterial);
    box.add(new THREE.LineSegments(cargoEdges.geometry, new THREE.LineBasicMaterial({ color: 0x6ee7b7 })));
    box.visible = false;
    return box;
  });
  const stackOutline = mesh(new THREE.BoxGeometry(CARGO_SIZE + 0.02, CARGO_SIZE + 0.02, CARGO_SIZE + 0.02),
    new THREE.MeshBasicMaterial({ color: 0x6ee7b7, wireframe: true, transparent: true, opacity: 0.65, depthWrite: false }));
  stackOutline.castShadow = false;
  stackOutline.receiveShadow = false;
  const target = new THREE.Group();
  scene.add(target);
  const targetDisk = mesh(new THREE.CylinderGeometry(1, 1, 0.025, 48),
    material(0x34d399, { transparent: true, opacity: 0.14, depthWrite: false }), target);
  targetDisk.position.y = 0.025;
  const targetRing = mesh(new THREE.TorusGeometry(1, 0.025, 8, 64), mint, target);
  targetRing.rotation.x = -Math.PI / 2;
  targetRing.position.y = 0.055;
  // A small beacon makes the target legible even beneath the raised cargo.
  const beacon = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 8), mint, target);
  beacon.position.set(0, 0.18, -1);
  const cursorMaterial = new THREE.MeshBasicMaterial({ color: 0x93c5fd, toneMapped: false });
  const cursor = mesh(new THREE.TorusGeometry(0.24, 0.018, 8, 32), cursorMaterial);
  cursor.rotation.x = -Math.PI / 2;
  const guide = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(), new THREE.Vector3(),
  ]), new THREE.LineDashedMaterial({ color: 0x93c5fd, dashSize: 0.08, gapSize: 0.07, transparent: true, opacity: 0.5 }));
  scene.add(guide);

  function label(text, color) {
    const image = document.createElement('canvas');
    image.width = 512; image.height = 80;
    const context = image.getContext('2d');
    context.fillStyle = color;
    context.font = '500 36px monospace';
    context.textAlign = 'center';
    context.fillText(text, 256, 52);
    const texture = new THREE.CanvasTexture(image);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }));
    sprite.scale.set(1.25, 0.2, 1);
    scene.add(sprite);
    return sprite;
  }
  const cargoLabel = label('CARGO', '#93c5fd');
  const targetLabel = label('DROP ZONE', '#6ee7b7');
  const stackLabel = label('STACK HERE', '#6ee7b7');
  const up = new THREE.Vector3(0, 1, 0);
  const from = new THREE.Vector3(), to = new THREE.Vector3(), difference = new THREE.Vector3();
  let visible = true;
  let previousTime = 0;
  let frame = null;
  let lastRange = '';
  let feedback = null;
  let releasePending = false;
  let fingerSpread = 0.38;
  const desiredSpread = () => game.closed ? (game.held ? 0.27 : 0.12) : 0.38;
  const visualMotionActive = () => feedback !== null || Math.abs(fingerSpread - desiredSpread()) > 0.0005;

  function clearFeedback() {
    feedback = null;
    fingerSpread = desiredSpread();
    contactRing.visible = false;
    outgoingCargo.visible = false;
    gripper.rotation.z = 0;
    cargo.scale.setScalar(1);
    cargoMaterial.opacity = 1;
    cargoMaterial.emissiveIntensity = 0.3;
    cargoEdges.material.opacity = 1;
  }

  function playFeedback(result, origin) {
    const success = ['delivered', 'level-four', 'stacked', 'won'].includes(result);
    const landed = success || result === 'missed' || result === 'misaligned';
    const dropped = result === 'released' || landed;
    // Landing feedback must not restart a return the player already interrupted.
    if (dropped && !(landed && releasePending) && !reducedMotion.matches) game.retractHand();
    if (result === 'released') releasePending = true;
    else if (landed || result === 'grabbed') releasePending = false;
    if (reducedMotion.matches) { clearFeedback(); return; }
    const spawning = ['delivered', 'level-four', 'stacked'].includes(result);
    feedback = {
      kind: success ? 'placed' : result === 'grabbed' ? 'grabbed' : 'gripper',
      elapsed: 0,
      duration: success ? 0.6 : 0.28,
      origin: { ...origin },
      spawning,
      outgoing: result === 'delivered' || result === 'level-four',
    };
    contactMaterial.color.set(success ? 0x6ee7b7 : result === 'too-far' ? 0xfbbf24 : 0x60a5fa);
  }

  function advanceFeedback(dt) {
    if (reducedMotion.matches) { clearFeedback(); return; }
    const targetSpread = desiredSpread();
    fingerSpread += (targetSpread - fingerSpread) * (1 - Math.exp(-22 * dt));
    if (Math.abs(fingerSpread - targetSpread) < 0.0005) fingerSpread = targetSpread;
    if (feedback) {
      feedback.elapsed += dt;
      if (feedback.elapsed >= feedback.duration) feedback = null;
    }
  }

  function updateHUD() {
    root.dataset.state = game.phase;
    score.textContent = `${game.level} / ${LEVEL_COUNT}`;
    const objectiveText = game.phase === 'won' ? 'All four levels complete · Three boxes stacked.'
      : game.phase === 'ready' ? 'Three deliveries, then a three-box stacking challenge.'
      : game.stacking ? `Level 4 · Stack ${game.stacked.length} / ${STACK_COUNT} boxes on the outline.`
        : `Level ${game.level} · Deliver the cube to the green pad.`;
    if (objective.textContent !== objectiveText) objective.textContent = objectiveText;
    timer.textContent = formatTime(game.elapsed);
    gripButton.disabled = game.phase !== 'playing';
    gripButton.textContent = game.held ? 'Release cargo' : game.closed ? 'Open gripper' : 'Grab cargo';
    liftButtons.forEach(button => { button.disabled = game.phase !== 'playing'; });
    const heightPercent = Math.round((game.hand.y - HEIGHT.min) / (HEIGHT.max - HEIGHT.min) * 100);
    heightText.textContent = `${heightPercent}%`;
    heightMeter.value = heightPercent;
    root.dataset.motion = game.retracting ? 'resetting' : feedback?.kind ?? 'idle';
    const rangeText = game.retracting ? 'RESETTING ARM' : game.phase === 'won' ? 'COMPLETE' : game.phase !== 'playing' ? 'STANDBY'
      : game.held ? (game.movementBlocked ? (game.stacking ? 'LIFT ABOVE STACK' : 'LIFT TO CARRY')
        : game.overTarget ? (!game.aligned ? 'ALIGN WITH OUTLINE'
          : game.inRange ? (game.stacking ? 'READY TO STACK' : 'READY TO DROP') : 'LOWER TO PLACE')
          : 'FIND THE GREEN PAD')
        : game.closed ? 'OPEN GRIPPER'
          : game.inRange ? 'READY TO GRAB' : game.nearCargo ? 'LOWER TO GRAB' : 'FIND THE BLUE CUBE';
    if (rangeText !== lastRange) {
      range.textContent = rangeText;
      root.dataset.inRange = String(game.inRange && (game.held || !game.closed) && game.phase === 'playing');
      lastRange = rangeText;
    }
  }

  function draw() {
    const wristHeight = game.hand.y;
    const points = solveArm(game.hand, wristHeight);
    const positions = [points.base, points.elbow, points.wrist];
    positions.forEach((point, index) => {
      joints[index].position.set(point.x, point.y, point.z);
      jointLights[index].position.set(point.x, point.y, point.z + (index === 2 ? 0.12 : 0.2));
    });
    links.forEach((link, index) => {
      from.copy(joints[index].position);
      to.copy(joints[index + 1].position);
      difference.subVectors(to, from);
      link.position.copy(from).add(to).multiplyScalar(0.5);
      link.scale.y = difference.length();
      link.quaternion.setFromUnitVectors(up, difference.normalize());
      linkStripes[index].position.copy(link.position);
      linkStripes[index].quaternion.copy(link.quaternion);
    });
    gripper.position.copy(joints[2].position);
    const spread = fingerSpread;
    fingers[0].position.x = -spread;
    fingers[1].position.x = spread;
    cargo.position.set(game.cargo.x, game.cargo.y, game.cargo.z);
    contactRing.visible = Boolean(feedback);
    outgoingCargo.visible = Boolean(feedback?.outgoing);
    gripper.rotation.z = 0;
    cargoMaterial.opacity = 1;
    cargoEdges.material.opacity = 1;
    cargoMaterial.emissiveIntensity = 0.3;
    cargo.scale.setScalar(1);
    if (feedback) {
      const t = Math.min(1, feedback.elapsed / feedback.duration);
      const pulse = Math.sin(Math.PI * t);
      contactRing.position.set(feedback.origin.x, feedback.origin.y - CARGO_SIZE / 2 + 0.015, feedback.origin.z);
      contactRing.scale.setScalar(1 + t * 1.8);
      contactMaterial.opacity = (1 - t) * 0.8;
      if (feedback.kind === 'grabbed') {
        gripper.rotation.z = Math.sin(t * Math.PI * 2) * (1 - t) * 0.045;
        cargoMaterial.emissiveIntensity = 0.3 + pulse * 0.7;
      }
      if (feedback.spawning) {
        const spawn = Math.min(1, Math.max(0, (t - 0.12) / 0.65));
        const eased = 1 - (1 - spawn) ** 3;
        cargoMaterial.opacity = eased;
        cargoEdges.material.opacity = eased;
        cargo.scale.setScalar(0.75 + eased * 0.25);
      }
      if (feedback.outgoing) {
        outgoingCargo.position.set(feedback.origin.x, feedback.origin.y + t * 0.06, feedback.origin.z);
        outgoingCargo.scale.setScalar(1 + pulse * 0.04);
        outgoingMaterial.opacity = Math.max(0, 1 - Math.max(0, t - 0.25) / 0.75);
        outgoingEdges.material.opacity = outgoingMaterial.opacity;
      }
    }
    cargo.visible = game.phase !== 'won';
    stackedCargo.forEach((box, index) => {
      const placed = game.stacked[index];
      box.visible = Boolean(placed);
      if (placed) box.position.set(placed.x, placed.y, placed.z);
    });
    stackOutline.visible = game.stacking && game.phase !== 'won';
    stackOutline.position.set(game.target.x, game.placementHeight, game.target.z);
    cargoLabel.visible = game.phase !== 'won' && !game.held;
    cargoLabel.material.opacity = cargoMaterial.opacity;
    cargoLabel.position.set(game.cargo.x, 0.2, game.cargo.z + 0.52);
    target.position.set(game.target.x, 0, game.target.z);
    target.scale.setScalar(game.targetRadius);
    targetLabel.position.set(game.target.x, 0.15, game.target.z + game.targetRadius + 0.25);
    targetLabel.visible = !game.stacking;
    stackLabel.visible = game.stacking && game.phase !== 'won';
    stackLabel.position.copy(targetLabel.position);
    cursor.position.set(game.hand.x, 0.065, game.hand.z);
    cursorMaterial.color.set(game.inRange ? 0x6ee7b7 : 0x93c5fd);
    const pointsArray = guide.geometry.attributes.position;
    pointsArray.setXYZ(0, game.hand.x, 0.08, game.hand.z);
    pointsArray.setXYZ(1, game.hand.x, wristHeight - 0.3, game.hand.z);
    pointsArray.needsUpdate = true;
    guide.computeLineDistances();
    renderer.render(scene, camera);
  }

  function tick(now) {
    frame = null;
    const dt = Math.max(0, (now - previousTime) / 1000);
    previousTime = now;
    if (!document.hidden && visible) {
      const direction = {
        x: Number(keys.has('ArrowRight') || keys.has('d')) - Number(keys.has('ArrowLeft') || keys.has('a')),
        z: Number(keys.has('ArrowDown') || keys.has('s')) - Number(keys.has('ArrowUp') || keys.has('w')),
        y: Math.max(-1, Math.min(1, liftInput + Number(keys.has('q')) - Number(keys.has('e')))),
      };
      const landing = { x: game.cargo.x, y: game.landingHeight(game.cargo), z: game.cargo.z };
      const result = game.update(dt, direction);
      if (result) handleResult(result, landing);
      advanceFeedback(Math.min(dt, 0.05));
      updateHUD();
      draw();
      if (frame === null && (game.retracting || visualMotionActive()
        || (game.phase !== 'won' && (game.phase === 'playing' || keys.size > 0 || Math.hypot(game.hand.x - game.aim.x, game.hand.z - game.aim.z) > 0.001)))) {
        frame = requestAnimationFrame(tick);
      }
    }
  }
  function resume() {
    if (frame !== null || !visible || document.hidden || root.dataset.state === 'unavailable'
      || (game.phase === 'won' && !game.retracting && !visualMotionActive())) return;
    previousTime = performance.now();
    frame = requestAnimationFrame(tick);
  }
  function pause() {
    keys.clear();
    liftInput = 0;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  }

  function start() {
    pause();
    game.start();
    releasePending = false;
    clearFeedback();
    overlay.hidden = true;
    showControlInstructions();
    canvas.focus({ preventScroll: true });
    updateHUD(); draw(); resume();
  }
  function chooseControls() {
    pause();
    game.reset();
    releasePending = false;
    clearFeedback();
    root.querySelector('[data-game-overlay-title]').textContent = 'Choose your controls.';
    root.querySelector('[data-game-overlay-copy]').textContent = 'Pick how to play. Your run starts when you choose.';
    overlay.hidden = false;
    showControlInstructions();
    updateHUD(); draw();
    controlPicker.querySelector(`[data-game-control="${controlMode}"]`).focus({ preventScroll: true });
  }
  function handleResult(result, origin) {
    if (!result || result === 'inactive') return;
    playFeedback(result, origin);
    const messages = {
      'too-far': 'Empty grip. Open it again, aim over the cube, and lower before grabbing.',
      opened: 'Gripper open. Aim over the blue cube and lower to grab it.',
      grabbed: 'Got it! Lift with Q or Lift, then carry it to the green pad.',
      released: 'Cargo released. Let it land on the green pad.',
      missed: 'Missed the pad. Lower the open gripper to pick the cube up again.',
      delivered: `${game.delivered} down. Find the next cube, lower, and grab.`,
      'level-four': 'Level 4 unlocked! Stack three boxes. Place each one inside the green outline.',
      stacked: `${game.stacked.length} / 3 stacked! Lift the next box above the tower, align, then lower and release.`,
      misaligned: 'Off-center. Pick the box up again and align it with the green outline.',
    };
    if (messages[result]) message.textContent = messages[result];
    if (result === 'won') {
      const record = best === null || game.elapsed < best;
      if (record) {
        best = game.elapsed;
        try { localStorage.setItem('robot-lab-best-stack-v3', String(best)); } catch { /* Optional persistence. */ }
      }
      bestLabel.textContent = `BEST ${formatTime(best)}`;
      // Keep the completed tower visible; Restart reopens the control chooser.
      overlay.hidden = true;
      message.textContent = `${record ? 'New best! ' : ''}Four levels complete in ${formatTime(game.elapsed)}. Three boxes stacked!`;
      pause();
      resetButton.focus({ preventScroll: true });
    }
  }
  function grip() {
    const origin = { x: game.hand.x, y: game.held ? game.landingHeight(game.cargo)
      : Math.max(0.27, game.hand.y - 0.57), z: game.hand.z };
    handleResult(game.grip(), origin);
    updateHUD(); draw(); resume();
  }
  gripButton.addEventListener('click', grip);
  resetButton.addEventListener('click', chooseControls);
  controlButtons.forEach(button => button.addEventListener('click', () => {
    controlMode = button.dataset.gameControl;
    start();
  }));
  function nudgeHeight(direction) {
    game.adjustHeight(direction * 0.18);
    updateHUD(); draw(); resume();
  }
  liftButtons.forEach(button => {
    const direction = Number(button.dataset.gameLift);
    button.addEventListener('pointerdown', event => {
      if (game.phase !== 'playing' || event.button !== 0 || !event.isPrimary) return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      nudgeHeight(direction);
      liftInput = direction;
    });
    const release = () => { liftInput = 0; };
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
    // Native keyboard activation emits a click without a pointerdown.
    button.addEventListener('click', event => { if (event.detail === 0) nudgeHeight(direction); });
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();
  function aim(event) {
    if (game.phase === 'won') return;
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1,
      -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(floor, hit)) {
      game.aimAt(hit.x, hit.z);
      resume();
    }
  }
  canvas.addEventListener('pointerdown', event => {
    if (game.phase === 'won' || !event.isPrimary || event.button !== 0) return;
    canvas.focus({ preventScroll: true });
    if (controlMode === 'keyboard') return;
    canvas.setPointerCapture(event.pointerId);
    aim(event);
  });
  stage.addEventListener('pointermove', event => {
    if (!event.isPrimary || controlMode === 'keyboard' || event.target.closest('button')) return;
    if (event.pointerType !== 'touch' || canvas.hasPointerCapture(event.pointerId)) aim(event);
  });
  canvas.addEventListener('pointerup', event => {
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  });
  canvas.addEventListener('wheel', event => {
    if (game.phase !== 'playing' || controlMode !== 'mouse' || event.deltaY === 0) return;
    event.preventDefault();
    game.adjustHeight(-Math.sign(event.deltaY) * 0.13);
    updateHUD(); draw(); resume();
  }, { passive: false });
  canvas.addEventListener('keydown', event => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === 'q' || key === 'e') {
      event.preventDefault();
      keys.add(key);
      resume();
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(key)) {
      if (controlMode !== 'keyboard') return;
      event.preventDefault();
      keys.add(key);
      resume();
    }
    if ((key === ' ' || key === 'Enter') && !event.repeat) { event.preventDefault(); grip(); }
    if (key === 'r' && !event.repeat) chooseControls();
  });
  // Clear keys even when focus moves from the canvas to an action button.
  window.addEventListener('keyup', event => keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
  canvas.addEventListener('blur', () => keys.clear());
  window.addEventListener('blur', () => { keys.clear(); liftInput = 0; });
  document.addEventListener('visibilitychange', () => document.hidden ? pause() : resume());
  const visibility = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) resume(); else pause();
  }, { threshold: 0.15 });
  visibility.observe(canvas);
  const resize = new ResizeObserver(() => {
    const width = stage.clientWidth, height = stage.clientHeight;
    const aspect = width / height;
    const viewHeight = Math.max(5.8, 7.8 / aspect);
    camera.left = -viewHeight * aspect / 2;
    camera.right = viewHeight * aspect / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.near = 0.1; camera.far = 50;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    draw();
  });
  resize.observe(stage);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    pause();
    unavailable();
  });
  canvas.addEventListener('webglcontextrestored', () => location.reload());
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) { game.cancelRetraction(); clearFeedback(); }
    updateHUD(); draw(); resume();
  });
  resetButton.disabled = false;
  controlButtons.forEach(button => { button.disabled = false; });
  root.dataset.loaded = 'true';
  showControlInstructions();
  updateHUD();
}

init().catch(error => { console.error('Robot game could not start:', error); unavailable(); });
