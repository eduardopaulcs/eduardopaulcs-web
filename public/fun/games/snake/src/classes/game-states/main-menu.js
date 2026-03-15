import { GameState } from './game-state.js';
import { InGame } from './in-game.js';
import { state } from '../../state.js';
import { config } from '../../config.js';

/**
 * MainMenu is the initial screen shown before the game starts.
 */
export class MainMenu extends GameState {
  constructor() {
    super();

    fill(210, 230, 210);
    textAlign(CENTER);
    textStyle(BOLD);
  }

  /**
   * Handles key input.
   *
   * @param keyCode p5.js keyCode global variable that has the code for the key pressed.
   */
  keyPressed(keyCode) {
    state.gs = new InGame();

    state.gs.startGame();
  }

  /**
   * Draws a frame for this state.
   */
  draw() {
    background(18, 26, 18);

    textSize(30);
    text(state.i18n.pressAnyKeyToStart, config.width / 2, config.height / 2 - 20);
    textSize(20);
    text(state.i18n.useArrowKeysToMove, config.width / 2, config.height / 2 + 20);
  }
}
