// ball.js

class Ball {
	constructor(x, y, r, colour, type) {
		this.r = r;
		this.colour = colour;
		this.type = type;

		const options = {
			restitution: 0.98,
			friction: 0.02
		};

		// for animation when removing in a pocket
		this.isPotted = false;
		this.isRemoving = false;
		this.fade = 255;
		this.shrink = 1;

		// ball trail effect
		this.trail = []; // for record trail data 
		this.maxTrailLength = 15;
		this.trailFadeFactor = 0.75; // trail fadeout rate

		this.body = Bodies.circle(x, y, this.r, options);
		World.add(engine.world, this.body);
	}


  // ========================================
  // ball removal and trail animation control 
  // ========================================
	startRemove() {
		this.isPotted = true;
    this.isRemoving = true;

    // stop physics influence when pot in a pocket to allow animation 
    Body.setVelocity(this.body, { x: 0, y: 0 });
    Body.setAngularVelocity(this.body, 0);
    Body.setStatic(this.body, true);
		console.log("is removing")
  }

	update() {
		// trail data update
		if (!this.isRemoving && !this.isPotted) {

			this.trail.push({
				x: this.body.position.x,
				y: this.body.position.y,
				fade: 180
			});

				// clean up older trail data 
				if (this.trail.length > this.maxTrailLength) {
					this.trail.shift();
				}
			
			}

		// update removing animation (fade and shrink)
    if (this.isRemoving) {
			this.fade -= 5;        // fade out
			this.shrink -= 0.02;   // shrink 

			if (this.fade <= 0 || this.shrink <= 0) {
				this.remove();
			}
		}
  }


  // ===============================
  // draw ball itself using vertices helper function
  // ===============================
  draw() {
		// draw trail 
		for (var t of this.trail) {
			fill(red(this.colour), green(this.colour), blue(this.colour), t.fade);
			noStroke();
			ellipse(t.x, t.y, this.r * 1.2 );
			t.fade *= this.trailFadeFactor;
		}


		// draw ball
	  var pos = this.body.position;
		push();
		translate(pos.x, pos.y); // move origin to ball center
		fill(red(this.colour), green(this.colour), blue(this.colour), this.fade);
		noStroke();
		scale(this.shrink); // scale around the tranlate center
		drawVertices(this.body.vertices.map(v => ({ x: v.x - pos.x, y: v.y - pos.y })));
		pop();
  }

	
  // ===============================
  // complete remove after removal anmation
  // ======================================
  remove() {
    World.remove(engine.world, this.body);
		this.isRemoving = false;
    this.toBeDeleted = true;
  }

}
