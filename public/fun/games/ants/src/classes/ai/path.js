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
    this.life = 0;        // set by colony.addPath()
    this.reinforced = false; // true if any ant traversed this path this tick
    this.alive = true;
  }

  /**
   * Advances this path by one tick. Only decays if no ant reinforced it this tick.
   */
  tick() {
    if (!this.reinforced) {
      this.life--;
      if (this.life <= 0) this.alive = false;
    }
    this.reinforced = false; // reset for next tick
  }

  addPoint(pos) {
    this.points.push(new PathPoint(pos));
  }
}
