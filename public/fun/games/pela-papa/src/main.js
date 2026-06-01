import { CONFIG, GAME_LANG } from './config.js';
import { MainMenu } from './classes/game-states/main-menu.js';

window.ctx = {
  /** Current game state */
  gs: null,
  /** Accumulated delta for the fixed-rate tick */
  deltaSum: 0,
  /** Translations for the current language */
  i18n: {},
  /** Loaded assets (textures, etc.) */
  assets: {},
};

const tickInterval = 1000 / CONFIG.tps;

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
  // The texture is optional: if the file is missing the game runs with a flat color.
  window.ctx.assets.potatoTex = loadImage(
    'assets/potato.png',
    () => {},
    () => { window.ctx.assets.potatoTex = null; }
  );
};

window.setup = function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
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

window.keyPressed   = () => window.ctx.gs.keyPressed(keyCode);
window.mousePressed = () => window.ctx.gs.mousePressed();
window.mouseDragged = () => window.ctx.gs.mouseDragged();
window.mouseReleased= () => window.ctx.gs.mouseReleased();
window.mouseWheel   = (e) => window.ctx.gs.mouseWheel(e);

window.draw = function draw() {
  const frameTime = Math.min(deltaTime, 250);
  window.ctx.deltaSum += frameTime;

  while (window.ctx.deltaSum >= tickInterval) {
    window.ctx.gs.tick();
    window.ctx.deltaSum -= tickInterval;
  }

  window.ctx.gs.draw();
};

window.windowResized = function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};
