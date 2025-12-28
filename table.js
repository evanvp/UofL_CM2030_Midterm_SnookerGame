// table.js

class SnookerTable {
  constructor(x, y, length) {
    this.x = x;           // center X
    this.y = y;           // center Y
    this.len = length;     // table length 
    this.wid = length / 2; // table width
	
    // table data
    this.frameColor = color(60, 30, 0);
    this.tableColor = color(30, 140, 30);
    this.frameWidth = this.wid / 36 ; // thickness of wooden frame

    // pocket diameter 
    this.pocketD = this.wid / 36 * 1.5 ; // same as ball diameter * 1.5
 
		// physics containers
		this.cushions = [];
		this.pockets = [];

	}


	// ===============================
  // draw table non-matter elements
  // ===============================
	draw() {
    push();
    translate(this.x, this.y);

		// postion coorndate 
    const lx = this.len / 2; // table length / 2
    const wy = this.wid / 2; // table width / 2
		
		// round for table corner
		const round = this.wid/36 ;

    // ---------- TABLE FRAME -----------
    fill(this.frameColor);
    noStroke();
    rect(0, 0, this.len + this.frameWidth * 2, this.wid + this.frameWidth * 2, round);

    // ---------- TABLE SURFACE -----------
    fill(this.tableColor);
    rect(0, 0, this.len, this.wid);

    // ----------- YELLOW FRAME ------------
    fill(255, 255, 0); 
    noStroke();
		
    const yellowD = this.frameWidth * 2;

    // 4 Yellow corners 
    rect(-lx , -wy  , yellowD, yellowD, round, 0, round, 0); // top-left
    rect(lx , -wy , yellowD, yellowD, 0, round, 0, round); // top-right
		rect(-lx , wy , yellowD, yellowD, 0, round, 0, round); // bottom-left
		rect(lx , wy , yellowD, yellowD, round, 0, round, 0); // bottom-right

		// 2 Yellow sides 
		rect(0, -wy - yellowD * 0.225, yellowD * 0.8, yellowD * 0.55); // top
		rect(0, wy + yellowD * 0.225, yellowD * 0.8, yellowD * 0.55); // bottom

		// --------- BAULK LINE and D ZONE ----------
		const LineX = -lx + this.len / 5; // x for the table line and D zone
		const dRadius = this.wid / 6; 		// D radius

		stroke(255);   
		strokeWeight(this.wid / 512);
		noFill();

		// baulk line 
		line(LineX, -wy + this.len * 0.005, LineX,  wy - this.len * 0.005); // make it slightly shorter to avoid overlap the frame
		// D zone (semi-circle opening to the right)
		arc(LineX, 0, dRadius * 2, dRadius * 2, 90, 270);


    pop();
  }


	// ===============================
  // create table matter objects
  // ===============================
  setupPhysics(engine) {
    const lx = this.len / 2;
    const wy = this.wid / 2;
    const p = this.pocketD;
    const offset = this.len * 0.005; // offset for mimic real snooker table

    // ---------- POCKET SENSORS ----------
    const pocketOptions = {
      isStatic: true,
      isSensor: true // collision detection with balls
    };

    // 4 corner Pockets
    this.pockets.push(
      Bodies.circle(this.x - lx + offset, this.y - wy + offset, p / 2, pocketOptions),
      Bodies.circle(this.x + lx - offset, this.y - wy + offset, p / 2, pocketOptions),
      Bodies.circle(this.x - lx + offset, this.y + wy - offset, p / 2, pocketOptions),
      Bodies.circle(this.x + lx - offset, this.y + wy - offset, p / 2, pocketOptions)
    );

    // 2 side Pockets
    this.pockets.push(
      Bodies.circle(this.x, this.y - wy, p / 2, pocketOptions),
      Bodies.circle(this.x, this.y + wy, p / 2, pocketOptions)
    );

    World.add(engine.world, this.pockets);

    // ---------- TABLE CUSHIONS ----------- 
    const cushionThickness = this.frameWidth * 3 / 5; // slightly shorter than frame width
    const cushionLength = this.len/2 - this.len / 32 ; // leave gaps for pockets

    const cushionOptions = {
      isStatic: true, // cushion wont move
      restitution: 0.9
    };

    const topLeftCushion = Bodies.rectangle(
      this.x - lx / 2 + offset / 2,
      this.y - wy + cushionThickness / 2,
      cushionLength,
      cushionThickness,
      cushionOptions
    );

		const topRightCushion = Bodies.rectangle(
      this.x + lx / 2 - offset / 2,
      this.y - wy + cushionThickness / 2,
      cushionLength,
      cushionThickness,
      cushionOptions
    );

		const bottomLeftCushion = Bodies.rectangle(
      this.x - lx / 2 + offset / 2,
      this.y + wy - cushionThickness / 2,
      cushionLength,
      cushionThickness,
      cushionOptions
    );

		const bottomRightCushion = Bodies.rectangle(
      this.x + lx / 2 - offset / 2,
      this.y + wy - cushionThickness / 2,
      cushionLength,
      cushionThickness,
      cushionOptions
    );

		const leftCushion = Bodies.rectangle(
      this.x - lx + cushionThickness/2,
      this.y,
			cushionThickness,
      cushionLength - offset,
      cushionOptions
    );

		const rightCushion = Bodies.rectangle(
      this.x + lx - cushionThickness/2,
      this.y,
			cushionThickness,
      cushionLength - offset,
      cushionOptions
    );

		this.cushions.push(topLeftCushion);
	  this.cushions.push(topRightCushion);
		this.cushions.push(bottomLeftCushion);
		this.cushions.push(bottomRightCushion);
		this.cushions.push(leftCushion);
		this.cushions.push(rightCushion);

    World.add(engine.world, this.cushions);
  }


	// ===============================
  // draw cushions and pockets using vertice helper function
  // ===============================
  drawCushions() {
    push();
    fill(20,90,20);
    noStroke();
    for (var c of this.cushions) {
      drawVertices(c.vertices);
    }
    pop();
  }

	drawPockets() {
    push();
    fill(0);
    noStroke();
    for (var p of this.pockets) {
      drawVertices(p.vertices);
    }
    pop();
  }
}

