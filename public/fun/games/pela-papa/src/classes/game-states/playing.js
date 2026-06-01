import { Potato } from '../entities/potato.js';
import { Knife } from '../entities/knife.js';
import { OrbitCamera } from '../entities/orbit-camera.js';
import { GameState } from './game-state.js';
import { setUI, clearUI } from '../ui/hud.js';
import { CONFIG } from '../../config.js';

/**
 * Active gameplay. The player orbits (right click), moves the knife (scroll)
 * and cuts (left click). The goal is to peel off all the skin while losing as
 * little volume as possible.
 *
 * Once peeled, a result overlay appears:
 *   - Left click: fresh new potato (restart).
 *   - Right click: keep slicing the same potato.
 */
export class Playing extends GameState {
  /**
   * @param {Potato|null} existingPotato  Pass the menu potato so the player
   *   continues on the same one. Omit to generate a fresh potato.
   */
  init(existingPotato = null) {
    this.orbit  = new OrbitCamera();
    this.potato = existingPotato || new Potato().style(CONFIG, window.ctx.assets.potatoTex);
    this.knife  = new Knife(this.potato, this.orbit.cam);

    this.initialVolume   = this.potato.volume();
    this.initialSkinArea = this.potato.skinArea();

    // `peeled` latches true the moment the skin is gone and never resets
    // (you can't un-peel a potato). Separating it from `finished` lets the
    // player dismiss the overlay and keep cutting without re-triggering it.
    this.peeled   = false;
    this.finished = false;
    this.score    = 0;

    this._updateHud();
  }

  // ─── Scoring ─────────────────────────────────────────────────────────────

  _volumeKept() {
    return this.initialVolume > 0 ? this.potato.volume() / this.initialVolume : 0;
  }

  _skinLeft() {
    return this.initialSkinArea > 0 ? this.potato.skinArea() / this.initialSkinArea : 0;
  }

  _computeScore() {
    const ratio = this._volumeKept() / CONFIG.score.perfectKeepRatio;
    return Math.max(0, Math.min(100, Math.round(ratio * 100)));
  }

  // ─── UI ──────────────────────────────────────────────────────────────────

  _updateHud() {
    const t = window.ctx.i18n;
    setUI(`
      <div class="hud">
        <div class="stats-row">
          <span>${t.volumeKept}: ${Math.round(this._volumeKept() * 100)}%</span>
          <span>${t.skinLeft}: ${Math.round(this._skinLeft() * 100)}%</span>
        </div>
        <div class="hint">${t.ctrlReset}</div>
      </div>`, 'playing');
  }

  _showResult() {
    const t = window.ctx.i18n;
    const vol  = Math.round(this._volumeKept() * 100);
    const skin = Math.round(this._skinLeft()   * 100);
    setUI(`
      <div class="panel result">
        <h1>${t.peeled}</h1>
        <p class="stat">${t.volumeKept}: <strong>${vol}%</strong></p>
        <p class="stat">${t.skinLeft}: <strong>${skin}%</strong></p>
        <p class="bigscore">${t.accuracy}: ${this.score}%</p>
        <ul class="controls">
          <li>${t.playAgain}</li>
          <li>${t.keepPlaying}</li>
        </ul>
      </div>`, 'result');
  }

  // ─── Input ───────────────────────────────────────────────────────────────

  /** Starts a fresh game. Triggered by R, or by the host on first launch. */
  _initPlaying() {
    window.setGameState(new Playing());
  }

  mousePressed() {
    if (this.finished) {
      // Any click dismisses the overlay so the player keeps slicing the
      // same potato. Restart is reserved for R deliberately: if left-click
      // also restarted here, a rapid clicker would accidentally throw away
      // their potato the instant the overlay appears mid-slice.
      this.finished = false;
      this._updateHud();
      return;
    }
    if (mouseButton === LEFT) this._performCut();
  }

  /** One cut at the current knife plane (no-op if there isn't one yet). */
  _performCut() {
    const plane = this.knife.getCutPlane();
    if (plane) {
      this.potato.cut(plane.point, plane.normal);
      this._updateHud();
    }
  }

  mouseDragged() {
    if (mouseButton === RIGHT) this.orbit.rotate(movedX, movedY);
  }

  mouseReleased() {}

  mouseWheel(event) {
    this.knife.scroll(event.delta);
    return false;
  }

  keyPressed() {
    // R is always "fresh potato", both during play and on the result overlay.
    if (key === 'r' || key === 'R') { this._initPlaying(); return; }

    if (this.finished) {
      // Any other playing-control key dismisses the overlay so the player
      // can keep slicing the same potato. We don't fire the action here:
      // for held keys (WASD, QE) the tick() poller will pick it up on the
      // next tick; for one-shots (Space) a second press will act.
      if (this._isPlayingControl(key)) {
        this.finished = false;
        this._updateHud();
      }
      return;
    }

    // Spacebar cuts.
    if (key === ' ') this._performCut();
  }

  _isPlayingControl(k) {
    const lo = k.toLowerCase();
    return lo === 'w' || lo === 'a' || lo === 's' || lo === 'd'
        || lo === 'q' || lo === 'e' || k === ' ';
  }

  /** Continuous controls polled each tick while the keys are held. */
  _handleHeldKeys() {
    const rot = CONFIG.camera.keyRotateSpeed;
    const sc  = CONFIG.camera.keyScrollSpeed;
    // WASD → orbit camera. Direction signs match the mouse-drag mapping:
    // dragging up (movedY<0) raises elevation, so W (look up) passes a
    // negative dy. Same logic for A=left: A wants az to decrease, and
    // orbit.rotate uses `az -= dx*s`, so A must pass a POSITIVE dx.
    if (keyIsDown(87)) this.orbit.rotate(0, -rot);   // W
    if (keyIsDown(83)) this.orbit.rotate(0,  rot);   // S
    if (keyIsDown(65)) this.orbit.rotate( rot, 0);   // A
    if (keyIsDown(68)) this.orbit.rotate(-rot, 0);   // D
    // Q/E → knife offset. Q pulls the cut plane deeper into the potato
    // (offset down), E pushes it outward (offset up).
    if (keyIsDown(81)) this.knife.scroll(-sc);       // Q
    if (keyIsDown(69)) this.knife.scroll( sc);       // E
  }

  // ─── Loop ────────────────────────────────────────────────────────────────

  tick() {
    if (!this.finished) this._handleHeldKeys();
    this.potato.tick();
    this.knife.update();

    // Only trigger once: `peeled` latches and never resets.
    if (!this.peeled && this._skinLeft() < CONFIG.score.peeledThreshold) {
      this.peeled   = true;
      this.finished = true;
      this.score    = this._computeScore();
      this._showResult();
    }
  }

  draw() {
    background(...CONFIG.colors.background);
    this.applyLights();

    const highlight = this.finished ? null : this.knife.getCutPlane();
    this.potato.draw(highlight);

    if (!this.finished) this.knife.draw();
  }

  dispose() {
    // setUI replaces the panel content, so the next state's init() naturally
    // overwrites this HUD on transition. We don't clearUI() here because
    // `setGameState(new Playing())` evaluates the new state BEFORE calling
    // dispose on the old one, meaning a clearUI() here would wipe the HUD
    // the new init() just set up.
  }
}
