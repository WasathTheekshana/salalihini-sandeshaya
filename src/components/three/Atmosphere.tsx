/* eslint-disable react-hooks/immutability -- three.js objects are mutated imperatively every frame */
"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { nightOf, type Theme } from "@/lib/themes";
import { damp, shared } from "./kit";
import type { WaterColors } from "./Water";

/** Eases a water material's palette towards a theme. */
export function easeWater(c: WaterColors, theme: Theme, k: number, tmp: { a: THREE.Color; b: THREE.Color }) {
  tmp.a.set(theme.top);
  c.skyTop.lerp(tmp.a, k);
  tmp.a.set(theme.mid).lerp(tmp.b.set(theme.bottom), 0.55);
  c.skyBottom.lerp(tmp.a, k);
  tmp.a.set(theme.bottom).lerp(tmp.b.set("#2fae9c"), 0.55).multiplyScalar(0.55);
  c.shallow.lerp(tmp.a, k);
  tmp.a.set(theme.top).lerp(tmp.b.set("#05304d"), 0.65).multiplyScalar(0.8);
  c.deep.lerp(tmp.a, k);
}

/**
 * Drives the shared clock, fog, rim colour, night factor and scene lights from the current theme.
 * Every model reads these through `shared`, so one component sets the mood of the whole scene.
 */
export function Atmosphere({ theme, calm, fogScale = 1 }: { theme: Theme; calm: boolean; fogScale?: number }) {
  const { scene } = useThree();
  const dir = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);

  const t = useMemo(
    () => ({
      accent: new THREE.Color(),
      fog: new THREE.Color(),
      sunColor: new THREE.Color(),
      sky: new THREE.Color(),
      ground: new THREE.Color(),
      sunDir: new THREE.Vector3(),
      tmp: new THREE.Color(),
    }),
    [],
  );

  useEffect(() => {
    scene.fog = new THREE.FogExp2("#000000", 0.02);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useEffect(() => {
    const night = nightOf(theme);
    t.accent.set(theme.accent);
    t.fog.set(theme.mid).lerp(t.tmp.set(theme.bottom), 0.45);
    const useSun = theme.sun[3] >= theme.moon[3];
    const p = useSun ? theme.sun : theme.moon;
    t.sunColor.set(useSun ? theme.sunColor : "#b9ccff");
    t.sunDir.set(p[0] * 1.2, Math.max(p[1] * 0.9 + 0.35, 0.18), -0.8).normalize();
    t.sky.set(theme.top).lerp(t.tmp.set(theme.mid), 0.5);
    t.ground.set(theme.ground).lerp(t.tmp.set(theme.bottom), 0.12);
    void night;
  }, [theme, t]);

  const first = useRef(true);

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05);
    const snap = first.current;
    first.current = false;
    const k = snap ? 1 : 1 - Math.exp(-dt * 2);
    if (snap) {
      shared.uNight.value = nightOf(theme);
      shared.uFogDensity.value = 0.0125 * fogScale;
    }
    const speed = calm ? 0.3 : 1;
    shared.uTime.value = state.clock.elapsedTime * speed;
    shared.uRimColor.value.lerp(t.accent, k);
    shared.uNight.value = damp(shared.uNight.value, nightOf(theme), 1.6, dt);
    shared.uFogColor.value.lerp(t.fog, k);
    shared.uSunColor.value.lerp(t.sunColor, k);
    shared.uSunDir.value.lerp(t.sunDir, k).normalize();
    shared.uFogDensity.value = damp(shared.uFogDensity.value, (0.0125 + shared.uNight.value * 0.005) * fogScale, 1.5, dt);

    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(shared.uFogColor.value);
      scene.fog.density = shared.uFogDensity.value;
    }
    if (dir.current) {
      dir.current.position.copy(shared.uSunDir.value).multiplyScalar(30);
      dir.current.color.lerp(t.sunColor, k);
      dir.current.intensity = damp(dir.current.intensity, 3.4 - shared.uNight.value * 2.2, 1.5, dt);
    }
    if (hemi.current) {
      hemi.current.color.lerp(t.sky, k);
      hemi.current.groundColor.lerp(t.ground, k);
      hemi.current.intensity = damp(hemi.current.intensity, 1.7 - shared.uNight.value * 0.7, 1.5, dt);
    }
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#ffffff", "#222222", 1]} />
      <directionalLight ref={dir} position={[-6, 8, 6]} intensity={2.4} />
    </>
  );
}
