import { Entity } from './entity.js';

/** One unit of the snake's tail. Lethal to the head on contact. */
export class SnakeBody extends Entity {
  constructor(grid, x, y) {
    super(grid, x, y, color(78, 145, 78));
  }
}
