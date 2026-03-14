import { config } from '../../config.js';
import { Entity } from './entity.js';
import { Ant } from './ant.js';

/**
 * A colony is a base for ants. They spawn there and try to bring food in.
 */
export class Colony extends Entity {
  /**
   * @param {Vector} pos Initial position.
   */
  constructor(pos = null) {
    // If no position specified, get random.
    if (!pos) {
      let randomX, randomY;

      randomX = round(random(0, config.width));
      randomY = round(random(0, config.height));

      pos = createVector(randomX, randomY);
    }
    super(pos);

    this.size = round(random(1, 8));
    this.radius = this.size * 4; // matches strokeWeight(size * 8) → visual radius = size * 4

    this.maxAnts = round(this.size * random(config.antMaxPerSizeMin, config.antMaxPerSizeMax));

    this.ants = [];
    this.paths = [];

    // In ticks.
    this.antTime = 0;
  }

  /**
   * Stores a completed tracer trail in this colony.
   * @param {Path} path
   */
  addPath(path) {
    path.life = path.points.length * config.pathLifePerPoint;
    this.paths.push(path);
  }

  /**
   * Spawns one ant at the center of the colony.
   */
  spawnAnt() {
    // Add ant at the center of the colony.
    this.ants.push(new Ant(this.pos.copy(), this));

    // Increase ant time.
    this.antTime += round(random(10, 30));
  }

  /**
   * Processes this colony for one tick.
   * @param {Food[]} foods List of food sources for ants to detect.
   */
  tick(foods) {
    // Should we spawn an ant?
    if (this.antTime <= 0) {
      // Do we have "ant space"? Yup, I'm calling that "ant space".
      if (this.ants.length < this.maxAnts) {
        this.spawnAnt();
      }
    } else {
      this.antTime--;
    }

    // Tick each ant and discard those that marked themselves as dead
    this.ants = this.ants.filter(ant => {
      ant.tick(foods);
      return ant.alive;
    });

    // Age paths and discard expired ones
    this.paths = this.paths.filter(path => {
      path.tick();
      return path.alive;
    });
  }

  /**
   * Returns true if the given point is within this colony's clickable area.
   * @param {number} x
   * @param {number} y
   */
  contains(x, y) {
    return dist(x, y, this.pos.x, this.pos.y) <= this.radius;
  }

  /**
   * Draws this colony as a big dot.
   */
  draw() {
    // Draw completed tracer trails
    for (const path of this.paths) {
      if (path.points.length < 2) continue;
      stroke(240, 220, 60, 150);
      strokeWeight(1);
      for (let i = 1; i < path.points.length; i++) {
        const a = path.points[i - 1].pos;
        const b = path.points[i].pos;
        line(a.x, a.y, b.x, b.y);
      }
    }

    stroke(color(200, 195, 150));
    strokeWeight(this.size*8);
    point(this.pos);

    for (let ant of this.ants) {
      ant.draw();
    }
  }
}
