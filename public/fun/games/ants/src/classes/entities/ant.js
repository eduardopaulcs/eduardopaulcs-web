import { CONFIG } from '../../config.js';
import { Creature } from './creature.js';
import { Path } from '../ai/path.js';

/**
 * The little creature that wanders, finds food, lays down a trail back to
 * the colony, and then either becomes a tracer (depositing the trail) or
 * a carrier (riding existing trails).
 */
export class Ant extends Creature {
  /**
   * @param {Vector} pos    Initial position.
   * @param {Colony} colony The colony this ant belongs to.
   */
  constructor(pos, colony) {
    super(pos, p5.Vector.random2D(), color(215, 15, 15));
    this.colony     = colony;
    this.turnRate   = 0;
    this.isTracer   = false;
    // Carrier = ant that found food whose source was already traced by this
    // colony. Carries food back but doesn't deposit a new trail.
    this.isCarrier  = false;
    this.trail      = null;
    this.trailTimer = 0;
  }

  /** Transitions this ant to tracer mode upon finding fresh (unmapped) food. */
  becomeTracer() {
    this.isTracer = true;
    this.trail = new Path();
    this.trail.addPoint(this.pos.copy());
  }

  /** Angular-momentum walk: jitter turnRate, clamp, rotate heading, step. */
  applyMovement() {
    this.turnRate += random(-CONFIG.ant.turnAccel, CONFIG.ant.turnAccel);
    this.turnRate  = constrain(this.turnRate, -CONFIG.ant.maxTurn, CONFIG.ant.maxTurn);
    this.dir.rotate(this.turnRate);
    this.pos.add(this.dir);
  }

  /**
   * Steers toward the nearest path point within `pathDetectRadius`, walking
   * the path toward higher indices (colony) or lower indices (food).
   *
   * Hot loop (every ant, every tick, every path point). Optimizations:
   *   - squared-distance comparisons (no sqrt in the inner loop)
   *   - bbox prune per path (skip whole paths whose bbox is far from the ant)
   *   - position fields hoisted into locals to avoid repeated property reads
   *
   * @param {boolean} towardColony
   * @returns {boolean} true if a path was found and steering was applied
   */
  steerAlongPath(towardColony) {
    const detectR  = CONFIG.ant.pathDetectRadius;
    const detectR2 = detectR * detectR;
    let nearestSq   = detectR2;
    let nearestPath = null;
    let nearestIdx  = -1;
    const ax = this.pos.x;
    const ay = this.pos.y;

    for (const path of this.colony.paths) {
      // Bbox prune: if the ant is outside the path's bbox expanded by the
      // detect radius, none of its points can possibly be in range.
      if (ax < path.minX - detectR || ax > path.maxX + detectR ||
          ay < path.minY - detectR || ay > path.maxY + detectR) continue;

      const points = path.points;
      for (let i = 0, n = points.length; i < n; i++) {
        const p  = points[i].pos;
        const dx = ax - p.x;
        const dy = ay - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < nearestSq) {
          nearestSq   = d2;
          nearestPath = path;
          nearestIdx  = i;
        }
      }
    }

    if (!nearestPath) return false;

    if (towardColony) nearestPath.reinforced = true;

    const targetIdx = towardColony
      ? Math.min(nearestPath.points.length - 1, nearestIdx + 1)
      : Math.max(0, nearestIdx - 1);

    const target    = nearestPath.points[targetIdx].pos;
    const toTarget  = p5.Vector.sub(target, this.pos);
    let angleDiff   = toTarget.heading() - this.dir.heading();
    while (angleDiff >  PI) angleDiff -= TWO_PI;
    while (angleDiff < -PI) angleDiff += TWO_PI;
    this.turnRate += angleDiff * CONFIG.ant.pathSteering;
    this.turnRate  = constrain(this.turnRate, -CONFIG.ant.maxTurn, CONFIG.ant.maxTurn);
    return true;
  }

  /** Steers directly toward the colony (used by tracers, no path needed). */
  steerTowardColony() {
    const toColony  = p5.Vector.sub(this.colony.pos, this.pos);
    let angleDiff   = toColony.heading() - this.dir.heading();
    while (angleDiff >  PI) angleDiff -= TWO_PI;
    while (angleDiff < -PI) angleDiff += TWO_PI;
    this.turnRate += angleDiff * CONFIG.ant.tracerSteering;
    this.turnRate  = constrain(this.turnRate, -CONFIG.ant.maxTurn, CONFIG.ant.maxTurn);
  }

  /**
   * @param {Food[]} foods Food sources visible to this ant.
   */
  tick(foods) {
    const ax = this.pos.x;
    const ay = this.pos.y;
    const cx = this.colony.pos.x;
    const cy = this.colony.pos.y;
    const colonyR2 = this.colony.radius * this.colony.radius;

    if (!this.isTracer && !this.isCarrier) {
      this.applyMovement();
      this.steerAlongPath(false);

      // Squared-distance food proximity check.
      for (const food of foods) {
        const dx = ax - food.pos.x;
        const dy = ay - food.pos.y;
        if (dx * dx + dy * dy < food.radius * food.radius) {
          food.deplete();
          if (!food.tracedBy.has(this.colony)) {
            food.tracedBy.add(this.colony);
            this.becomeTracer();
          } else {
            this.isCarrier = true;
          }
          break;
        }
      }
    } else if (this.isTracer) {
      this.applyMovement();
      this.steerTowardColony();

      this.trailTimer++;
      if (this.trailTimer >= CONFIG.ant.trailInterval) {
        this.trail.addPoint(this.pos.copy());
        this.trailTimer = 0;
      }

      // Arrival: squared-distance check vs colony radius.
      const dx = ax - cx;
      const dy = ay - cy;
      if (dx * dx + dy * dy < colonyR2) {
        this.colony.addPath(this.trail);
        this.colony.feed();
        this.alive = false;
      }
    } else {
      this.applyMovement();
      this.steerAlongPath(true);

      const dx = ax - cx;
      const dy = ay - cy;
      if (dx * dx + dy * dy < colonyR2) {
        this.colony.feed();
        this.alive = false;
      }
    }

    // Cull ants that wander more than 5px outside the canvas.
    if (this.pos.x < -5 || this.pos.x > width  + 5 ||
        this.pos.y < -5 || this.pos.y > height + 5) {
      this.alive = false;
    }
  }

  draw() {
    if (this.isTracer && this.trail && this.trail.points.length > 1) {
      stroke(red(this.colony.col), green(this.colony.col), blue(this.colony.col), 150);
      strokeWeight(1);
      for (let i = 1; i < this.trail.points.length; i++) {
        const a = this.trail.points[i - 1].pos;
        const b = this.trail.points[i].pos;
        line(a.x, a.y, b.x, b.y);
      }
    }

    this.col = (this.isTracer || this.isCarrier)
      ? this.colony.col
      : lerpColor(this.colony.col, color(0), 0.4);
    strokeWeight(4);
    super.draw();
  }
}
