/* eslint-disable react-hooks/immutability -- three.js uniforms are mutated imperatively every frame by design */
"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Theme } from "@/lib/themes";

const vertexShader = /* glsl */ `
  uniform float uTime, uPhase, uSway, uDensity, uSize, uPixelRatio;
  attribute vec4 aSeed;
  varying float vAlpha;
  varying float vMix;
  varying float vRot;

  void main() {
    vec3 p = position;
    float speed = 0.35 + aSeed.x * 0.9;
    p.y = mod(p.y + uPhase * speed + 6.0, 12.0) - 6.0;
    p.x += sin(uTime * (0.3 + aSeed.y * 0.5) + aSeed.z * 6.2831) * uSway * (0.4 + aSeed.y);
    p.z += cos(uTime * 0.25 + aSeed.w * 6.2831) * 0.3;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float visible = step(aSeed.w, uDensity);
    float edge = smoothstep(-6.0, -4.6, p.y) * smoothstep(6.0, 4.6, p.y);
    float twinkle = 0.65 + 0.35 * sin(uTime * (0.8 + aSeed.x * 2.0) + aSeed.z * 20.0);
    vAlpha = visible * edge * twinkle * (0.25 + aSeed.y * 0.55);
    vMix = aSeed.z;
    vRot = aSeed.x * 6.2831 + uTime * (0.4 + aSeed.y);

    gl_PointSize = uSize * (0.45 + aSeed.y) * uPixelRatio * (8.0 / -mv.z);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uColorA, uColorB;
  uniform float uPetal;
  varying float vAlpha;
  varying float vMix;
  varying float vRot;

  void main() {
    vec2 c = gl_PointCoord - 0.5;

    // soft glowing dot
    float dotA = pow(smoothstep(0.5, 0.0, length(c)), 2.0);

    // petal: rotated ellipse with a pointed tip
    float cs = cos(vRot), sn = sin(vRot);
    vec2 r = vec2(cs * c.x - sn * c.y, sn * c.x + cs * c.y);
    float petalA = smoothstep(0.5, 0.15, length(vec2(r.x * 1.0, r.y * 2.6)));
    petalA *= 0.9 - 0.3 * smoothstep(-0.3, 0.4, r.x);

    float a = mix(dotA, petalA, uPetal) * vAlpha;
    if (a < 0.01) discard;
    vec3 col = mix(uColorA, uColorB, vMix);
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;

type Props = { theme: Theme; calm: boolean; count: number };

/** Small seeded PRNG (mulberry32): a stable starfield, and pure under render. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Particles({ theme, calm, count }: Props) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count * 4);
    const rand = mulberry32(20251009);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 20;
      pos[i * 3 + 1] = (rand() - 0.5) * 12;
      pos[i * 3 + 2] = (rand() - 0.5) * 9;
      seed[i * 4] = rand();
      seed[i * 4 + 1] = rand();
      seed[i * 4 + 2] = rand();
      seed[i * 4 + 3] = rand();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
    return g;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const phase = useRef(0);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPhase: { value: 0 },
      uSway: { value: theme.sway },
      uDensity: { value: theme.density },
      uSize: { value: 8 },
      uPixelRatio: { value: 1 },
      uColorA: { value: new THREE.Color(theme.particleA) },
      uColorB: { value: new THREE.Color(theme.particleB) },
      uPetal: { value: theme.petal },
    }),
    // Initial values only; the frame loop eases towards the current theme.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const target = useMemo(
    () => ({ a: new THREE.Color(), b: new THREE.Color(), drift: 0, sway: 0, density: 0, petal: 0 }),
    [],
  );
  const drift = useRef(theme.drift);

  useEffect(() => {
    target.a.set(theme.particleA);
    target.b.set(theme.particleB);
    target.drift = theme.drift;
    target.sway = theme.sway;
    target.density = theme.density * (calm ? 0.55 : 1);
    target.petal = theme.petal;
  }, [theme, calm, target]);

  useFrame((state, dt) => {
    const k = 1 - Math.exp(-dt * 1.8);
    const speed = calm ? 0.3 : 1;
    drift.current += (target.drift - drift.current) * k;
    phase.current += drift.current * dt * 2.2 * speed;

    uniforms.uTime.value = state.clock.elapsedTime * speed;
    uniforms.uPhase.value = phase.current;
    uniforms.uSway.value += (target.sway - uniforms.uSway.value) * k;
    uniforms.uDensity.value += (target.density - uniforms.uDensity.value) * k;
    uniforms.uPetal.value += (target.petal - uniforms.uPetal.value) * k;
    uniforms.uColorA.value.lerp(target.a, k);
    uniforms.uColorB.value.lerp(target.b, k);
    uniforms.uPixelRatio.value = state.gl.getPixelRatio();
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
