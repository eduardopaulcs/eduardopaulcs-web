import { Entity } from './entity.js';

/**
 * The player should eat food in order to make the snake grow.
 */
export class Food extends Entity {
  constructor(x, y) {
    super(x, y, color(205, 92, 92));
  }
}
