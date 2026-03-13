import { state } from '../../state.js';
import { config, NULL_DIR } from '../../config.js';

/**
 * An entity is an interactive object of the game. The food and the snake are entities.
 */
export class Entity {
  constructor(x, y, c) {
    /**
     * X and Y coordinates.
     */
    this.x = 0;
    this.y = 0;

    /**
     * Facing direction of this entity.
     */
    this.dir = NULL_DIR;

    /**
     * Direction when the last move was made.
     */
    this.lastDir = NULL_DIR;

    /**
     * Color to use for this entity.
     */
    this.c = c;

    this.setCell(x, y);
  }

  /**
   * Gets the cell where this entity is.
   *
   * @returns Cell Cell where this entity is.
   */
  get cell() {
    return state.gs.cells[this.x][this.y];
  }

  /**
   * Gets the cell that this entity is facing to.
   *
   * @returns Cell The cell that this entity is facing. Null otherwise.
   */
  facingToCell() {
    if (this.dir === NULL_DIR) {
      return null;
    }

    let faceX, faceY;

    // Calculate position
    faceX = round(this.x + cos(this.dir * PI));
    faceY = round(this.y - sin(this.dir * PI));

    // If position out of bounds
    if (faceX < 0 || faceX > config.cols - 1 ||
        faceY < 0 || faceY > config.rows - 1) {
      return null;
    }

    return state.gs.cells[faceX][faceY];
  }

  /**
   * Sets the cell where this entity is in.
   *
   * @param x X position.
   * @param y Y position.
   */
  setCell(x, y) {
    // Set position
    this.x = x;
    this.y = y;

    // Notify cell of this entity
    this.cell.setEntity(this);
  }

  /**
   * Changes the direction of this entity.
   *
   * @param dir New direction to set.
   * @returns True if successful. False otherwise.
   */
  changeDir(dir) {
    // Get opposite direction of the new direction
    let opDir = dir + 1;
    if (opDir >= 2) {
      opDir -= 2;
    }

    if (this.lastDir !== opDir) {
      this.dir = dir;

      return true;
    }

    return false;
  }

  /**
   * Moves this entity one cell in the facing direction.
   *
   * @returns True if successful. False otherwise.
   */
  move() {
    if (this.dir !== NULL_DIR) {
      let newCell = this.facingToCell();

      if (newCell === null) {
        return false;
      }

      // Change cell
      this.cell.removeEntity();
      this.setCell(newCell.x, newCell.y);

      // Update last direction
      this.lastDir = this.dir;

      return true;
    }

    return false;
  }

  /**
   * Teleports this entity to the given coordinates.
   *
   * @param x X position.
   * @param y Y position.
   */
  teleport(x, y) {
    // Change cell
    this.cell.removeEntity();
    this.setCell(x, y);
  }
}
