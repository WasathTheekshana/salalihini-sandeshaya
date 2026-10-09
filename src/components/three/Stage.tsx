/* eslint-disable react-hooks/immutability -- three.js objects are mutated imperatively every frame */
"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Silhouette } from "@/data/sections";
import type { Theme } from "@/lib/themes";
import { easeWater } from "./Atmosphere";
import { createWaterMaterial, withDepth } from "./Water";
import { damp, fbm, litMaterial, mulberry32, paint, shared, smooth } from "./kit";
import {
  bushGeometry,
  createBoat,
  createDalada,
  createGopuram,
  createHouseGeometry,
  createLotus,
  createPalace,
  createPavilion,
  createStupa,
  instanced,
  mats,
  palmGeometry,
  treeGeometry,
  type Placement,
} from "./models";

/* -------------------------------------------------------------------------- */
/*  The valley: a winding river between gentle hills                           */
/* -------------------------------------------------------------------------- */

const WATER_Y = -3.62;

const riverX = (z: number) => 2.2 * Math.sin(z * 0.16 + 0.8) + 0.8 * Math.sin(z * 0.43);
const riverW = (z: number) => 2.0 + Math.max(0, -z - 4) * 0.11;

function stageHeight(x: number, z: number): number {
  let h = -3.35 + 0.5 * fbm(x * 0.09 + 3, z * 0.09);
  h += smooth(-14, -44, z) * 4.2 * fbm(x * 0.05, z * 0.05 + 9);
  const d = Math.abs(x - riverX(z));
  h -= smooth(riverW(z) + 1.5, riverW(z) * 0.55, d) * 1.15;
  return h;
}

function safeX(x: number, z: number) {
  const d = x - riverX(z);
  const w = riverW(z) + 2.4;
  if (Math.abs(d) < w) return riverX(z) + (d >= 0 ? 1 : -1) * w;
  return x;
}

/* -------------------------------------------------------------------------- */
/*  Prop sets: what the valley holds in each part of the story                 */
/* -------------------------------------------------------------------------- */

type Kind = "palace" | "dalada" | "stupa" | "gopuram" | "pavilion";
type Spec = [Kind, number, number, number, number];
type SetDef = {
  objs: Spec[];
  palms: number;
  trees: number;
  houses: number;
  boats: number;
  lotus: number;
};

const SETS: Record<Silhouette, SetDef> = {
  city: {
    objs: [["palace", -9.5, -11, 1.15, 0.4], ["palace", 10.5, -15, 0.9, -0.5], ["stupa", 3, -21, 1.2, 0], ["pavilion", -4.5, -8, 0.9, 0.3], ["pavilion", 6.5, -9, 0.8, -0.2]],
    palms: 26, trees: 18, houses: 14, boats: 0, lotus: 0,
  },
  temple: {
    objs: [["dalada", -9.5, -10.5, 1.35, 0.3], ["stupa", 10.5, -13, 1.0, 0], ["pavilion", -4, -8, 0.9, 0], ["pavilion", 5, -8.5, 0.9, 0]],
    palms: 22, trees: 14, houses: 6, boats: 0, lotus: 0,
  },
  stupa: {
    objs: [["stupa", 9.5, -11, 1.8, 0], ["stupa", -11.5, -16, 1.1, 0], ["pavilion", -6.5, -8, 0.9, 0.2], ["stupa", 0, -28, 1.4, 0]],
    palms: 34, trees: 14, houses: 6, boats: 0, lotus: 18,
  },
  kovil: {
    objs: [["gopuram", -9.5, -10.5, 1.7, 0.2], ["gopuram", 10.5, -14, 1.0, -0.3], ["pavilion", 4.5, -8, 0.8, 0]],
    palms: 26, trees: 10, houses: 8, boats: 0, lotus: 0,
  },
  mountain: {
    objs: [["pavilion", -8, -9, 0.9, 0.2]],
    palms: 40, trees: 70, houses: 8, boats: 2, lotus: 0,
  },
  palms: {
    objs: [["pavilion", -8, -9, 1, 0.2]],
    palms: 64, trees: 22, houses: 10, boats: 3, lotus: 36,
  },
  none: {
    objs: [["pavilion", 9, -10, 1.15, -0.3], ["stupa", -12, -17, 1.0, 0]],
    palms: 20, trees: 10, houses: 0, boats: 1, lotus: 52,
  },
};

/* -------------------------------------------------------------------------- */
/*  Shaders for clouds and the distant flock                                   */
/* -------------------------------------------------------------------------- */

const cloudVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const cloudFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime, uSeed, uAlpha;
  uniform vec3 uColor, uShade;
  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.05; a *= 0.5; } return v; }
  void main() {
    vec2 uv = vUv - 0.5;
    float r = length(uv * vec2(1.0, 2.2));
    float body = smoothstep(0.5, 0.05, r);
    float n = fbm(uv * 4.0 + vec2(uSeed, uSeed * 0.7) + vec2(uTime * 0.012, 0.0));
    float d = smoothstep(0.38, 0.78, n * 0.9 + body * 0.55);
    float shade = smoothstep(0.1, 0.6, fbm(uv * 5.0 + 3.0 + uSeed) );
    vec3 col = mix(uColor, uShade, shade * 0.55 + (uv.y < 0.0 ? 0.25 : 0.0));
    gl_FragColor = vec4(col, d * uAlpha * body);
    #include <colorspace_fragment>
  }
`;
const flockVert = /* glsl */ `
  attribute vec4 aSeed;
  uniform float uTime;
  void main() {
    vec3 p = position;
    float flap = sin(uTime * (7.0 + aSeed.x * 3.0) + aSeed.y * 6.28);
    p.y += flap * abs(p.z) * 0.9;
    float speed = 0.9 + aSeed.x * 0.4;
    float x0 = mod(aSeed.z * 80.0 + uTime * speed + 45.0, 90.0) - 45.0;
    float lead = -abs(aSeed.w - 0.5) * 3.0;
    vec3 base = vec3(x0 + lead, 5.5 + aSeed.y * 3.0 + sin(uTime * 0.4 + aSeed.z * 9.0) * 0.4 + (aSeed.w - 0.5) * 1.4, -24.0 - aSeed.x * 6.0 + (aSeed.w - 0.5) * 3.0);
    gl_Position = projectionMatrix * viewMatrix * vec4(base + p * 1.1, 1.0);
  }
`;
const flockFrag = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  void main() {
    gl_FragColor = vec4(uColor, 0.9);
    #include <colorspace_fragment>
  }
`;

/* -------------------------------------------------------------------------- */
/*  Build everything once                                                      */
/* -------------------------------------------------------------------------- */

function ridge(width: number, baseY: number, height: number, seed: number, peakX: number | null, peakH: number) {
  const n = 180;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n - 0.5) * width;
    let y = baseY + height * (0.25 + 0.75 * fbm(x * 0.045 + seed, seed * 1.7));
    if (peakX !== null) {
      const d = (x - peakX) / 11;
      y += peakH * Math.exp(-d * d) * (0.88 + 0.12 * fbm(x * 0.4, seed));
    }
    pos.push(x, y, 0, x, baseY - 10, 0);
    col.push(1, 1, 1, 0.55, 0.55, 0.6);
    if (i < n) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  return g;
}

function buildStage() {
  const root = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const m = mats();

  /* ground */
  const ground = new THREE.PlaneGeometry(96, 76, 150, 120);
  ground.rotateX(-Math.PI / 2);
  ground.translate(0, 0, -28);
  const gp = ground.getAttribute("position");
  const depth = new Float32Array(gp.count);
  for (let i = 0; i < gp.count; i++) {
    const h = stageHeight(gp.getX(i), gp.getZ(i));
    gp.setY(i, h);
    depth[i] = Math.max(0, WATER_Y - h);
  }
  ground.computeVertexNormals();
  const c = new THREE.Color();
  paint(ground, (x, y, z) => {
    const bank = smooth(WATER_Y + 0.42, WATER_Y - 0.05, y);
    const n = fbm(x * 0.35, z * 0.35);
    c.set("#4b8a3a").lerp(c.clone().set("#2f6a30"), n);
    if (fbm(x * 0.12 + 8, z * 0.12) > 0.58) c.lerp(c.clone().set("#97c64c"), 0.55);
    c.lerp(c.clone().set("#2c5a2f"), smooth(-2.9, -0.8, y));
    c.lerp(c.clone().set("#c7b384"), bank * 0.85);
    return c.getHex();
  });
  const groundMat = litMaterial({ flat: false, roughness: 1, rim: 0.25 });
  const groundMesh = new THREE.Mesh(ground, groundMat);
  root.add(groundMesh);
  disposables.push(ground, groundMat);

  /* river and lakes */
  const wgeo = new THREE.PlaneGeometry(96, 76, 150, 120);
  wgeo.rotateX(-Math.PI / 2);
  wgeo.translate(0, 0, -28);
  withDepth(wgeo, depth);
  const water = createWaterMaterial(0.03);
  const waterMesh = new THREE.Mesh(wgeo, water.material);
  waterMesh.position.y = WATER_Y;
  waterMesh.renderOrder = 2;
  root.add(waterMesh);
  disposables.push(wgeo, water.material);

  /* mountains */
  const mountains: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; fog: number; baseScale: number }[] = [];
  const layers: [number, number, number, number, number, number | null, number, number][] = [
    // z, width, baseY, height, seed, peakX, peakH, fog mix
    [-36, 150, -4.5, 5.5, 2.1, null, 0, 0.3],
    [-50, 200, -5, 8.5, 5.7, 21, 9, 0.5],
    [-68, 280, -6, 14, 9.3, -18, 6, 0.72],
  ];
  for (const [z, w, by, h, seed, px, ph, fog] of layers) {
    const g = ridge(w, by, h, seed, px, ph);
    const mat = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false });
    const mesh = new THREE.Mesh(g, mat);
    mesh.position.z = z;
    mesh.renderOrder = -3;
    root.add(mesh);
    mountains.push({ mesh, mat, fog, baseScale: 1 });
    disposables.push(g, mat);
  }

  /* clouds */
  const clouds: THREE.ShaderMaterial[] = [];
  const rngC = mulberry32(9);
  const cloudGeo = new THREE.PlaneGeometry(1, 1);
  disposables.push(cloudGeo);
  for (let i = 0; i < 8; i++) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: cloudVert,
      fragmentShader: cloudFrag,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: shared.uTime,
        uSeed: { value: rngC() * 20 },
        uAlpha: { value: 0.55 },
        uColor: { value: new THREE.Color("#ffe4cc") },
        uShade: { value: new THREE.Color("#b88aa6") },
      },
    });
    const mesh = new THREE.Mesh(cloudGeo, mat);
    const s = 16 + rngC() * 16;
    mesh.scale.set(s * 1.7, s * 0.55, 1);
    mesh.position.set((rngC() - 0.5) * 100, 5 + rngC() * 11, -34 - rngC() * 22);
    mesh.renderOrder = -4;
    root.add(mesh);
    clouds.push(mat);
    disposables.push(mat);
  }

  /* distant flock */
  const birdGeo = new THREE.BufferGeometry();
  birdGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [0, 0, 0, -0.35, 0, 0.55, -0.1, 0, 0, 0, 0, 0, -0.35, 0, -0.55, -0.1, 0, 0, 0.25, 0, 0, -0.2, 0.02, 0.05, -0.2, 0.02, -0.05],
      3,
    ),
  );
  const nBirds = 9;
  const seeds = new Float32Array(nBirds * 4);
  const rngB = mulberry32(21);
  for (let i = 0; i < seeds.length; i++) seeds[i] = rngB();
  birdGeo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 4));
  const flockMat = new THREE.ShaderMaterial({
    vertexShader: flockVert,
    fragmentShader: flockFrag,
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: { uTime: shared.uTime, uColor: { value: new THREE.Color("#1a1330") } },
  });
  const flock = new THREE.InstancedMesh(birdGeo, flockMat, nBirds);
  flock.frustumCulled = false;
  root.add(flock);
  disposables.push(birdGeo, flockMat);

  /* prop sets */
  const sets = {} as Record<Silhouette, THREE.Group>;
  const boats: { obj: THREE.Group; phase: number; y: number }[] = [];
  const palmGeo = palmGeometry();
  const treeGeo = treeGeometry();
  const bushGeo = bushGeometry();
  const houseGeo = createHouseGeometry();
  const houseMat = litMaterial({ rim: 0.35 });
  disposables.push(houseMat);
  let seed = 100;

  const groundY = (x: number, z: number) => Math.max(stageHeight(x, z), WATER_Y + 0.1);

  (Object.keys(SETS) as Silhouette[]).forEach((kind) => {
    const def = SETS[kind];
    const rng = mulberry32(seed++);
    const g = new THREE.Group();
    sets[kind] = g;

    for (const [type, x0, z, s, ry] of def.objs) {
      const x = safeX(x0, z);
      const obj =
        type === "palace" ? createPalace(s)
        : type === "dalada" ? createDalada(s)
        : type === "stupa" ? createStupa(s)
        : type === "gopuram" ? createGopuram(s)
        : createPavilion(s);
      obj.position.set(x, groundY(x, z) - 0.05, z);
      obj.rotation.y = ry;
      g.add(obj);
    }

    const palms: Placement[] = [];
    for (let tries = 0; palms.length < def.palms && tries < def.palms * 12; tries++) {
      const z = -6 - rng() * 30;
      const side = rng() < 0.5 ? -1 : 1;
      const x = riverX(z) + side * (riverW(z) + 0.9 + rng() * rng() * 22);
      if (Math.abs(x) > 40) continue;
      const y = stageHeight(x, z);
      if (y < WATER_Y + 0.14) continue;
      palms.push({ x, y: y - 0.04, z, s: 0.8 + rng() * 0.7, r: rng() * 6.28, tilt: (rng() - 0.5) * 0.12 });
    }
    if (palms.length) g.add(instanced(palmGeo, m.leaf, palms));

    const trees: Placement[] = [];
    const bushes: Placement[] = [];
    for (let tries = 0; trees.length < def.trees && tries < def.trees * 14; tries++) {
      const z = -7 - rng() * 38;
      const x = (rng() - 0.5) * 78;
      if (Math.abs(x - riverX(z)) < riverW(z) + 1.2) continue;
      const y = stageHeight(x, z);
      if (y < WATER_Y + 0.18) continue;
      trees.push({ x, y: y - 0.04, z, s: 0.9 + rng() * 1.0, r: rng() * 6.28 });
      if (rng() < 0.7) bushes.push({ x: x + (rng() - 0.5) * 2, y: y - 0.02, z: z + (rng() - 0.5) * 2, s: 0.8 + rng(), r: rng() * 6.28 });
    }
    if (trees.length) g.add(instanced(treeGeo, m.canopy, trees));
    if (bushes.length) g.add(instanced(bushGeo, m.canopy, bushes));

    const houses: Placement[] = [];
    for (let tries = 0; houses.length < def.houses && tries < def.houses * 14; tries++) {
      const z = -7 - rng() * 22;
      const side = rng() < 0.5 ? -1 : 1;
      const x = riverX(z) + side * (riverW(z) + 2 + rng() * 14);
      const y = stageHeight(x, z);
      if (y < WATER_Y + 0.2) continue;
      houses.push({ x, y, z, s: 1 + rng() * 0.8, r: rng() * 6.28 });
    }
    if (houses.length) g.add(instanced(houseGeo, houseMat, houses));

    const lotus: Placement[] = [];
    for (let tries = 0; lotus.length < def.lotus && tries < def.lotus * 20; tries++) {
      const z = -4 - rng() * 22;
      const x = riverX(z) + (rng() - 0.5) * riverW(z) * 2.2;
      if (stageHeight(x, z) > WATER_Y - 0.12) continue;
      lotus.push({ x, y: WATER_Y + 0.03, z, s: 0.8 + rng() * 0.9, r: rng() * 6.28 });
    }
    if (lotus.length) {
      const lg = createLotus(mulberry32(5));
      disposables.push(lg);
      g.add(instanced(lg, m.litSmooth, lotus));
    }

    for (let i = 0; i < def.boats; i++) {
      const z = -9 - rng() * 14;
      const x = riverX(z) + (rng() - 0.5) * riverW(z) * 1.2;
      const b = createBoat(1.3);
      b.position.set(x, WATER_Y + 0.02, z);
      b.rotation.y = rng() * 6.28;
      g.add(b);
      boats.push({ obj: b, phase: rng() * 6, y: WATER_Y + 0.02 });
    }

    root.add(g);
  });

  return {
    root,
    sets,
    boats,
    mountains,
    clouds,
    flockMat,
    groundMat,
    water,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function Stage({ theme, silhouette, calm }: { theme: Theme; silhouette: Silhouette; calm: boolean }) {
  const stage = useMemo(() => buildStage(), []);
  useEffect(() => () => stage.dispose(), [stage]);

  const weights = useMemo(() => {
    const w = {} as Record<Silhouette, number>;
    (Object.keys(SETS) as Silhouette[]).forEach((k) => (w[k] = 0));
    return w;
  }, []);

  const tmp = useMemo(() => ({ a: new THREE.Color(), b: new THREE.Color(), w: { a: new THREE.Color(), b: new THREE.Color() } }), []);

  const first = useRef(true);

  useFrame((_state, dt) => {
    dt = Math.min(dt, 0.05);
    // On the very first frame snap straight to the theme so the scene never "builds up" on load.
    const snap = first.current;
    first.current = false;
    const k = snap ? 1 : 1 - Math.exp(-dt * 2);
    if (snap) weights[silhouette] = 1;

    (Object.keys(SETS) as Silhouette[]).forEach((kind) => {
      const target = kind === silhouette ? 1 : 0;
      const w = (weights[kind] = damp(weights[kind], target, target ? 2.2 : 3.2, dt));
      const g = stage.sets[kind];
      g.visible = w > 0.015;
      const e = w * w * (3 - 2 * w);
      g.position.y = -(1 - e) * 9;
      g.scale.setScalar(0.88 + 0.12 * e);
    });

    stage.mountains.forEach((m, i) => {
      tmp.a.set(theme.ground).lerp(tmp.b.set(theme.bottom), 0.18).lerp(shared.uFogColor.value, m.fog);
      m.mat.color.lerp(tmp.a, k);
      void i;
    });
    const peak = silhouette === "mountain" ? 1.3 : 1;
    stage.mountains[1].mesh.scale.y = damp(stage.mountains[1].mesh.scale.y, peak, 1.4, dt);

    const night = shared.uNight.value;
    stage.clouds.forEach((c) => {
      tmp.a.set(theme.bottom).lerp(tmp.b.set("#ffffff"), 0.5).multiplyScalar(1 - night * 0.55);
      c.uniforms.uColor.value.lerp(tmp.a, k);
      tmp.a.set(theme.mid).multiplyScalar(0.8 - night * 0.3);
      c.uniforms.uShade.value.lerp(tmp.a, k);
      c.uniforms.uAlpha.value = damp(c.uniforms.uAlpha.value, 0.62 - night * 0.3, 1.5, dt);
    });
    stage.flockMat.uniforms.uColor.value.lerp(tmp.a.set(theme.ground).multiplyScalar(1.2), k);

    easeWater(stage.water.colors, theme, k, tmp.w);

    tmp.a.set("#ffffff").lerp(tmp.b.set(theme.ground), 0.25);
    stage.groundMat.color.lerp(tmp.a, k);

    const t = shared.uTime.value;
    stage.boats.forEach((b) => {
      b.obj.position.y = b.y + Math.sin(t * 1.1 + b.phase) * 0.035;
      b.obj.rotation.z = Math.sin(t * 0.9 + b.phase) * 0.04;
      b.obj.rotation.x = Math.sin(t * 0.7 + b.phase * 2) * 0.03;
    });
    void calm;
  });

  return <primitive object={stage.root} />;
}
