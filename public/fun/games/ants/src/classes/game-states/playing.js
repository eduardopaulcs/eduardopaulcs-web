import { GameState } from './game-state.js';
import { Colony } from '../entities/colony.js';
import { Food } from '../entities/food.js';

/**
 * The only state in ants: a sandbox where the player drops/removes food
 * (left click) and colonies (right click), and watches them figure each
 * other out via tracer trails.
 */
export class Playing extends GameState {
  init() {
    this.colonies = [];
    this.foods = [];
    this.hasUsedLeftClick = false;
    this.hasUsedRightClick = false;
    this._startRandom();
  }

  /** Drops one colony and one food source inside the inner 60% of the canvas. */
  _startRandom() {
    const marginX = width * 0.2;
    const marginY = height * 0.2;
    this.colonies.push(new Colony(createVector(
      random(marginX, width - marginX),
      random(marginY, height - marginY),
    )));
    this.foods.push(new Food(createVector(
      random(marginX, width - marginX),
      random(marginY, height - marginY),
    )));
  }

  mousePressed() {
    if (mouseButton === LEFT)  this._handleLeftClick(mouseX, mouseY);
    if (mouseButton === RIGHT) this._handleRightClick(mouseX, mouseY);
  }

  /** Left click toggles a food source at the cursor (add, or remove if present). */
  _handleLeftClick(x, y) {
    this.hasUsedLeftClick = true;
    const idx = this.foods.findIndex(f => f.contains(x, y));
    if (idx !== -1) this.foods.splice(idx, 1);
    else this.foods.push(new Food(createVector(x, y)));
  }

  /** Right click toggles a colony at the cursor (add, or remove if present). */
  _handleRightClick(x, y) {
    this.hasUsedRightClick = true;
    const idx = this.colonies.findIndex(c => c.contains(x, y));
    if (idx !== -1) this.colonies.splice(idx, 1);
    else this.colonies.push(new Colony(createVector(x, y)));
  }

  tick() {
    for (const colony of this.colonies) colony.tick(this.foods);
    this.foods    = this.foods.filter(f => f.alive);
    this.colonies = this.colonies.filter(c => c.alive);
  }

  draw() {
    background(15);

    for (const food of this.foods)       food.draw();
    for (const colony of this.colonies)  colony.draw();

    // Bottom hint, hidden once the player has tried both click types.
    if (!this.hasUsedLeftClick || !this.hasUsedRightClick) {
      noStroke();
      fill(180);
      textAlign(CENTER, BOTTOM);
      textSize(16);
      text(window.ctx.i18n.hint, width / 2, height - 26);
    }
  }

  dispose() {}
}
