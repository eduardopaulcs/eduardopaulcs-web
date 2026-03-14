import { PathPoint } from './path-point.js';

/**
 * A path is a sequence of points deposited by a tracer ant from food to colony.
 * It has a finite lifetime after which it is considered dead.
 */
export class Path {
  /**
   * @param {Array} points List of points for this path.
   */
  constructor(points = []) {
    this.points = points;
    this.life = 0; // set by colony.addPath() based on final point count
    this.alive = true;
  }

  /**
   * Advances this path by one tick, aging it toward expiry.
   */
  tick() {
    this.life--;
    if (this.life <= 0) this.alive = false;
  }

  addPoint(pos) {
    this.points.push(new PathPoint(pos));
  }
}
