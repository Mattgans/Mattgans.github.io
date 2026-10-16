The hero's robot is a four-level Three.js pick-and-place game. Cargo spawns at a fresh random position for every delivery and replay, within the reachable workspace and away from the target. Levels 1–3 each deliver one cube to a progressively smaller green pad. Level 4 builds a tower of three boxes on a fixed pad. There is no time limit. The best time for all four levels is saved in the visitor's browser when storage is available, separately from earlier versions of the game.

Run the site locally from this directory:

```sh
python -m http.server 8765
```

Open http://localhost:8765 and choose **Mouse** or **Keyboard** in the popup over the board. Your run starts immediately when you choose. There is no separate start button or control bar.

- **Mouse:** move the mouse over the board to aim the gripper automatically, or tap / drag on touchscreens.
- **Keyboard:** focus the board and use arrow keys or WASD. Mouse movement won't move the arm in this mode.
- **Height:** Q lifts and E lowers the gripper in either mode. Mouse mode also supports the scroll wheel over the board (scroll up to lift, down to lower). Tap or hold the on-screen **Lift** / **Lower** buttons on any device.
- **Gripper:** Space, Enter, or the grab button opens and closes the fingers. Lower over a cube before closing to pick it up. An empty closed gripper must be opened before trying again.
- **Action feedback:** fingers close and open smoothly, grabs have a brief mechanical settle, and placements pulse at the contact point. Delivered cargo fades out as the next cube fades in. After releasing a box, the arm lifts clear, swings back, and settles into its neutral pose. Mouse movement, arrow/WASD movement, height input, or another grip action interrupts the return immediately. Lifting held cargo remains manual. Reduced-motion settings skip the automatic return and animated effects.
- **Delivery:** lift the cube clear of the table before moving sideways. Carry it to the green pad, lower it, then release. Releasing from higher up lets the cube fall; delivery counts when it lands on the pad.
- **Level 4:** place three boxes on the green wireframe outline. It rises one box height after each placement. Lift cargo above the existing tower before moving over it, then lower and release. Centered boxes settle into a stable stack. An off-center box can be picked up and corrected without losing the existing stack. The complete tower stays visible when you win.
- **Restart** (or R while the board is focused) resets the run, clears the stack, and reopens the control chooser. Use Restart after winning to play again.

In Mouse mode, the arm follows the mouse automatically across the table; height and grip are controlled by the player. Scoring and timing begin when you select a control option in the popup. The timer pauses when the game leaves the viewport or the browser tab is hidden. The scene stops rendering when idle before a run and after completion. Browsers without WebGL 2 see a fallback message. The Fulcrum GT update sits in a subtle banner beneath the hero description, separate from the game.

`robot-game.js` handles rendering and controls, `robot-game-logic.mjs` contains the game rules and arm kinematics, and `robot-game.css` styles the panel. Three.js 0.180.0 and its license are in `vendor/three`; no package installation or build step is required.

Run the game-rule and kinematics checks with Node.js 20 or later:

```sh
node --test tests/robot-game.test.mjs
```
