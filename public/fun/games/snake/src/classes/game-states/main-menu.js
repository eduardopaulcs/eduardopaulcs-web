import { GameState } from './game-state.js';
import { Playing } from './playing.js';
import { setUI } from '../ui/hud.js';

/** Per-tick speed presets. The i18n key is resolved at render time. */
const SPEED_PRESETS = [
  { key: 'speedSlow',   tps: 3 },
  { key: 'speedNormal', tps: 4 },
  { key: 'speedFast',   tps: 6 },
];

const SIZE_PRESETS = [
  { cols: 8,  rows: 8  },
  { cols: 12, rows: 12 },
  { cols: 16, rows: 16 },
  { cols: 20, rows: 20 },
];

const DEFAULT_SPEED = 1;
const DEFAULT_SIZE  = 1;

/**
 * Title screen with speed and grid-size selectors. Pressing any key (or
 * the Start button) starts the game using the current selections. Restart
 * after a game reuses those same selections via Playing's _opts.
 */
export class MainMenu extends GameState {
  init() {
    this.speedIdx = DEFAULT_SPEED;
    this.sizeIdx  = DEFAULT_SIZE;
    this._showMenu();
    // Event delegation: one listener on the overlay catches every button
    // click. setUI() replaces innerHTML on re-render but #ui itself stays,
    // so the listener survives re-renders.
    this._onUIClick = this._onUIClick.bind(this);
    document.getElementById('ui').addEventListener('click', this._onUIClick);
  }

  _showMenu() {
    const t = window.ctx.i18n;
    const speed = SPEED_PRESETS[this.speedIdx];
    const size  = SIZE_PRESETS[this.sizeIdx];
    setUI(`
      <div class="panel">
        <h1>${t.title}</h1>
        <div class="selectors">
          <div class="selector">
            <span class="label">${t.speedLabel}</span>
            <button class="step" data-action="speed-prev">◀</button>
            <span class="value">${t[speed.key]}</span>
            <button class="step" data-action="speed-next">▶</button>
          </div>
          <div class="selector">
            <span class="label">${t.gridLabel}</span>
            <button class="step" data-action="size-prev">◀</button>
            <span class="value">${size.cols}×${size.rows}</span>
            <button class="step" data-action="size-next">▶</button>
          </div>
        </div>
        <button class="primary" data-action="start">${t.start}</button>
        <p class="hint">${t.useArrowKeysToMove}</p>
      </div>`, 'menu');
  }

  _onUIClick(e) {
    const action = e.target.dataset.action;
    if (!action) return;
    switch (action) {
      case 'speed-prev': this.speedIdx = (this.speedIdx - 1 + SPEED_PRESETS.length) % SPEED_PRESETS.length; this._showMenu(); break;
      case 'speed-next': this.speedIdx = (this.speedIdx + 1) % SPEED_PRESETS.length; this._showMenu(); break;
      case 'size-prev':  this.sizeIdx  = (this.sizeIdx  - 1 + SIZE_PRESETS.length)  % SIZE_PRESETS.length;  this._showMenu(); break;
      case 'size-next':  this.sizeIdx  = (this.sizeIdx  + 1) % SIZE_PRESETS.length;  this._showMenu(); break;
      case 'start':      this._startGame(); break;
    }
  }

  _startGame() {
    const speed = SPEED_PRESETS[this.speedIdx];
    const size  = SIZE_PRESETS[this.sizeIdx];
    window.setGameState(new Playing({ tps: speed.tps, cols: size.cols, rows: size.rows }));
  }

  keyPressed() { this._startGame(); }

  draw() {
    background(16, 16, 20); // matches body bg so canvas blends with the frame
  }

  dispose() {
    document.getElementById('ui').removeEventListener('click', this._onUIClick);
  }
}
