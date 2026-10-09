/* eslint-disable react-hooks/immutability -- three.js objects are mutated imperatively every frame */
"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useBirdRig } from "./myna";
import { shared, smooth } from "./kit";

type Props = {
  /** 0..1 position across the poem */
  progress: number;
  calm: boolean;
  /** Current verse; each change makes the bird swoop across the screen */
  verse: number | null;
};

/** Lights that follow the scene's mood, read from the shared uniforms the background sets. */
export function BirdLights() {
  const dir = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  useFrame((_s, dt) => {
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 3);
    if (dir.current) {
      dir.current.position.copy(shared.uSunDir.value).multiplyScalar(20).add(new THREE.Vector3(-4, 2, 8));
      dir.current.color.lerp(shared.uSunColor.value, k);
      dir.current.intensity = 3.0 - shared.uNight.value * 1.0;
    }
    if (hemi.current) {
      hemi.current.color.lerp(shared.uFogColor.value, k).lerp(new THREE.Color("#ffffff"), 0.02);
      hemi.current.intensity = 1.6 - shared.uNight.value * 0.4;
    }
    if (fill.current) fill.current.intensity = 0.9 + shared.uNight.value * 0.4;
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={["#ffffff", "#5b4a3c", 1.7]} />
      <directionalLight ref={dir} position={[-4, 6, 8]} intensity={3.2} />
      {/* soft light from the viewer's side so the bird never goes black against the sky */}
      <directionalLight ref={fill} position={[3, 1, 10]} intensity={1.1} color="#fff1dc" />
    </>
  );
}

/** The starling that accompanies the reader. Always kept inside the visible area. */
export function Starling({ progress, calm, verse }: Props) {
  const rig = useBirdRig();

  const { viewport, camera } = useThree();
  const kick = useRef(0);
  const prevVerse = useRef(verse);
  useEffect(() => {
    if (prevVerse.current !== verse) kick.current = 1;
    prevVerse.current = verse;
  }, [verse]);

  const s = useRef({
    pos: new THREE.Vector3(0, 2, 0),
    vel: new THREE.Vector3(),
    facing: 1,
    yaw: -0.5,
    phase: 0,
    bank: 0,
    prevYaw: -0.5,
    look: new THREE.Vector2(),
  });

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05);
    const st = s.current;
    const speed = calm ? 0.35 : 1;
    const t = state.clock.elapsedTime * speed;

    // size relative to the screen, so the bird is clearly visible on any display
    const scale = THREE.MathUtils.clamp(viewport.width * 0.095, 0.85, 1.7);
    const spanX = 1.05 * scale; // half wingspan in world units
    const spanY = 1.0 * scale; // raised wings reach well above the body

    // visible half-extents at the bird's current depth (perspective!)
    const vp = viewport.getCurrentViewport(camera, [0, 0, st.pos.z]);
    const maxX = Math.max(0.2, vp.width / 2 - spanX * 1.15);
    const maxY = Math.max(0.2, vp.height / 2 - spanY * 1.5);

    const k = kick.current;
    kick.current = k * Math.exp(-dt * 1.2);

    // On verse pages she perches in the open margins, then crosses the screen as you turn the page.
    const side = verse === null ? 1 : verse % 2 === 0 ? -1 : 1;
    const cross = Math.sin(smooth(0, 1, k) * Math.PI); // 0 → 1 → 0 across a swoop
    let tx = side ? side * maxX * 0.92 + Math.sin(t * 0.5) * 0.35 : THREE.MathUtils.lerp(-maxX * 0.55, maxX * 0.55, progress) + Math.sin(t * 0.5) * 0.9;
    let ty = (side ? 0.1 + 0.28 * Math.sin(progress * 9) : 0.62) * maxY + Math.sin(t * 0.9) * 0.22 + Math.sin(t * 0.37) * 0.3 - cross * maxY * 0.5;
    const tz = 0.5 + Math.sin(t * 0.3) * 0.3 + cross * 0.9;
    tx = THREE.MathUtils.clamp(tx, -maxX, maxX);
    ty = THREE.MathUtils.clamp(ty, -maxY * 0.55, maxY);

    // critically damped spring toward the anchor
    const stiff = 4.5;
    const damp = 2 * Math.sqrt(stiff);
    st.vel.x += ((tx - st.pos.x) * stiff - st.vel.x * damp) * dt;
    st.vel.y += ((ty - st.pos.y) * stiff - st.vel.y * damp) * dt;
    st.vel.z += ((tz - st.pos.z) * stiff - st.vel.z * damp) * dt;
    st.pos.addScaledVector(st.vel, dt);
    // hard safety clamp: never leave the screen, whatever the spring does
    st.pos.x = THREE.MathUtils.clamp(st.pos.x, -maxX * 1.04, maxX * 1.04);
    st.pos.y = THREE.MathUtils.clamp(st.pos.y, -maxY * 0.6, maxY * 1.04);

    if (Math.abs(st.vel.x) > 0.3) st.facing = Math.sign(st.vel.x);
    const yawTarget = st.facing > 0 ? -0.55 : Math.PI + 0.55;
    st.yaw += (yawTarget - st.yaw) * (1 - Math.exp(-dt * 2.6));
    const yawRate = (st.yaw - st.prevYaw) / Math.max(dt, 1e-3);
    st.prevYaw = st.yaw;

    const sp = Math.min(Math.hypot(st.vel.x, st.vel.y), 2);
    const glide = smooth(-0.2, 0.55, Math.sin(t * 0.45)) * (1 - Math.min(sp / 1.2, 1) * 0.85) * (1 - Math.min(k * 2, 1));
    st.phase += dt * (calm ? 3.4 : 7 + sp * 2.6 + k * 8) * (1 - glide * 0.75);
    const amp = (0.65 + 0.25 * Math.min(sp, 1) + 0.2 * k) * (1 - glide * 0.2);

    st.look.x += (THREE.MathUtils.clamp(state.pointer.x * st.facing * 0.5, -0.5, 0.5) - st.look.x) * (1 - Math.exp(-dt * 3));
    st.look.y += (THREE.MathUtils.clamp(state.pointer.y * 0.3, -0.3, 0.3) - st.look.y) * (1 - Math.exp(-dt * 3));

    rig.update({
      phase: st.phase,
      amp,
      glide,
      tailSpread: THREE.MathUtils.clamp(0.35 + glide * 0.5 + Math.abs(st.vel.y) * 0.2, 0, 1),
      tailPitch: THREE.MathUtils.clamp(-st.vel.y * 0.08, -0.35, 0.35) - Math.sin(st.phase) * 0.05 * amp,
      lookYaw: st.look.x,
      lookPitch: st.look.y,
    });

    const g = rig.group;
    g.position.copy(st.pos);
    g.scale.setScalar(scale);
    g.rotation.order = "YZX";
    st.bank += (THREE.MathUtils.clamp(yawRate * 0.18, -0.6, 0.6) - st.bank) * (1 - Math.exp(-dt * 4));
    g.rotation.set(0.3 + st.bank, st.yaw, THREE.MathUtils.clamp(st.vel.y * 0.12 * st.facing, -0.5, 0.5));
  });

  return <primitive object={rig.group} />;
}
