import { config, gameLang } from './config.js';
import { state } from './state.js';
import { MainState } from './classes/program-states/main-state.js';

let ps = null;
let deltaSum = 0;

/**
 * Loads assets before setup runs. p5.js ensures this completes before setup() is called.
 */
window.preload = function preload() {
  state.i18n = loadJSON(`i18n/${gameLang}.json`);
};

/**
 * Executed the first time the program runs, sets up everything needed to start.
 */
window.setup = function setup() {
  config.width = windowWidth;
  config.height = windowHeight;

  createCanvas(config.width, config.height);
  frameRate();

  // Prevent browser context menu so right click can be used in-game
  document.addEventListener('contextmenu', e => e.preventDefault());

  // Pause the loop when the tab is hidden; discard accumulated delta on restore
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      noLoop();
    } else {
      deltaSum = 0;
      loop();
    }
  });

  ps = new MainState();

  ps.startRandom();
};

/**
 * Handles mouse clicks.
 */
window.mousePressed = function mousePressed() {
  if (mouseButton === LEFT) {
    ps.handleLeftClick(mouseX, mouseY);
  } else if (mouseButton === RIGHT) {
    ps.handleRightClick(mouseX, mouseY);
  }
  return false;
};

/**
 * Draws a frame.
 */
window.draw = function draw() {
  deltaSum = Math.min(deltaSum + deltaTime, config.timeForTick * 3);

  // If we have to tick
  while (deltaSum > config.timeForTick) {
    ps.tick();

    deltaSum -= config.timeForTick;
  }

  ps.draw();
};
