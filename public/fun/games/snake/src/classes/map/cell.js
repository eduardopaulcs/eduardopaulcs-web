/**
 * One cell of the grid. Owns the entity that occupies it (or null), and
 * notifies the Playing state whenever it becomes empty / occupied so the
 * "empty cells" list stays in sync.
 *
 * Reads its width/height from `playing.cols / playing.rows` (NOT from
 * CONFIG.grid) so a custom grid picked on the menu actually changes the
 * cell pitch — using CONFIG here was the bug that made non-default grid
 * sizes draw their cells at the wrong scale and never display food.
 */
export class Cell {
  /**
   * @param {Playing} playing State to notify on empty/occupied transitions
   *                          and to source the grid dimensions from.
   * @param {number}  x
   * @param {number}  y
   */
  constructor(playing, x, y) {
    this.playing  = playing;
    this.x        = x;
    this.y        = y;
    this.w        = width  / playing.cols;
    this.h        = height / playing.rows;
    this.defaultC = color(0, 0, 0, 0);
    this.c        = this.defaultC;
    this.entity   = null;
  }

  /** Center-x pixel of this cell. */
  get xp() { return (this.w * this.x) + (this.w / 2); }

  /** Center-y pixel of this cell. */
  get yp() { return (this.h * this.y) + (this.h / 2); }

  setEntity(entity) {
    this.entity = entity;
    this.c      = entity.c;
    this.playing.removeEmptyCell(this);
  }

  removeEntity() {
    this.entity = null;
    this.c      = this.defaultC;
    this.playing.addEmptyCell(this);
  }

  draw() {
    fill(this.c);
    rect(this.xp, this.yp, this.w, this.h);
    if (this.entity) this.entity.drawDecoration(this);
  }
}
