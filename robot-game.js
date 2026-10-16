import { RobotGame, solveArm, DELIVERY_COUNT } from './robot-game-logic.mjs';

const root = document.getElementById('robot-game');
const stage = root.querySelector('.robot-game-stage');
const canvas = root.querySelector('canvas');
const overlay = root.querySelector('.robot-game-overlay');
const gripButton = root.querySelector('[data-game-grip]');
const resetButton = root.querySelector('[data-game-reset]');
const message = root.querySelector('[data-game-message]');
const score = root.querySelector('[data-game-score]');
const timer = root.querySelector('[data-game-time]');
const range = root.querySelector('[data-game-range]');
const bestLabel = root.querySelector('[data-game-best]');
const controlPicker = root.querySelector('.robot-game-controls');
const controlButtons = controlPicker.querySelectorAll('[data-game-control]');
const help = root.querySelector('.robot-game-help');
const controlModes = {
  mouse: {
    running: 'Move the mouse to the blue cube. Grab it, then carry it to the green pad.',
    help: 'Move mouse or tap / drag to aim · Space or the button to grab / release',
  },
  keyboard: {
    running: 'Use arrows or WASD to reach the blue cube. Press Space to grab it.',
    help: 'Focus the board · Arrows / WASD to move · Space / Enter to grab / release',
  },
};
let controlMode = 'mouse';
function showControlInstructions() {
  root.dataset.controls = controlMode;
  help.textContent = game.phase === 'ready' ? 'Choose your controls to begin.' : controlModes[controlMode].help;
  if (game.phase === 'ready') {
    message.textContent = 'Choose Mouse or Keyboard on the board to start. There’s no time limit.';
  } else if (game.phase === 'playing') {
    message.textContent = game.held ? 'Carry the cube to the green pad, then release it.' : controlModes[controlMode].running;
  }
}
const game = new RobotGame();
const keys = new Set();
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let best = null;
try {
  const saved = Number(localStorage.getItem('robot-lab-best-v1'));
  if (Number.isFinite(saved) && saved > 0) best = saved;
} catch { /* Private browsing may disable storage. */ }
const formatTime = value => `${value.toFixed(1)}s`;
bestLabel.textContent = best ? `BEST ${formatTime(best)}` : '3 DELIVERIES / NO TIME LIMIT';

function unavailable() {
  root.dataset.state = 'unavailable';
  overlay.hidden = false;
  root.querySelector('[data-game-overlay-title]').textContent = 'The robot is taking a break.';
  root.querySelector('[data-game-overlay-copy]').textContent = 'The 3D game needs WebGL 2. Try a browser with hardware acceleration enabled.';
  controlPicker.hidden = true;
  gripButton.disabled = true;
  resetButton.disabled = true;
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
  const cargo = mesh(new THREE.BoxGeometry(0.48, 0.48, 0.48), blue);
  const cargoEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(cargo.geometry), new THREE.LineBasicMaterial({ color: 0xdbeafe }));
  cargo.add(cargoEdges);
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
  const up = new THREE.Vector3(0, 1, 0);
  const from = new THREE.Vector3(), to = new THREE.Vector3(), difference = new THREE.Vector3();
  let wristHeight = 0.92;
  let cargoHeight = 0.27;
  let round = 0;
  let visible = true;
  let previousTime = 0;
  let frame = null;
  let lastRange = '';

  function updateHUD() {
    root.dataset.state = game.phase;
    score.textContent = `${game.delivered} / ${DELIVERY_COUNT}`;
    timer.textContent = formatTime(game.elapsed);
    gripButton.disabled = game.phase !== 'playing';
    gripButton.textContent = game.held ? 'Release cargo' : 'Grab cargo';
    const rangeText = game.phase !== 'playing' ? 'STANDBY'
      : game.inRange ? (game.held ? 'READY TO DROP' : 'READY TO GRAB')
        : (game.held ? 'FIND THE GREEN PAD' : 'FIND THE BLUE CUBE');
    if (rangeText !== lastRange) {
      range.textContent = rangeText;
      root.dataset.inRange = String(game.inRange && game.phase === 'playing');
      lastRange = rangeText;
    }
  }

  function draw(dt = 0) {
    const snap = motionPreference.matches || dt === 0;
    const mix = snap ? 1 : 1 - Math.exp(-12 * dt);
    wristHeight += ((game.held ? 1.75 : 0.92) - wristHeight) * mix;
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
    const spread = game.held ? 0.27 : 0.38;
    fingers[0].position.x = -spread;
    fingers[1].position.x = spread;
    if (round !== game.delivered) { cargoHeight = 0.27; round = game.delivered; }
    cargoHeight += ((game.held ? wristHeight - 0.57 : 0.27) - cargoHeight) * mix;
    cargo.position.set(game.cargo.x, cargoHeight, game.cargo.z);
    cargo.visible = game.phase !== 'won';
    cargoLabel.visible = game.phase !== 'won' && !game.held;
    cargoLabel.position.set(game.cargo.x, 0.2, game.cargo.z + 0.52);
    target.position.set(game.target.x, 0, game.target.z);
    target.scale.setScalar(game.targetRadius);
    targetLabel.position.set(game.target.x, 0.15, game.target.z + game.targetRadius + 0.25);
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
      };
      game.update(dt, direction);
      updateHUD();
      draw(Math.min(dt, 0.05));
      if (game.phase === 'playing' || keys.size > 0 || Math.hypot(game.hand.x - game.aim.x, game.hand.z - game.aim.z) > 0.001) {
        frame = requestAnimationFrame(tick);
      }
    }
  }
  function resume() {
    if (frame !== null || !visible || document.hidden || game.phase === 'won' || root.dataset.state === 'unavailable') return;
    previousTime = performance.now();
    frame = requestAnimationFrame(tick);
  }
  function pause() {
    keys.clear();
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  }

  function start() {
    pause();
    game.start();
    round = 0;
    wristHeight = 0.92; cargoHeight = 0.27;
    overlay.hidden = true;
    showControlInstructions();
    canvas.focus({ preventScroll: true });
    updateHUD(); draw(); resume();
  }
  function chooseControls() {
    pause();
    game.reset();
    round = 0;
    wristHeight = 0.92; cargoHeight = 0.27;
    root.querySelector('[data-game-overlay-title]').textContent = 'Choose your controls.';
    root.querySelector('[data-game-overlay-copy]').textContent = 'Pick how to play. Your run starts when you choose.';
    overlay.hidden = false;
    showControlInstructions();
    updateHUD(); draw();
    controlPicker.querySelector(`[data-game-control="${controlMode}"]`).focus({ preventScroll: true });
  }
  function grip() {
    const result = game.grip();
    const messages = {
      'too-far': 'A little closer! Move the ring under the blue cube, then grab.',
      grabbed: 'Got it! Move to the green pad, then release.',
      missed: 'Missed the pad. Grab the cube again and give it another go.',
      delivered: `${game.delivered} down. The next pad is a little smaller.`,
    };
    if (messages[result]) message.textContent = messages[result];
    if (result === 'won') {
      const record = best === null || game.elapsed < best;
      if (record) {
        best = game.elapsed;
        try { localStorage.setItem('robot-lab-best-v1', String(best)); } catch { /* Optional persistence. */ }
      }
      bestLabel.textContent = `BEST ${formatTime(best)}`;
      root.querySelector('[data-game-overlay-title]').textContent = record ? 'Personal best. Nicely placed.' : 'All cargo delivered.';
      root.querySelector('[data-game-overlay-copy]').textContent = `Three deliveries in ${formatTime(game.elapsed)}. Choose controls to play again.`;
      overlay.hidden = false;
      message.textContent = `Complete! Three deliveries in ${formatTime(game.elapsed)}.`;
      pause();
      controlPicker.querySelector(`[data-game-control="${controlMode}"]`).focus({ preventScroll: true });
    }
    updateHUD();
    draw(1 / 60);
  }
  gripButton.addEventListener('click', grip);
  resetButton.addEventListener('click', chooseControls);
  controlButtons.forEach(button => button.addEventListener('click', () => {
    controlMode = button.dataset.gameControl;
    start();
  }));

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
  canvas.addEventListener('keydown', event => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
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
  window.addEventListener('blur', () => keys.clear());
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
  motionPreference.addEventListener('change', () => draw());
  resetButton.disabled = false;
  controlButtons.forEach(button => { button.disabled = false; });
  root.dataset.loaded = 'true';
  showControlInstructions();
  updateHUD();
}

init().catch(error => { console.error('Robot game could not start:', error); unavailable(); });
