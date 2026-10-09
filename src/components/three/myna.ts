"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { clamp01, litMaterial, merge, mulberry32, smooth, solid, valueNoise, xf } from "./kit";

/**
 * The starling: a stylised but lifelike Sri Lankan myna. A smooth sculpted body and head, a
 * curved yellow bill with a bare eye-patch, and wings and tail made of many overlapping
 * pointed feathers in layered rows, with soft colour gradients along each feather.
 *
 * Facing +x, wings along +/-z, up is +y. About 1.6 units from beak to tail tip.
 */

const C = {
  brown: "#9a5f36",
  brownLight: "#b9824d",
  brownDark: "#6a4128",
  dark: "#4a2e1e",
  tailDark: "#3b261b",
  hood: "#1e1a24",
  belly: "#eed3aa",
  beak: "#f5c32c",
  beakLow: "#eead18",
  patch: "#f8cc33",
  white: "#f7f1e5",
  leg: "#e8b023",
};

export type BirdPose = {
  /** Wingbeat phase in radians */
  phase: number;
  /** Flap amplitude 0..1 */
  amp: number;
  /** 0 = flapping, 1 = gliding with spread wings */
  glide: number;
  tailSpread: number;
  tailPitch: number;
  lookYaw: number;
  lookPitch: number;
};

export type BirdRig = {
  group: THREE.Group;
  update: (p: BirdPose) => void;
  /** Kept for the map; the 3D bird reads fine from any angle so this does nothing */
  faceCamera: (camera: THREE.Camera) => void;
  dispose: () => void;
};

/* --------------------------------- feathers --------------------------------- */

/**
 * One pointed feather lying along +z: a rounded quill end, widest around a third of the way,
 * tapering to a point, with a gentle upward curl. Colour blends from `base` to `tip`.
 * Indexed, so normals are smooth across the feather.
 */
function blade(len: number, wid: number, base: string, tip: string, curl = 0.05, hold = 0.25) {
  const rows = 6;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const cb = new THREE.Color(base);
  const ct = new THREE.Color(tip);
  const c = new THREE.Color();
  for (let i = 0; i <= rows; i++) {
    const t = i / rows;
    // vane half-width: quick rise, long taper, rounded point
    const w = wid * 0.5 * Math.pow(Math.sin(Math.PI * Math.min(0.12 + t * 0.88, 1)), 0.6) * (1 - 0.35 * t * t);
    const y = curl * t * t * len;
    c.copy(cb).lerp(ct, smooth(hold, 1, t));
    if (i === rows) {
      pos.push(0, y, t * len);
      col.push(c.r, c.g, c.b);
    } else {
      pos.push(-w, y, t * len, w, y, t * len);
      col.push(c.r, c.g, c.b, c.r, c.g, c.b);
    }
    if (i < rows - 1) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    } else if (i === rows - 1) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Slight per-feather colour variation so rows don't look stamped. */
function jitter(color: string, rng: () => number, amt = 0.03) {
  return new THREE.Color(color).offsetHSL((rng() - 0.5) * 0.015, (rng() - 0.5) * 0.05, (rng() - 0.5) * amt * 2).getStyle();
}

/* ---------------------------------- body ---------------------------------- */

function bodyGeometry() {
  const rings = 26;
  const segs = 20;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const c = new THREE.Color();
  const back = new THREE.Color(C.brown);
  const backLight = new THREE.Color(C.brownLight);
  const backDark = new THREE.Color(C.brownDark);
  const belly = new THREE.Color(C.belly);
  const hood = new THREE.Color(C.hood);
  for (let r = 0; r <= rings; r++) {
    const s = r / rings;
    const x = THREE.MathUtils.lerp(-0.5, 0.54, s);
    const e = Math.pow(Math.sin(Math.PI * (0.05 + 0.9 * s)), 0.7);
    const p = 0.26 + 0.74 * Math.max(e, 0.42 * smooth(0.6, 0.95, s));
    const ry = 0.205 * p * (1 + 0.1 * smooth(0.45, 0.75, s));
    const rz = 0.17 * p;
    const cy = 0.035 * Math.sin(Math.PI * s) + 0.07 * s ** 3 - 0.012;
    for (let k = 0; k <= segs; k++) {
      const a = (k / segs) * Math.PI * 2;
      const ny = Math.sin(a);
      const nz = Math.cos(a);
      pos.push(x, cy + ny * ry, nz * rz);
      c.copy(back).lerp(backLight, smooth(0.0, 0.8, ny) * 0.55);
      c.lerp(backDark, smooth(0.5, 1.0, ny) * smooth(0.55, 0.15, s) * 0.5);
      c.lerp(belly, smooth(0.3, -0.7, ny));
      c.lerp(hood, smooth(0.6, 0.8, s) * (0.5 + 0.5 * smooth(-0.95, 0.35, ny)));
      c.offsetHSL(0, 0, (valueNoise(x * 8 + nz * 3, ny * 5 + 2) - 0.5) * 0.07);
      col.push(c.r, c.g, c.b);
    }
  }
  const stride = segs + 1;
  for (let r = 0; r < rings; r++) {
    for (let k = 0; k < segs; k++) {
      const a = r * stride + k;
      const b = a + stride;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** A tapering, down-curved bill half with its tip toward +x. */
function billHalf(radius: number, length: number, bend: number, color: string, flatten: number) {
  const g = new THREE.ConeGeometry(radius, length, 12, 8);
  g.rotateZ(-Math.PI / 2);
  g.translate(length / 2, 0, 0);
  const pos = g.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getX(i) / length;
    pos.setY(i, pos.getY(i) * flatten - bend * t * t);
  }
  g.computeVertexNormals();
  return solid(g, color);
}

/* ---------------------------------- wings ---------------------------------- */

const FORE = 0.34;

type WingRig = {
  holder: THREE.Group;
  root: THREE.Group;
  fore: THREE.Group;
  hand: THREE.Group;
  primaries: { mesh: THREE.Mesh; yaw: number }[];
};

function makeWing(mat: THREE.Material, seed: number, owned: { dispose: () => void }[]): WingRig {
  const rng = mulberry32(seed);
  const b = (len: number, wid: number, base: string, tip: string, curl = 0.05, hold = 0.25) =>
    blade(len, wid, jitter(base, rng), jitter(tip, rng), curl, hold);

  const holder = new THREE.Group();
  const root = new THREE.Group();
  root.position.set(0.12, 0.11, 0.07);
  holder.add(root);

  // scapulars hide the join with the body
  const scap: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 4; i++) {
    scap.push(xf(b(0.24 - i * 0.015, 0.1, C.brown, C.brownDark, 0.12), [0.06 - i * 0.035, 0.014 + i * 0.002, i * 0.012], [0, -Math.PI / 2 + 0.12 - i * 0.1, 0]));
  }
  const scapGeo = merge(scap);
  owned.push(scapGeo);
  root.add(new THREE.Mesh(scapGeo, mat));

  const fore = new THREE.Group();
  fore.position.set(0, 0, 0.1);
  root.add(fore);

  // secondaries: long dark blades fanning back from the forearm
  const sec: THREE.BufferGeometry[] = [];
  const nSec = 9;
  for (let i = 0; i < nSec; i++) {
    const t = i / (nSec - 1);
    sec.push(xf(b(0.31 - t * 0.04, 0.095, C.brownDark, C.dark, 0.07, 0.4), [-0.035, 0, t * (FORE - 0.02)], [0, -Math.PI / 2 - 0.12 + t * 0.34, 0]));
  }
  const secGeo = merge(sec);
  owned.push(secGeo);
  fore.add(new THREE.Mesh(secGeo, mat));

  // coverts: three overlapping rows of shorter feathers on top
  const rows: [number, number, number, number, string, string][] = [
    [0.23, 0.1, -0.015, 0.005, C.brown, C.dark],
    [0.17, 0.09, 0.035, 0.011, C.brownLight, C.brownDark],
    [0.115, 0.075, 0.085, 0.017, C.brownLight, C.brown],
  ];
  const cov: THREE.BufferGeometry[] = [];
  rows.forEach(([len, wid, xo, yo, c0, c1], r) => {
    const n = 9 - r;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      cov.push(xf(b(len, wid, c0, c1, 0.1, 0.35), [xo, yo, 0.01 + t * (FORE - 0.04)], [0, -Math.PI / 2 + 0.08 + t * 0.2 - 0.04 * r, 0]));
    }
  });
  const covGeo = merge(cov);
  owned.push(covGeo);
  fore.add(new THREE.Mesh(covGeo, mat));

  // the hand carries the primaries
  const hand = new THREE.Group();
  hand.position.set(-0.01, 0, FORE);
  fore.add(hand);

  const hc: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 5; i++) {
    hc.push(xf(b(0.15 - i * 0.008, 0.07, C.brown, C.brownDark, 0.1, 0.4), [0.03, 0.013, 0.01 + i * 0.04], [0, -0.6 - i * 0.07, 0]));
  }
  const hcGeo = merge(hc);
  owned.push(hcGeo);
  hand.add(new THREE.Mesh(hcGeo, mat));

  // alula
  const alulaGeo = merge([
    xf(b(0.11, 0.045, C.dark, C.dark, 0.1), [0.05, 0.02, 0.0], [0, 0.55, 0]),
    xf(b(0.09, 0.04, C.brownDark, C.dark, 0.1), [0.05, 0.026, 0.01], [0, 0.85, 0]),
  ]);
  owned.push(alulaGeo);
  hand.add(new THREE.Mesh(alulaGeo, mat));

  // primaries, each its own mesh so they can ripple; the middle ones carry the white flash
  const primaries: WingRig["primaries"] = [];
  const count = 9;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const yaw = THREE.MathUtils.lerp(-1.1, 0.14, t);
    const len = 0.3 + 0.14 * Math.sin(Math.PI * Math.min(1, t * 0.95 + 0.05) * 0.88) - (i === count - 1 ? 0.07 : 0);
    const patch = i >= 2 && i <= 6;
    const g = patch ? b(len, 0.08, C.white, C.dark, 0.05, 0.42) : b(len, i > 6 ? 0.062 : 0.078, C.brownDark, C.dark, 0.05, 0.3);
    owned.push(g);
    const m = new THREE.Mesh(g, mat);
    m.rotation.y = yaw;
    m.position.set(0, 0.0006 * (count - i), 0);
    hand.add(m);
    primaries.push({ mesh: m, yaw });
  }
  return { holder, root, fore, hand, primaries };
}

/* ----------------------------------- bird ----------------------------------- */

function createRig(): BirdRig {
  const owned: { dispose: () => void }[] = [];
  const smoothMat = litMaterial({ flat: false, roughness: 0.8, rim: 0.8 });
  const featherMat = litMaterial({ flat: false, roughness: 0.85, rim: 0.7, side: THREE.DoubleSide });
  const glossMat = litMaterial({ flat: false, roughness: 0.35, rim: 0.5 });
  owned.push(smoothMat, featherMat, glossMat);

  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);

  const bodyGeo = bodyGeometry();
  owned.push(bodyGeo);
  body.add(new THREE.Mesh(bodyGeo, smoothMat));

  /* ---- head ---- */
  const head = new THREE.Group();
  head.position.set(0.56, 0.12, 0);
  body.add(head);
  const headGeo = merge([
    solid(xf(new THREE.SphereGeometry(0.14, 20, 14), [0.02, 0, 0], [0, 0, 0], [1.15, 1, 0.92]), C.hood),
    solid(xf(new THREE.SphereGeometry(0.07, 12, 9), [0.0, 0.058, 0], [0, 0, 0], [1.2, 0.7, 1.15]), C.hood),
    // bare yellow skin behind the eye
    solid(xf(new THREE.SphereGeometry(0.04, 12, 9), [0.012, 0.012, 0.106], [0, 0, 0], [1.7, 0.85, 0.28]), C.patch),
    solid(xf(new THREE.SphereGeometry(0.04, 12, 9), [0.012, 0.012, -0.106], [0, 0, 0], [1.7, 0.85, 0.28]), C.patch),
  ]);
  owned.push(headGeo);
  head.add(new THREE.Mesh(headGeo, smoothMat));

  const eyeGeo = merge([
    solid(xf(new THREE.SphereGeometry(0.026, 12, 9), [0.07, 0.03, 0.1]), "#130c08"),
    solid(xf(new THREE.SphereGeometry(0.026, 12, 9), [0.07, 0.03, -0.1]), "#130c08"),
    solid(xf(new THREE.SphereGeometry(0.0075, 6, 5), [0.082, 0.042, 0.108]), "#ffffff"),
    solid(xf(new THREE.SphereGeometry(0.0075, 6, 5), [0.082, 0.042, -0.108]), "#ffffff"),
  ]);
  owned.push(eyeGeo);
  head.add(new THREE.Mesh(eyeGeo, glossMat));

  const beakGeo = merge([
    billHalf(0.044, 0.21, 0.06, C.beak, 0.82),
    xf(billHalf(0.033, 0.17, 0.035, C.beakLow, 0.7), [0, -0.032, 0]),
  ]);
  beakGeo.translate(0.115, -0.012, 0);
  owned.push(beakGeo);
  head.add(new THREE.Mesh(beakGeo, glossMat));

  /* ---- legs tucked up ---- */
  const legParts: THREE.BufferGeometry[] = [];
  for (const s of [-1, 1]) {
    legParts.push(solid(xf(new THREE.SphereGeometry(0.06, 10, 8), [-0.05, -0.12, s * 0.075], [0, 0, 0], [1.4, 1, 0.8]), C.belly));
    legParts.push(solid(xf(new THREE.CylinderGeometry(0.014, 0.011, 0.15, 8), [-0.1, -0.17, s * 0.07], [0, 0, 1.35]), C.leg));
    for (const t of [-0.4, 0, 0.4]) legParts.push(solid(xf(new THREE.ConeGeometry(0.009, 0.075, 6), [-0.205, -0.185, s * 0.07 + t * 0.03], [t * 0.5, 0, 1.75]), C.leg));
  }
  const legGeo = merge(legParts);
  owned.push(legGeo);
  body.add(new THREE.Mesh(legGeo, glossMat));

  /* ---- wings ---- */
  const right = makeWing(featherMat, 11, owned);
  const left = makeWing(featherMat, 23, owned);
  left.holder.scale.z = -1;
  body.add(right.holder, left.holder);
  const wings = [right, left];

  /* ---- tail: a fan of dark feathers, the outer ones tipped white ---- */
  const tail = new THREE.Group();
  tail.position.set(-0.44, 0.03, 0);
  body.add(tail);
  const tailFeathers: { mesh: THREE.Mesh; base: number }[] = [];
  const nTail = 9;
  const rngT = mulberry32(99);
  for (let i = 0; i < nTail; i++) {
    const t = i / (nTail - 1) - 0.5;
    const edge = Math.abs(t) * 2;
    const len = 0.5 - edge * 0.07;
    const g = blade(len, 0.115, jitter(C.tailDark, rngT), edge > 0.45 ? C.white : jitter(C.dark, rngT), 0.03, edge > 0.45 ? 0.6 : 0.3);
    owned.push(g);
    const m = new THREE.Mesh(g, featherMat);
    m.position.y = (i % 2 ? 0.003 : -0.002) + i * 0.0004;
    tail.add(m);
    tailFeathers.push({ mesh: m, base: t });
  }
  // pale under-tail coverts
  const under: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 5; i++) {
    const t = i / 4 - 0.5;
    under.push(xf(blade(0.2, 0.09, C.belly, C.white, 0.05), [0.02, -0.03, t * 0.08], [0, -Math.PI / 2 + t * 0.5, 0]));
  }
  const underGeo = merge(under);
  owned.push(underGeo);
  tail.add(new THREE.Mesh(underGeo, featherMat));

  const update = (p: BirdPose) => {
    const phase = p.phase;
    const glide = clamp01(p.glide);
    const amp = clamp01(p.amp);

    body.position.y = Math.sin(phase) * -0.04 * amp * (1 - glide * 0.8);
    body.rotation.z = Math.cos(phase) * 0.035 * amp + p.tailPitch * 0.4 + p.lookPitch * 0.2;

    for (const w of wings) {
      const up = Math.cos(phase);
      const fold = Math.max(0, -Math.sin(phase));
      const shoulder = 0.72 * up * amp * (1 - glide) + 0.16 * glide + (1 - glide) * 0.1;
      w.root.rotation.x = -shoulder;
      w.root.rotation.y = 0.06 * fold * amp;
      w.fore.rotation.x = -(0.5 * Math.cos(phase - 0.55) * amp) * (1 - glide) + 0.02;
      w.fore.rotation.y = -fold * 0.5 * amp * (1 - glide) - 0.04 * glide;
      w.hand.rotation.x = -(0.55 * Math.cos(phase - 1.15) * amp) * (1 - glide) + 0.05 * glide;
      w.hand.rotation.y = -fold * 0.95 * amp * (1 - glide) - 0.05 * glide;
      const fan = 0.9 + 0.34 * glide + 0.1 * (1 - fold);
      for (let i = 0; i < w.primaries.length; i++) {
        const pr = w.primaries[i];
        pr.mesh.rotation.y = pr.yaw * fan;
        pr.mesh.rotation.x = Math.sin(phase - 1.7 - i * 0.14) * 0.17 * amp - 0.04;
      }
    }

    tail.rotation.z = p.tailPitch;
    const spread = 0.12 + p.tailSpread * 0.5 + glide * 0.12;
    for (const f of tailFeathers) {
      f.mesh.rotation.y = -Math.PI / 2 + f.base * spread * 2;
      f.mesh.rotation.x = Math.sin(phase - 2.4 + f.base * 2) * 0.05 * amp;
    }

    head.rotation.y = p.lookYaw;
    head.rotation.z = p.lookPitch - Math.sin(phase) * 0.03 * amp;
  };

  return {
    group,
    update,
    faceCamera: () => {},
    dispose: () => owned.forEach((d) => d.dispose()),
  };
}

/** The bird needs no assets, so it is ready immediately. */
export function useBirdRig(): BirdRig {
  const rig = useMemo(() => createRig(), []);
  useEffect(() => () => rig.dispose(), [rig]);
  return rig;
}
