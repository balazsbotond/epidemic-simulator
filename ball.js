class Ball {
  constructor(radius, xmin, ymin, xmax, ymax, settings, colors) {
    this.settings = settings;
    this.colors = colors;
    this.radius = radius;
    this.xmin = xmin;
    this.xmax = xmax;
    this.ymin = ymin;
    this.ymax = ymax;
    this.pos = createVector(random(xmin, xmax), random(ymin, ymax));

    this.vel = random(0, 1) > this.settings.probStationary
      ? createVector(random(-2, 2), random(-2, 2))
      : createVector(0, 0);

    if (random(0, 1) > this.settings.probImmune) {
      this.makeSusceptible()
    } else {
      this.inoculate();
    }

    this.recoveryTime = floor(random(this.settings.recoveryTime, this.settings.recoveryTime + this.settings.recoveryTimeSpread));
    this.timeUntilRecovery = this.recoveryTime;
    this.immunityTime = floor(random(this.settings.immunityTime, this.settings.immunityTime + this.settings.immunityTimeSpread));
    this.timeUntilSusceptible = this.immunityTime;
    this.contacts = [];
  }
  
  initAsZeroPatient() {
    this.infect();
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
        if (random(0, 1) < this.settings.probDeath) {
          this.kill();
        } else {
          this.recover();
        }
      }
    }
    if (this.state === 'recovered') {
      this.timeUntilSusceptible--;
      if (this.timeUntilSusceptible === 0) {
        this.makeSusceptible();
        this.timeUntilRecovery = this.recoveryTime;
        this.timeUntilSusceptible = this.immunityTime;
      }
    }
    this.pos.add(this.vel);
  }

  draw() {
    noStroke();
    if (this.settings.drawBorders) {
      fill(0);
      circle(this.pos.x, this.pos.y, this.radius + 2); // faster than using stroke
    }
    if (this.state === 'infected') {
      this.drawInfectionDistance();
    }
    fill(this.color);
    circle(this.pos.x, this.pos.y, ballRadius);
  }

  drawInfectionDistance() {
    if (!this.settings.showInfectionDistance) {
      return;
    }
    const c = color(this.color);
    c.setAlpha(63);
    fill(c);
    noStroke();
    circle(this.pos.x, this.pos.y, this.settings.infectionDistance);
    arc(
      this.pos.x,
      this.pos.y,
      this.settings.infectionDistance,
      this.settings.infectionDistance,
      map(this.timeUntilRecovery, 0, this.recoveryTime, TWO_PI, 0),
      0
    );
  }

  inoculate() {
    this.state = 'immune';
    this.color = this.colors.immune;
  }

  infect() {
    this.state = 'infected';
    this.color = this.colors.infected;
  }

  recover() {
    this.state = 'recovered';
    this.color = this.colors.recovered;
  }

  makeSusceptible() {
    this.state = 'susceptible';
    this.color = this.colors.susceptible;
  }

  kill() {
    this.state = 'deceased';
    this.vel.mult(0);
    this.color = this.colors.deceased;
  }

  checkInfection(qtree) {
    const range = new Circle(this.pos.x, this.pos.y, this.settings.infectionDistance);
    const points = qtree.query(range);
    const newContacts = [];

    for (const point of points) {
      const other = point.userData;
      if (this.state !== 'infected' || other.state !== 'susceptible') {
        continue;
      }
      if (!this.contacts.includes(other) && random(0, 1) < this.settings.probInfection) {
        other.infect();
      }
      newContacts.push(other);
    }

    this.contacts = newContacts;
  }
}