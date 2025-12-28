/*
Snooker Game (p5.js + Matter.js)

This applicaiton is a simplified snooker game built based on p5.js for rendering and 
Matter.js for physic simulation. The overall design to to create a keyboard + mouse-driven
control to mimic how a real snooker game is played. The development follows a step-by-step process 
that starts by creating the table and ball class, and allows balls to be drawn on canvas according 
to the mode selection. Next, the cuestick class and cue force logic are included to allow applying forces 
on cue ball. Advanced functions such as Collision check and animations on balls are added into this app so it 
become visually interesting. Finally, extra extension including potted ball recorder, force visualisaion bar, 
and game instructions are implemented on screen to further polish this game. 


Table Design
--------------
Table elements including both non-matter and matter objects. Non-matter objects include those table 
side frames, yellow decoration, and table top as they are not involving in physic calculation. Pocket holes and 
cushions are created as Matter.js objects as they will be interacting with ball objects. Cushions are set to be static, 
while pockets are only set to be a sensor for collision check and won't block any Matter objects. 


Cue Interaction 
---------------
Cue stick is created as a non-matter objects intentionaly becasue this could reduce the collision complexity and 
simpify the code but still remain with very effective force logic. A keyboard "c" would control the activation and drawn
status of the cue stick, and allow player aiming on white ball. Mouse control including mouse press, drag and release creates
the force applied to whiteball by calculating the vector between mouse press and release locations. Overall, the cue stick and
force logic combines both keyboard and mouse control to simulate the real world snooker game and provide players a smooth 
cue control. 


Collision Handling and Animations
----------------------------------
Collision hanlding take advantages of the shape of both balls and pockets as all of them are circles. A simple check using 
x,y Euclidean distance and circle radius are applied. 

While a ball is in a pocket, a fading and shrinking animation starts, which is written in update() of ball class. In addition, 
ball trail effects are also included, which recorded a series of previous ball location and draw a smaller and faded circles 
based on those locations behind the ball itself when a ball moves in every frame. 


Extension Features
------------------
Two main extensions were implemented. The first is a drag power visualisation bar shown on the side of the canvas. 
As the player drags the mouse, the bar fills proportionally to the calculated shot power. This gives immediate feedback 
before the shot is taken, allowing the player to make more precise and deliberate decisions.

The second extension is a potted-ball display area at the top of the screen. When a ball is potted, its colour and type are
recorded and displayed visually, rather than being simply removed. This adds clarity to game progress and helps players 
keep track of which balls have already been potted.

*/



// sketch.js
var Engine = Matter.Engine;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Body = Matter.Body;
var Events = Matter.Events;

var engine;
var table;
var balls = [];
let pottedBalls = []; // removed balls (for render on top)
var whiteBall = null;
var cue;   
var cueImpacts = [];            

var currentMode = 0;

var dragStart; // store mouse press position for calculate force
var currentForceMag = 0; // store force value while mouse drag
var powerBarValue = 0; // visualised force value (for render on side)

var canva;

function setup() {
  canva =  createCanvas(1200, 800);

  angleMode(DEGREES);
  rectMode(CENTER);

	engine = Engine.create();

	// turn off gravity
	engine.world.gravity.y = 0;
	engine.world.gravity.x = 0;

  var tableLength = width * 2 / 3;  // choose a relative table size within the Canvas
  table = new SnookerTable(width / 2, height / 2, tableLength);
	table.setupPhysics(engine); 

	cue = new CueStick(table); // new cuestick

}


function draw() {
  background(0); 
	Matter.Engine.update(engine);


  table.draw();
	table.drawCushions();
	table.drawPockets();
	

  // draw and update balls
  for (let i = balls.length - 1; i >= 0; i--) {
    let b = balls[i];
    b.update();
    b.draw();

    if (b.toBeDeleted) {
      balls.splice(i, 1);
    }
  }


  if (cue.activate) {
		cue.draw(whiteBall);
		cue.updateAnimation();
	}

	checkBallPocketCollisions();
  drawPottedBalls();

	// draw the cue impact circle
	for (let i = cueImpacts.length - 1; i >= 0; i--) {
		cueImpacts[i].update();
		cueImpacts[i].draw();
	
		if (cueImpacts[i].done) {
			cueImpacts.splice(i, 1);
		}
	}

	// draw extra element on screen
	drawPowerBar();
	drawInstructions();   
}


// ===============================
// keyboard input control 
// ===============================
function keyPressed() {
	// for place a white ball and D zone check
  if (key === 'b' || key === 'B') {
    if (isMouseInD(table)) {
      console.log("inside D zone");
			drawWhiteBall();
    } else {
      console.log("outside D zone");
    }
  }

	// draw cue stick if white ball is available
	if (key === 'c' || key === 'C') {
		if (!whiteBall) return;

		if (cue.active) {
			cue.deactivate();           // reset cue
		} else {
			cue.activate(mouseX, mouseY); // show cue at mouse position
		}
	}

	// for changing game mode 
	if (key === '1') {
    currentMode = 1;
    initMode1();
  }

  if (key === '2') {
    currentMode = 2;
    initMode2();
  }

  if (key === '3') {
    currentMode = 3;
    initMode3();
  }
}


// ===============================
// function to draw white balls and check if mouse is in D zone
// ===============================
function drawWhiteBall() {
  // restrict to only one white ball
  if (whiteBall !== null) return;

  var r = table.wid / 36;

  whiteBall = new Ball(mouseX, mouseY, r / 2, color(255), "white");

  balls.push(whiteBall);
}

function isMouseInD(table) {
  // table data
  let lx = table.len / 2;
  let LineX = table.x - lx + table.len / 5; // table line X location 
  let dRadius = table.wid / 6; // D zone radius

  // distance from D center
  let dx = mouseX - LineX; // distance from mouse X to Line X (X of D center)
  let dy = mouseY - table.y; // distance from mouse Y to height/2  (Y of D center)
  let distToCenter = sqrt(dx * dx + dy * dy); // Euclidean distance 

  // inside full circle? 
  let insideCircle = distToCenter <= dRadius;

  // in left side?
  let insideHalf = mouseX <= LineX;

  return insideCircle && insideHalf;
}


// ===============================
// game mode control 1/2/3
// ===============================
function initMode1() {
  clearBalls();
  addColourBalls();
  addStandardReds();
}

function initMode2() {
  clearBalls();
  addColourBalls();
	addClusterReds();

}

function initMode3() {
  clearBalls();
  addColourBalls();
  addPracticeReds();
}


// ===================================
// function for clearing up all balls
// ===================================
function clearBalls() {
  for (var b of balls) {
    World.remove(engine.world, b.body);
  }
  balls = [];
	whiteBall = null;
	pottedBalls = [];
}


// ===============================================
// function to set up coloured balls except red ones
// ===============================================
function addColourBalls() {
	var ballD = table.wid / 36; // ball diameter

  // Blue (center)
  balls.push(new Ball(table.x, table.y, ballD / 2, color(0,0,255), "blue"));
	
	var lx = table.len / 2;
  var LineX = table.x - lx + table.len / 5; // baulk line
  var dRadius = table.wid / 6;              // D radius

  // Baulk-line balls
	balls.push(new Ball(LineX, table.y - dRadius, ballD / 2, color(0, 200, 0), "green"));   // Green
  balls.push(new Ball(LineX, table.y + dRadius, ballD / 2, color(255, 255, 0), "yellow")); // Yellow
  balls.push(new Ball(LineX, table.y, ballD / 2, color(150, 80, 33), "brown"));           // Brown

  // Pink (halfway between blue and black)
  var pinkX = table.x + lx / 2 ;
  balls.push(new Ball(pinkX, table.y, ballD / 2, color(255, 192, 203), "pink"));

  // Black 
  var blackX = table.x + lx - lx/5;
  balls.push(new Ball(blackX, table.y, ballD / 2, color(0), "black"));
}


// =========================================================================================
// functions to set up coloured balls except red ones (standard "<", clusters, and practice)
// =========================================================================================
function addStandardReds() {
	var lx = table.len/2
	var ballD = table.wid / 36; // ball diameter
	var startX = table.x + lx/2 + ballD; // triangle apex x-position (right after pink)
  var startY = table.y 

	for (let row = 0; row < 5; row++) {
			// trigonometry to calcualte row top position
			var TopX = startX + row * ballD * cos(30); 
			var TopY = startY - row * ballD * sin(30);

			for (let i = 0; i <= row; i++) {
				var x = TopX;
				// for each row, adding diameters below to draw balls
				var y = TopY + (i * ballD); 
				balls.push(new Ball(x, y, ballD / 2, color(255, 0, 0), "red"));
			}
	}
}

function addClusterReds() {
  var ballD = table.wid / 36; // ball diameter

	var clusterCount = 3; 
  var ballsPerCluster = 5;
  var spread = ballD * 1.5; // how tight the cluster is

	// coordinate range for cluster center to avoid drawing outside the table
  var margin = ballD * 2.5; // margin to the table frame
  var minX = table.x - table.len / 2 + margin;
  var maxX = table.x + table.len / 2 - margin;
  var minY = table.y - table.wid / 2 + margin;
  var maxY = table.y + table.wid / 2 - margin;

  const clusterCenters = [];

  // random cluster centers 
  for (let i = 0; i < clusterCount; i++) {
    var cx = random(minX, maxX);
    var cy = random(minY, maxY);

    clusterCenters.push({ x: cx, y: cy });
  }

  // balls in each cluster
  for (let c = 0; c < clusterCenters.length; c++) {
    var center = clusterCenters[c];

    for (let i = 0; i < ballsPerCluster; i++) {
      let angle = random(0, 360); // possible spread in whole direction
      let dist = random(0, spread); // random spread distance 

      let x = center.x + cos(angle) * dist;
      let y = center.y + sin(angle) * dist;

      balls.push(
        new Ball(x, y, ballD / 2 , color(255, 0, 0), "red")
      );
    }
  }
}

function addPracticeReds() {
  var lx = table.len / 2;
  var ballD = table.wid / 36;

  var pinkX  = table.x + lx / 2;
  var blackX = table.x + lx - lx / 5;
  var y = table.y;

  // total distance between pink and black
  var totalDist = blackX - pinkX;

  // 5 balls + 6 equal gaps + (pink + black radius)
  var gap = (totalDist - 6 * ballD) / 6;

	// push 5 right horizontal balls from pink to black
  for (var i = 0; i < 5; i++) {
    var x = pinkX + gap + ballD  + i * (ballD + gap);

    balls.push(
      new Ball(x, y, ballD / 2, color(255, 0, 0), "red")
    );
  }
	
	// push 5 up vertical balls from pink 
	for (var i = 0; i < 5; i++) {
    var x = pinkX;
		var yUp = y -  gap - ballD  - i * (ballD + gap);

    balls.push(
      new Ball(x, yUp, ballD / 2, color(255, 0, 0), "red")
    );
	}

	// push 5 down vertical balls from pink 
	for (var i = 0; i < 5; i++) {
		var x = pinkX;
		var yDown = y + gap + ballD  + i * (ballD + gap);

		balls.push(
			new Ball(x, yDown, ballD / 2, color(255, 0, 0), "red")
		);
  }
}


// ===============================================
// mouse drag control for applying force to whiteball
// ===============================================
function mousePressed() {
  if (cue.active && whiteBall) {
    // record mouse press position as a p5.Vector
    dragStart = createVector(mouseX, mouseY);

    // start cue animation
    cue.startAnimation();
  }
}

function mouseDragged() {
  if (cue.active && whiteBall && dragStart) {
    var dragVec = p5.Vector.sub(dragStart, createVector(mouseX, mouseY));

		currentForceMag = dragVec.mag() * 0.00001; // a reasonable value after multiple try

		// further restrict the force mag to avoid unnatural behaviour
		const MAX_FORCE = 0.003;   
		const MIN_FORCE = 0.00001;  

		currentForceMag = constrain(currentForceMag, MIN_FORCE, MAX_FORCE);
		powerBarValue = map(currentForceMag, MIN_FORCE, MAX_FORCE, 0 , 1);

  }
}

function mouseReleased() {
  if (cue.active && whiteBall && dragStart) {
 		// direction from cue aim to white ball 
		var dir = p5.Vector.sub(
			createVector(whiteBall.body.position.x, whiteBall.body.position.y),
			cue.aimPos
		).normalize();

    // applying force
    var forceVec = dir.mult(currentForceMag);

    // apply force to white ball
    Matter.Body.applyForce(
      whiteBall.body,
      whiteBall.body.position,
      { x: forceVec.x, y: forceVec.y }
    );

		if (currentForceMag != 0){
			cueImpacts.push(new CueImpact(
				whiteBall.body.position.x,
				whiteBall.body.position.y
			));
		}
		
		// rest both global variable
		currentForceMag = 0; 
		powerBarValue = 0;

		
	
		
    // reset dragStart
    dragStart = null;

		// stop cue animation
		cue.stopAnimation();

		// auto deactivate the cue stick after 200ms
		setTimeout(() => {
      cue.deactivate();
    }, 200); 
  }
}


// =================================================
// ball/pocket collision check and removing control 
// ==================================================
function checkBallPocketCollisions() {
  // loop backwards for avoiding missing checking a ball
  for (let i = balls.length - 1; i >= 0; i--) {
    var ball = balls[i];
    var ballPos = ball.body.position;

    for (var pocket of table.pockets) {
      var pocketPos = pocket.position;

      var dx = ballPos.x - pocketPos.x;
      var dy = ballPos.y - pocketPos.y;
      var distSq = dx * dx + dy * dy;

      // Matter circle sensor radius
      var pocketRadius = pocket.circleRadius;
      var ballRadius = ball.r;

      // allow slightly off (about 1/2 ball radius)
      var threshold = pocketRadius - ballRadius * 0.5;

      if (distSq < threshold * threshold) {
        potBall(i);
        break; 
      }
    }
  }
}

function potBall(ballIndex) {
  let ball = balls[ballIndex];

	if (ball.isPotted) return; // ensure no duplicated push while removing 

	ball.startRemove();

  // simply record potted ball 
  pottedBalls.push({
    colour: ball.colour,
    type: ball.type
  });

	// white ball special case
	if (ball.type === "white") {
		console.log("White ball potted (foul)");

		whiteBall = null;    
	}

  console.log("Ball potted:", ball.type);
}

function drawPottedBalls() {
  let startX = width/2;
  let y = height/20;
  let gap = width/48;
  let r = width/64;

  for (let i = 0; i < pottedBalls.length; i++) {
    let b = pottedBalls[i];

    fill(b.colour);
    noStroke();
    ellipse(startX + i * gap, y, r);
  }
}


// =================================================
// extension to visualise cue force while mouse dragged 
// ==================================================
function drawPowerBar() {
  var barX = width / 20;
  var barY = height / 2;
  var barH = height / 2;
  var barW = width / 100;

	// bar back
  noStroke();
  fill(50, 150);
  rect(barX, barY, barW, barH, 6);

  // fill amount
	var fillH = barH * powerBarValue;
  fill(255, 200, 0);
  rect(barX, barY + barH / 2 - fillH / 2, barW, fillH);

}


// =================================================
// draw rules 
// ==================================================
function drawInstructions() {
  push();


  // text
  fill(200);
  textSize(14);
  textAlign(LEFT, TOP);

	var x = width/40;
  var y = height/40;
  var lh = height/40; // line height

  text("🎱 SNOOKER CONTROLS", x, y); 
  y += lh * 1.2;

  text("Mode 1 / 2 / 3  : Switch game modes", x, y);
  y += lh;

  text("B (D-Zone)       : Place white ball", x, y);
  y += lh;

  text("C                      : activate / deactivate cue stick", x, y);
  y += lh;

  text("Mouse Drag     : Set shot power", x, y);
  y += lh;

  text("Mouse Release  : Strike the cue ball", x, y);

  pop();
}


// ===============================================
// helper function to draw matter objects
// ===============================================
function drawVertices(vertices) {
	beginShape();
	for (var i = 0; i < vertices.length; i++) {
			vertex(vertices[i].x, vertices[i].y);
	}
	endShape(CLOSE);
}

