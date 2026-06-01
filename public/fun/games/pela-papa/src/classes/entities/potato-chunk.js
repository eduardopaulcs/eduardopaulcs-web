import { buildModels, drawModels } from './potato-render.js';

/**
 * A chunk of potato that falls after being cut off.
 *
 * The chunk pre-scales its triangle geometry by the potato's scale on first
 * draw, so its vertices live in WORLD units. That decouples the chunk's
 * rigid translate+rotate from the potato's (potentially non-uniform) scale:
 * if the chunk were drawn inside the potato's scaled frame, rotation in a
 * non-uniformly scaled space would shear the chunk and it would visibly
 * "deform" as it tumbled. With world-space geometry that issue is gone.
 *
 * For this to work the chunk must be drawn OUTSIDE the potato's transform
 * stack (see Potato.draw).
 */
export class PotatoChunk {
  constructor(triangles) {
    this.triangles = triangles;
    this.position = createVector(0, 0, 0);
    this.velocity = createVector(
      random(-3, 3),
      random(-7, -3),
      random(-3, 3)
    );
    this.rotation = createVector(0, 0, 0);
    this.rotationVelocity = p5.Vector.random3D().mult(0.05);
    this.dead = false;
    this._models = null; // built lazily on first draw, once we know the scale
  }

  tick() {
    this.velocity.y += 0.6;
    this.position.add(this.velocity);
    this.rotation.add(this.rotationVelocity);

    if (this.position.y > 3000) this.dead = true;
  }

  draw(style) {
    if (this.dead) return;

    if (!this._models) {
      // Pre-scale once: bake the parent potato's scale into the chunk's
      // vertices, so the chunk's geometry is in world units from now on.
      const s = style.scale || { x: 1, y: 1, z: 1 };
      const scaled = this.triangles.map(t => ({
        v0: [t.v0[0]*s.x, t.v0[1]*s.y, t.v0[2]*s.z],
        v1: [t.v1[0]*s.x, t.v1[1]*s.y, t.v1[2]*s.z],
        v2: [t.v2[0]*s.x, t.v2[1]*s.y, t.v2[2]*s.z],
        kind: t.kind,
      }));
      this._models = buildModels(scaled);
    }

    push();
    translate(this.position.x, this.position.y, this.position.z);
    rotateX(this.rotation.x);
    rotateY(this.rotation.y);
    rotateZ(this.rotation.z);
    // NO scale here — geometry is already in world units.
    drawModels(this._models, style);
    pop();
  }
}
