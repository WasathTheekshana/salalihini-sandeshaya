import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/* -------------------------------------------------------------------------- */
/*  Shared uniforms: one set drives wind, rim light and night glow everywhere  */
/* -------------------------------------------------------------------------- */

export const shared = {
  uTime: { value: 0 },
  uRimColor: { value: new THREE.Color("#ffd58a") },
  /** 0 = day, 1 = night. Drives window and lantern glow. */
  uNight: { value: 0 },
  uFogColor: { value: new THREE.Color("#b5527a") },
  uFogDensity: { value: 0.02 },
  /** Direction towards the sun/moon, used for water glints */
  uSunDir: { value: new THREE.Vector3(0.3, 0.5, -0.8).normalize() },
  uSunColor: { value: new THREE.Color("#ffd9a0") },
};

/* -------------------------------------------------------------------------- */
/*  Seeded randomness and noise (pure, deterministic)                          */
/* -------------------------------------------------------------------------- */

export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(x: number, y: number): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm(x: number, y: number, octaves = 4): number {
  let v = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < octaves; i++) {
    v += amp * valueNoise(x * f, y * f);
    f *= 2.03;
    amp *= 0.5;
  }
  return v;
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* -------------------------------------------------------------------------- */
/*  Materials                                                                  */
/* -------------------------------------------------------------------------- */

type LitOptions = {
  roughness?: number;
  flat?: boolean;
  /** Wind sway strength; 0 disables */
  wind?: number;
  /** Rim light strength */
  rim?: number;
  side?: THREE.Side;
  emissive?: string;
  emissiveIntensity?: number;
  map?: THREE.Texture;
  alphaTest?: number;
  bumpMap?: THREE.Texture;
  bumpScale?: number;
};

/**
 * A lit, vertex-coloured material with a soft coloured rim and optional wind sway.
 * All instances share the same `shared` uniforms, so one clock moves every tree.
 */
export function litMaterial({
  roughness = 0.85,
  flat = true,
  wind = 0,
  rim = 0.55,
  side = THREE.FrontSide,
  emissive,
  emissiveIntensity = 1,
  map,
  alphaTest = 0,
  bumpMap,
  bumpScale = 1,
}: LitOptions = {}) {
  const m = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: flat,
    roughness,
    metalness: 0,
    side,
  });
  if (emissive) {
    m.emissive = new THREE.Color(emissive);
    m.emissiveIntensity = emissiveIntensity;
  }
  if (map) m.map = map;
  if (alphaTest > 0) m.alphaTest = alphaTest;
  if (bumpMap) {
    m.bumpMap = bumpMap;
    m.bumpScale = bumpScale;
  }
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = shared.uTime;
    shader.uniforms.uRimColor = shared.uRimColor;
    shader.uniforms.uWind = { value: wind };
    shader.uniforms.uRim = { value: rim };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;\nuniform float uWind;")
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `
        #include <begin_vertex>
        if (uWind > 0.0) {
          #ifdef USE_INSTANCING
            float wph = instanceMatrix[3].x * 0.7 + instanceMatrix[3].z * 0.5;
          #else
            float wph = 0.0;
          #endif
          float hf = max(transformed.y, 0.0);
          transformed.x += sin(uTime * 1.6 + wph + transformed.y * 0.9) * uWind * hf;
          transformed.z += cos(uTime * 1.2 + wph * 1.3 + transformed.y * 0.7) * uWind * 0.6 * hf;
        }
        `,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uRimColor;\nuniform float uRim;")
      .replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `
        #include <emissivemap_fragment>
        {
          float fres = pow(1.0 - saturate(dot(normalize(normal), normalize(vViewPosition))), 3.0);
          totalEmissiveRadiance += uRimColor * fres * uRim;
        }
        `,
      );
  };
  m.customProgramCacheKey = () => `lit-${wind}-${rim}-${flat}-${!!map}-${!!bumpMap}`;
  return m;
}

/** Emissive material for lamps and windows; glows more at night. */
export function glowMaterial(color: string, day = 0.35, night = 2.4) {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color), toneMapped: false });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uNight = shared.uNight;
    shader.uniforms.uDay = { value: day };
    shader.uniforms.uMax = { value: night };
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uNight;\nuniform float uDay;\nuniform float uMax;")
      .replace(
        "#include <color_fragment>",
        "#include <color_fragment>\ndiffuseColor.rgb *= mix(uDay, uMax, uNight);",
      );
  };
  m.customProgramCacheKey = () => `glow-${day}-${night}`;
  return m;
}

/* -------------------------------------------------------------------------- */
/*  Geometry helpers                                                           */
/* -------------------------------------------------------------------------- */

/** Paint vertex colours from a per-vertex function. Returns the same geometry. */
export function paint<T extends THREE.BufferGeometry>(
  geo: T,
  fn: (x: number, y: number, z: number, nx: number, ny: number, nz: number) => THREE.ColorRepresentation,
): T {
  const pos = geo.getAttribute("position");
  const nor = geo.getAttribute("normal");
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    c.set(fn(pos.getX(i), pos.getY(i), pos.getZ(i), nor?.getX(i) ?? 0, nor?.getY(i) ?? 1, nor?.getZ(i) ?? 0));
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return geo;
}

/** Vertical colour ramp: cheap ambient-occlusion-looking shading. */
export function gradient<T extends THREE.BufferGeometry>(geo: T, bottom: string, top: string, y0: number, y1: number): T {
  const a = new THREE.Color(bottom);
  const b = new THREE.Color(top);
  const c = new THREE.Color();
  return paint(geo, (_x, y) => c.copy(a).lerp(b, clamp01((y - y0) / (y1 - y0))).getHex());
}

export function solid<T extends THREE.BufferGeometry>(geo: T, color: string): T {
  return paint(geo, () => color);
}

/** Bake a transform into a geometry so many parts can be merged into one draw call. */
export function xf<T extends THREE.BufferGeometry>(
  geo: T,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] | number = 1,
): T {
  const s = typeof scale === "number" ? ([scale, scale, scale] as const) : scale;
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(...pos),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),
    new THREE.Vector3(...s),
  );
  geo.applyMatrix4(m);
  return geo;
}

export function merge(parts: THREE.BufferGeometry[], keepUv = false): THREE.BufferGeometry {
  // mergeGeometries needs matching attributes; strip uvs unless every part carries them
  const cleaned = parts.map((p) => {
    const g = p.index ? p.toNonIndexed() : p.clone();
    if (!keepUv) g.deleteAttribute("uv");
    if (!g.getAttribute("normal")) g.computeVertexNormals();
    if (!g.getAttribute("color")) solid(g, "#ffffff");
    return g;
  });
  const merged = mergeGeometries(cleaned, false);
  cleaned.forEach((g) => g.dispose());
  return merged ?? new THREE.BufferGeometry();
}

/** Smoothstep-eased exponential approach, frame-rate independent. */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
