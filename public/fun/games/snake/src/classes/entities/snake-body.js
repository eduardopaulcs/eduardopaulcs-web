import { Entity } from './entity.js';

/**
 * SnakeBody is one unit of the whole snake body. If the player eats this, they lose.
 */
export class SnakeBody extends Entity {
  constructor(x, y) {
    super(x, y, color(78, 145, 78));
  }
}
