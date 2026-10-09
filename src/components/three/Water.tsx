"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { shared } from "./kit";

const vertex = /* glsl */ `
  attribute float aDepth;
  uniform float uTime;
  uniform float uWave;
  varying vec3 vWorld;
  varying float vDepth;
  void main() {
    vec3 p = position;
    float w = sin(p.x * 1.3 + uTime * 1.1) * 0.5 + sin(p.z * 1.7 - uTime * 0.9) * 0.5;
    p.y += w * uWave * smoothstep(0.0, 0.35, aDepth);
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    vDepth = aDepth;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime, uNight, uFogDensity, uOpacity;
  uniform vec3 uSkyTop, uSkyBottom, uShallow, uDeep, uSunDir, uSunColor, uFogColor;
  varying vec3 vWorld;
  varying float vDepth;

  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float wave(vec2 p, float t) {
    return noise(p * 1.1 + vec2(t * 0.35, t * 0.2)) * 0.6 + noise(p * 2.7 - vec2(t * 0.5, -t * 0.3)) * 0.4;
  }

  void main() {
    vec2 xz = vWorld.xz;
    float e = 0.06;
    float h  = wave(xz, uTime);
    float hx = wave(xz + vec2(e, 0.0), uTime);
    float hz = wave(xz + vec2(0.0, e), uTime);
    vec3 n = normalize(vec3((h - hx) * 2.2, 1.0, (h - hz) * 2.2));

    vec3 V = normalize(cameraPosition - vWorld);
    float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
    vec3 R = reflect(-V, n);

    vec3 reflection = mix(uSkyBottom, uSkyTop, clamp(R.y * 1.6, 0.0, 1.0));
    vec3 body = mix(uShallow, uDeep, smoothstep(0.0, 0.7, vDepth));
    vec3 col = mix(body, reflection, 0.18 + 0.72 * fres);

    // sun / moon glitter
    float spec = pow(max(dot(R, normalize(uSunDir)), 0.0), 180.0) * 3.0;
    float glit = smoothstep(0.55, 0.9, noise(xz * 14.0 + uTime * 0.6));
    col += uSunColor * (spec * (0.4 + glit));

    // shoreline foam: pulsing bands where the water is shallow
    float pulse = 0.5 + 0.5 * sin(uTime * 1.4 + noise(xz * 3.0) * 6.0);
    float edge = smoothstep(0.075 + 0.035 * pulse, 0.0, vDepth);
    float lace = smoothstep(0.42, 0.7, noise(xz * 9.0 + uTime * 0.25));
    float foam = edge * (0.45 + 0.55 * lace);
    col = mix(col, vec3(0.97, 0.98, 0.96) * (0.55 + 0.45 * (1.0 - uNight)), clamp(foam, 0.0, 1.0));

    // dry land (depth 0) must stay clear; foam only starts a hair inside the shore
    float vis = smoothstep(0.004, 0.03, vDepth);
    float alpha = mix(0.55, 0.96, smoothstep(0.0, 0.35, vDepth)) * uOpacity;
    alpha = max(alpha, foam * 0.9 * uOpacity) * vis;

    float dist = length(vWorld - cameraPosition);
    float fog = 1.0 - exp(-dist * dist * uFogDensity * uFogDensity);
    col = mix(col, uFogColor, clamp(fog, 0.0, 1.0));

    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

export type WaterColors = {
  skyTop: THREE.Color;
  skyBottom: THREE.Color;
  shallow: THREE.Color;
  deep: THREE.Color;
};

/** Creates the water material plus an `update` that eases it towards theme colours. */
export function createWaterMaterial(wave = 0.05) {
  const colors: WaterColors = {
    skyTop: new THREE.Color("#2a1b52"),
    skyBottom: new THREE.Color("#f2a65a"),
    shallow: new THREE.Color("#4fb8a8"),
    deep: new THREE.Color("#0b3a5c"),
  };
  const uniforms = {
    uTime: shared.uTime,
    uNight: shared.uNight,
    uFogColor: shared.uFogColor,
    uFogDensity: shared.uFogDensity,
    uSunDir: shared.uSunDir,
    uSunColor: shared.uSunColor,
    uSkyTop: { value: colors.skyTop },
    uSkyBottom: { value: colors.skyBottom },
    uShallow: { value: colors.shallow },
    uDeep: { value: colors.deep },
    uWave: { value: wave },
    uOpacity: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
  });
  return { material, uniforms, colors };
}

/** Attach a `aDepth` attribute (water depth, metres) to a geometry. */
export function withDepth(geo: THREE.BufferGeometry, depth: Float32Array | number) {
  const count = geo.getAttribute("position").count;
  const arr = typeof depth === "number" ? new Float32Array(count).fill(depth) : depth;
  geo.setAttribute("aDepth", new THREE.BufferAttribute(arr, 1));
  return geo;
}

export function useWater(wave = 0.05) {
  return useMemo(() => createWaterMaterial(wave), [wave]);
}
