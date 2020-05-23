class Chart {
    constructor(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.width = w;
      this.height = h;
      this.data = [];
    }
  
    update(d) {
      // if (d.infected === 0) {
      //   return;
      // }
      this.data.push(d);
    }
  
    draw() {
      noStroke();
      fill(255);
      rect(this.x, this.y, this.width, this.height);
      const xstep = this.width > this.data.length ? 1 : this.width / this.data.length;
  
      let x = 0;
      fill(255, 128, 128);
      beginShape();
      for (let i = 0; i < this.data.length; i++) {
        const d = this.data[i];
        const infHeight = map(d.infected, 0, d.total, 0, this.height);
        vertex(x, this.y + this.height - infHeight);
        x += xstep;
      }
      vertex(x, this.y + this.height);
      endShape(CLOSE);
      
      x = 0;
      fill(0);
      beginShape();
      for (let i = 0; i < this.data.length; i++) {
        const d = this.data[i];
        const decHeight = map(d.dead, 0, d.total, 0, this.height);
        vertex(x, this.y + decHeight);
        x += xstep;
      }
      vertex(x, this.y);
      endShape(CLOSE);
      
      x = 0;
      fill(128, 128, 255);
      beginShape();
      for (let i = 0; i < this.data.length; i++) {
        const d = this.data[i];
        const decHeight = map(d.dead, 0, d.total, 0, this.height);
        vertex(x, this.y + decHeight);
        x += xstep;
      }
      for (let i = this.data.length - 1; i >= 0; i--) {
        const d = this.data[i];
        const decHeight = map(d.dead, 0, d.total, 0, this.height);
        const recHeight = map(d.recovered, 0, d.total, 0, this.height);
        vertex(x, this.y + decHeight + recHeight);
        x -= xstep;
      }
      vertex(x, this.y);
      endShape(CLOSE);
      
      x = 0;
      fill(125, 199, 125);
      beginShape();
      for (let i = 0; i < this.data.length; i++) {
        const d = this.data[i];
        const decHeight = map(d.dead, 0, d.total, 0, this.height);
        const recHeight = map(d.recovered, 0, d.total, 0, this.height);
        vertex(x, this.y + decHeight + recHeight);
        x += xstep;
      }
      for (let i = this.data.length - 1; i >= 0; i--) {
        const d = this.data[i];
        const decHeight = map(d.dead, 0, d.total, 0, this.height);
        const recHeight = map(d.recovered, 0, d.total, 0, this.height);
        const immHeight = map(d.immune, 0, d.total, 0, this.height);
        vertex(x, this.y + decHeight + recHeight + immHeight);
        x -= xstep;
      }
      vertex(x, this.y);
      endShape(CLOSE);
    }
    
  }
  