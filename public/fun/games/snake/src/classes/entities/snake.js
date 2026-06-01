import { Entity } from './entity.js';
import { Food } from './food.js';
import { SnakeBody } from './snake-body.js';

/**
 * The snake's head. Holds the body (a FIFO of SnakeBody segments) and
 * handles the eat / grow / move logic. Delegates score, food respawn and
 * lose conditions back to the owning Playing state.
 */
export class Snake extends Entity {
  /**
   * @param {Cell[][]} grid
   * @param {number}   x
   * @param {number}   y
   * @param {Playing}  playing State the snake reports score / loss / food
   *                           respawn back to.
   */
  constructor(grid, x, y, playing) {
    super(grid, x, y, color(135, 205, 135));
    this.playing = playing;
    this.body = [];
  }

  /**
   * Move one cell forward, eating any food in the target cell and dying on
   * contact with the body. Returns false if the move was rejected (e.g.
   * out of bounds — caller decides whether that's a lose condition).
   */
  /**
   * Two small black dots that telegraph which way the head will move next.
   * Positioned forward of center along `this.dir` and splayed sideways on
   * the perpendicular axis. push()/pop() so the noStroke/fill don't leak
   * into the next cell's rect draw (which would erase the grid lines).
   */
  drawDecoration(cell) {
    if (this.dir.x === 0 && this.dir.y === 0) return; // no heading yet

    const s  = cell.w;
    const fx = cell.xp + this.dir.x * s * 0.30; // forward offset (eyes pair center)
    const fy = cell.yp + this.dir.y * s * 0.30;
    // Perpendicular to (dx, dy) is (-dy, dx). Eyes splayed left/right of the
    // forward axis by this offset.
    const px = -this.dir.y * s * 0.18;
    const py =  this.dir.x * s * 0.18;

    push();
    noStroke();
    fill(0);
    const eyeSize = s * 0.14;
    ellipse(fx + px, fy + py, eyeSize);
    ellipse(fx - px, fy - py, eyeSize);
    pop();
  }

  move() {
    const newCell = this.facingToCell();
    if (newCell === null) return false;

    const cellEntity = newCell.entity;
    let eaten = false;

    if (cellEntity instanceof Food) {
      eaten = true;
    } else if (cellEntity instanceof SnakeBody) {
      this.playing.lose();
      return false;
    }

    const oldX = this.x;
    const oldY = this.y;
    if (!super.move()) return false;

    if (eaten) {
      // Grow: the cell the head just left becomes the new front segment.
      const newBody = new SnakeBody(this.grid, oldX, oldY);
      newBody.changeDir(this.lastDir);
      this.body.unshift(newBody);
      this.playing.addScorePoint();
      this.playing.spawnFood();
    } else if (this.body.length > 0) {
      // Walk: teleport the tail to where the head was a moment ago.
      const tail = this.body.pop();
      tail.teleport(oldX, oldY);
      tail.changeDir(this.lastDir);
      this.body.unshift(tail);
    }
    return true;
  }
}
