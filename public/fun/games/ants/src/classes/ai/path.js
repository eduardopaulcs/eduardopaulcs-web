import { PathPoint } from './path-point.js';

/**
 * A trail of points an ant deposits from food back to the colony. Has a
 * finite life that only decays on ticks no ant reinforced it.
 *
 * Tracks an axis-aligned bounding box that grows with every point added.
 * Ants use it to short-circuit `steerAlongPath`: if the ant is outside
 * `bbox.expanded(detectRadius)` we skip the whole path's points.
 */
export class Path {
  /**
   * @param {PathPoint[]} points Initial points (usually empty; the tracer
   *                             adds them as it walks).
   */
  constructor(points = []) {
    this.points     = points;
    this.life       = 0;     // colony.addPath() sets the real value
    this.reinforced = false; // any ant traversed this path this tick?
    this.alive      = true;
    this.minX =  Infinity; this.maxX = -Infinity;
    this.minY =  Infinity; this.maxY = -Infinity;
    for (const p of points) this._growBbox(p.pos);
  }

  /** One tick: decay only if no ant reinforced this path. Reset the flag. */
  tick() {
    if (!this.reinforced) {
      this.life--;
      if (this.life <= 0) this.alive = false;
    }
    this.reinforced = false;
  }

  addPoint(pos) {
    this.points.push(new PathPoint(pos));
    this._growBbox(pos);
  }

  _growBbox(pos) {
    if (pos.x < this.minX) this.minX = pos.x;
    if (pos.x > this.maxX) this.maxX = pos.x;
    if (pos.y < this.minY) this.minY = pos.y;
    if (pos.y > this.maxY) this.maxY = pos.y;
  }
}
