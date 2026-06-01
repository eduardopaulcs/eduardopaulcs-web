import { Entity } from './entity.js';

/** A single edible food item placed on a random empty cell. */
export class Food extends Entity {
  constructor(grid, x, y) {
    super(grid, x, y, color(205, 92, 92));
  }
}
