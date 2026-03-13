import { GameState } from './game-state.js';
import { Cell } from '../map/cell.js';
import { Player } from '../entities/player.js';
import { Food } from '../entities/food.js';
import { state } from '../../state.js';
import { config, STATE_PLAYING, STATE_WON, STATE_LOST } from '../../config.js';

/**
 * InGame is when the user is actively playing the game.
 */
export class InGame extends GameState {
  constructor() {
    super();

    /**
     * The player. The one and only.
     */
    this.player = null;

    /**
     * The score. One food equals one point.
     */
    this.score = 0;

    /**
     * Array of cells ([X Coord][Y Coord]).
     */
    this.cells = [];

    /**
     * Single list of every empty cell.
     */
    this.emptyCells = [];

    /**
     * Game state. Whether the player is playing, has won or lost.
     */
    this.state = STATE_PLAYING;

    stroke(52, 74, 52);
    strokeWeight(1);
    rectMode(CENTER);

    textStyle(BOLD);
  }

  /**
   * Starts a game.
   */
  startGame() {
    this.createGrid();
    this.spawnPlayer();
    this.spawnFood();
  }

  /**
   * Creates the grid map.
   */
  createGrid() {
    // For each column
    for (let i = 0; i < config.cols; i++) {
      // Create column array
      let col = [];

      // For each row
      for (let j = 0; j < config.rows; j++) {
        let cell = new Cell(i, j);

        // Add cell to the column
        col.push(cell);

        // Add cell to the list of empty cells
        this.emptyCells.push(cell);
      }

      // Add column to the cells array
      this.cells.push(col);
    }
  }

  /**
   * Adds one cell to the list of empty cells.
   *
   * @param cell Cell to add.
   */
  addEmptyCell(cell) {
    this.emptyCells.push(cell);
  }

  /**
   * Removes one cell from the list of empty cells.
   *
   * @param cell Cell to remove.
   */
  removeEmptyCell(cell) {
    let indexOfCell = this.emptyCells.findIndex((elem) => {
      if (elem.x === cell.x && elem.y === cell.y) {
        return true;
      }

      return false;
    });

    if (indexOfCell !== -1) {
      this.emptyCells.splice(indexOfCell, 1);
    }
  }

  /**
   * Adds one point to the score.
   */
  addScorePoint() {
    this.score++;
  }

  /**
   * Creates the player.
   *
   * @param x (Opt) X position.
   * @param y (Opt) Y position.
   */
  spawnPlayer(x = -1, y = -1) {
    if (x < 0) {
      x = round(config.cols / 2 - 1);
    }

    if (y < 0) {
      y = round(config.rows / 2 - 1);
    }

    this.player = new Player(x, y);
  }

  /**
   * Creates a food entity in one of the empty cells.
   */
  spawnFood() {
    let emptyLength = this.emptyCells.length;

    // If we have room to spawn food
    if (emptyLength > 0) {
      // Select random empty cell
      let randomCell = this.emptyCells[round(random(0, emptyLength - 1))];

      // Spawn food
      let food = new Food(randomCell.x, randomCell.y);
    }
  }

  /**
   * Wins the current game.
   */
  win() {
    this.state = STATE_WON;
  }

  /**
   * Loses the current game.
   */
  lose() {
    this.state = STATE_LOST;
  }

  /**
   * Handles key input.
   *
   * @param keyCode p5.js keyCode global variable that has the code for the key pressed.
   */
  keyPressed(keyCode) {
    if (this.state === STATE_PLAYING) {
      this.player.input(keyCode);
    }
    else {
      state.gs = new InGame();

      state.gs.startGame();
    }
  }

  /**
   * Calculates a new tick for this state.
   */
  tick() {
    if (this.state === STATE_PLAYING) {
      if (this.emptyCells.length <= 0) {
        this.win();
      }
      else {
        this.player.move();
      }
    }
  }

  /**
   * Draws a frame for this state.
   */
  draw() {
    background(35, 52, 35);

    // For each cell
    for (let col of this.cells) {
      for (let cell of col) {
        cell.draw();
      }
    }

    fill(210, 230, 210);
    textSize(20);
    textAlign(LEFT);
    text(state.i18n.score + this.score, 5, 20);

    textAlign(CENTER);
    if (this.state !== STATE_PLAYING) {
      fill(210, 230, 210);
      text(state.i18n.pressAnyKeyToRestart, config.width / 2, config.height / 2 + 20);

      textSize(50);
      if (this.state === STATE_LOST) {
        fill(205, 92, 92);
        text(state.i18n.youveLost, config.width / 2, config.height / 2 - 20);
      }
      else {
        fill(135, 205, 135);
        text(state.i18n.youveWon, config.width / 2, config.height / 2 - 20);
      }
    }
  }
}
