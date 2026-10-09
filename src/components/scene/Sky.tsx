/* eslint-disable react-hooks/immutability -- three.js uniforms are mutated imperatively every frame by design */
"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Theme } from "@/lib/themes";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec3 uTop, uMid, uBottom, uSunColor;
  uniform vec4 uSun, uMoon;
  uniform float uTime, uStars, uAspect;
  uniform vec2 uPointer;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uAspect, 1.0) * 2.0;
    vec2 par = uPointer * 0.02;

    // One continuous quadratic Bezier through bottom, mid and top: no kinks, so no visible "layers"
    float t = clamp(uv.y, 0.0, 1.0);
    float it = 1.0 - t;
    vec3 col = it * it * uBottom + 2.0 * it * t * uMid + t * t * uTop;

    // Sun: glow + disc
    vec2 sp = uSun.xy * vec2(uAspect, 1.0);
    float d = length(p - sp - par * 3.0);
    float glow = exp(-d * 2.2) * 0.55 + exp(-d * 7.0) * 0.5;
    col += uSunColor * glow * uSun.w * 0.8;
    col = mix(col, uSunColor, smoothstep(uSun.z, uSun.z * 0.82, d) * uSun.w);

    // Moon: disc with soft mottling and halo
    vec2 mp = uMoon.xy * vec2(uAspect, 1.0);
    float dm = length(p - mp - par * 2.0);
    float mdisk = smoothstep(uMoon.z, uMoon.z * 0.93, dm);
    float shade = 0.86 + 0.14 * fbm((p - mp) * 16.0);
    col += vec3(0.7, 0.8, 1.0) * exp(-dm * 4.0) * 0.35 * uMoon.w;
    col = mix(col, vec3(0.94, 0.96, 1.0) * shade, mdisk * uMoon.w);

    // Stars: dust, medium and a few bright ones with diffraction spikes
    float skyMask = smoothstep(0.16, 0.62, uv.y);
    vec2 sp0 = uv * vec2(uAspect, 1.0) + par * 1.5;
    vec3 starCol = vec3(0.0);
    {
      vec2 g = sp0 * 150.0; vec2 id = floor(g); vec2 f = fract(g) - 0.5;
      float h = hash(id);
      vec2 jit = (vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5) * 0.5;
      float s1 = step(0.9, h) * smoothstep(0.2, 0.0, length(f - jit));
      float tw1 = 0.65 + 0.35 * sin(uTime * (1.0 + h * 4.0) + h * 30.0);
      starCol += mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.88, 0.7), hash(id + 1.7)) * s1 * tw1 * 0.65;
    }
    {
      vec2 g = sp0 * 60.0; vec2 id = floor(g); vec2 f = fract(g) - 0.5;
      float h = hash(id + 9.0);
      vec2 jit = (vec2(hash(id + 5.3), hash(id + 2.9)) - 0.5) * 0.45;
      float s2 = step(0.93, h) * smoothstep(0.26, 0.0, length(f - jit));
      float tw2 = 0.6 + 0.4 * sin(uTime * (0.8 + h * 3.0) + h * 50.0);
      starCol += mix(vec3(0.8, 0.9, 1.0), vec3(1.0, 0.82, 0.62), hash(id + 4.4)) * s2 * tw2 * 1.15;
    }
    {
      vec2 g = sp0 * 20.0; vec2 id = floor(g); vec2 f = fract(g) - 0.5;
      float h = hash(id + 21.0);
      vec2 jit = (vec2(hash(id + 8.8), hash(id + 1.3)) - 0.5) * 0.5;
      vec2 q = f - jit;
      float core = smoothstep(0.1, 0.0, length(q));
      float spike = max(smoothstep(0.012, 0.0, abs(q.x)) * smoothstep(0.32, 0.0, abs(q.y)),
                        smoothstep(0.012, 0.0, abs(q.y)) * smoothstep(0.32, 0.0, abs(q.x)));
      float tw3 = 0.75 + 0.25 * sin(uTime * (0.6 + h * 1.5) + h * 70.0);
      starCol += mix(vec3(0.85, 0.92, 1.0), vec3(1.0, 0.9, 0.72), hash(id + 6.1)) * step(0.84, h) * (core * 2.0 + spike * 0.8) * tw3;
    }
    // faint Milky Way band with dust lanes
    float bandD = abs((uv.x * uAspect * 0.55 - uv.y * 0.95) + 0.12 + 0.07 * sin(uv.x * 3.2 + 1.0));
    float milky = smoothstep(0.34, 0.0, bandD) * (0.35 + 0.65 * fbm(sp0 * 4.5 + 3.0));
    milky *= 1.0 - 0.55 * smoothstep(0.5, 0.75, fbm(sp0 * 9.0 + 11.0));
    starCol += vec3(0.42, 0.5, 0.82) * milky * 0.32;
    // an occasional shooting star
    {
      float period = 9.0;
      float ph = mod(uTime, period);
      float seed = floor(uTime / period);
      float life = 0.9;
      if (ph < life) {
        float k = ph / life;
        vec2 start = vec2(0.25 + 0.55 * fract(seed * 0.37), 0.82 + 0.1 * fract(seed * 0.71)) * vec2(uAspect, 1.0);
        vec2 dir = normalize(vec2(0.8, -0.38));
        vec2 head = start + dir * k * 0.55;
        vec2 pa = (uv * vec2(uAspect, 1.0)) - head;
        float along = dot(pa, -dir);
        float across = length(pa + dir * along);
        float trail = smoothstep(0.0, 0.01, along) * smoothstep(0.16, 0.0, along) * smoothstep(0.004, 0.0, across);
        starCol += vec3(1.0, 0.95, 0.85) * trail * (1.0 - k) * 2.2;
      }
    }
    col += starCol * pow(uStars, 0.85) * skyMask;

    // Slow clouds
    float c = fbm(vec2(p.x * 0.55 + uTime * 0.015, p.y * 1.1) + par * 4.0);
    float band = smoothstep(0.0, 0.5, uv.y) * smoothstep(1.0, 0.5, uv.y);
    vec3 cloudCol = mix(uMid, vec3(1.0), 0.35);
    col = mix(col, cloudCol, smoothstep(0.52, 0.9, c) * 0.13 * band);

    // Vignette + dithering to hide banding
    float v = smoothstep(1.5, 0.3, length(p * vec2(0.8, 1.0)));
    col *= mix(0.55, 1.0, v);
    col += (hash(gl_FragCoord.xy + fract(uTime)) + hash(gl_FragCoord.yx * 1.7) - 1.0) / 255.0;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

type Props = { theme: Theme; calm: boolean };

export function Sky({ theme, calm }: Props) {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color(theme.top) },
      uMid: { value: new THREE.Color(theme.mid) },
      uBottom: { value: new THREE.Color(theme.bottom) },
      uSunColor: { value: new THREE.Color(theme.sunColor) },
      uSun: { value: new THREE.Vector4(...theme.sun) },
      uMoon: { value: new THREE.Vector4(...theme.moon) },
      uStars: { value: theme.stars },
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uPointer: { value: new THREE.Vector2() },
    }),
    // Initial values only; the frame loop eases towards the current theme.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const target = useMemo(
    () => ({
      top: new THREE.Color(),
      mid: new THREE.Color(),
      bottom: new THREE.Color(),
      sunColor: new THREE.Color(),
      sun: new THREE.Vector4(),
      moon: new THREE.Vector4(),
      stars: 0,
    }),
    [],
  );

  useEffect(() => {
    target.top.set(theme.top);
    target.mid.set(theme.mid);
    target.bottom.set(theme.bottom);
    target.sunColor.set(theme.sunColor);
    target.sun.set(...theme.sun);
    target.moon.set(...theme.moon);
    target.stars = theme.stars;
  }, [theme, target]);

  const { size } = useThree();

  useFrame((state, dt) => {
    const k = 1 - Math.exp(-dt * 2.2);
    uniforms.uTop.value.lerp(target.top, k);
    uniforms.uMid.value.lerp(target.mid, k);
    uniforms.uBottom.value.lerp(target.bottom, k);
    uniforms.uSunColor.value.lerp(target.sunColor, k);
    uniforms.uSun.value.lerp(target.sun, k);
    uniforms.uMoon.value.lerp(target.moon, k);
    uniforms.uStars.value += (target.stars - uniforms.uStars.value) * k;
    uniforms.uTime.value = state.clock.elapsedTime * (calm ? 0.3 : 1);
    uniforms.uAspect.value = size.width / size.height;
    uniforms.uPointer.value.lerp(state.pointer, 1 - Math.exp(-dt * 3));
  });

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
