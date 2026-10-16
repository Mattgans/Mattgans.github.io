The hero's robot is a Three.js pick-and-place game. Deliver three cubes to progressively smaller green pads; a missed drop can be picked up again. There is no time limit. The best completed time is saved in the visitor's browser when storage is available.

Run the site locally from this directory:

```sh
python -m http.server 8765
```

Open http://localhost:8765 and choose **Mouse** or **Keyboard** in the popup over the board. Your run starts immediately when you choose. There is no separate start button or control bar.

- **Mouse:** move the mouse over the board to aim the gripper automatically, or tap / drag on touchscreens.
- **Keyboard:** focus the board and use arrow keys or WASD. Mouse movement won't move the arm in this mode.
- Select **Grab cargo** / **Release cargo**, or focus the board and press Space or Enter.
- **Restart** (or R while the board is focused) resets the run and reopens the control chooser. After completing a run, choose either control option to play again.

In Mouse mode, the arm follows the mouse automatically. Scoring and timing begin when you select a control option in the popup. The timer pauses when the game leaves the viewport or the browser tab is hidden. The scene stops rendering when idle before a run and after completion. Reduced-motion settings remove the lift interpolation; controls remain available. Browsers without WebGL 2 see a fallback message. The Fulcrum GT update sits in a subtle banner beneath the hero description, separate from the game.

`robot-game.js` handles rendering and controls, `robot-game-logic.mjs` contains the game rules and arm kinematics, and `robot-game.css` styles the panel. Three.js 0.180.0 and its license are in `vendor/three`; no package installation or build step is required.

Run the game-rule and kinematics checks with Node.js 20 or later:

```sh
node --test tests/robot-game.test.mjs
```
