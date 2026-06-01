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
}
