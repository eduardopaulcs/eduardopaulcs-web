import { config } from '../../config.js';

/**
 * An entity is an object that has a position and can interact with other entities.
 */
export class Entity {
  /**
   * @param {Vector} pos Initial position.
   */
  constructor(pos = null) {
    this.pos = pos || createVector(config.width/2, config.height/2);
    this.alive = true;
  }

  tick() {
    //...
  }

  draw() {
    //...
  }
}
