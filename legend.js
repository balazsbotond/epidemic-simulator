class Legend {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.width = 150;
      this.height = 100;
      this.padding = 15;
      this.paddingTop = 5;
      this.rectw = 15;
      this.recth = 10;
    }
    
    draw(stats) {
      push();
      fill(230);
      noStroke();
      rect(this.x, this.y, this.width, this.height);
      textSize(12);
      textFont('Arial');
      
      const items = [
        { color: 'rgb(0, 0, 0)', label: 'deceased', value: stats.dead },
        { color: 'rgb(128, 128, 255)', label: 'recovered', value: stats.recovered },
        { color: 'rgb(125, 199, 125)', label: 'immune', value: stats.immune },
        { color: 'rgb(255, 255, 255)', label: 'susceptible', value: stats.healthy },
        { color: 'rgb(255, 128, 128)', label: 'infected', value: stats.infected },
      ];
      
      let offset = 0, lineHeight = 20;
      
      for (const item of items) {
        stroke(200);
        strokeWeight(1);
        fill(item.color);
        rect(this.x + this.padding, this.y + this.paddingTop + offset, this.rectw, this.recth);
        noStroke();
        fill(0);
        textAlign(LEFT);
        text(item.label, this.x + this.padding + this.rectw + 5, this.y + this.paddingTop + this.recth - 1 + offset);
        textAlign(RIGHT);
        text(item.value, this.x + this.width - this.padding, this.y + this.paddingTop + this.recth - 1 + offset);
  
        offset += lineHeight;
      }
  
      pop();
    }
  }