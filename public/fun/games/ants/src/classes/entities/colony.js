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

    this.maxLife = config.colonyMaxLife;
    this.life = config.colonyMaxLife;

    // Assign a visually distinct color using golden-angle hue rotation
    const h = Colony._nextHue;
    Colony._nextHue = (Colony._nextHue + 137) % 360;
    colorMode(HSB, 360, 100, 100);
    this.col = color(h, 75, 90);
    colorMode(RGB, 255, 255, 255, 255);

    // In ticks.
    this.antTime = 0;
  }

  /**
   * Restores some life to this colony when an ant delivers food.
   */
  feed() {
    this.life = Math.min(this.maxLife, this.life + config.colonyFeedAmount);
  }

  /**
   * Stores a completed tracer trail in this colony.
   * @param {Path} path
   */
  addPath(path) {
    path.life = config.pathMaxLife + path.points.length * config.pathInitialLifePerPoint;
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
    // Decay life; die if starved
    this.life -= config.colonyLifeDecay;
    if (this.life <= 0) { this.alive = false; return; }

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
      stroke(red(this.col), green(this.col), blue(this.col), 150);
      strokeWeight(1);
      for (let i = 1; i < path.points.length; i++) {
        const a = path.points[i - 1].pos;
        const b = path.points[i].pos;
        line(a.x, a.y, b.x, b.y);
      }
    }

    // Life bar
    const barW = this.size * 10;
    const barH = 3;
    const ratio = this.life / this.maxLife;
    noStroke();
    fill(60, 60, 60);
    rect(this.pos.x - barW / 2, this.pos.y - this.radius - 10, barW, barH);
    fill(lerpColor(color(60, 60, 60), this.col, ratio));
    rect(this.pos.x - barW / 2, this.pos.y - this.radius - 10, barW * ratio, barH);

    stroke(this.col);
    strokeWeight(this.size*8);
    point(this.pos);

    for (let ant of this.ants) {
      ant.draw();
    }
  }
}

Colony._nextHue = 0;
