import { config } from '../../config.js';
import { Creature } from './creature.js';
import { Path } from '../ai/path.js';

/**
 * That small creature that looks for food and tries to get back to their colony.
 */
export class Ant extends Creature {
  /**
   * @param {Vector} pos Initial position.
   * @param {Colony} colony The colony this ant belongs to.
   */
  constructor(pos, colony) {
    super(pos, p5.Vector.random2D(), color(215, 15, 15));
    this.colony = colony;
    this.turnRate = 0;
    this.isTracer = false;
    this.isCarrier = false; // carrying food but no trail (food was already traced)
    this.trail = null;
    this.trailTimer = 0;
  }

  /**
   * Transitions this ant into tracer mode upon finding food.
   */
  becomeTracer() {
    this.isTracer = true;
    this.trail = new Path();
    this.trail.addPoint(this.pos.copy());
  }

  /**
   * Applies angular-momentum movement and updates position.
   */
  applyMovement() {
    this.turnRate += random(-config.antTurnAccel, config.antTurnAccel);
    this.turnRate = constrain(this.turnRate, -config.antMaxTurn, config.antMaxTurn);
    this.dir.rotate(this.turnRate);
    this.pos.add(this.dir);
  }

  /**
   * Steers toward the nearest path point in the given direction.
   * towardColony=true targets higher indices (colony end),
   * towardColony=false targets lower indices (food end).
   * Returns true if a path point was found and steering was applied.
   * @param {boolean} towardColony
   * @returns {boolean}
   */
  steerAlongPath(towardColony) {
    let nearestDist = config.antPathDetectRadius;
    let nearestPath = null;
    let nearestIdx = -1;

    for (const path of this.colony.paths) {
      for (let i = 0; i < path.points.length; i++) {
        const d = dist(this.pos.x, this.pos.y, path.points[i].pos.x, path.points[i].pos.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearestPath = path;
          nearestIdx = i;
        }
      }
    }

    if (!nearestPath) return false;

    const targetIdx = towardColony
      ? Math.min(nearestPath.points.length - 1, nearestIdx + 1)
      : Math.max(0, nearestIdx - 1);

    const target = nearestPath.points[targetIdx].pos;
    const toTarget = p5.Vector.sub(target, this.pos);
    let angleDiff = toTarget.heading() - this.dir.heading();
    while (angleDiff > PI) angleDiff -= TWO_PI;
    while (angleDiff < -PI) angleDiff += TWO_PI;
    this.turnRate += angleDiff * config.antPathSteering;
    this.turnRate = constrain(this.turnRate, -config.antMaxTurn, config.antMaxTurn);

    return true;
  }

  /**
   * Steers directly toward the colony.
   */
  steerTowardColony() {
    const toColony = p5.Vector.sub(this.colony.pos, this.pos);
    let angleDiff = toColony.heading() - this.dir.heading();
    while (angleDiff > PI) angleDiff -= TWO_PI;
    while (angleDiff < -PI) angleDiff += TWO_PI;
    this.turnRate += angleDiff * config.antTracerSteering;
    this.turnRate = constrain(this.turnRate, -config.antMaxTurn, config.antMaxTurn);
  }

  /**
   * Processes this ant for one tick.
   * @param {Food[]} foods List of food sources to check proximity against.
   */
  tick(foods) {
    if (!this.isTracer && !this.isCarrier) {
      this.applyMovement();

      // Steer toward food end of nearest path (lower indices)
      this.steerAlongPath(false);

      // Check proximity to food — deplete once, then transition permanently
      for (const food of foods) {
        if (dist(this.pos.x, this.pos.y, food.pos.x, food.pos.y) < food.radius) {
          food.deplete();
          if (!food.traced) {
            food.traced = true;
            this.becomeTracer();
          } else {
            this.isCarrier = true;
          }
          break;
        }
      }
    } else if (this.isTracer) {
      this.applyMovement();

      // Follow path toward colony; fall back to direct steering if no path in range
      if (!this.steerAlongPath(true)) {
        this.steerTowardColony();
      }

      // Deposit trail points at regular intervals
      this.trailTimer++;
      if (this.trailTimer >= config.antTrailInterval) {
        this.trail.addPoint(this.pos.copy());
        this.trailTimer = 0;
      }

      // Check arrival at colony — transfer trail and die
      if (dist(this.pos.x, this.pos.y, this.colony.pos.x, this.colony.pos.y) < this.colony.radius) {
        this.colony.addPath(this.trail);
        this.alive = false;
      }
    } else { // isCarrier
      this.applyMovement();

      // Follow path toward colony — no fallback, just wanders if no path in range
      this.steerAlongPath(true);

      // Check arrival at colony — just die (no trail)
      if (dist(this.pos.x, this.pos.y, this.colony.pos.x, this.colony.pos.y) < this.colony.radius) {
        this.alive = false;
      }
    }

    // Cull any ant that wanders more than 5px outside the canvas
    if (this.pos.x < -5 || this.pos.x > config.width + 5 ||
        this.pos.y < -5 || this.pos.y > config.height + 5) {
      this.alive = false;
    }
  }

  /**
   * Draws this ant as a point, and its trail if it is a tracer.
   */
  draw() {
    // Draw active trail
    if (this.isTracer && this.trail && this.trail.points.length > 1) {
      stroke(240, 220, 60, 150);
      strokeWeight(1);
      for (let i = 1; i < this.trail.points.length; i++) {
        const a = this.trail.points[i - 1].pos;
        const b = this.trail.points[i].pos;
        line(a.x, a.y, b.x, b.y);
      }
    }

    // Green if carrying food (tracer or carrier), red otherwise
    this.col = (this.isTracer || this.isCarrier) ? color(80, 200, 100) : color(215, 15, 15);
    strokeWeight(4);
    super.draw();
  }
}
