import { CONFIG } from '../../config.js';
import { Entity } from './entity.js';
import { Ant } from './ant.js';

/**
 * A colony spawns ants, accumulates trails brought back by them, and slowly
 * starves unless its ants keep delivering food. Visualized as a big colored
 * dot with a life bar above it.
 */
export class Colony extends Entity {
  constructor(pos = null) {
    super(pos ?? createVector(random(0, width), random(0, height)));

    this.size    = round(random(1, 8));
    this.radius  = this.size * 4; // matches strokeWeight(size * 8) → visual radius = size * 4
    this.maxAnts = round(this.size * random(CONFIG.ant.maxPerSizeMin, CONFIG.ant.maxPerSizeMax));

    this.ants  = [];
    this.paths = [];

    this.maxLife = CONFIG.colony.maxLife;
    this.life    = CONFIG.colony.maxLife;

    // Visually distinct color per colony via golden-angle hue rotation.
    const h = Colony._nextHue;
    Colony._nextHue = (Colony._nextHue + 137) % 360;
    colorMode(HSB, 360, 100, 100);
    this.col = color(h, 75, 90);
    colorMode(RGB, 255, 255, 255, 255);

    this.antTime = 0; // countdown (ticks) until the next ant may spawn
  }

  /** Restores life when an ant delivers food. Capped at maxLife. */
  feed() {
    this.life = Math.min(this.maxLife, this.life + CONFIG.colony.feedAmount);
  }

  /**
   * Stores a completed tracer trail. Path's life scales with its length.
   * Enforces `CONFIG.colony.maxPaths`: oldest path is dropped if the cap
   * would otherwise be exceeded. Bounds the per-ant scan cost so a long
   * session doesn't progressively slow down.
   */
  addPath(path) {
    path.life = CONFIG.path.maxLife + path.points.length * CONFIG.path.initialLifePerPoint;
    this.paths.push(path);
    if (this.paths.length > CONFIG.colony.maxPaths) this.paths.shift();
  }

  /** Spawns one ant at the colony's center and sets a random cooldown. */
  spawnAnt() {
    this.ants.push(new Ant(this.pos.copy(), this));
    this.antTime += round(random(10, 30));
  }

  /**
   * @param {Food[]} foods Food sources visible to this colony's ants.
   */
  tick(foods) {
    this.life -= CONFIG.colony.lifeDecay;
    if (this.life <= 0) { this.alive = false; return; }

    // Spawn one ant per cooldown expiration, if we have "ant space" left.
    if (this.antTime <= 0) {
      if (this.ants.length < this.maxAnts) this.spawnAnt();
    } else {
      this.antTime--;
    }

    this.ants  = this.ants.filter(ant => { ant.tick(foods); return ant.alive; });
    this.paths = this.paths.filter(p   => { p.tick();       return p.alive;   });
  }

  /** True if (x, y) is inside this colony's clickable area. */
  contains(x, y) {
    return dist(x, y, this.pos.x, this.pos.y) <= this.radius;
  }

  draw() {
    // Stored tracer trails (faded colony color).
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

    // Life bar above the colony.
    const barW  = this.size * 10;
    const barH  = 3;
    const ratio = this.life / this.maxLife;
    noStroke();
    fill(60, 60, 60);
    rect(this.pos.x - barW / 2, this.pos.y - this.radius - 10, barW, barH);
    fill(lerpColor(color(60, 60, 60), this.col, ratio));
    rect(this.pos.x - barW / 2, this.pos.y - this.radius - 10, barW * ratio, barH);

    // The colony itself: a big colored point.
    stroke(this.col);
    strokeWeight(this.size * 8);
    point(this.pos);

    for (const ant of this.ants) ant.draw();
  }
}

Colony._nextHue = 0;
