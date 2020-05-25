// a legend for the chart that displays constantly updating values
class Legend {

  // x - x coordinate of top left corner
  // y - y coordinate of top left corner
  // labels - array of objects like: { color: color(255, 255, 255), label: 'my label' }
  constructor(x, y, labels) {
    this.x = x;
    this.y = y;
    this.width = 150;
    this.height = 100;
    this.padding = 15;
    this.paddingTop = 5;
    this.rectw = 15;
    this.recth = 10;
    this.labels = labels;
  }

  // values - array of current values for the labels
  draw(values) {
    push();
    fill(230);
    noStroke();
    rect(this.x, this.y, this.width, this.height);
    textSize(12);
    textFont('Arial');

    let offset = 0, lineHeight = 20, i = 0;

    for (const item of this.labels) {
      stroke(200);
      strokeWeight(1);
      fill(item.color);
      rect(this.x + this.padding, this.y + this.paddingTop + offset, this.rectw, this.recth);
      noStroke();
      fill(0);
      textAlign(LEFT);
      text(item.label, this.x + this.padding + this.rectw + 5, this.y + this.paddingTop + this.recth - 1 + offset);
      textAlign(RIGHT);
      text(values[i], this.x + this.width - this.padding, this.y + this.paddingTop + this.recth - 1 + offset);

      offset += lineHeight;
      i++;
    }

    pop();
  }
}
