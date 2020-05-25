// A normalized stacked area chart
class Chart {

  // x - x coordinate of top left corner
  // y - y coordinate of top left corner
  // w - chart width
  // h - chart height
  // colors - array of area colors, top to bottom
  constructor(x, y, w, h, colors) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.colors = colors;
    this.data = [];
  }

  // values - array of current values, top to bottom
  update(values) {
    const total = values.reduce((a, b) => a + b, 0);
    const offsets = [0];
    let s = 0;
    for (let i = 0; i < values.length; i++) {
      s += map(values[i], 0, total, 0, this.height);
      offsets.push(s);
    }
    this.data.push(offsets);
  }

  draw() {
    noStroke();
    fill(200);
    rect(this.x, this.y, this.width, this.height);
    const xstep = this.width > this.data.length ? 1 : this.width / this.data.length;

    for (let c = 0; c < this.colors.length; c++) {
      let x = this.x;
      fill(this.colors[c]);
      beginShape();
      for (let i = 0; i < this.data.length; i++) {
        vertex(x, this.y + this.data[i][c]);
        x += xstep;
      }
      for (let i = this.data.length - 1; i >= 0; i--) {
        x -= xstep;
        vertex(x, this.y + this.data[i][c + 1]);
      }
      endShape(CLOSE);
    }
  }
  
}
