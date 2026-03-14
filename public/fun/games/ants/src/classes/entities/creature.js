import { Entity } from './entity.js';

/**
 * A creature is a living entity that can move and die.
 */
export class Creature extends Entity {
  /**
   * @param {Vector} pos Initial position.
   * @param {Vector} dir Initial direction.
   * @param {Color} col Creature color.
   */
  constructor(pos = null, dir = null, col = color(215)) {
    super(pos);
    this.dir = dir;

    this.col = col;
  }

  /**
   * Processes this creature for one tick.
   */
  tick() {
    // ...
  }

  /**
   * Draws this creature as a point.
   */
  draw() {
    stroke(this.col);
    point(this.pos);
  }
}
