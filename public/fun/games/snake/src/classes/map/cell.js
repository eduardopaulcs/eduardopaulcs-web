import { state } from '../../state.js';
import { config } from '../../config.js';

/**
 * One cell of the grid.
 */
export class Cell {
  constructor(x, y) {
    /**
     * X and Y coordinates.
     */
    this.x = x;
    this.y = y;

    /**
     * Width and height.
     */
    this.w = config.cellW;
    this.h = config.cellH;

    /**
     * Color of this cell.
     */
    this.defaultC = color(0, 0, 0, 0);
    this.c = this.defaultC;

    /**
     * Entity that is inside this cell.
     */
    this.entity = null;
  }

  /**
   * Gets the X pixel of this cell.
   *
   * @returns number X pixel of this cell.
   */
  get xp() {
    return (this.w * this.x) + (this.w / 2);
  }

  /**
   * Gets the Y pixel of this cell.
   *
   * @returns number Y pixel of this cell.
   */
  get yp() {
    return (this.h * this.y) + (this.h / 2);
  }

  /**
   * Sets an entity inside this cell.
   *
   * @param entity Entity to set inside this cell.
   */
  setEntity(entity) {
    this.entity = entity;
    this.c = entity.c;

    state.gs.removeEmptyCell(this);
  }

  /**
   * Removes the entity that this cell contains.
   */
  removeEntity() {
    this.entity = null;
    this.c = this.defaultC;

    state.gs.addEmptyCell(this);
  }

  /**
   * Draws this cell.
   */
  draw() {
    fill(this.c);
    rect(this.xp, this.yp, this.w, this.h);
  }
}
