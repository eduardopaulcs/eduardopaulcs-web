/**
 * Knife follows the mouse on the potato surface and defines the cut plane
 */
export class Knife {
  constructor(potato, camera) {
    this.potato = potato;
    this.camera = camera;

    this.offset = 150;
    this.minOffset = -150;
    this.maxOffset = 150;

    this.surfacePoint = null;
    this.surfaceNormal = null;

    // Detect whether the device has a precise pointer (mouse, trackpad,
    // stylus). On a touch-only device we don't have meaningful mouseX/mouseY,
    // so the raycast falls back to the screen center — i.e. the knife stays
    // centered on the potato and the player uses the keyboard for everything.
    // (any-pointer: fine) matches if ANY connected device is precise, which
    // handles laptops, hybrid tablets with a stylus, etc.
    this._hasMouse = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(any-pointer: fine)').matches
      : true;
  }

  /**
   * Adjusts the offset along the normal via mouse scroll
   */
  scroll(delta) {
    this.offset = constrain(this.offset + delta * 0.5, this.minOffset, this.maxOffset);
  }

  /**
   * Updates the knife position based on the current mouse position
   */
  update() {
    const ray = this._buildRay();
    const hit = this._intersectElipsoid(ray);

    if (hit) {
      this.surfacePoint = hit.point;
      this.surfaceNormal = hit.normal;
    } else {
      const closest = this._closestPointOnRay(ray);
      this.surfacePoint = closest.point;
      this.surfaceNormal = closest.normal;
    }
  }

  /**
   * Returns the current cut plane { point, normal }
   */
  getCutPlane() {
    if (!this.surfacePoint || !this.surfaceNormal) return null;

    const normal = this.surfaceNormal.copy();
    const point = p5.Vector.add(
      this.surfacePoint,
      p5.Vector.mult(normal, this.offset)
    );

    return { point, normal };
  }

  /**
   * Draws the knife at the current cut position
   */
  draw() {
    if (!this.surfacePoint || !this.surfaceNormal) return;

    const cutPlane = this.getCutPlane();

    push();
    translate(cutPlane.point.x, cutPlane.point.y, cutPlane.point.z);
    this._alignToNormal(cutPlane.normal);

    // After _alignToNormal local +Z is the cut plane normal, so the knife
    // lies flat in the XY plane. Coordinates are tuned with the tip
    // pointing toward -X (Pol's preferred orientation) and the spine of
    // the blade/handle ALIGNED on the same top edge at y = -30:
    //   -X = forward (toward the tip)   +X = backward (toward the handle)
    //   -Y = spine (top edge — shared between blade and handle)
    //   +Y = cutting edge (bottom of the blade)
    //   +Z = blade thickness direction

    noStroke();

    // ── Handle: wooden rectangular prism on the +X side ───────────────────
    // Height = 40 (less than the blade's 60) so it shares the top spine at
    // y=-30 and the underside of the handle stops at y=+10, leaving a step
    // down to the blade's cutting edge at y=+30. The handle is wider in Z
    // than the blade so it visually reads as something to hold.
    push();
    fill(120, 78, 44);
    ambientMaterial(120, 78, 44);
    specularMaterial(30, 22, 14);
    shininess(6);
    translate(120, -10, 0);   // x∈[60,180], y center -10 → y∈[-30,10]
    box(120, 40, 26);
    pop();

    // ── Blade body: silvery thin rectangle ────────────────────────────────
    push();
    fill(205, 210, 220);
    ambientMaterial(205, 210, 220);
    specularMaterial(180, 185, 195);
    shininess(90);
    translate(-60, 0, 0);     // x∈[-180,60], full height y∈[-30,30]
    box(240, 60, 3);
    pop();

    // ── Blade tip: RIGHT triangle wedge in -X direction ───────────────────
    // The 90° corner is at the TOP-back of the tip (where it meets the
    // spine and the blade body), per Pol's spec. Vertex labels:
    //   A = (-180, -30, ±1.5)  90° corner (top-back, meets spine + blade)
    //   B = (-180, +30, ±1.5)  bottom-back (the blade's cutting edge ends)
    //   C = (-260, -30, ±1.5)  the TIP itself, forward and on the spine
    // The spine continues straight from the blade through A out to C; the
    // hypotenuse is B→C — that's the cutting edge of the tip sloping up.
    push();
    fill(205, 210, 220);
    ambientMaterial(205, 210, 220);
    specularMaterial(180, 185, 195);
    shininess(90);
    beginShape(TRIANGLES);
    // Front face (z=+1.5), winding A1→B1→C1 → outward normal +Z (verified
    // by cross product (B1-A1)×(C1-A1) = (0,0,+4800)).
    vertex(-180, -30,  1.5); vertex(-180,  30,  1.5); vertex(-260, -30,  1.5);
    // Back face (z=-1.5), winding A2→C2→B2 → outward normal -Z.
    vertex(-180, -30, -1.5); vertex(-260, -30, -1.5); vertex(-180,  30, -1.5);
    // Top (spine) face at y=-30. Two triangles; outward normal -Y (up in p5
    // since +Y points down). Verified cross product → (0,-240,0).
    vertex(-180, -30,  1.5); vertex(-260, -30, -1.5); vertex(-180, -30, -1.5);
    vertex(-180, -30,  1.5); vertex(-260, -30,  1.5); vertex(-260, -30, -1.5);
    // Hypotenuse face (the tip's cutting edge slope, B→C). Outward normal
    // pointing -X/+Y (forward and downward), verified → (-180,+240,0).
    vertex(-180,  30,  1.5); vertex(-180,  30, -1.5); vertex(-260, -30, -1.5);
    vertex(-180,  30,  1.5); vertex(-260, -30, -1.5); vertex(-260, -30,  1.5);
    endShape();
    pop();

    pop();
  }

  _buildRay() {
    const origin = createVector(
      this.camera.eyeX,
      this.camera.eyeY,
      this.camera.eyeZ
    );

    // On no-pointer devices fall back to screen center so the knife sits on
    // the potato regardless of where p5 has parked mouseX/mouseY (often 0,0).
    const px = this._hasMouse ? mouseX : width / 2;
    const py = this._hasMouse ? mouseY : height / 2;
    const ndcX = (px / width) * 2 - 1;
    const ndcY = (py / height) * 2 - 1;

    const eye = createVector(this.camera.eyeX, this.camera.eyeY, this.camera.eyeZ);
    const center = createVector(this.camera.centerX, this.camera.centerY, this.camera.centerZ);
    const upVec = createVector(this.camera.upX, this.camera.upY, this.camera.upZ);

    const forward = p5.Vector.sub(center, eye).normalize();
    const right = forward.cross(upVec).normalize();
    const up = right.cross(forward).normalize();

    const fov = PI / 3;
    const aspect = width / height;
    const tanHalfFov = tan(fov / 2);

    const dir = p5.Vector.add(
      forward,
      p5.Vector.add(
        p5.Vector.mult(right, ndcX * aspect * tanHalfFov),
        p5.Vector.mult(up, ndcY * tanHalfFov)
      )
    ).normalize();

    return { origin, dir };
  }

  _intersectElipsoid(ray) {
    const pos = this.potato.position;
    const scale = this.potato.scale;
    const R = 300;

    const ax = scale.x * R;
    const ay = scale.y * R;
    const az = scale.z * R;

    const ox = (ray.origin.x - pos.x) / ax;
    const oy = (ray.origin.y - pos.y) / ay;
    const oz = (ray.origin.z - pos.z) / az;

    const dx = ray.dir.x / ax;
    const dy = ray.dir.y / ay;
    const dz = ray.dir.z / az;

    const a = dx * dx + dy * dy + dz * dz;
    const b = 2 * (ox * dx + oy * dy + oz * dz);
    const c = ox * ox + oy * oy + oz * oz - 1;

    const disc = b * b - 4 * a * c;
    if (disc < 0) return null;

    const sqrtDisc = sqrt(disc);
    const t1 = (-b - sqrtDisc) / (2 * a);
    const t2 = (-b + sqrtDisc) / (2 * a);

    let t = null;
    if (t1 > 0) t = t1;
    else if (t2 > 0) t = t2;
    else return null;

    const point = p5.Vector.add(ray.origin, p5.Vector.mult(ray.dir, t));

    const nx = (point.x - pos.x) / (ax * ax);
    const ny = (point.y - pos.y) / (ay * ay);
    const nz = (point.z - pos.z) / (az * az);
    const normal = createVector(nx, ny, nz).normalize();

    return { point, normal };
  }

  _closestPointOnRay(ray) {
    const pos   = this.potato.position;
    const scale = this.potato.scale;
    const R     = 300;

    const toCenter = p5.Vector.sub(pos, ray.origin);
    const t        = max(toCenter.dot(ray.dir), 0);

    const closestOnRay = p5.Vector.add(ray.origin, p5.Vector.mult(ray.dir, t));

    const dir = p5.Vector.sub(closestOnRay, pos);

    if (dir.mag() < 0.001) {
      const toCam = p5.Vector.sub(ray.origin, pos).normalize();
      return {
        point:  p5.Vector.add(pos, createVector(toCam.x * scale.x * R, toCam.y * scale.y * R, toCam.z * scale.z * R)),
        normal: toCam,
      };
    }

    const dirNorm = dir.normalize();

    const ax = scale.x * R;
    const ay = scale.y * R;
    const az = scale.z * R;

    const point = createVector(
      pos.x + dirNorm.x * ax,
      pos.y + dirNorm.y * ay,
      pos.z + dirNorm.z * az,
    );

    const nx = (point.x - pos.x) / (ax * ax);
    const ny = (point.y - pos.y) / (ay * ay);
    const nz = (point.z - pos.z) / (az * az);
    const normal = createVector(nx, ny, nz).normalize();

    return { point, normal };
  }

  _alignToNormal(normal) {
    const yaw = atan2(normal.x, normal.z);
    const pitch = -asin(constrain(normal.y, -1, 1));

    rotateY(yaw);
    rotateX(pitch);
  }
}
