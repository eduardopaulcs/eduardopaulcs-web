import { Snake } from './snake.js';
import { UP, DOWN, LEFT, RIGHT, NONE } from '../directions.js';

/** Snake the user controls. Reads arrow/WASD input to change direction. */
export class Player extends Snake {
  constructor(grid, x, y, playing) {
    super(grid, x, y, playing);
  }

  /**
   * @param {number} keyCode p5's keyCode for the key just pressed.
   */
  input(keyCode) {
    switch (keyCode) {
      case RIGHT_ARROW: case 68: this.changeDir(RIGHT); break;
      case UP_ARROW:    case 87: this.changeDir(UP);    break;
      case LEFT_ARROW:  case 65: this.changeDir(LEFT);  break;
      case DOWN_ARROW:  case 83: this.changeDir(DOWN);  break;
    }
  }

  /** Same as Snake.move but treats out-of-bounds as a lose, not a no-op. */
  move() {
    if (this.facingToCell() === null && this.dir !== NONE) {
      this.playing.lose();
      return false;
    }
    return super.move();
  }
}
