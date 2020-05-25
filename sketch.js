const ballRadius = 5;
const w = window.innerWidth;
const h = window.innerHeight;
const chartHeight = 100;
const chartWidth = w - 150;
const chartX = 0;
const chartY = h - chartHeight;
const xmin = 0;
const xmax = w;
const ymin = 0;
const ymax = h - chartHeight;
const bgcolor = '#1c2321';

let running = false;
let balls = [];
let chart;
let legend;
let paramGui;
let controlGui;
let cycle = 0;

const colors = {
  deceased: 'rgb(0, 0, 0)',
  acquiredImmunity: 'rgb(128, 128, 255)',
  hereditaryImmunity: 'rgb(172, 128, 255)',
  susceptible: 'rgb(125, 199, 125)',
  infected: 'rgb(255, 128, 128)',
  background: 'rgb(255, 255, 255)'
}

const chartColors = [
  colors.deceased,
  colors.acquiredImmunity,
  colors.hereditaryImmunity,
  colors.susceptible,
  colors.infected
];

const labels = [
  { color: colors.deceased, label: 'deceased' },
  { color: colors.acquiredImmunity, label: 'acq. immunity' },
  { color: colors.hereditaryImmunity, label: 'her. immunity' },
  { color: colors.susceptible, label: 'susceptible' },
  { color: colors.infected, label: 'infected' },
];

const settings = {
  population: 920,
  infectionDistance: 30,
  probStationary: 0.0,
  probHereditaryImmunity: 0.0,
  probDeath: 0.1,
  probInfection: 0.1,
  recoveryTime: 300,
  recoveryTimeRange: 60,
  acquiredImmunityTime: 200,
  acquiredImmunityTimeRange: 100,
  showInfectionDistance: true,
  drawBorders: true,
  speed: 1
};

function setup() {
  const canvas = createCanvas(w, h);
  background(colors.background);
  initGui();
}

function draw() {
  if (!running) {
    return;
  }

  const shouldDraw = cycle === 0;

  if (shouldDraw) {
    background(colors.background);
  }

  updateBalls(shouldDraw);
  updateStats(shouldDraw);
  updateGui();

  cycle = (cycle + 1) % settings.speed;
}

function updateBalls(shouldDraw) {
  const qtree = buildQuadTree();

  for (const ball of balls) {
    ball.update();
    ball.checkInfection(qtree);
    if (shouldDraw) {
      ball.draw();
    }
  }
}

function updateStats(shouldDraw) {
  const stats = getStats();
  chart.update(stats);

  if (shouldDraw) {
    legend.draw(stats);
    chart.draw();
  }
}

function updateGui() {
  controlGui.setValue('FPS', floor(frameRate()));
}

function buildQuadTree() {
  const boundary = new Rectangle(0, 0, w, h - chartHeight);
  const qtree = new QuadTree(boundary, 4);

  for (const ball of balls) {
    qtree.insert(new Point(ball.pos.x, ball.pos.y, ball));
  }

  return qtree;
}

function getStats() {
  return [
    countStates(balls, 'deceased'),
    countStates(balls, 'acquiredImmunity'),
    countStates(balls, 'hereditaryImmunity'),
    countStates(balls, 'susceptible'),
    countStates(balls, 'infected'),
  ];
}

function startSimulation() {
  controlGui.hideControl('Start');
  controlGui.showControl('Stop');
  paramGui.hideControl('population');
  paramGui.hideControl('probStationary');
  paramGui.hideControl('probHereditaryImmunity');
  paramGui.hideControl('recoveryTime');
  paramGui.hideControl('recoveryTimeRange');
  paramGui.hideControl('acquiredImmunityTime');
  paramGui.hideControl('acquiredImmunityTimeRange');
  initSimulation();
  running = true;
}

function stopSimulation() {
  controlGui.hideControl('Stop');
  controlGui.showControl('Start');
  paramGui.showControl('population');
  paramGui.showControl('probStationary');
  paramGui.showControl('probHereditaryImmunity');
  paramGui.showControl('recoveryTime');
  paramGui.showControl('recoveryTimeRange');
  paramGui.showControl('acquiredImmunityTime');
  paramGui.showControl('acquiredImmunityTimeRange');
  running = false;
}

function initSimulation() {
  balls = [];

  for (let i = 0; i < settings.population - 1; i++) {
    balls.push(new Ball(ballRadius, xmin, ymin, xmax, ymax, settings, colors));
  }

  const infected = new Ball(ballRadius, xmin, ymin, xmax, ymax, settings, colors);
  infected.initAsZeroPatient();
  balls.push(infected);

  chart = new Chart(chartX, chartY, chartWidth, chartHeight, chartColors);
  legend = new Legend(chartX + chartWidth, chartY, labels);
}

function initGui() {
  controlGui = QuickSettings.create(window.innerWidth - 225, 20, 'Simulation');
  controlGui.setCollapsible(true);
  controlGui.bindRange('speed', 1, 50, settings.speed, 1, settings);
  controlGui.bindBoolean('showInfectionDistance', settings.showInfectionDistance, settings);
  controlGui.bindBoolean('drawBorders', settings.drawBorders, settings);
  controlGui.addHTML('FPS', 0, () => {});
  controlGui.disableControl('FPS');
  controlGui.addButton('Start', startSimulation);
  controlGui.addButton('Stop', stopSimulation);
  controlGui.hideControl('Stop');
  controlGui.saveInLocalStorage('epidemic-simulator-control');

  // prevent clicks from propagating to the canvas
  controlGui._panel.addEventListener('click', e => e.stopPropagation());

  paramGui = QuickSettings.create(20, 20, 'Parameters');
  paramGui.setCollapsible(true);
  paramGui.bindRange('population', 1, 2000, settings.population, 1, settings);
  paramGui.bindRange('infectionDistance', 5, 50, settings.infectionDistance, 1, settings);
  paramGui.bindRange('probStationary', 0, 1, settings.probStationary, 0.1, settings);
  paramGui.bindRange('probHereditaryImmunity', 0, 1, settings.probHereditaryImmunity, 0.1, settings);
  paramGui.bindRange('probDeath', 0, 1, settings.probDeath, 0.1, settings);
  paramGui.bindRange('probInfection', 0, 1, settings.probInfection, 0.1, settings);
  paramGui.bindRange('recoveryTime', 1, 1000, settings.recoveryTime, 1, settings);
  paramGui.bindRange('recoveryTimeRange', 1, 1000, settings.recoveryTimeRange, 1, settings);
  paramGui.bindRange('acquiredImmunityTime', 1, 5000, settings.acquiredImmunityTime, 1, settings);
  paramGui.bindRange('acquiredImmunityTimeRange', 1, 1000, settings.acquiredImmunityTimeRange, 1, settings);
  paramGui.saveInLocalStorage('epidemic-simulator-parameters');

  // prevent clicks from propagating to the canvas
  paramGui._panel.addEventListener('click', e => e.stopPropagation());
}

function countStates(balls, state) {
  return balls.filter(b => b.state === state).length;
}