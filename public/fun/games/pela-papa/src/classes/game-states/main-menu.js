import { Potato } from '../entities/potato.js';
import { OrbitCamera } from '../entities/orbit-camera.js';
import { GameState } from './game-state.js';
import { Playing } from './playing.js';
import { setUI, clearUI } from '../ui/hud.js';
import { CONFIG } from '../../config.js';

/**
 * Title screen: a potato spins in the background (blurred via CSS) with the
 * title and controls on top. Any key or click starts the game.
 */
export class MainMenu extends GameState {
  init() {
    this.orbit  = new OrbitCamera();
    this.potato = new Potato().style(CONFIG, window.ctx.assets.potatoTex);
    this._showMenu();
  }

  _showMenu() {
    const t = window.ctx.i18n;
    setUI(`
      <div class="panel">
        <h1>${t.title}</h1>
        <ul class="controls">
          <li>${t.ctrlRotate}</li>
          <li>${t.ctrlZoom}</li>
          <li>${t.ctrlCut}</li>
          <li>${t.ctrlReset}</li>
        </ul>
        <p class="start">${t.pressAnyKeyToStart}</p>
      </div>`, 'menu');
  }

  /**
   * Starts the game, passing the SAME potato so the player continues on the
   * exact potato they see on the title screen (no jarring swap on start).
   */
  _initPlaying() { window.setGameState(new Playing(this.potato)); }

  keyPressed() {
    // R generates a fresh potato in the menu, without starting the game,
    // so the player can roll the dice on its silhouette.
    if (key === 'r' || key === 'R') {
      this.potato = new Potato().style(CONFIG, window.ctx.assets.potatoTex);
      return;
    }
    this._initPlaying();
  }
  mousePressed() { this._initPlaying(); }
  mouseDragged() {}
  mouseReleased() {}
  mouseWheel() { return false; }

  tick() {
    this.orbit.spin(0.004); // slow background spin
    this.potato.tick();
  }

  draw() {
    background(...CONFIG.colors.background);
    this.applyLights();
    this.potato.draw();
  }

  dispose() { /* see Playing.dispose for why this is empty */ }
}
