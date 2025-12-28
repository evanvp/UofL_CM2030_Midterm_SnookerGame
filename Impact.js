class CueImpact {
    constructor(x, y) {
      this.pos = createVector(x, y); // whiteball location
  
      this.r = 0; // impact circle start radius
      this.maxR = 40; 
  
      this.fade = 200;
      this.fadeSpeed = 15;
      this.expandSpeed = 4;
  
      this.done = false;
    }
  
    update() {
      this.r += this.expandSpeed; // circle expand
      this.fade -= this.fadeSpeed; 
  
      if (this.fade <= 0 || this.r >= this.maxR) {
        this.done = true;
      }
    }
  
    draw() {
      push();
      noFill();
      stroke(255, 255, 255, this.fade);
      strokeWeight(2);
      ellipse(this.pos.x, this.pos.y, this.r * 2);
      pop();
    }
  }
  