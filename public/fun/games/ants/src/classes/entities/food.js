import { Entity } from './entity.js';
import { CONFIG } from '../../config.js';

/**
 * A food source the ants can detect, deplete, and ferry back to the colony.
 */
export class Food extends Entity {
  constructor(pos) {
    super(pos);
    this.radius  = 10;
    this.maxLife = CONFIG.food.maxLife;
    this.life    = CONFIG.food.maxLife;
    // Colonies that have already traced this food source. WeakSet → dead
    // colonies are garbage-collected without holding the food alive.
    this.tracedBy = new WeakSet();
  }

  /** Subtracts one ant's worth of life. Sets alive=false when exhausted. */
  deplete() {
    this.life -= CONFIG.food.depleteAmount;
    if (this.life <= 0) this.alive = false;
  }

  /** True if (x, y) is inside the food's clickable radius. */
  contains(x, y) {
    return dist(x, y, this.pos.x, this.pos.y) <= this.radius;
  }

  draw() {
    const alpha = map(this.life, 0, this.maxLife, 0, 255);
    noStroke();
    fill(80, 200, 100, alpha);
    circle(this.pos.x, this.pos.y, this.radius * 2);
  }
}
