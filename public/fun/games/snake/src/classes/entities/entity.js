import { NONE, isOpposite } from '../directions.js';

/**
 * An entity is anything that lives in a grid cell, has a position, a heading
 * and a color. The grid (a 2D array of Cell objects) is injected so the
 * entity can look up its current cell — and its bounds — without reaching
 * into global config. The grid IS the source of truth for size:
 * `grid.length` = cols, `grid[0].length` = rows.
 */
export class Entity {
  /**
   * @param {Cell[][]} grid Grid the entity lives in, indexed [x][y].
   * @param {number}   x    Initial column.
   * @param {number}   y    Initial row.
   * @param {Color}    c    Render color (used by Cell when it owns this entity).
   */
  constructor(grid, x, y, c) {
    this.grid    = grid;
    this.x       = 0;
    this.y       = 0;
    this.dir     = NONE;  // direction the entity is heading right now
    this.lastDir = NONE;  // direction the entity actually moved on its last move()
    this.c       = c;
    this.setCell(x, y);
  }

  /** Current cell. */
  get cell() {
    return this.grid[this.x][this.y];
  }

  /** Cell one step ahead in `this.dir`, or null if out of bounds / no dir. */
  facingToCell() {
    if (this.dir === NONE) return null;
    const fx = this.x + this.dir.x;
    const fy = this.y + this.dir.y;
    if (fx < 0 || fx >= this.grid.length ||
        fy < 0 || fy >= this.grid[0].length) {
      return null;
    }
    return this.grid[fx][fy];
  }

  setCell(x, y) {
    this.x = x;
    this.y = y;
    this.cell.setEntity(this);
  }

  /**
   * Set the heading. Refuses to flip 180° relative to the last actual move
   * (so the snake can't suicide by reversing into its own body).
   * @returns {boolean} true if the heading was accepted
   */
  changeDir(dir) {
    if (isOpposite(this.lastDir, dir)) return false;
    this.dir = dir;
    return true;
  }

  /**
   * Move one cell forward. Returns false if there's no heading or the path
   * is out of bounds; in either case the entity stays put.
   */
  move() {
    if (this.dir === NONE) return false;
    const newCell = this.facingToCell();
    if (newCell === null) return false;

    this.cell.removeEntity();
    this.setCell(newCell.x, newCell.y);
    this.lastDir = this.dir;
    return true;
  }

  /** Hard teleport (e.g. snake tail relocates to where the head used to be). */
  teleport(x, y) {
    this.cell.removeEntity();
    this.setCell(x, y);
  }

  /**
   * Called by Cell.draw() right after the cell rect is filled, with the
   * cell as argument. Override to layer something on top of the entity's
   * cell (e.g. eyes on the snake's head). Default is a no-op.
   */
  drawDecoration(_cell) {}
}
