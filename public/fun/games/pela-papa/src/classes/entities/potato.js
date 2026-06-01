import { PotatoChunk } from './potato-chunk.js';
import { buildModels, drawModels, classify, area } from './potato-render.js';

/**
 * The potato.
 *
 * Incremental model: this.triangles IS the live, closed mesh.
 * Each cut clips that mesh with a SINGLE plane and stitches a flat cap
 * along the cut rim. Since a plane cutting a closed surface always yields
 * closed loops, every cut starts closed and ends closed -> flat caps,
 * no holes, and no dependency on the original sphere.
 */
export class Potato {
  constructor() {
    this.position = createVector(0, 0, 0);
    this.rotation = createVector(0, 0, 0);
    this.scale    = createVector(random(0.8, 1.2), random(1.5, 2.5), random(0.8, 1.2));
    this.chunks   = [];
    this.triangles = [];
    this.model    = this.createModel(300, 12);
  }

  // ─── Initialization ──────────────────────────────────────────────────────

  /**
   * Generates a potato-like model by deforming a sphere with Perlin noise
   */
  createModel(radius = 100, detail = 16) {
    this._genRadius         = radius;
    this._genDetail         = detail;
    this._genNoiseOffset    = random(1000);
    this._genNoiseFreq      = random(8, 16);
    this._genNoiseAmplitude = random(150, 300);

    this.triangles = this._generateBaseTriangles();
    return this._buildFromTriangles(this.triangles);
  }

  /**
   * Generates the base sphere triangles (closed mesh)
   */
  _generateBaseTriangles() {
    const { _genRadius: radius, _genDetail: detail,
            _genNoiseOffset: noiseOffset,
            _genNoiseFreq: noiseFreq,
            _genNoiseAmplitude: noiseAmplitude } = this;

    const spherePoint = (phi, theta) => {
      const x = radius * sin(phi) * cos(theta);
      const y = radius * cos(phi);
      const z = radius * sin(phi) * sin(theta);

      const noiseValue = noise(
        x * noiseFreq + noiseOffset,
        y * noiseFreq + noiseOffset,
        z * noiseFreq + noiseOffset
      );

      const poleAttenuation = sin(phi);
      const newRadius = radius + noiseValue * noiseAmplitude * poleAttenuation;

      return [
        x / radius * newRadius,
        y / radius * newRadius,
        z / radius * newRadius
      ];
    };

    const triangles = [];
    const sameV = (p, q) => Math.abs(p[0]-q[0])<1e-6 && Math.abs(p[1]-q[1])<1e-6 && Math.abs(p[2]-q[2])<1e-6;
    const pushTri = (a, b, c) => { if (sameV(a,b) || sameV(b,c) || sameV(a,c)) return; triangles.push({ v0:a, v1:b, v2:c, kind:'skin' }); };

    for (let i = 0; i < detail; i++) {
      for (let j = 0; j < detail; j++) {
        const phi1   = map(i,     0, detail, 0, PI);
        const phi2   = map(i + 1, 0, detail, 0, PI);
        const theta1 = map(j,     0, detail, 0, TWO_PI);
        const theta2 = map(j + 1, 0, detail, 0, TWO_PI);

        const v = [
          spherePoint(phi1, theta1),
          spherePoint(phi2, theta1),
          spherePoint(phi2, theta2),
          spherePoint(phi1, theta2),
        ];

        pushTri(v[0], v[2], v[1]);
        pushTri(v[0], v[3], v[2]);
      }
    }

    return triangles;
  }

  // ─── Cutting ─────────────────────────────────────────────────────────────

  /**
   * Cuts the potato with a single plane.
   * Clips the live mesh, caps the rim flat, and drops the removed part as a chunk.
   */
  cut(planePoint, planeNormal) {
    const EPS = 0.01;

    const localPoint = createVector(
      (planePoint.x - this.position.x) / this.scale.x,
      (planePoint.y - this.position.y) / this.scale.y,
      (planePoint.z - this.position.z) / this.scale.z,
    );

    const localNormal = createVector(
      planeNormal.x * this.scale.x,
      planeNormal.y * this.scale.y,
      planeNormal.z * this.scale.z,
    ).normalize();

    // is there anything STRICTLY on the side to remove? if not, nothing is cut.
    let anyPos = false;
    for (const tri of this.triangles) {
      if ([tri.v0, tri.v1, tri.v2].some(v => this._sideOf(v, localPoint, localNormal) > EPS)) {
        anyPos = true;
        break;
      }
    }
    if (!anyPos) return;

    // Split each triangle into its negative (kept) and positive (removed) part.
    // Both share the EXACT same intersection points -> identical rim.
    const keep = [];
    const drop = [];
    const rim  = [];

    for (const tri of this.triangles) {
      const { neg, pos, cutEdge } = this._splitTriangle(tri, localPoint, localNormal);
      if (neg.length) keep.push(...neg);
      if (pos.length) drop.push(...pos);
      if (cutEdge)    rim.push(cutEdge);
    }

    if (drop.length === 0) return;

    // Flat caps: ear-clip the closed rim loops using the plane normal.
    const loops = this._loopsFromSegments(rim);

    const negNormal = createVector(-localNormal.x, -localNormal.y, -localNormal.z);
    const keepCaps  = [];
    const dropCaps  = [];
    for (const loop of loops) {
        const kc = this._earClip(loop, localNormal);
      const dc = this._earClip(loop, negNormal);
      for (const t of kc) t.kind = 'cap';
      for (const t of dc) t.kind = 'cap';
      this._extend(keepCaps, kc); // potato cap: faces +n (outward)
      this._extend(dropCaps, dc); // chunk cap: faces -n
    }

    // Safety net: seals residual holes from floating-point drift.
    let mesh = this._sealStrays([...keep, ...keepCaps]);
    // Compact: merge over-triangulated coplanar caps and drop degenerates.
    mesh = this._simplifyCoplanar(mesh);
    this.triangles = mesh;
    this.model     = this._buildFromTriangles(this.triangles);

    this.chunks.push(new PotatoChunk([...drop, ...dropCaps]));
  }

  /**
   * Splits a triangle by a plane.
   * Returns { neg, pos, cutEdge } where neg/pos are triangle arrays and
   * cutEdge is the [ptA, ptB] rim segment (or null if it doesn't straddle).
   */
  _splitTriangle(tri, planePoint, planeNormal) {
    const verts = [tri.v0, tri.v1, tri.v2];
    const sides = verts.map(v => this._sideOf(v, planePoint, planeNormal));
    const k     = tri.kind || 'skin'; // propagate face kind to the split pieces

    const negIdx = sides.map((s, i) => s <  0 ? i : -1).filter(i => i >= 0);
    const posIdx = sides.map((s, i) => s >= 0 ? i : -1).filter(i => i >= 0);

    if (posIdx.length === 0) return { neg: [tri], pos: [],    cutEdge: null };
    if (negIdx.length === 0) return { neg: [],    pos: [tri], cutEdge: null };

    if (negIdx.length === 1) {
      const ni = negIdx[0];
      const a  = (ni + 1) % 3;
      const b  = (ni + 2) % 3;
      const i1 = this._edgeIntersect(verts[ni], verts[a], planePoint, planeNormal);
      const i2 = this._edgeIntersect(verts[ni], verts[b], planePoint, planeNormal);

      return {
        neg: [{ v0: verts[ni], v1: i1,       v2: i2,       kind: k }],
        pos: [{ v0: verts[a],  v1: verts[b],  v2: i1,       kind: k },
              { v0: verts[b],  v1: i2,        v2: i1,       kind: k }],
        cutEdge: [i1, i2],
      };
    } else {
      const pi = posIdx[0];
      const a  = (pi + 1) % 3;
      const b  = (pi + 2) % 3;
      const i1 = this._edgeIntersect(verts[pi], verts[a], planePoint, planeNormal);
      const i2 = this._edgeIntersect(verts[pi], verts[b], planePoint, planeNormal);

      return {
        neg: [{ v0: verts[a],  v1: verts[b],  v2: i1,  kind: k },
              { v0: verts[b],  v1: i2,        v2: i1,  kind: k }],
        pos: [{ v0: verts[pi], v1: i1,        v2: i2,  kind: k }],
        cutEdge: [i1, i2],
      };
    }
  }

  /**
   * Chains undirected rim segments into closed loops.
   * On a closed mesh, a plane's rim is always a set of simple closed loops.
   */
  _loopsFromSegments(segments) {
    if (segments.length === 0) return [];

    const KEY = (v) => v.map(c => Math.round(c * 1000) / 1000).join(',');
    const verts = [];
    const vmap  = new Map();
    const idOf  = (v) => {
      const k = KEY(v);
      let e = vmap.get(k);
      if (e === undefined) { e = verts.length; vmap.set(k, e); verts.push(v); }
      return e;
    };

    const adj  = new Map();
    const segs = [];
    for (const [pa, pb] of segments) {
      const a = idOf(pa), b = idOf(pb);
      if (a === b) continue;
      const ei = segs.length;
      segs.push([a, b]);
      if (!adj.has(a)) adj.set(a, []);
      if (!adj.has(b)) adj.set(b, []);
      adj.get(a).push({ to: b, e: ei });
      adj.get(b).push({ to: a, e: ei });
    }

    const usedEdge = new Set();
    const loops    = [];

    for (let start = 0; start < segs.length; start++) {
      if (usedEdge.has(start)) continue;

      const [s0, s1] = segs[start];
      usedEdge.add(start);
      const loop = [s0];
      let cur = s1;
      let guard = segs.length + 5;

      while (cur !== s0 && guard-- > 0) {
        loop.push(cur);
        const nbrs = adj.get(cur) || [];
        let nxt = null, ne = null;
        for (const { to, e } of nbrs) {
          if (!usedEdge.has(e)) { nxt = to; ne = e; break; }
        }
        if (nxt === null) break;
        usedEdge.add(ne);
        cur = nxt;
      }

      if (cur === s0 && loop.length >= 3) loops.push(loop.map(i => verts[i]));
    }

    return loops;
  }

  /**
   * Ear-clips a polygon from an ordered list of 3D points on a plane.
   */
  _earClip(orderedPts, planeNormal) {
    if (orderedPts.length < 3) return [];

    const n = planeNormal.copy().normalize();
    const arbitrary = abs(n.x) < 0.9
      ? createVector(1, 0, 0)
      : createVector(0, 1, 0);
    const uAxis = n.cross(arbitrary).normalize();
    const vAxis = n.cross(uAxis).normalize();

    const pts2d = orderedPts.map(p => ({
      pt3: p,
      u: p[0] * uAxis.x + p[1] * uAxis.y + p[2] * uAxis.z,
      v: p[0] * vAxis.x + p[1] * vAxis.y + p[2] * vAxis.z,
    }));

    let area = 0;
    for (let i = 0; i < pts2d.length; i++) {
      const j = (i + 1) % pts2d.length;
      area += pts2d[i].u * pts2d[j].v - pts2d[j].u * pts2d[i].v;
    }
    if (area < 0) pts2d.reverse();

    const poly = pts2d.map((_, i) => i);
    const triangles = [];

    const cross2d = (ax, ay, bx, by) => ax * by - ay * bx;

    const isConvex = (pi, ci, ni) => {
      const p = pts2d[pi], c = pts2d[ci], nx = pts2d[ni];
      return cross2d(c.u - p.u, c.v - p.v, nx.u - p.u, nx.v - p.v) > 0;
    };

    const pointInTriangle = (px, py, ax, ay, bx, by, cx, cy) => {
      const d1 = cross2d(bx-ax, by-ay, px-ax, py-ay);
      const d2 = cross2d(cx-bx, cy-by, px-bx, py-by);
      const d3 = cross2d(ax-cx, ay-cy, px-cx, py-cy);
      const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
      const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
      return !(hasNeg && hasPos);
    };

    const isEar = (polyIdx) => {
      const len = poly.length;
      const ci = poly[polyIdx];
      const pi = poly[(polyIdx - 1 + len) % len];
      const ni = poly[(polyIdx + 1) % len];

      if (!isConvex(pi, ci, ni)) return false;

      const p = pts2d[pi], c = pts2d[ci], nx = pts2d[ni];

      for (let k = 0; k < len; k++) {
        const idx = poly[k];
        if (idx === pi || idx === ci || idx === ni) continue;
        const pt = pts2d[idx];
        if (pointInTriangle(pt.u, pt.v, p.u, p.v, c.u, c.v, nx.u, nx.v)) {
          return false;
        }
      }
      return true;
    };

    let maxIter = poly.length * poly.length;
    let i = 0;

    while (poly.length > 3 && maxIter-- > 0) {
      if (isEar(i)) {
        const len = poly.length;
        const pi = poly[(i - 1 + len) % len];
        const ci = poly[i];
        const ni = poly[(i + 1) % len];

        triangles.push({
          v0: pts2d[pi].pt3,
          v1: pts2d[ci].pt3,
          v2: pts2d[ni].pt3,
        });

        poly.splice(i, 1);
        i = i % poly.length;
      } else {
        i = (i + 1) % poly.length;
      }
    }

    if (poly.length === 3) {
      triangles.push({
        v0: pts2d[poly[0]].pt3,
        v1: pts2d[poly[1]].pt3,
        v2: pts2d[poly[2]].pt3,
      });
    }

    return triangles;
  }

  // ─── Geometry helpers ────────────────────────────────────────────────────

  /**
   * Safety net: detects boundary edges (those belonging to a single
   * triangle), chains them into closed loops and fills them. On the
   * incremental mesh it rarely finds anything; it only closes tiny holes
   * caused by floating-point drift. Returns the full sealed mesh.
   */
  _sealStrays(triangles) {
    const KEY  = (v) => v.map(c => Math.round(c * 1000) / 1000).join(',');
    const verts = [];
    const vmap  = new Map();
    const idOf  = (v) => {
      const k = KEY(v);
      let e = vmap.get(k);
      if (e === undefined) { e = verts.length; vmap.set(k, e); verts.push(v); }
      return e;
    };

    const undKey = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
    const edgeCount = new Map();
    const dirEdges  = [];

    for (const t of triangles) {
      const a = idOf(t.v0), b = idOf(t.v1), c = idOf(t.v2);
      for (const [x, y] of [[a, b], [b, c], [c, a]]) {
        if (x === y) continue;
        const k = undKey(x, y);
        edgeCount.set(k, (edgeCount.get(k) || 0) + 1);
        dirEdges.push([x, y]);
      }
    }

    const boundary = dirEdges.filter(([x, y]) => edgeCount.get(undKey(x, y)) === 1);
    if (boundary.length === 0) return triangles;

    const nextFrom = new Map();
    for (const [x, y] of boundary) {
      if (!nextFrom.has(x)) nextFrom.set(x, []);
      nextFrom.get(x).push(y);
    }

    const used  = new Set();
    const loops = [];

    for (const [sx, sy] of boundary) {
      if (used.has(sx + '>' + sy)) continue;
      const loop = [sx];
      let cur = sy;
      used.add(sx + '>' + sy);
      let guard = boundary.length + 5;

      while (cur !== sx && guard-- > 0) {
        loop.push(cur);
        const outs = nextFrom.get(cur) || [];
        let nxt = null;
        for (const o of outs) {
          if (!used.has(cur + '>' + o)) { nxt = o; break; }
        }
        if (nxt === null) break;
        used.add(cur + '>' + nxt);
        cur = nxt;
      }

      if (cur === sx && loop.length >= 3) loops.push(loop);
    }

    const out = [...triangles];

    for (const loop of loops) {
      const pts = loop.map(i => verts[i]);

      let nx = 0, ny = 0, nz = 0;
      for (let i = 0; i < pts.length; i++) {
        const cu = pts[i], ne = pts[(i + 1) % pts.length];
        nx += (cu[1] - ne[1]) * (cu[2] + ne[2]);
        ny += (cu[2] - ne[2]) * (cu[0] + ne[0]);
        nz += (cu[0] - ne[0]) * (cu[1] + ne[1]);
      }
      const normal = createVector(nx, ny, nz);
      if (normal.mag() < 1e-9) continue;
      normal.normalize();

      const fill = this._earClip(pts, normal);
      for (const t of fill) t.kind = 'cap';
      this._extend(out, fill);
    }

    return out;
  }

  // ─── Mesh compaction ─────────────────────────────────────────────────────

  /**
   * Pushes every element of src into dst without spread (avoids the argument
   * limit that triggers "Maximum call stack size exceeded").
   */
  _extend(dst, src) {
    for (let i = 0; i < src.length; i++) dst.push(src[i]);
  }

  /**
   * Unit normal of a triangle (or null if degenerate / area ~0).
   */
  _triNormal(t) {
    const ux = t.v1[0]-t.v0[0], uy = t.v1[1]-t.v0[1], uz = t.v1[2]-t.v0[2];
    const vx = t.v2[0]-t.v0[0], vy = t.v2[1]-t.v0[1], vz = t.v2[2]-t.v0[2];
    const nx = uy*vz - uz*vy, ny = uz*vx - ux*vz, nz = ux*vy - uy*vx;
    const m = Math.sqrt(nx*nx + ny*ny + nz*nz);
    if (m < 1e-7) return null;
    return [nx/m, ny/m, nz/m];
  }

  /**
   * Compacts the mesh in two steps, without touching rendering (operates on triangles):
   *  1) group by plane and re-triangulate each cap from its outline;
   *  2) remove the intermediate COLLINEAR vertices on plane-plane lines,
   *     but only if they're collinear in ALL groups touching them (otherwise
   *     it would create a T-junction). The endpoints, which touch the curved
   *     surface, are not collinear there and are kept.
   * Result: same silhouette and same volume, far fewer vertices.
   */
  _simplifyCoplanar(triangles) {
    const KEY = (v) => Math.round(v[0]*1000)+','+Math.round(v[1]*1000)+','+Math.round(v[2]*1000);
    const verts   = [];
    const vindex  = new Map();
    const idOf    = (v) => {
      const k = KEY(v);
      let e = vindex.get(k);
      if (e === undefined) { e = verts.length; vindex.set(k, e); verts.push(v); }
      return e;
    };

    // Index triangles and group by plane. Degenerates (no normal) and
    // small groups (<4, e.g. surface faces) are "passthrough".
    const groups   = new Map();
    const passVert = new Set();
    const degener  = []; // original triangle objects (keep kind)

    for (const t of triangles) {
      const a = idOf(t.v0), b = idOf(t.v1), c = idOf(t.v2);
      const n = this._triNormal(t);
      if (!n) { degener.push(t); passVert.add(a); passVert.add(b); passVert.add(c); continue; }
      const d  = n[0]*verts[a][0] + n[1]*verts[a][1] + n[2]*verts[a][2];
      const pk = Math.round(n[0]*100)/100 + ',' + Math.round(n[1]*100)/100 + ',' +
                 Math.round(n[2]*100)/100 + ',' + Math.round(d);
      let g = groups.get(pk);
      if (!g) { g = { n, faces: [], originals: [] }; groups.set(pk, g); }
      g.faces.push([a, b, c]);
      g.originals.push(t); // keep original for passthrough (preserves kind)
    }

    const out = [];
    for (const t of degener) out.push(t); // push original objects (kind intact)

    // Outline (indices) of each large group; small ones pass through and their
    // vertices stay protected (passVert).
    const mergeable = [];
    for (const g of groups.values()) {
      if (g.faces.length < 4) {
        for (const t of g.originals) { out.push(t); for (const v of [t.v0,t.v1,t.v2]) passVert.add(idOf(v)); }
        continue;
      }
      const cnt = new Map();
      const edgesOf = (f) => [[f[0],f[1]],[f[1],f[2]],[f[2],f[0]]];
      for (const f of g.faces) for (const [x,y] of edgesOf(f)) {
        if (x === y) continue;
        const uk = x < y ? x+'|'+y : y+'|'+x;
        cnt.set(uk, (cnt.get(uk)||0)+1);
      }
      const seg = [];
      for (const f of g.faces) for (const [x,y] of edgesOf(f)) {
        if (x === y) continue;
        if (cnt.get(x < y ? x+'|'+y : y+'|'+x) === 1) seg.push([x, y]);
      }
      const loops = this._chainIndexLoops(seg);
      mergeable.push({ n: g.n, loops });
    }

    // Collinearity per occurrence. A vertex can be removed only if it is
    // collinear in EVERY loop where it appears and is not protected.
    const collinear = (q, p, r) => {
      const ux = verts[p][0]-verts[q][0], uy = verts[p][1]-verts[q][1], uz = verts[p][2]-verts[q][2];
      const vx = verts[r][0]-verts[p][0], vy = verts[r][1]-verts[p][1], vz = verts[r][2]-verts[p][2];
      const cx = uy*vz-uz*vy, cy = uz*vx-ux*vz, cz = ux*vy-uy*vx;
      const cm = Math.sqrt(cx*cx+cy*cy+cz*cz);
      const um = Math.sqrt(ux*ux+uy*uy+uz*uz), vm = Math.sqrt(vx*vx+vy*vy+vz*vz);
      if (um < 1e-9 || vm < 1e-9) return true;
      return cm/(um*vm) < 1e-4;
    };

    const removable = new Map();
    for (const { loops } of mergeable) {
      for (const loop of loops) {
        const L = loop.length;
        for (let i = 0; i < L; i++) {
          const p = loop[i], q = loop[(i-1+L)%L], r = loop[(i+1)%L];
          const col = collinear(q, p, r);
          if (!removable.has(p)) removable.set(p, true);
          if (!col) removable.set(p, false);
        }
      }
    }

    const drop = new Set();
    for (const [p, ok] of removable) if (ok && !passVert.has(p)) drop.add(p);

    // Re-triangulate each large group with its already-decimated loops.
    for (const { n, loops } of mergeable) {
      const normal = createVector(n[0], n[1], n[2]);
      for (const loop of loops) {
        const kept = loop.filter(idx => !drop.has(idx));
        if (kept.length < 3) continue;
        const rtris = this._earClip(kept.map(idx => verts[idx]), normal);
        for (const t of rtris) t.kind = 'cap';
        this._extend(out, rtris);
      }
    }

    return out;
  }

  /**
   * Chains segments (index pairs) into closed loops.
   */
  _chainIndexLoops(segs) {
    const adj = new Map();
    segs.forEach(([a, b], ei) => {
      if (a === b) return;
      if (!adj.has(a)) adj.set(a, []);
      if (!adj.has(b)) adj.set(b, []);
      adj.get(a).push({ to: b, e: ei });
      adj.get(b).push({ to: a, e: ei });
    });
    const used  = new Set();
    const loops = [];
    for (let ei = 0; ei < segs.length; ei++) {
      if (used.has(ei)) continue;
      const [s0, s1] = segs[ei];
      if (s0 === s1) continue;
      used.add(ei);
      const loop = [s0];
      let cur = s1, guard = segs.length + 5;
      while (cur !== s0 && guard-- > 0) {
        loop.push(cur);
        const nbrs = adj.get(cur) || [];
        let nx = null, ne = null;
        for (const { to, e } of nbrs) if (!used.has(e)) { nx = to; ne = e; break; }
        if (nx === null) break;
        used.add(ne); cur = nx;
      }
      if (cur === s0 && loop.length >= 3) loops.push(loop);
    }
    return loops;
  }

  _buildFromTriangles(triangles) {
    return buildGeometry(() => {
      beginShape(TRIANGLES);
      for (const tri of triangles) {
        vertex(...tri.v0);
        vertex(...tri.v1);
        vertex(...tri.v2);
      }
      endShape(CLOSE);
    });
  }

    _sideOf(vertex, planePoint, planeNormal) {
    const dx = vertex[0] - planePoint.x;
    const dy = vertex[1] - planePoint.y;
    const dz = vertex[2] - planePoint.z;
    return dx * planeNormal.x + dy * planeNormal.y + dz * planeNormal.z;
  }

  _edgeIntersect(a, b, planePoint, planeNormal) {
    const da    = this._sideOf(a, planePoint, planeNormal);
    const db    = this._sideOf(b, planePoint, planeNormal);
    const denom = da - db;
    if (abs(denom) < 0.0001) return [a[0], a[1], a[2]];
    const t = da / denom;
    return [
      a[0] + t * (b[0] - a[0]),
      a[1] + t * (b[1] - a[1]),
      a[2] + t * (b[2] - a[2]),
    ];
  }

  // ─── Game loop ───────────────────────────────────────────────────────────

  tick() {
    for (const chunk of this.chunks) chunk.tick();
    this.chunks = this.chunks.filter(c => !c.dead);
  }

  // ─── Read-only queries (do NOT touch the cut geometry) ───────────────────

  /** Volume of the current solid (local space; scale cancels out in ratios). */
  volume() {
    let V = 0;
    for (const t of this.triangles) {
      const a = t.v0, b = t.v1, c = t.v2;
      V += a[0]*(b[1]*c[2]-b[2]*c[1]) - a[1]*(b[0]*c[2]-b[2]*c[0]) + a[2]*(b[0]*c[1]-b[1]*c[0]);
    }
    return Math.abs(V) / 6;
  }

  /** Remaining skin area (used to detect a fully peeled potato). */
  skinArea() {
    return area(classify(this.triangles).skin);
  }

  /** Triangles on the side a (world) plane would remove, WITHOUT mutating the potato. */
  previewRemoval(planePoint, planeNormal) {
    const lp = createVector(
      (planePoint.x - this.position.x) / this.scale.x,
      (planePoint.y - this.position.y) / this.scale.y,
      (planePoint.z - this.position.z) / this.scale.z,
    );
    const ln = createVector(
      planeNormal.x * this.scale.x,
      planeNormal.y * this.scale.y,
      planeNormal.z * this.scale.z,
    ).normalize();

    const out = [];
    for (const tri of this.triangles) {
      const { pos } = this._splitTriangle(tri, lp, ln);
      for (const t of pos) out.push(t);
    }
    return out;
  }

  // ─── Rendering (separate from the cut logic) ─────────────────────────────

  /**
   * Sets the render appearance. `config` is the game CONFIG shape; `texture`
   * is an optional p5.Image. Folded in from the old potato-style helper.
   */
  style(config, texture = null) {
    this.skinTexture      = texture;
    this.skinColor        = config.colors.skin;
    this.fleshColor       = config.colors.flesh;
    this.highlightColor   = config.colors.highlight;
    this.capAreaThreshold = config.render.capAreaThreshold;
    this.shininess        = config.render.shininess;
    return this;
  }

  /** Render style for the skin/cap drawer. */
  _style() {
    return {
      skinTexture: this.skinTexture,
      skinColor:   this.skinColor  || [104, 68, 40],
      fleshColor:  this.fleshColor || [232, 205, 120],
      shininess:   this.shininess  || 18,
    };
  }

  /** Style for the falling chunks: adds the potato scale and cap threshold. */
  _chunkStyle() {
    return {
      ...this._style(),
      scale: this.scale,
      capAreaThreshold: this.capAreaThreshold || 0.03,
    };
  }

  _buildRenderModels() {
    this._models = buildModels(this.triangles, this.capAreaThreshold || 0.03);
  }

  /**
   * Draws the potato. If highlightPlane {point, normal} (world) is passed,
   * highlights in red the geometry that plane would slice off.
   * External knobs (optional): this.skinTexture, this.skinColor,
   * this.fleshColor, this.highlightColor.
   */
  draw(highlightPlane = null) {
    if (this.triangles !== this._lastTris) {
      this._buildRenderModels();
      this._lastTris = this.triangles;
    }

    push();
    translate(this.position.x, this.position.y, this.position.z);
    rotateX(this.rotation.x);
    rotateY(this.rotation.y);
    rotateZ(this.rotation.z);
    scale(this.scale.x, this.scale.y, this.scale.z);

    // Skin (textured/brown) + interior (yellow flesh), with specular sheen.
    drawModels(this._models, this._style());

    // Red highlight of the geometry that will be sliced off. Flat/unlit, and
    // nudged a few units along the cut normal so it hugs the surface to remove
    // (instead of inflating radially, which made it drift off the geometry).
    if (highlightPlane) {
      const removal = this.previewRemoval(highlightPlane.point, highlightPlane.normal);
      if (removal.length) {
        const ln = createVector(
          highlightPlane.normal.x * this.scale.x,
          highlightPlane.normal.y * this.scale.y,
          highlightPlane.normal.z * this.scale.z,
        ).normalize();
        const k = 3; // lift toward the removed side
        const h = this.highlightColor || [220, 60, 50];
        push();
        noStroke();
        if (typeof noLights === 'function') noLights();
        fill(h[0], h[1], h[2], 210);
        beginShape(TRIANGLES);
        for (const t of removal) {
          for (const v of [t.v0, t.v1, t.v2]) {
            vertex(v[0] + ln.x * k, v[1] + ln.y * k, v[2] + ln.z * k);
          }
        }
        endShape();
        pop();
      }
    }

    pop();

    // Chunks are drawn in WORLD space (outside the potato's transform):
    // their geometry is pre-scaled, so their rigid translate+rotate doesn't get
    // sheared by the potato's non-uniform scale during rotation.
    for (const chunk of this.chunks) chunk.draw(this._chunkStyle());
  }
}
