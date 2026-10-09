import * as THREE from "three";
import {
  fbm,
  glowMaterial,
  gradient,
  litMaterial,
  merge,
  mulberry32,
  paint,
  smooth,
  solid,
  xf,
} from "./kit";

/* -------------------------------------------------------------------------- */
/*  Shared materials (created lazily, reused by every scene)                   */
/* -------------------------------------------------------------------------- */

type Mats = {
  lit: THREE.MeshStandardMaterial;
  litSmooth: THREE.MeshStandardMaterial;
  leaf: THREE.MeshStandardMaterial;
  canopy: THREE.MeshStandardMaterial;
  glow: THREE.MeshBasicMaterial;
  gold: THREE.MeshBasicMaterial;
};
let _mats: Mats | null = null;
export function mats(): Mats {
  if (!_mats) {
    _mats = {
      lit: litMaterial({ rim: 0.45 }),
      litSmooth: litMaterial({ flat: false, rim: 0.5 }),
      leaf: litMaterial({ flat: false, wind: 0.045, rim: 0.5, side: THREE.DoubleSide }),
      canopy: litMaterial({ flat: true, wind: 0.022, rim: 0.4 }),
      glow: glowMaterial("#ffcf7a", 0.3, 3.2),
      gold: glowMaterial("#ffd36b", 0.9, 1.6),
    };
  }
  return _mats;
}

/* -------------------------------------------------------------------------- */
/*  Little builders                                                            */
/* -------------------------------------------------------------------------- */

function box(w: number, h: number, d: number, pos: [number, number, number], color: string, rotY = 0) {
  return solid(xf(new THREE.BoxGeometry(w, h, d), pos, [0, rotY, 0]), color);
}

function cyl(rt: number, rb: number, h: number, pos: [number, number, number], color: string, seg = 20) {
  return solid(xf(new THREE.CylinderGeometry(rt, rb, h, seg), pos), color);
}

/** Square hip-roof frustum, sides `a` (half width) and `b` (half depth) at the bottom. */
function roofFrustum(a: number, b: number, topA: number, topB: number, h: number, y: number, c0: string, c1: string) {
  // CylinderGeometry with 4 sides is a square frustum; scale to a rectangle
  const g = new THREE.CylinderGeometry(1, 1, h, 4, 1);
  g.rotateY(Math.PI / 4);
  const pos = g.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const top = pos.getY(i) > 0;
    const ra = top ? topA : a;
    const rb = top ? topB : b;
    pos.setXYZ(i, pos.getX(i) * ra * Math.SQRT2, pos.getY(i) + y + h / 2, pos.getZ(i) * rb * Math.SQRT2);
  }
  g.computeVertexNormals();
  return gradient(g, c0, c1, y, y + h);
}

/** Tiled roof with an upswept eave: flared lower slope, steeper upper slope, ridge finial. */
function tieredRoof(a: number, b: number, h: number, y: number, tile = "#a2432a", ridge = "#e8b84a") {
  return [
    roofFrustum(a * 1.18, b * 1.18, a * 0.78, b * 0.78, h * 0.3, y, "#5f2417", tile),
    roofFrustum(a * 0.78, b * 0.78, 0.06, 0.06, h * 0.7, y + h * 0.3, tile, "#c2573a"),
    cyl(0.03, 0.05, h * 0.2, [0, y + h + h * 0.08, 0], ridge, 8),
    solid(xf(new THREE.SphereGeometry(0.06, 8, 6), [0, y + h + h * 0.2, 0]), ridge),
  ];
}

function pillars(count: number, radius: number, h: number, y: number, rx: number, rz: number, color = "#e9dcc0") {
  const out: THREE.BufferGeometry[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    for (const sz of [-1, 1]) {
      out.push(cyl(radius, radius * 1.1, h, [(t - 0.5) * 2 * rx, y + h / 2, sz * rz], color, 8));
    }
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/*  Stupa (dagoba)                                                             */
/* -------------------------------------------------------------------------- */

export function createStupa(scale = 1) {
  const white: THREE.BufferGeometry[] = [];
  const gold: THREE.BufferGeometry[] = [];
  const glow: THREE.BufferGeometry[] = [];

  // stepped platforms
  white.push(gradient(xf(new THREE.CylinderGeometry(2.0, 2.1, 0.14, 40), [0, 0.07, 0]), "#8f866f", "#d7ccb2", 0, 0.14));
  white.push(gradient(xf(new THREE.CylinderGeometry(1.74, 1.82, 0.13, 40), [0, 0.2, 0]), "#9a917b", "#e3d9c0", 0.13, 0.27));
  white.push(gradient(xf(new THREE.CylinderGeometry(1.5, 1.58, 0.12, 40), [0, 0.32, 0]), "#a59c86", "#ece3cb", 0.26, 0.38));

  // bell: smooth dome with a slight waist near the base
  const prof: THREE.Vector2[] = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const ang = t * (Math.PI / 2);
    const r = 1.2 * Math.pow(Math.cos(ang), 0.9) + (t < 0.08 ? 0.03 : 0);
    const y = 0.38 + 1.02 * Math.pow(Math.sin(ang), 0.88);
    prof.push(new THREE.Vector2(Math.max(r, 0.18), y));
  }
  white.push(gradient(new THREE.LatheGeometry(prof, 40), "#cfc6b0", "#fbf7ec", 0.38, 1.4));
  // moulding rings
  white.push(gradient(xf(new THREE.TorusGeometry(1.2, 0.035, 6, 40), [0, 0.42, 0], [Math.PI / 2, 0, 0]), "#b8ad94", "#e7ddc6", 0.4, 0.45));

  // harmika (square chamber) and spire
  gold.push(solid(xf(new THREE.BoxGeometry(0.46, 0.34, 0.46), [0, 1.52, 0]), "#e9b94a"));
  gold.push(solid(xf(new THREE.BoxGeometry(0.56, 0.06, 0.56), [0, 1.72, 0]), "#f5d27a"));
  const rings = 9;
  for (let i = 0; i < rings; i++) {
    const t = i / rings;
    const r = THREE.MathUtils.lerp(0.3, 0.05, Math.pow(t, 0.85));
    gold.push(solid(xf(new THREE.CylinderGeometry(r * 0.88, r, 0.09, 16), [0, 1.82 + i * 0.1, 0]), i % 2 ? "#f2cf72" : "#d9a53a"));
  }
  glow.push(solid(xf(new THREE.SphereGeometry(0.07, 10, 8), [0, 1.82 + rings * 0.1 + 0.05, 0]), "#fff0b0"));

  // lamps around the platform edge
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    glow.push(solid(xf(new THREE.SphereGeometry(0.038, 6, 5), [Math.cos(a) * 1.96, 0.2, Math.sin(a) * 1.96]), "#ffd98a"));
  }

  const g = new THREE.Group();
  const m = mats();
  g.add(new THREE.Mesh(merge(white), m.lit));
  g.add(new THREE.Mesh(merge(gold), m.gold));
  g.add(new THREE.Mesh(merge(glow), m.glow));
  g.scale.setScalar(scale);
  return g;
}

/* -------------------------------------------------------------------------- */
/*  Royal palace (Kotte): platform, pillared hall, two-tier hip roof, wings    */
/* -------------------------------------------------------------------------- */

export function createPalace(scale = 1) {
  const parts: THREE.BufferGeometry[] = [];
  const goldBits: THREE.BufferGeometry[] = [];
  const windows: THREE.BufferGeometry[] = [];

  // stone terrace with steps
  parts.push(gradient(xf(new THREE.BoxGeometry(4.6, 0.3, 3.2), [0, 0.15, 0]), "#7d7466", "#bfb49b", 0, 0.3));
  parts.push(gradient(xf(new THREE.BoxGeometry(1.4, 0.2, 0.5), [0, 0.1, 1.85]), "#7d7466", "#b5aa92", 0, 0.2));
  parts.push(gradient(xf(new THREE.BoxGeometry(1.1, 0.12, 0.3), [0, 0.06, 2.1]), "#7d7466", "#b5aa92", 0, 0.12));

  // main hall
  parts.push(box(3.4, 0.9, 2.2, [0, 0.75, 0], "#efe2c6"));
  parts.push(...pillars(8, 0.055, 0.9, 0.3, 1.7, 1.15));
  parts.push(...tieredRoof(1.95, 1.35, 1.0, 1.2));

  // upper hall
  parts.push(box(1.9, 0.62, 1.3, [0, 2.45, 0], "#f2e6cc"));
  parts.push(...tieredRoof(1.1, 0.8, 0.9, 2.76));

  // flanking pavilions
  for (const s of [-1, 1]) {
    parts.push(box(0.9, 0.55, 0.9, [s * 2.1, 0.6, 0.4], "#eadcc0"));
    parts.push(...tieredRoof(0.62, 0.62, 0.6, 0.88));
  }

  // windows and lamps that glow at night
  for (let i = 0; i < 6; i++) {
    const x = -1.25 + i * 0.5;
    windows.push(box(0.16, 0.26, 0.04, [x, 0.8, 1.11], "#ffd27a"));
  }
  for (const s of [-1, 1]) windows.push(box(0.16, 0.24, 0.04, [s * 0.4, 2.45, 0.67], "#ffd27a"));
  goldBits.push(solid(xf(new THREE.SphereGeometry(0.08, 8, 6), [0, 4.0, 0]), "#f7d577"));

  const g = new THREE.Group();
  const m = mats();
  g.add(new THREE.Mesh(merge(parts), m.lit));
  g.add(new THREE.Mesh(merge(windows), m.glow));
  g.add(new THREE.Mesh(merge(goldBits), m.gold));
  g.scale.setScalar(scale);
  return g;
}

/* -------------------------------------------------------------------------- */
/*  Three-storey Tooth Relic shrine                                            */
/* -------------------------------------------------------------------------- */

export function createDalada(scale = 1) {
  const parts: THREE.BufferGeometry[] = [];
  const windows: THREE.BufferGeometry[] = [];
  parts.push(gradient(xf(new THREE.BoxGeometry(3.0, 0.24, 2.4), [0, 0.12, 0]), "#7d7466", "#b8ad94", 0, 0.24));
  let y = 0.24;
  const tiers = [
    { a: 1.15, b: 0.9, h: 0.7 },
    { a: 0.9, b: 0.7, h: 0.6 },
    { a: 0.66, b: 0.52, h: 0.5 },
  ];
  tiers.forEach((t, i) => {
    parts.push(box(t.a * 2 * 0.86, t.h, t.b * 2 * 0.86, [0, y + t.h / 2, 0], "#f1e4c8"));
    parts.push(...tieredRoof(t.a, t.b, t.h * 0.95, y + t.h));
    for (const s of [-1, 1]) windows.push(box(0.14, 0.24, 0.04, [s * t.a * 0.36, y + t.h * 0.55, t.b * 0.86 + 0.01], "#ffd27a"));
    y += t.h + t.h * 0.95 * 0.6;
    void i;
  });
  const g = new THREE.Group();
  const m = mats();
  g.add(new THREE.Mesh(merge(parts), m.lit));
  g.add(new THREE.Mesh(merge(windows), m.glow));
  g.scale.setScalar(scale);
  return g;
}

/* -------------------------------------------------------------------------- */
/*  Kovil gopuram (Hindu temple gateway tower)                                 */
/* -------------------------------------------------------------------------- */

export function createGopuram(scale = 1) {
  const parts: THREE.BufferGeometry[] = [];
  const lamps: THREE.BufferGeometry[] = [];
  parts.push(gradient(xf(new THREE.BoxGeometry(2.6, 0.3, 1.5), [0, 0.15, 0]), "#8a7c68", "#c5b79f", 0, 0.3));
  parts.push(box(1.7, 0.7, 1.0, [0, 0.65, 0], "#e8d9bc"));
  // doorway
  parts.push(box(0.5, 0.5, 0.06, [0, 0.55, 0.52], "#3a2418"));
  const bands = ["#d4553c", "#f1e1bc", "#2f7f8a", "#f1e1bc", "#c9923a", "#f1e1bc"];
  let y = 1.0;
  const tiers = 7;
  for (let i = 0; i < tiers; i++) {
    const w = 1.6 - i * 0.19;
    const d = 0.95 - i * 0.1;
    const h = 0.34;
    parts.push(gradient(xf(new THREE.BoxGeometry(w, h, d), [0, y + h / 2, 0]), "#5b4636", bands[i % bands.length], y, y + h));
    parts.push(box(w + 0.1, 0.05, d + 0.08, [0, y + h, 0], "#d9c9a6"));
    // little pot-shaped ornaments on the cornice
    for (const sx of [-1, 1]) lamps.push(solid(xf(new THREE.SphereGeometry(0.04, 6, 5), [sx * (w / 2 - 0.04), y + h + 0.06, d / 2]), "#ffd98a"));
    y += h + 0.05;
  }
  // barrel-vault crown
  parts.push(solid(xf(new THREE.CylinderGeometry(0.2, 0.2, 0.55, 12, 1, false, 0, Math.PI), [0, y + 0.1, 0], [0, 0, Math.PI / 2]), "#c9923a"));
  parts.push(cyl(0.02, 0.05, 0.3, [0.0, y + 0.55, 0.0], "#f2cf72", 6));
  for (const sx of [-0.55, 0, 0.55]) parts.push(cyl(0.03, 0.04, 0.2, [sx, y + 0.2, 0], "#f2cf72", 6));

  const g = new THREE.Group();
  const m = mats();
  g.add(new THREE.Mesh(merge(parts), m.lit));
  g.add(new THREE.Mesh(merge(lamps), m.glow));
  g.scale.setScalar(scale);
  return g;
}

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                               */
/* -------------------------------------------------------------------------- */

export function createPavilion(scale = 1) {
  const parts: THREE.BufferGeometry[] = [];
  parts.push(gradient(xf(new THREE.BoxGeometry(1.5, 0.14, 1.5), [0, 0.07, 0]), "#7d7466", "#c0b59c", 0, 0.14));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) parts.push(cyl(0.045, 0.055, 0.7, [sx * 0.6, 0.5, sz * 0.6], "#d9c7a0", 8));
  parts.push(...tieredRoof(0.95, 0.95, 0.65, 0.85));
  const g = new THREE.Group();
  g.add(new THREE.Mesh(merge(parts), mats().lit));
  g.scale.setScalar(scale);
  return g;
}

export function createHouseGeometry() {
  const parts = [
    box(0.5, 0.32, 0.4, [0, 0.16, 0], "#e0cba4"),
    roofFrustum(0.36, 0.3, 0.03, 0.03, 0.34, 0.3, "#8a5a32", "#b7874f"),
  ];
  return merge(parts);
}

export function createBoat(scale = 1) {
  const g = new THREE.Group();
  const hull = paint(xf(new THREE.CapsuleGeometry(0.1, 1.1, 4, 10), [0, 0.06, 0], [0, 0, Math.PI / 2], [1, 1, 0.8]), (_x, y) =>
    y > 0.07 ? "#2b6f9a" : "#d4663a",
  );
  const parts = [
    hull,
    cyl(0.012, 0.016, 1.15, [0.05, 0.62, 0], "#5a3a22", 6),
    // outrigger float and booms
    solid(xf(new THREE.CapsuleGeometry(0.035, 0.85, 3, 6), [0.0, 0.05, 0.42], [0, 0, Math.PI / 2]), "#b45a2e"),
    solid(xf(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 5), [0.35, 0.09, 0.22], [Math.PI / 2, 0, 0]), "#5a3a22"),
    solid(xf(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 5), [-0.3, 0.09, 0.22], [Math.PI / 2, 0, 0]), "#5a3a22"),
  ];
  g.add(new THREE.Mesh(merge(parts), mats().litSmooth));
  // sail
  const sail = new THREE.BufferGeometry();
  sail.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([0.05, 0.2, 0, 0.05, 1.12, 0, 0.62, 0.22, 0.03, 0.05, 0.2, 0, -0.45, 0.22, -0.02, 0.05, 0.9, 0], 3),
  );
  sail.computeVertexNormals();
  solid(sail, "#f4e8cf");
  g.add(new THREE.Mesh(sail, litMaterial({ side: THREE.DoubleSide, flat: false, rim: 0.2 })));
  g.scale.setScalar(scale);
  return g;
}

/* -------------------------------------------------------------------------- */
/*  Vegetation geometries (used with instancing)                               */
/* -------------------------------------------------------------------------- */

function frond(len: number, width: number, droop: number, rng: () => number) {
  const segs = 18;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const c0 = new THREE.Color("#245c2b");
  const c1 = new THREE.Color("#86b845");
  const c = new THREE.Color();
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const cx = t * len;
    const cy = len * (0.32 * t - droop * t * t);
    const zig = i % 2 ? 1 : 0.55;
    const w = width * 0.5 * Math.pow(Math.sin(Math.PI * Math.min(t * 1.12, 1)), 0.7) * (1 - 0.2 * t) * zig;
    c.copy(c0).lerp(c1, smooth(0.0, 1, t)).offsetHSL(0, 0, (rng() - 0.5) * 0.04);
    for (const s of [-1, 1]) {
      pos.push(cx, cy + w * 0.35, s * w);
      col.push(c.r, c.g, c.b);
    }
    if (i < segs) {
      const k = i * 2;
      idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

let _palm: THREE.BufferGeometry | null = null;
/** One coconut palm, ~3.6 high, origin at its foot. Trunk and fronds are one geometry. */
export function palmGeometry() {
  if (_palm) return _palm;
  const rng = mulberry32(77);
  const parts: THREE.BufferGeometry[] = [];
  const H = 3.2;
  const bend = 0.42;
  const rings = 12;
  const segs = 7;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const cc = new THREE.Color();
  for (let j = 0; j <= rings; j++) {
    const t = j / rings;
    const cx = bend * t * t * H * 0.5;
    const cy = t * H;
    const r = THREE.MathUtils.lerp(0.13, 0.07, t) + (j % 2 ? 0.012 : 0);
    cc.set(j % 2 ? "#6f5a3e" : "#85694a").lerp(new THREE.Color("#4e3e2b"), (1 - t) * 0.5);
    for (let k = 0; k <= segs; k++) {
      const a = (k / segs) * Math.PI * 2;
      pos.push(cx + Math.cos(a) * r, cy, Math.sin(a) * r);
      col.push(cc.r, cc.g, cc.b);
    }
  }
  for (let j = 0; j < rings; j++)
    for (let k = 0; k < segs; k++) {
      const a = j * (segs + 1) + k;
      const b = a + segs + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  const trunk = new THREE.BufferGeometry();
  trunk.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  trunk.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  trunk.setIndex(idx);
  trunk.computeVertexNormals();
  parts.push(trunk);

  const top = new THREE.Vector3(bend * H * 0.5, H, 0);
  const n = 11;
  for (let i = 0; i < n; i++) {
    const phi = (i / n) * Math.PI * 2 + (rng() - 0.5) * 0.3;
    const len = 1.5 + rng() * 0.35;
    const f = frond(len, 0.5, 0.95 + rng() * 0.5, rng);
    f.rotateZ((rng() - 0.3) * 0.25);
    f.rotateY(phi);
    f.translate(top.x, top.y, top.z);
    parts.push(f);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    parts.push(solid(xf(new THREE.SphereGeometry(0.085, 6, 5), [top.x + Math.cos(a) * 0.12, top.y - 0.12, Math.sin(a) * 0.12]), "#5d6d2c"));
  }
  _palm = merge(parts);
  return _palm;
}

let _tree: THREE.BufferGeometry | null = null;
/** A broad-canopy tree (mango / jak style), ~2.4 high. */
export function treeGeometry() {
  if (_tree) return _tree;
  const rng = mulberry32(31);
  const parts: THREE.BufferGeometry[] = [];
  parts.push(gradient(xf(new THREE.CylinderGeometry(0.06, 0.11, 1.0, 6), [0, 0.5, 0]), "#4a3624", "#6d5238", 0, 1));
  const blobs: [number, number, number, number][] = [
    [0, 1.45, 0, 0.7],
    [0.42, 1.2, 0.12, 0.5],
    [-0.38, 1.28, -0.1, 0.52],
    [0.05, 1.8, -0.05, 0.46],
    [-0.1, 1.2, 0.4, 0.45],
  ];
  for (const [x, y, z, r] of blobs) {
    const ico = new THREE.IcosahedronGeometry(r, 1);
    const pos = ico.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      const k = 1 + (rng() - 0.5) * 0.18;
      pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k * 0.85, pos.getZ(i) * k);
    }
    ico.translate(x, y, z);
    ico.computeVertexNormals();
    parts.push(gradient(ico, "#1f5a2a", "#7fae3e", y - r, y + r));
  }
  _tree = merge(parts);
  return _tree;
}

let _bush: THREE.BufferGeometry | null = null;
export function bushGeometry() {
  if (_bush) return _bush;
  const ico = new THREE.IcosahedronGeometry(0.35, 1);
  ico.scale(1.2, 0.8, 1.1);
  ico.translate(0, 0.25, 0);
  _bush = merge([gradient(ico, "#2c6a30", "#6aa23a", 0, 0.6)]);
  return _bush;
}

/** Lotus flower with leaf pad, lying on the water plane. */
export function createLotus(rng: () => number) {
  const parts: THREE.BufferGeometry[] = [];
  const pad = new THREE.CircleGeometry(0.32 + rng() * 0.12, 12);
  pad.rotateX(-Math.PI / 2);
  parts.push(gradient(pad, "#2f6b34", "#4b8f3d", 0, 0.01));
  if (rng() > 0.35) {
    for (let ring = 0; ring < 2; ring++) {
      const n = 8;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ring * 0.4;
        const p = new THREE.SphereGeometry(0.1, 6, 5);
        p.scale(0.55, 1.15, 0.28);
        p.translate(0, 0.1, 0.07 + ring * 0.0);
        p.rotateX(-(0.35 + ring * 0.45));
        p.rotateY(a);
        parts.push(gradient(p, "#fff4ee", ring ? "#ff9ac0" : "#ffb7d1", 0, 0.22));
      }
    }
    parts.push(solid(xf(new THREE.SphereGeometry(0.04, 6, 5), [0, 0.1, 0]), "#ffd86b"));
  }
  return merge(parts);
}

/* -------------------------------------------------------------------------- */
/*  Instancing helper                                                          */
/* -------------------------------------------------------------------------- */

export type Placement = { x: number; y: number; z: number; s: number; r: number; tilt?: number };

export function instanced(geo: THREE.BufferGeometry, mat: THREE.Material, places: Placement[]) {
  const mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, places.length));
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const sc = new THREE.Vector3();
  places.forEach((p, i) => {
    e.set(p.tilt ?? 0, p.r, 0);
    q.setFromEuler(e);
    sc.setScalar(p.s);
    m.compose(new THREE.Vector3(p.x, p.y, p.z), q, sc);
    mesh.setMatrixAt(i, m);
  });
  mesh.count = places.length;
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  mesh.frustumCulled = false;
  return mesh;
}

/* -------------------------------------------------------------------------- */
/*  Map-only pieces                                                            */
/* -------------------------------------------------------------------------- */

/** Ring wall with towers and a gate gap, for the fortified city of Kotte. */
export function createRampart(radius: number, gateAngle = -Math.PI / 2) {
  const parts: THREE.BufferGeometry[] = [];
  const lamps: THREE.BufferGeometry[] = [];
  const n = 36;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    let d = a - gateAngle;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    if (Math.abs(d) < 0.2) continue;
    const seg = (Math.PI * 2 * radius) / n;
    parts.push(
      gradient(xf(new THREE.BoxGeometry(seg * 1.06, 0.26, 0.1), [Math.cos(a) * radius, 0.13, Math.sin(a) * radius], [0, -a + Math.PI / 2, 0]), "#8d8268", "#d6caa9", 0, 0.26),
    );
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    parts.push(cyl(0.12, 0.14, 0.5, [Math.cos(a) * radius, 0.25, Math.sin(a) * radius], "#cfc2a1", 8));
    parts.push(...tieredRoof(0.15, 0.15, 0.22, 0.5, "#a2432a"));
    parts[parts.length - 1] = xf(parts[parts.length - 1], [Math.cos(a) * radius, 0, Math.sin(a) * radius]);
    parts[parts.length - 2] = xf(parts[parts.length - 2], [Math.cos(a) * radius, 0, Math.sin(a) * radius]);
    parts[parts.length - 3] = xf(parts[parts.length - 3], [Math.cos(a) * radius, 0, Math.sin(a) * radius]);
    parts[parts.length - 4] = xf(parts[parts.length - 4], [Math.cos(a) * radius, 0, Math.sin(a) * radius]);
    lamps.push(solid(xf(new THREE.SphereGeometry(0.035, 6, 5), [Math.cos(a) * radius, 0.6, Math.sin(a) * radius]), "#ffd98a"));
  }
  const g = new THREE.Group();
  g.add(new THREE.Mesh(merge(parts), mats().lit));
  g.add(new THREE.Mesh(merge(lamps), mats().glow));
  return g;
}

/** A column of horsemen with parasols and banners. */
export function createArmy(count = 7) {
  const rng = mulberry32(12);
  const parts: THREE.BufferGeometry[] = [];
  const gold: THREE.BufferGeometry[] = [];
  for (let i = 0; i < count; i++) {
    const row = i % 2;
    const x = (i - count / 2) * 0.22 + (rng() - 0.5) * 0.05;
    const z = row * 0.22 + (rng() - 0.5) * 0.05;
    parts.push(solid(xf(new THREE.CapsuleGeometry(0.05, 0.16, 3, 6), [x, 0.12, z], [0, 0, Math.PI / 2]), i === 0 ? "#2a3a6a" : "#6b4a2e"));
    parts.push(solid(xf(new THREE.CylinderGeometry(0.03, 0.04, 0.16, 6), [x, 0.26, z]), "#c9553a"));
    parts.push(solid(xf(new THREE.SphereGeometry(0.03, 6, 5), [x, 0.37, z]), "#5a3a22"));
    if (i % 2 === 0 || i === 0) {
      parts.push(cyl(0.005, 0.005, 0.36, [x, 0.5, z], "#4a3a2a", 4));
      gold.push(solid(xf(new THREE.ConeGeometry(0.11, 0.07, 10), [x, 0.7, z]), i === 0 ? "#f2cf72" : "#d94c3a"));
    }
  }
  const g = new THREE.Group();
  g.add(new THREE.Mesh(merge(parts), mats().litSmooth));
  g.add(new THREE.Mesh(merge(gold), mats().gold));
  return g;
}

export function createLighthouse(scale = 1) {
  const parts = [
    gradient(xf(new THREE.CylinderGeometry(0.1, 0.17, 1.1, 10), [0, 0.55, 0]), "#d9d2c0", "#f6f1e4", 0, 1.1),
    cyl(0.2, 0.2, 0.08, [0, 1.14, 0], "#3a3a44", 10),
    cyl(0.12, 0.12, 0.16, [0, 1.26, 0], "#2a2a34", 10),
  ];
  const g = new THREE.Group();
  g.add(new THREE.Mesh(merge(parts), mats().lit));
  const lamp = new THREE.Mesh(merge([solid(xf(new THREE.SphereGeometry(0.1, 8, 6), [0, 1.3, 0]), "#fff2b0")]), mats().glow);
  g.add(lamp);
  g.scale.setScalar(scale);
  return g;
}

export { fbm };
