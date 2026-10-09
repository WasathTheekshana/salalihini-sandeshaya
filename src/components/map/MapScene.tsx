/* eslint-disable react-hooks/immutability -- three.js objects are mutated imperatively every frame */
"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Sky } from "@/components/scene/Sky";
import { Atmosphere, easeWater } from "@/components/three/Atmosphere";
import { PostFX } from "@/components/three/PostFX";
import { ReadySignal } from "@/components/three/ReadySignal";
import { useBirdRig } from "@/components/three/myna";
import { damp, shared } from "@/components/three/kit";
import { sectionOfVerse } from "@/data/sections";
import { THEMES } from "@/lib/themes";
import { LANDMARKS, SCENERY_LABELS, nodeToU, terrainHeight, verseToNode } from "./geo";
import { buildWorld, type World } from "./world";

export type CamMode = "orbit" | "follow" | "top";
export type LabelRefs = RefObject<Record<string, HTMLElement | null>>;

type Props = {
  verse: number;
  mode: CamMode;
  /** Landmark to fly the camera to; changes with `focusNonce` */
  focusId: string | null;
  focusNonce: number;
  labels: LabelRefs;
  calm: boolean;
  /** Called every frame with the bird's current route progress, 0..1 */
  progressRef: RefObject<number>;
};

const ORBIT_HOME = { pos: new THREE.Vector3(-1, 13.5, 17.5), target: new THREE.Vector3(-1, 0, -0.5) };
const TOP_HOME = { pos: new THREE.Vector3(-1, 40, -0.4), target: new THREE.Vector3(-1, 0, -0.5) };

/* -------------------------------------------------------------------------- */

function MapBird({
  world,
  verse,
  calm,
  progressRef,
  birdPos,
}: {
  world: World;
  verse: number;
  calm: boolean;
  progressRef: RefObject<number>;
  birdPos: RefObject<THREE.Vector3>;
}) {
  const rig = useBirdRig();

  // soft golden halo so the starling stays findable from far away
  const halo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0.12, 0], 3));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: "void main(){ gl_PointSize = 38.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader:
        "precision highp float; void main(){ float d = length(gl_PointCoord-0.5); float a = pow(smoothstep(0.5,0.0,d),2.4)*0.4; gl_FragColor = vec4(vec3(1.0,0.82,0.45)*a, a); }",
    });
    const pts = new THREE.Points(g, m);
    pts.frustumCulled = false;
    return pts;
  }, []);
  useEffect(() => {
    rig.group.add(halo);
    return () => {
      rig.group.remove(halo);
      halo.geometry.dispose();
      (halo.material as THREE.Material).dispose();
    };
  }, [rig, halo]);

  const s = useRef({
    u: 0,
    speed: 0,
    phase: 0,
    heading: 0,
    pos: new THREE.Vector3(),
    tan: new THREE.Vector3(1, 0, 0),
    started: false,
    bank: 0,
    prevHeading: 0,
  });
  const targetU = useMemo(() => nodeToU(world.route.nodeU, verseToNode(verse)), [world, verse]);

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05);
    const st = s.current;
    const { curve, length } = world.route;
    if (!st.started) {
      st.u = targetU;
      st.started = true;
    }
    const prevU = st.u;
    st.u += (targetU - st.u) * (1 - Math.exp(-dt * 1.7));
    const du = st.u - prevU;
    const v = Math.abs(du / Math.max(dt, 1e-4)) * length; // world units per second
    st.speed += (v - st.speed) * (1 - Math.exp(-dt * 6));
    progressRef.current = st.u;

    const p = curve.getPointAt(Math.min(Math.max(st.u, 0), 1));
    const tan = curve.getTangentAt(Math.min(Math.max(st.u, 0), 1));
    const moving = Math.min(st.speed / 1.2, 1);
    const dir = du < -1e-5 ? -1 : 1;
    // face the way we are travelling; hold the last heading when hovering
    if (moving > 0.08) st.tan.lerp(tan.multiplyScalar(dir), 1 - Math.exp(-dt * 5)).normalize();

    const t = state.clock.elapsedTime * (calm ? 0.4 : 1);
    const hover = 1 - moving;
    const y = world.altitude(p.x, p.z) + Math.sin(t * 1.3) * 0.06 * hover + 0.05;
    st.pos.set(p.x + Math.cos(t * 0.7) * 0.12 * hover, y, p.z + Math.sin(t * 0.7) * 0.12 * hover);

    birdPos.current.copy(st.pos);
    const targetHeading = Math.atan2(-st.tan.z, st.tan.x);
    let dh = targetHeading - st.heading;
    dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    st.heading += dh * (1 - Math.exp(-dt * 6));
    const turn = dh / Math.max(dt, 1e-3);
    st.bank += (THREE.MathUtils.clamp(-turn * 0.06, -0.7, 0.7) - st.bank) * (1 - Math.exp(-dt * 5));

    const glide = 0;
    st.phase += dt * (calm ? 4 : 6.5 + st.speed * 2.2);
    rig.update({
      phase: st.phase,
      amp: 0.55 + 0.4 * moving,
      glide,
      tailSpread: 0.35 + 0.35 * hover,
      tailPitch: Math.sin(st.phase) * -0.05,
      lookYaw: Math.sin(t * 0.6) * 0.25 * hover,
      lookPitch: 0,
    });
    const g = rig.group;
    g.position.copy(st.pos);
    g.scale.setScalar(THREE.MathUtils.clamp(state.camera.position.distanceTo(st.pos) * 0.028, 0.5, 1.1));
    g.rotation.order = "YZX";
    g.rotation.set(st.bank, st.heading, THREE.MathUtils.clamp((y - (world.altitude(p.x, p.z) + 0.05)) * 0.2, -0.2, 0.2));
    rig.faceCamera(state.camera);
  });

  return <primitive object={rig.group} />;
}

/* -------------------------------------------------------------------------- */

function CameraRig({
  mode,
  focusId,
  focusNonce,
  birdPos,
}: {
  mode: CamMode;
  focusId: string | null;
  focusNonce: number;
  birdPos: RefObject<THREE.Vector3>;
}) {
  const { camera, gl } = useThree();
  const controls = useRef<OrbitControls | null>(null);
  const goal = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>({
    pos: ORBIT_HOME.pos.clone(),
    target: ORBIT_HOME.target.clone(),
  });
  const look = useRef(ORBIT_HOME.target.clone());
  const first = useRef(true);
  const prevMode = useRef<CamMode>("orbit");

  useEffect(() => {
    const c = new OrbitControls(camera, gl.domElement);
    c.enableDamping = true;
    c.dampingFactor = 0.07;
    c.minDistance = 4;
    c.maxDistance = 70;
    c.maxPolarAngle = Math.PI * 0.47;
    c.target.copy(ORBIT_HOME.target);
    c.addEventListener("start", () => {
      goal.current = null;
    });
    controls.current = c;
    return () => {
      c.dispose();
      controls.current = null;
    };
  }, [camera, gl]);

  // mode changes set a camera goal
  useEffect(() => {
    if (first.current) {
      first.current = false;
      prevMode.current = mode;
      return;
    }
    if (mode === "orbit") goal.current = { pos: ORBIT_HOME.pos.clone(), target: ORBIT_HOME.target.clone() };
    else if (mode === "top") goal.current = { pos: TOP_HOME.pos.clone(), target: TOP_HOME.target.clone() };
    else {
      goal.current = null;
      if (controls.current) look.current.copy(controls.current.target);
    }
    prevMode.current = mode;
  }, [mode]);

  // fly to a landmark
  useEffect(() => {
    if (!focusId) return;
    const l = LANDMARKS.find((x) => x.id === focusId);
    if (!l) return;
    const y = Math.max(terrainHeight(l.x, l.z), 0.1);
    const target = new THREE.Vector3(l.x, y + 0.6, l.z);
    const far = l.id === "samanala" || l.id === "sea";
    const dist = far ? 22 : 7.5;
    const dir = new THREE.Vector3().subVectors(camera.position, target).setY(0);
    if (dir.lengthSq() < 0.01) dir.set(0, 0, 1);
    dir.normalize();
    const pos = target.clone().addScaledVector(dir, dist).add(new THREE.Vector3(0, dist * 0.55, 0));
    goal.current = { pos, target };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNonce]);

  useFrame((_s, dt) => {
    dt = Math.min(dt, 0.05);
    const c = controls.current;
    if (!c) return;
    if (mode === "follow") {
      c.enabled = false;
      const bp = birdPos.current;
      const desired = bp.clone().add(new THREE.Vector3(-3.6, 2.6, 4.2));
      const k = 1 - Math.exp(-dt * 2.2);
      camera.position.lerp(desired, k);
      look.current.lerp(bp, 1 - Math.exp(-dt * 3.5));
      camera.lookAt(look.current);
      c.target.copy(look.current);
      return;
    }
    const g = goal.current;
    if (g) {
      c.enabled = false;
      const k = first.current ? 1 : 1 - Math.exp(-dt * 2.8);
      camera.position.lerp(g.pos, k);
      c.target.lerp(g.target, k);
      camera.lookAt(c.target);
      if (camera.position.distanceTo(g.pos) < 0.08 && c.target.distanceTo(g.target) < 0.05) goal.current = null;
    } else {
      c.enabled = true;
      c.update();
    }
  });

  return null;
}

/* -------------------------------------------------------------------------- */

function World({
  verse,
  mode,
  labels,
  calm,
  focusId,
  focusNonce,
  progressRef,
}: Omit<Props, never>) {
  const world = useMemo(() => buildWorld(), []);
  useEffect(() => () => world.dispose(), [world]);

  const { camera, size } = useThree();
  const theme = THEMES[sectionOfVerse(verse).theme];
  const birdPos = useRef(new THREE.Vector3());
  const proj = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => ({ a: new THREE.Color(), b: new THREE.Color(), w: { a: new THREE.Color(), b: new THREE.Color() } }), []);
  const first = useRef(true);
  const selected = useMemo(() => {
    let best: string | null = null;
    let span = Infinity;
    for (const l of LANDMARKS) {
      if (l.verses && verse >= l.verses[0] && verse <= l.verses[1] && l.verses[1] - l.verses[0] < span) {
        best = l.id;
        span = l.verses[1] - l.verses[0];
      }
    }
    return best;
  }, [verse]);

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05);
    const snap = first.current;
    first.current = false;
    const k = snap ? 1 : 1 - Math.exp(-dt * 2);
    const t = shared.uTime.value;

    easeWater(world.water.colors, theme, k, tmp.w);
    tmp.a.set("#ffffff").lerp(tmp.b.set(theme.ground), 0.18);
    world.groundMat.color.lerp(tmp.a, k);

    world.route.mat.uniforms.uProgress.value = progressRef.current ?? 0;
    world.boats.forEach((b) => {
      b.obj.position.y = b.y + Math.sin(t * 1.1 + b.phase) * 0.03;
      b.obj.rotation.z = Math.sin(t * 0.9 + b.phase) * 0.05;
    });
    world.army.position.y += Math.sin(t * 3) * 0.0004;

    for (const l of LANDMARKS) {
      const b = world.beams[l.id];
      const on = l.id === selected || l.id === focusId ? 1 : 0;
      b.weight = damp(b.weight, on, 4, dt);
      b.mat.uniforms.uOpacity.value = 0.22 + b.weight * 0.7;
      b.head.position.y = b.top.y + Math.sin(t * 2 + l.x) * 0.06 + b.weight * 0.08;
      b.head.rotation.y = t * 1.2;
      b.head.scale.setScalar(0.8 + b.weight * 0.7);
      const mat = b.ring.material as THREE.MeshBasicMaterial;
      mat.opacity = b.weight * (0.55 + 0.25 * Math.sin(t * 3));
      b.ring.scale.setScalar(1 + (0.5 - 0.5 * Math.cos(t * 2)) * 0.15 * b.weight);
    }

    // project DOM labels
    const els = labels.current;
    // labels fade out where they would sit on top of the bird
    proj.copy(birdPos.current).project(camera);
    const bx = (proj.x * 0.5 + 0.5) * size.width;
    const by = (-proj.y * 0.5 + 0.5) * size.height;
    const place = (id: string, x: number, y: number, z: number) => {
      const el = els[id];
      if (!el) return;
      proj.set(x, y, z).project(camera);
      const hidden = proj.z > 1 || Math.abs(proj.x) > 1.15 || Math.abs(proj.y) > 1.15;
      if (hidden) {
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        return;
      }
      const px = (proj.x * 0.5 + 0.5) * size.width;
      const py = (-proj.y * 0.5 + 0.5) * size.height;
      const dist = camera.position.distanceTo(new THREE.Vector3(x, y, z));
      const fade = 1 - THREE.MathUtils.smoothstep(dist, 45, 80);
      const away = THREE.MathUtils.smoothstep(Math.hypot(px - bx, py - 14 - by), 40, 120);
      el.style.opacity = String(fade * (0.1 + 0.9 * away));
      el.style.pointerEvents = fade > 0.3 ? "auto" : "none";
      el.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) translate(-50%, -100%)`;
      el.style.zIndex = String(Math.round(1000 - dist));
    };
    for (const l of LANDMARKS) {
      const b = world.beams[l.id];
      place(l.id, b.top.x, b.top.y + 1.0, b.top.z);
    }
    for (const sl of SCENERY_LABELS) {
      place(sl.id, sl.x, sl.y + Math.max(terrainHeight(sl.x, sl.z), 0), sl.z);
    }
    void state;
  });

  return (
    <>
      <primitive object={world.root} />
      <MapBird world={world} verse={verse} calm={calm} progressRef={progressRef} birdPos={birdPos} />
      <CameraRig mode={mode} focusId={focusId} focusNonce={focusNonce} birdPos={birdPos} />
    </>
  );
}

/* -------------------------------------------------------------------------- */

export default function MapScene(props: Props) {
  const theme = THEMES[sectionOfVerse(props.verse).theme];
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: ORBIT_HOME.pos.toArray(), fov: 42, near: 0.1, far: 400 }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
    >
      <Atmosphere theme={theme} calm={props.calm} fogScale={0.5} />
      <Sky theme={theme} calm={props.calm} />
      <World {...props} />
      <PostFX calm={props.calm} bloom={0.7} />
      <ReadySignal id="map" />
    </Canvas>
  );
}
