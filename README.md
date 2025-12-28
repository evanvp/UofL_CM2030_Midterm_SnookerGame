# 🎱 Snooker Game (p5.js + Matter.js)

This project is an interactive snooker game built using p5.js for rendering and
Matter.js for physics. It simulates realistic ball movement, cue interaction,
pocket detection, and includes multiple gameplay modes and visual effects.


## 🎮 Controls

Keyboard
- 1 / 2 / 3 : Switch between game modes
- B : Place the white ball inside the D-zone
- C : Activate / deactivate the cue stick

Mouse
- Click & Drag : Control shot power
- Release : Strike the cue ball


## 🕹 Game Modes

- Mode 1 : Standard snooker setup
- Mode 2 : Random cluster mode
- Mode 3 : Practice reds layout


## 🏹 Cue & Physics

- Mouse-based cue aiming for intuitive control
- Shot direction is calculated from cue position to the white ball
- Shot power depends on mouse drag distance
- Physics-based collisions and motion using Matter.js


## ✨ Visual Effects & Extensions

- Ball trail effect showing direction and speed
- Pocket entry animation (balls shrink and fade when potted)
- Cue impact animation when striking the white ball
- Shot power bar displaying drag strength
- Potted balls record displayed at the top of the canvas


## 🛠 Technologies

- p5.js – Rendering, interaction, animation
- Matter.js – Physics engine
- JavaScript (ES6)


## ▶️ How to Run

1. Open index.html in a web browser
2. Ensure all .js files are in the same folder
3. No additional setup required
