/**
 * A GameState is an instance of the game, whether the user is playing, is in the main menu, etc.
 */
export class GameState {
  constructor() {
    this.running = true;
  }

  keyPressed(keyCode) {
    // ...
  }

  tick() {
    // ...
  }

  draw() {
    // ...
  }
}
