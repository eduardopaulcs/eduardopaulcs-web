import { Entity } from './entity.js';

/**
 * A moving Entity: position from the base class plus a heading and a color.
 * `tick()` is overridden by subclasses; `draw()` plots the creature as a
 * single point in its color (callers set strokeWeight beforehand).
 */
export class Creature extends Entity {
  /**
   * @param {Vector} pos Initial position.
   * @param {Vector} dir Initial heading.
   * @param {Color}  col Tint used by draw().
   */
  constructor(pos = null, dir = null, col = color(215)) {
    super(pos);
    this.dir = dir;
    this.col = col;
  }

  tick() {}

  draw() {
    stroke(this.col);
    point(this.pos);
  }
}
