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

    if (random(0, 1) > this.settings.probHereditaryImmunity) {
      this.makeSusceptible()
    } else {
      this.inoculate();
    }

    const recoveryTime = randomIntWithRange(this.settings.recoveryTime, this.settings.recoveryTimeRange);
    this.infectionCountdown = new Countdown(recoveryTime, () => this.onRecovery());

    const acquiredacquiredImmunityTime = randomIntWithRange(this.settings.acquiredImmunityTime, this.settings.acquiredImmunityTimeRange);
    this.acquiredImmunityCountdown = new Countdown(recoveryTime, () => this.onLossOfAcquiredImmunity());

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
      this.infectionCountdown.update();
    }
    if (this.state === 'acquiredImmunity') {
      this.acquiredImmunityCountdown.update();
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
      map(this.infectionCountdown.current, 0, this.infectionCountdown.from, TWO_PI, 0),
      0
    );
  }

  inoculate() {
    this.state = 'hereditaryImmunity';
    this.color = this.colors.hereditaryImmunity;
  }

  infect() {
    this.state = 'infected';
    this.color = this.colors.infected;
    this.infectionCountdown.reset();
  }

  recover() {
    this.state = 'acquiredImmunity';
    this.color = this.colors.acquiredImmunity;
    this.acquiredImmunityCountdown.reset();
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

  onRecovery() {
    if (random(0, 1) < this.settings.probDeath) {
      this.kill();
    } else {
      this.recover();
    }
  }

  onLossOfAcquiredImmunity() {
    this.makeSusceptible();
  }
}

function randomIntWithRange(from, Range) {
  return floor(random(from, from + Range));
}

function occurs(probability) {
  return random(0, 1) < probability;
}