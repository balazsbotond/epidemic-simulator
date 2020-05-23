class Ball {
    constructor(xmin, ymin, xmax, ymax) {
      this.xmin = xmin;
      this.xmax = xmax;
      this.ymin = ymin;
      this.ymax = ymax;
      this.pos = createVector(random(xmin, xmax), random(ymin, ymax));
      this.vel = random(0, 1) > settings.probStationary
        ? createVector(random(-2, 2), random(-2, 2))
        : createVector(0, 0);
      this.state = random(0, 1) > settings.probImmune
        ? 'healthy'
        : 'immune';
      this.recoveryTime = floor(random(settings.recoveryTime, settings.recoveryTime + settings.recoveryTimeSpread));
      this.timeUntilRecovery = this.recoveryTime;
      this.immunityTime = floor(random(settings.immunityTime, settings.immunityTime + settings.immunityTimeSpread));
      this.timeUntilSusceptible = this.immunityTime;
      this.contacts = [];
    }
    
    initAsZeroPatient() {
      this.state = 'infected';
      this.vel = createVector(random(-2, 2), random(-2, 2));
    }
  
    update() {
      if (this.pos.x < this.xmin || this.pos.x > this.xmax) {
        this.vel.x *= -1;
      }
      if (this.pos.y < this.ymin || this.pos.y > this.ymax) {
        this.vel.y *= -1;
      }
      if (this.state === 'infected') {
        this.timeUntilRecovery--;
        if (this.timeUntilRecovery === 0) {
          if (random(0, 1) < settings.probDeath) {
            this.kill();
          } else {
            this.heal();
          }
        }
      }
      if (this.state === 'recovered') {
        this.timeUntilSusceptible--;
        if (this.timeUntilSusceptible === 0) {
          this.state = 'healthy';
          this.timeUntilRecovery = this.recoveryTime;
          this.timeUntilSusceptible = this.immunityTime;
        }
      }
      this.pos.add(this.vel);
    }
  
    draw() {
      if (settings.drawBorders) {
        fill(0);
        circle(this.pos.x, this.pos.y, ballRadius + 2);
      }
      switch (this.state) {
        case 'healthy':
          fill(255);
          break;
        case 'infected':
          this.drawInfected();
          fill(255, 0, 0);
          break;
        case 'recovered':
          fill(128, 128, 255);
          break;
        case 'immune':
          fill(125, 199, 125);
          break;
        case 'dead':
          fill(0);
          break;
      }
      circle(this.pos.x, this.pos.y, ballRadius);
    }
  
    drawInfected() {
      if (!settings.showInfectionDistance) {
        return;
      }
      fill('rgba(255, 0, 0, 0.25)');
      noStroke();
      circle(this.pos.x, this.pos.y, settings.infectionDistance);
      arc(
        this.pos.x,
        this.pos.y,
        settings.infectionDistance,
        settings.infectionDistance,
        map(this.timeUntilRecovery, 0, this.recoveryTime, TWO_PI, 0),
        0
      );
    }
  
    infect() {
      if (this.state !== 'healthy') {
        return;
      }
      this.state = 'infected';
    }
  
    heal() {
      if (this.state !== 'infected') {
        return;
      }
      this.state = 'recovered';
    }
  
    kill() {
      if (this.state !== 'infected') {
        return;
      }
      this.state = 'dead';
      this.vel.mult(0);
    }
  
    isNear(ball) {
      return this.pos.dist(ball.pos) <= settings.infectionDistance;
    }
  
    checkInfection(qtree) {
      const range = new Circle(this.pos.x, this.pos.y, settings.infectionDistance);
      const points = qtree.query(range);
      const newContacts = [];
      for (const point of points) {
        const ball = point.userData;
        if (!this.isNear(ball) || (this.state !== 'infected' && ball.state !== 'infected')) {
          continue;
        }
        if (!this.contacts.includes(ball) && random(0, 1) < settings.probInfection) {
          this.infect();
          ball.infect();
        }
        newContacts.push(ball);
      }
      this.contacts = newContacts;
    }
  }