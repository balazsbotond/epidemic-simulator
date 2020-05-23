const ballRadius = 5;
let running = false;

const w = window.innerWidth,
  h = window.innerHeight,
  chartHeight = 100,
  chartWidth = w - 150;
const chartX = 0,
  chartY = h - chartHeight;
const xmin = 0,
  xmax = w,
  ymin = 0,
  ymax = h - chartHeight;
const bgcolor = '#1c2321';
let balls = [];
let chart;
let legend;
let paramGui;
let controlGui;
let cycle = 1;
let settings = {
  population: 300,
  infectionDistance: 20,
  probStationary: 0.0,
  probImmune: 0.0,
  probDeath: 0.1,
  probInfection: 0.5,
  recoveryTime: 300,
  recoveryTimeSpread: 60,
  immunityTime: 200,
  immunityTimeSpread: 100,
  showInfectionDistance: true,
  drawBorders: true,
  speed: 1
};

function setup() {
  const canvas = createCanvas(w, h);
  background(190);

  controlGui = QuickSettings.create(window.innerWidth - 225, 20, 'Simulation');
  controlGui.setCollapsible(true);
  controlGui.bindRange('speed', 1, 50, settings.speed, 1, settings);
  controlGui.bindBoolean('showInfectionDistance', settings.showInfectionDistance, settings);
  controlGui.bindBoolean('drawBorders', settings.drawBorders, settings);
  controlGui.addHTML('FPS', 0, function () {});
  controlGui.disableControl('FPS');
  controlGui.addButton('Start', startSimulation);
  controlGui.addButton('Stop', stopSimulation);
  controlGui.hideControl('Stop');
  controlGui.saveInLocalStorage('epidemic-simulator-control');

  // prevent clicks to propagate to the canvas
  controlGui._panel.addEventListener('click', function (e) { e.stopPropagation() });

  paramGui = QuickSettings.create(20, 20, 'Parameters');
  paramGui.setCollapsible(true);
  paramGui.bindRange('population', 1, 2000, settings.population, 1, settings);
  paramGui.bindRange('infectionDistance', 5, 50, settings.infectionDistance, 1, settings);
  paramGui.bindRange('probStationary', 0, 1, settings.probStationary, 0.1, settings);
  paramGui.bindRange('probImmune', 0, 1, settings.probImmune, 0.1, settings);
  paramGui.bindRange('probDeath', 0, 1, settings.probDeath, 0.1, settings);
  paramGui.bindRange('probInfection', 0, 1, settings.probInfection, 0.1, settings);
  paramGui.bindRange('recoveryTime', 1, 1000, settings.recoveryTime, 1, settings);
  paramGui.bindRange('recoveryTimeSpread', 1, 1000, settings.recoveryTimeSpread, 1, settings);
  paramGui.bindRange('immunityTime', 1, 5000, settings.immunityTime, 1, settings);
  paramGui.bindRange('immunityTimeSpread', 1, 1000, settings.immunityTimeSpread, 1, settings);
  paramGui.saveInLocalStorage('epidemic-simulator-parameters');

  // prevent clicks to propagate to the canvas
  paramGui._panel.addEventListener('click', function (e) { e.stopPropagation() });

}

function draw() {
  if (!running) {
    return;
  }
  const shouldDraw = cycle === 0;
  const boundary = new Rectangle(0, 0, w, h - chartHeight);
  const qtree = new QuadTree(boundary, 4);
  for (const ball of balls) {
    qtree.insert(new Point(ball.pos.x, ball.pos.y, ball));
  }
  if (shouldDraw) {
    background(195, 209, 227);
    noStroke();
  }
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    ball.update();
    ball.checkInfection(qtree);
    if (shouldDraw) {
      ball.draw();
    }
  }
  const stats = getStats();
  chart.update(stats);
  if (shouldDraw) {
    legend.draw(stats);
    chart.draw();
  }
  cycle = (cycle + 1) % settings.speed;
  controlGui.setValue('FPS', floor(frameRate()));
}

function mouseClicked() {
  if (!running) {
    return;
  }
  const ball = new Ball(xmin, ymin, xmax, ymax);
  ball.initAsZeroPatient();
  ball.pos.x = mouseX;
  ball.pos.y = mouseY;
  balls.push(ball);
  return false;
}

function getStats() {
  return {
    healthy: countStates(balls, 'healthy'),
    infected: countStates(balls, 'infected'),
    recovered: countStates(balls, 'recovered'),
    immune: countStates(balls, 'immune'),
    dead: countStates(balls, 'dead'),
    total: balls.length
  };
}

function startSimulation() {
  init();
  controlGui.hideControl('Start');
  controlGui.showControl('Stop');
  paramGui.hideControl('population');
  paramGui.hideControl('probStationary');
  paramGui.hideControl('probImmune');
  paramGui.hideControl('recoveryTime');
  paramGui.hideControl('recoveryTimeSpread');
  paramGui.hideControl('immunityTime');
  paramGui.hideControl('immunityTimeSpread');
  running = true;
}

function stopSimulation() {
  controlGui.hideControl('Stop');
  controlGui.showControl('Start');
  paramGui.showControl('population');
  paramGui.showControl('probStationary');
  paramGui.showControl('probImmune');
  paramGui.showControl('recoveryTime');
  paramGui.showControl('recoveryTimeSpread');
  paramGui.showControl('immunityTime');
  paramGui.showControl('immunityTimeSpread');
  running = false;
}

function init() {
  balls = [];
  for (let i = 0; i < settings.population - 1; i++) {
    balls.push(new Ball(xmin, ymin, xmax, ymax));
  }
  const infected = new Ball(xmin, ymin, xmax, ymax);
  infected.initAsZeroPatient();
  balls.push(infected);
  chart = new Chart(chartX, chartY, chartWidth, chartHeight);
  legend = new Legend(chartX + chartWidth, chartY);
}

function countStates(balls, state) {
  return balls.filter(b => b.state === state).length;
}