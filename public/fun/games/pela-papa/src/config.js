p5.disableFriendlyErrors = true;

export const GAME_LANG = new URLSearchParams(window.location.search).get('lang') || 'en';

export const CONFIG = {
  fps: 30,
  tps: 30,

  camera: {
    dist: 1400,
    elevation: -0.25,
    azimuth: 0,
    rotateSensitivity: 0.002,
    // Per-tick "delta" handed to orbit.rotate() and knife.scroll() while
    // a WASD/QE key is held. Tuned so a full 360° orbit takes ~4 s at
    // 30 tps (25 × 30 × 0.002 ≈ 1.5 rad/s), and Q/E sweeps the full
    // offset range in ~2 s (10 × 30 × 0.5 = 150 u/s, range = 300).
    keyRotateSpeed: 25,
    keyScrollSpeed: 10,
  },

  // Color knobs (see potato.draw for how they're used)
  colors: {
    background: [12, 12, 16],
    skin:       [104, 68, 40],    // fallback when there's no texture (potato-skin brown)
    flesh:      [232, 205, 120],  // potato yellow (interior)
    highlight:  [220, 60, 50],    // red for the geometry about to be cut
  },

  // Rendering knobs read by the potato
  render: {
    // A coplanar group is a cap (yellow flesh) only if its area exceeds this
    // fraction of the total. Base mesh groups are < ~1.5%, real cuts >= ~7%.
    capAreaThreshold: 0.03,
    shininess: 18,
  },

  score: {
    // Keep this fraction of the volume (or more) after peeling = 100%.
    // Example: 47 out of 50 => 0.94.
    perfectKeepRatio: 0.94,
    // The potato counts as "peeled" when less than this fraction of skin remains.
    peeledThreshold: 0.02,
  },
};
