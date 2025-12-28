class CueStick {
    constructor(table) {
      this.active = false;
      this.aimPos = null;
      this.width = table.len/ 128;
      this.length = table.len / 8;
      this.bodyportion = 0.8;
  
      // animation property
      this.animating = false;
      this.animOffset = 0;
      this.animDir = -1; 
      this.animSpeed = 2;
      this.maxOffset = this.length / 3;
    }
		
		// ===============================
		// cuestick activation control
		// ===============================
    activate(mouseX, mouseY) {
      this.active = true;
      this.aimPos = createVector(mouseX, mouseY);
    }

		deactivate() {
			// clean up 
			this.active = false;
			this.aimPos = null;
			this.animating = false; 
			this.animOffset = 0;
			this.animDir = -1;

		}
  

		// ========================================
		// cuestick animation control when mouse pressed
		// ========================================
    startAnimation() {
      if (!this.active) return;
      this.animating = true;
      this.animOffset = 0;
      this.animDir = -1; 
    }
  
    updateAnimation() {
			if (this.animating){
				this.animOffset += this.animSpeed * this.animDir;

				// when reaching the maxOffset, move opposite direciotn
				if (this.animOffset <= -this.maxOffset || this.animOffset >= 0) {
					this.animDir *= -1;
				}
			}
    }

		stopAnimation(){
			this.animOffset = 0;
			this.animating = false;
		}


		// ===============================
		// draw cuestick
		// ===============================
    draw(whiteBall) {
      if (!this.active || !whiteBall || !this.aimPos) return;
  
      var ballPos = whiteBall.body.position;
			
			// calculate the direction that cue points to whiteball
      var dir = p5.Vector.sub(createVector(ballPos.x, ballPos.y), this.aimPos).normalize();
  
			// cue stick coordinate 
      var stickStart = this.aimPos.copy().add(dir.copy().mult(this.animOffset)); // mult animation offset
      var stickEnd = p5.Vector.add(stickStart, dir.copy().mult(this.length * -1)); //the startpoint of whole stick
      var bodyStart = p5.Vector.lerp(stickStart, stickEnd, 1 - this.bodyportion); // the startpoint of stick body
  
      push();
      strokeWeight(this.width);
      stroke(255, 255, 0); // yellow head
      line(stickStart.x, stickStart.y, bodyStart.x, bodyStart.y);
  
      stroke(160, 82, 45); // brown body
      line(bodyStart.x, bodyStart.y, stickEnd.x, stickEnd.y);
      pop();
    }
  }
  