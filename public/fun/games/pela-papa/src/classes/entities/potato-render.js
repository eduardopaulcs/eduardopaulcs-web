/**
 * Shared rendering for potato meshes (the potato and the falling chunks).
 * Classifies triangles into skin (curved surface, textured) and caps (flat
 * interior, yellow flesh), builds the geometries with proper UVs, and draws
 * them with the given style. Pure rendering: it never touches cut geometry.
 */

function triNormal(t) {
  const ux = t.v1[0]-t.v0[0], uy = t.v1[1]-t.v0[1], uz = t.v1[2]-t.v0[2];
  const vx = t.v2[0]-t.v0[0], vy = t.v2[1]-t.v0[1], vz = t.v2[2]-t.v0[2];
  const nx = uy*vz-uz*vy, ny = uz*vx-ux*vz, nz = ux*vy-uy*vx;
  const m = Math.sqrt(nx*nx + ny*ny + nz*nz);
  if (m < 1e-7) return null;
  return [nx/m, ny/m, nz/m];
}

function triArea(t) {
  const ux = t.v1[0]-t.v0[0], uy = t.v1[1]-t.v0[1], uz = t.v1[2]-t.v0[2];
  const vx = t.v2[0]-t.v0[0], vy = t.v2[1]-t.v0[1], vz = t.v2[2]-t.v0[2];
  const cx = uy*vz-uz*vy, cy = uz*vx-ux*vz, cz = ux*vy-uy*vx;
  return 0.5 * Math.sqrt(cx*cx + cy*cy + cz*cz);
}

/** Total surface area of a triangle list. */
export function area(triangles) {
  let a = 0;
  for (const t of triangles) a += triArea(t);
  return a;
}

/**
 * Splits triangles by the `kind` tag each face carries from birth.
 * 'skin' (or missing): original curved surface — textured.
 * 'cap': flat cut face — yellow flesh.
 */
export function classify(triangles) {
  const skin = [], caps = [];
  for (const t of triangles) {
    if (t.kind === 'cap') caps.push(t);
    else                  skin.push(t);
  }
  return { skin, caps };
}

/** Builds { skinModel, capModel } geometries. Skin gets spherical UVs. */
export function buildModels(triangles) {
  const { skin, caps } = classify(triangles);

  const skinModel = buildGeometry(() => {
    beginShape(TRIANGLES);
    for (const t of skin) {
      for (const v of [t.v0, t.v1, t.v2]) {
        const r = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]) || 1;
        const u = 0.5 + Math.atan2(v[2], v[0]) / (2 * Math.PI);
        const w = 0.5 - Math.asin(Math.max(-1, Math.min(1, v[1]/r))) / Math.PI;
        vertex(v[0], v[1], v[2], u, w);
      }
    }
    endShape();
  });
  // buildGeometry bakes the active fill (default white) into the geometry as
  // "internal colors". With internal colors set, fill() has no effect when we
  // later draw the model. clearColors() removes them so drawModels' fill takes
  // over. See https://p5js.org/reference/p5.Geometry/clearColors/
  skinModel.clearColors();
  // buildGeometry does NOT auto-call computeNormals; immediate-mode vertex()
  // calls store whatever the renderer's current normal state is (often a
  // stale default), which means lighting can be subtly wrong even when
  // something visible shows up. Explicit FLAT normals: every face gets its
  // own normal from the triangle's cross product. See p5 issue #5393 and
  // https://p5js.org/reference/p5.Geometry/computeNormals/
  skinModel.computeNormals();

  const capModel = buildGeometry(() => {
    beginShape(TRIANGLES);
    for (const t of caps) { vertex(...t.v0); vertex(...t.v1); vertex(...t.v2); }
    endShape();
  });
  capModel.clearColors();
  capModel.computeNormals();

  return { skinModel, capModel };
}

/**
 * Draws skin + caps with diffuse, ambient, and specular materials.
 *
 * The three material calls control three different lighting components:
 *   fill(r,g,b)            → diffuse color (how directional/point/spot
 *                            lights illuminate the surface — without this
 *                            the diffuse defaults to white and the surface
 *                            looks washed out and pale).
 *   ambientMaterial(r,g,b) → how ambientLight() tints the surface.
 *   specularMaterial(r,g,b)→ the color of the highlight reflections.
 *
 * For specular to show up, the scene must also have specularColor() and at
 * least one directional/point/spot light (set in applyLights).
 *
 * style: { skinTexture, skinColor, fleshColor, shininess }
 */
export function drawModels(models, style) {
  const shine = style.shininess || 18;

  // ── Skin (outer surface) ────────────────────────────────────────────────
  push();
  noStroke();

  if (style.skinTexture) {
    // Texture provides the diffuse color directly. Reset fill to white so
    // the texture isn't tinted, and let ambient mildly brighten dark areas.
    texture(style.skinTexture);
    fill(255);
    ambientMaterial(200);
  } else {
    const [r, g, b] = style.skinColor;
    fill(r, g, b);              // diffuse (the brown the player sees when lit)
    ambientMaterial(r, g, b);   // ambient (same color → dark side stays brown)
  }
  // Potato skin is dry/matte. Big specular hides the diffuse variation
  // that *is* the relief — so keep specular small and tight.
  specularMaterial(22, 20, 14);
  shininess(Math.max(1, shine));

  if (models.skinModel) model(models.skinModel);
  pop();

  // ── Flesh / caps (interior cut faces) ──────────────────────────────────
  push();
  noStroke();

  const [fr, fg, fb] = style.fleshColor;
  fill(fr, fg, fb);             // diffuse (yellow)
  ambientMaterial(fr, fg, fb);  // ambient (yellow on the dark side)
  // Fresh cut is slightly moist → brighter specular and a sharper highlight.
  specularMaterial(120, 110, 80);
  shininess(Math.max(1, shine + 10));

  if (models.capModel) model(models.capModel);
  pop();
}
