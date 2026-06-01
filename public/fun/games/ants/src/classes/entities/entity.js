/**
 * Anything that lives on the canvas, has a position, and can be killed off.
 */
export class Entity {
  /**
   * @param {Vector} pos Initial position. Defaults to the canvas center.
   */
  constructor(pos = null) {
    this.pos = pos || createVector(width / 2, height / 2);
    this.alive = true;
  }

  tick() {}
  draw() {}
}
