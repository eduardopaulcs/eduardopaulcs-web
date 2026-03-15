import { state } from './state.js';
import { config, gameLang } from './config.js';
import { MainMenu } from './classes/game-states/main-menu.js';

/**
 * Loads assets before setup runs. p5.js ensures this completes before setup() is called.
 */
window.preload = function preload() {
  state.i18n = loadJSON(`i18n/${gameLang}.json`);
};

/**
 * Executed the first time the program runs, it "sets up" every thing needed to start.
 */
window.setup = function setup() {
  // If this screen is vertical
  if (windowHeight > windowWidth && config.cols > config.rows) {
    let temp = config.cols;
    config.cols = config.rows;
    config.rows = temp;
  }

  // Make canvas full screen width
  config.width = floor(windowWidth / config.cols) * config.cols;
  config.height = config.cellW * config.rows;

  // If height is too tall, cap size with height
  if (config.height > windowHeight) {
    config.height = floor(windowHeight / config.rows) * config.rows;
    config.width = config.cellH * config.cols;
  }

  createCanvas(config.width, config.height);
  frameRate(30);

  // Pause the loop when the tab is hidden; discard accumulated delta on restore
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      noLoop();
    } else {
      state.deltaSum = 0;
      loop();
    }
  });

  // Set MainMenu state
  state.gs = new MainMenu();
};

/**
 * Handles key input.
 */
window.keyPressed = function keyPressed() {
  state.gs.keyPressed(keyCode);
};

/**
 * Draws a frame.
 */
window.draw = function draw() {
  state.deltaSum = Math.min(state.deltaSum + deltaTime, config.timeForTick * 3);

  // If we have to tick
  while (state.deltaSum >= config.timeForTick) {
    state.gs.tick();

    state.deltaSum -= config.timeForTick;
  }

  // We are assuming 30 fps
  state.gs.draw();
};
