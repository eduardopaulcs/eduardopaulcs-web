/**
 * A base class for game states
 */
export class GameState {
  constructor(...args) {
    this.init(...args);
  }

  /**
   * Initialize the game state
   */
  init() {
    // ...
  }

  /**
   * Handle key input
   */
  keyPressed(keyCode) {
    // ...
  }

  /**
   * Handle mouse input
   */
  mousePressed() {
    // ...
  }

  /**
   * Handle mouse drag
   */
  mouseDragged() {
    // ...
  }

  /**
   * Handle mouse release after drag
   */
  mouseReleased() {
    // ...
  }

  /**
   * Handle mouse wheel scroll
   */
  mouseWheel(event) {
    // ...
  }

  /**
   * Handle game logic updates
   */
  tick() {
    // ...
  }

  /**
   * Handle frame drawing
   */
  draw() {
    // ...
  }

  /**
   * Scene lighting, shared by all states. Called every draw BEFORE rendering,
   * so the lights stay fixed in world space: when the player orbits, the lit
   * face changes naturally, like a fixed lamp.
   */
  applyLights() {
    // Very low ambient: the shadow side should be almost black so the form
    // and the relief from the Perlin noise read strongly. Anything brighter
    // here flattens the look.
    ambientLight(28, 25, 18);

    // specularColor must come BEFORE the lights it tints.
    specularColor(255, 240, 200);

    // KEY — strong directional with a low Z component (≈grazing the front
    // face of the potato). Grazing-ish angles amplify per-face dot-product
    // differences from the Perlin bumps, which is what makes the relief
    // pop. A more head-on light gives a smoother, flatter look.
    directionalLight(250, 230, 195, 0.7, 0.55, -0.15);

    // Cool back-fill (~22% of key). Lifts the side of the potato that's
    // turned away from the key so it doesn't dissolve into black. Still much
    // dimmer than the key, so the lit/dark contrast — and the relief — stays.
    directionalLight(55, 65, 90, -0.55, -0.5, 0.4);

    // SPECULAR SPOT — modest intensity, tight cone, mostly for the moving
    // highlight as the camera orbits. Kept dim so the diffuse variation
    // (the relief) still dominates the look.
    spotLight(
      60, 56, 45,
      -300, -700, 700,
      0.3, 0.85, -0.7,
      PI / 6,
      18
    );
  }
}
