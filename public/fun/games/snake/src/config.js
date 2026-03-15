// Disable p5.js friendly-error system for performance
p5.disableFriendlyErrors = true;

// LANGUAGE SETUP
export const gameLang = new URLSearchParams(window.location.search).get('lang') || 'en';

// IN-GAME STATE CONSTANTS
export const STATE_PLAYING = 0;
export const STATE_WON = 1;
export const STATE_LOST = -1;

// DIRECTION CONSTANTS
export const NULL_DIR = -1;
export const UP_DIR = 0.5;
export const DOWN_DIR = 1.5;
export const LEFT_DIR = 1;
export const RIGHT_DIR = 0;

// SETUP CONFIG
export const config = {
  width: 768,
  height: 512,
  rows: 12,
  cols: 12,
  get cellW() {
    return round(this.width / this.cols);
  },
  get cellH() {
    return round(this.height / this.rows);
  },
  timeForTick: 200, // MS
};
