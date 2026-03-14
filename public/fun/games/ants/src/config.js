export const gameLang = new URLSearchParams(window.location.search).get('lang') || 'en';

export const config = {
  width: 768,
  height: 512,
  timeForTick: 24,           // MS
  antMaxPerSizeMin: 20,      // Min ants per colony size unit
  antMaxPerSizeMax: 40,      // Max ants per colony size unit
  antMaxTurn: Math.PI / 16,  // Max angular velocity per tick
  antTurnAccel: Math.PI / 8, // Max change in angular velocity per tick
  antTrailInterval: 4,       // Ticks between trail point deposits
  antTracerSteering: 0.4,    // Steering pull toward colony per tick
  antPathDetectRadius: 40,   // Radius within which a normal ant detects path points
  antPathSteering: 0.6,      // Steering pull toward nearby path point
  foodMaxLife: 100,          // Starting life of a food source
  foodDepleteAmount: 2,      // Life removed each time an ant reaches the food
  pathLifePerPoint: 80,      // Ticks of life granted per path point
};
