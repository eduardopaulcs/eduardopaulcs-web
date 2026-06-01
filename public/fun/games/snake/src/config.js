p5.disableFriendlyErrors = true;

export const GAME_LANG = new URLSearchParams(window.location.search).get('lang') || 'en';

export const CONFIG = {
  fps: 30,
  // 5 ticks per second = one snake step every 200 ms. The old 1.3.x code
  // used `timeForTick: 200` for this; same number, framework standard now.
  tps: 5,

  grid: {
    rows: 12,
    cols: 12,
  },
};
