p5.disableFriendlyErrors = true;

export const GAME_LANG = new URLSearchParams(window.location.search).get('lang') || 'en';

export const CONFIG = {
  fps: 30,
  tps: 15,

  ant: {
    // Population: each colony spawns up to `size * random(min, max)` ants.
    maxPerSizeMin: 12,
    maxPerSizeMax: 24,
    // Steering kinematics. Ants accumulate angular velocity per tick within
    // [-maxTurn, +maxTurn], driven by random turnAccel jitter plus pull from
    // path/colony when applicable.
    maxTurn:           Math.PI / 16,
    turnAccel:         Math.PI / 8,
    tracerSteering:    0.3,  // pull toward colony when carrying a fresh trail
    pathSteering:      0.6,  // pull toward nearest path point when one is in range
    pathDetectRadius:  40,   // radius in which non-tracer ants notice paths
    trailInterval:     8,    // ticks between trail-point deposits while tracing
  },

  food: {
    maxLife:       100,  // initial life of a food source
    depleteAmount: 2,    // life removed each time an ant touches the food
  },

  path: {
    maxLife:             300, // ticks before a non-reinforced path expires
    initialLifePerPoint: 16,  // extra initial life per stored path point (~2× trailInterval)
  },

  colony: {
    maxLife:    8000, // initial colony life
    lifeDecay:  1,    // life lost per tick when no food is delivered
    feedAmount: 100,  // life restored per food delivery
    // Hard cap on stored trails per colony. Path scanning is the hot loop
    // (every ant, every tick, walks every point of every path), so an
    // unbounded path list is the main thing that turns lag on at scale.
    // The oldest path is dropped when a new one would exceed the cap.
    maxPaths:   40,
  },
};
