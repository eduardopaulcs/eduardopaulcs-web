import { CONFIG } from '../../config.js';

/**
 * Orbit camera: rotates around the origin by azimuth/elevation.
 * Encapsulates the position math so it isn't repeated in each state.
 */
export class OrbitCamera {
  constructor() {
    this.dist = CONFIG.camera.dist;
    this.az   = CONFIG.camera.azimuth;
    this.el   = CONFIG.camera.elevation;
    this.cam  = createCamera();
    this.apply();
  }

  apply() {
    const r = this.dist, az = this.az, el = this.el;
    const x = r * cos(el) * sin(az);
    const y = r * sin(el);
    const z = r * cos(el) * cos(az);
    this.cam.camera(x, y, z, 0, 0, 0, 0, 1, 0);
  }

  /** Rotates the camera from mouse drag. */
  rotate(dx, dy) {
    const s = CONFIG.camera.rotateSensitivity;
    const dpr = window.devicePixelRatio || 1;
    this.az -= (dx / dpr) * s;
    this.el -= (dy / dpr) * s;
    this.el = constrain(this.el, -PI / 2 + 0.05, PI / 2 - 0.05);
    this.apply();
  }

  /** Auto-rotation (for the menu background). */
  spin(delta) {
    this.az += delta;
    this.apply();
  }
}
