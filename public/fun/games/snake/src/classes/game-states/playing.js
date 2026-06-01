import { GameState } from './game-state.js';
import { Cell } from '../map/cell.js';
import { Player } from '../entities/player.js';
import { Food } from '../entities/food.js';
import { setUI } from '../ui/hud.js';
import { CONFIG } from '../../config.js';

/**
 * The actual game. Two flags model the end-of-game (finished + won) the
 * same way pela-papa does it with `peeled`. Speed and grid size come in
 * via `opts` (chosen on the main menu) and are stashed so R-restart
 * preserves them.
 */
export class Playing extends GameState {
  /**
   * @param {{ tps?: number, cols?: number, rows?: number }} opts
   */
  init(opts = {}) {
    this._opts = opts;
    this.tps   = opts.tps  ?? CONFIG.tps;
    this.cols  = opts.cols ?? CONFIG.grid.cols;
    this.rows  = opts.rows ?? CONFIG.grid.rows;

    // Resize canvas for the chosen grid so cells stay square at integer pixels.
    this._resizeForGrid();

    this.cells      = [];   // [col][row]
    this.emptyCells = [];   // single flat list, kept in sync by Cell
    this.player     = null;
    this.score      = 0;
    this.finished   = false;
    this.won        = false;

    stroke(52, 74, 52);
    strokeWeight(1);
    rectMode(CENTER);
    textStyle(BOLD);

    this._createGrid();
    this._spawnPlayer();
    this.spawnFood();
    this._updateHud();

    this._onUIClick = this._onUIClick.bind(this);
    document.getElementById('ui').addEventListener('click', this._onUIClick);
  }

  _resizeForGrid() {
    let cellSize = floor(windowWidth / this.cols);
    let w = cellSize * this.cols;
    let h = cellSize * this.rows;
    if (h > windowHeight) {
      cellSize = floor(windowHeight / this.rows);
      w = cellSize * this.cols;
      h = cellSize * this.rows;
    }
    resizeCanvas(w, h);
  }

  _createGrid() {
    for (let i = 0; i < this.cols; i++) {
      const col = [];
      for (let j = 0; j < this.rows; j++) {
        const cell = new Cell(this, i, j);
        col.push(cell);
        this.emptyCells.push(cell);
      }
      this.cells.push(col);
    }
  }

  _spawnPlayer() {
    const x = round(this.cols / 2 - 1);
    const y = round(this.rows / 2 - 1);
    this.player = new Player(this.cells, x, y, this);
  }

  /** Drops a food onto a random empty cell (no-op if there are none). */
  spawnFood() {
    if (this.emptyCells.length === 0) return;
    const cell = this.emptyCells[round(random(0, this.emptyCells.length - 1))];
    new Food(this.cells, cell.x, cell.y);
  }

  // ── Public hooks the Snake / Cell call into ──────────────────────────────

  addEmptyCell(cell)    { this.emptyCells.push(cell); }
  removeEmptyCell(cell) {
    const idx = this.emptyCells.findIndex(c => c.x === cell.x && c.y === cell.y);
    if (idx !== -1) this.emptyCells.splice(idx, 1);
  }
  addScorePoint() { this.score++; this._updateHud(); }
  win()  { this._finish(true);  }
  lose() { this._finish(false); }

  _finish(won) {
    // Latch: first call wins. Matters because losing on the same tick the
    // grid filled up shouldn't overwrite the lose with a win.
    if (this.finished) return;
    this.finished = true;
    this.won      = won;
    this._showResult();
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  keyPressed(keyCode) {
    if (this.finished) {
      // Result screen: only R restarts. Movement keys are intentionally
      // ignored — a player who crashed while pressing arrow/WASD would
      // otherwise reset the game by accident.
      if (keyCode === 82) this._restart();
      return;
    }
    this.player.input(keyCode);
  }

  _restart() {
    window.setGameState(new Playing(this._opts));
  }

  _onUIClick(e) {
    if (e.target.dataset.action === 'restart') this._restart();
  }

  tick() {
    if (this.finished) return;
    if (this.emptyCells.length === 0) { this.win(); return; }
    this.player.move();
  }

  draw() {
    background(35, 52, 35); // playfield green ("grass")
    for (const col of this.cells) for (const cell of col) cell.draw();
  }

  // ── UI ───────────────────────────────────────────────────────────────────

  _updateHud() {
    const t = window.ctx.i18n;
    setUI(`<div class="hud"><span>${t.score}${this.score}</span></div>`, 'playing');
  }

  _showResult() {
    const t = window.ctx.i18n;
    const heading = this.won ? t.youveWon : t.youveLost;
    const cls     = this.won ? 'won' : 'lost';
    setUI(`
      <div class="panel result ${cls}">
        <h1>${heading}</h1>
        <p class="stat">${t.score}<strong>${this.score}</strong></p>
        <button class="primary" data-action="restart">${t.restart}</button>
        <p class="hint">${t.pressRToRestart}</p>
      </div>`, `result ${cls}`);
  }

  dispose() {
    document.getElementById('ui').removeEventListener('click', this._onUIClick);
  }
}
