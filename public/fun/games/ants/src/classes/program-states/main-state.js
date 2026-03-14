import { ProgramState } from './program-state.js';
import { Colony } from '../entities/colony.js';
import { Food } from '../entities/food.js';
import { state } from '../../state.js';
import { config } from '../../config.js';

/**
 * The main state of the program, where it "mainly" runs.
 */
export class MainState extends ProgramState {
  constructor() {
    super();

    this.colonies = [];
    this.foods = [];
    this.hasUsedLeftClick = false;
    this.hasUsedRightClick = false;
  }

  /**
   * Starts a random map with one colony.
   */
  startRandom() {
    const marginX = config.width * 0.2;
    const marginY = config.height * 0.2;

    const colonyPos = createVector(
      random(marginX, config.width - marginX),
      random(marginY, config.height - marginY)
    );
    this.colonies.push(new Colony(colonyPos));

    const foodPos = createVector(
      random(marginX, config.width - marginX),
      random(marginY, config.height - marginY)
    );
    this.foods.push(new Food(foodPos));
  }

  /**
   * Handles a left click: removes food under the cursor, or adds a new one.
   * @param {number} x
   * @param {number} y
   */
  handleLeftClick(x, y) {
    this.hasUsedLeftClick = true;
    const idx = this.foods.findIndex(f => f.contains(x, y));
    if (idx !== -1) {
      this.foods.splice(idx, 1);
    } else {
      this.foods.push(new Food(createVector(x, y)));
    }
  }

  /**
   * Handles a right click: removes colony under the cursor, or adds a new one.
   * @param {number} x
   * @param {number} y
   */
  handleRightClick(x, y) {
    this.hasUsedRightClick = true;
    const idx = this.colonies.findIndex(c => c.contains(x, y));
    if (idx !== -1) {
      this.colonies.splice(idx, 1);
    } else {
      this.colonies.push(new Colony(createVector(x, y)));
    }
  }

  /**
   * Calculates one tick of the program.
   */
  tick() {
    for (let colony of this.colonies) {
      colony.tick(this.foods);
    }

    this.foods = this.foods.filter(f => f.alive);

    super.tick();
  }

  /**
   * Draws one frame of the program.
   */
  draw() {
    background(15);

    for (let food of this.foods) {
      food.draw();
    }

    for (let colony of this.colonies) {
      colony.draw();
    }

    // HUD hint text — hidden once the user has tried both click types
    if (!this.hasUsedLeftClick || !this.hasUsedRightClick) {
      noStroke();
      fill(180);
      textAlign(CENTER, BOTTOM);
      textSize(14);
      text(state.i18n.hint, width / 2, height - 10);
    }

    super.draw();
  }
}
