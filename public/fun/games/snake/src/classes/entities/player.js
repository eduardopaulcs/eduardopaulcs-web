import { Snake } from './snake.js';
import { state } from '../../state.js';
import { NULL_DIR, RIGHT_DIR, UP_DIR, LEFT_DIR, DOWN_DIR } from '../../config.js';

/**
 * The player is the entity that the user can control.
 */
export class Player extends Snake {
  constructor(x, y) {
    super(x, y);
  }

  /**
   * Processes user input.
   *
   * @param keyCode p5.js keyCode global variable that has the code for the key pressed.
   */
  input(keyCode) {
    switch (keyCode) {
      case RIGHT_ARROW:
      case 68: // D
        this.changeDir(RIGHT_DIR);
        break;

      case UP_ARROW:
      case 87: // W
        this.changeDir(UP_DIR);
        break;

      case LEFT_ARROW:
      case 65: // A
        this.changeDir(LEFT_DIR);
        break;

      case DOWN_ARROW:
      case 83: // S
        this.changeDir(DOWN_DIR);
        break;

      default:
        break;
    }
  }

  /**
   * Moves this entity one cell in the facing direction.
   *
   * @returns True if successful. False otherwise.
   */
  move() {
    // Are we moving out of bounds?
    if (this.facingToCell() === null && this.dir !== NULL_DIR) {
      state.gs.lose();

      return false;
    }

    return super.move();
  }
}
