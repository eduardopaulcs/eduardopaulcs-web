import { CONFIG, GAME_LANG } from './config.js';
import { MainMenu } from './classes/game-states/main-menu.js';

window.ctx = {
  /** Current game state */
  gs: null,
  /** Accumulated delta for the fixed-rate tick */
  deltaSum: 0,
  /** Translations for the current language */
  i18n: {},
};

/** Switches game state, cleaning up the previous one if needed. */
window.setGameState = function setGameState(gs) {
  if (window.ctx.gs && typeof window.ctx.gs.dispose === 'function') {
    window.ctx.gs.dispose();
  }
  window.ctx.gs = gs;
  window.ctx.deltaSum = 0;
};

window.preload = function preload() {
  window.ctx.i18n = loadJSON(`i18n/${GAME_LANG}.json`);
};

window.setup = function setup() {
  // Initial canvas size for the title screen. Playing.init() resizes again
  // for the grid the player picks. Snap to whole-pixel square cells.
  if (windowHeight > windowWidth && CONFIG.grid.cols > CONFIG.grid.rows) {
    [CONFIG.grid.cols, CONFIG.grid.rows] = [CONFIG.grid.rows, CONFIG.grid.cols];
  }
  let cellSize = floor(windowWidth / CONFIG.grid.cols);
  let canvasW  = cellSize * CONFIG.grid.cols;
  let canvasH  = cellSize * CONFIG.grid.rows;
  if (canvasH > windowHeight) {
    cellSize = floor(windowHeight / CONFIG.grid.rows);
    canvasW  = cellSize * CONFIG.grid.cols;
    canvasH  = cellSize * CONFIG.grid.rows;
  }
  createCanvas(canvasW, canvasH);
  frameRate(CONFIG.fps);

  document.querySelector('canvas').addEventListener('contextmenu', e => e.preventDefault());

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      noLoop();
    } else {
      window.ctx.deltaSum = 0;
      loop();
    }
  });

  window.ctx.gs = new MainMenu();
};

window.keyPressed    = () => window.ctx.gs.keyPressed(keyCode);
window.mousePressed  = () => window.ctx.gs.mousePressed();
window.mouseDragged  = () => window.ctx.gs.mouseDragged();
window.mouseReleased = () => window.ctx.gs.mouseReleased();
window.mouseWheel    = (e) => window.ctx.gs.mouseWheel(e);

window.draw = function draw() {
  const frameTime = Math.min(deltaTime, 250);
  window.ctx.deltaSum += frameTime;

  // Each state can declare its own tps (default CONFIG.tps). Picked up
  // every frame so the speed selector on the menu takes effect immediately
  // when entering Playing.
  const tickInterval = 1000 / (window.ctx.gs.tps ?? CONFIG.tps);
  while (window.ctx.deltaSum >= tickInterval) {
    window.ctx.gs.tick();
    window.ctx.deltaSum -= tickInterval;
  }

  window.ctx.gs.draw();
};
