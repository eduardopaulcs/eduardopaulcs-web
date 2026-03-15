import { Entity } from './entity.js';
import { config } from '../../config.js';

/**
 * A food source that ants can detect and collect.
 */
export class Food extends Entity {
  /**
   * @param {Vector} pos Position of the food.
   */
  constructor(pos) {
    super(pos);
    this.radius = 10;
    this.maxLife = config.foodMaxLife;
    this.life = config.foodMaxLife;
    this.tracedBy = new WeakSet(); // weak refs — dead colonies are GC'd automatically
  }

  /**
   * Removes life from this food source. Sets alive = false when fully consumed.
   */
  deplete() {
    this.life -= config.foodDepleteAmount;
    if (this.life <= 0) this.alive = false;
  }

  /**
   * Returns true if the given point is within this food's clickable area.
   * @param {number} x
   * @param {number} y
   */
  contains(x, y) {
    return dist(x, y, this.pos.x, this.pos.y) <= this.radius;
  }

  /**
   * Draws this food as a green circle, fading as it gets consumed.
   */
  draw() {
    const alpha = map(this.life, 0, this.maxLife, 0, 255);
    noStroke();
    fill(80, 200, 100, alpha);
    circle(this.pos.x, this.pos.y, this.radius * 2);
  }
}
