import { Entity } from './entity.js';
import { Food } from './food.js';
import { SnakeBody } from './snake-body.js';
import { state } from '../../state.js';
import { STATE_PLAYING } from '../../config.js';

/**
 * The snake is the character of the player.
 */
export class Snake extends Entity {
  constructor(x, y) {
    super(x, y, color(135, 205, 135));

    this.body = [];
  }

  /**
   * Moves this entity one cell in the facing direction.
   *
   * @returns True if successful. False otherwise.
   */
  move() {
    let newCell = this.facingToCell();
    let eaten = false;
    let oldX, oldY;
    let moved = false;

    // If we are moving into a valid cell
    if (newCell !== null) {
      moved = true;
      oldX = this.x;
      oldY = this.y;

      let cellEntity = state.gs.cells[newCell.x][newCell.y].entity;

      // If we are about to move into an entity
      if (cellEntity !== null) {
        // If we are about to move into food
        if (cellEntity instanceof Food) {
          // Prepare to spawn body
          eaten = true;
        }
        // If we are about to move into ourselves
        else if (cellEntity instanceof SnakeBody) {
          state.gs.lose();
        }
      }
    }

    // If we are still playing
    if (state.gs.state === STATE_PLAYING) {
      // Could we move?
      if (super.move()) {
        // If we have eaten
        if (eaten) {
          // Create body
          let newBody = new SnakeBody(oldX, oldY);

          // Set body direction
          newBody.changeDir(this.lastDir);

          // Add body at the start of the list
          this.body.unshift(newBody);

          // Add one score point
          state.gs.addScorePoint();

          // Spawn new food
          state.gs.spawnFood();
        }
        // If we have moved
        else if (moved) {
          // If we have a body
          if (this.body.length > 0) {
            // Get tail
            let tail = this.body.pop();

            // Teleport tail to the beginning
            tail.teleport(oldX, oldY);
            tail.changeDir(this.lastDir);

            // Add tail at the start of the list
            this.body.unshift(tail);
          }
        }

        return true;
      }
    }

    return false;
  }
}
