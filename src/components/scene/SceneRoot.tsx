"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useState } from "react";
import { usePrefs } from "@/components/providers/Prefs";
import { Atmosphere } from "@/components/three/Atmosphere";
import { PostFX } from "@/components/three/PostFX";
import { ReadySignal } from "@/components/three/ReadySignal";
import { Stage } from "@/components/three/Stage";
import { sectionOfVerse } from "@/data/sections";
import { useJourney } from "@/hooks/useJourney";
import { THEMES } from "@/lib/themes";
import { Particles } from "./Particles";
import { Sky } from "./Sky";

/** Subtle camera parallax that follows the pointer. */
function Rig({ calm }: { calm: boolean }) {
  useFrame((state, dt) => {
    const k = 1 - Math.exp(-dt * 2);
    const s = calm ? 0.1 : 0.55;
    state.camera.position.x += (state.pointer.x * s - state.camera.position.x) * k;
    state.camera.position.y += (state.pointer.y * s * 0.6 - state.camera.position.y) * k;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function SceneRoot() {
  const { n, themeId } = useJourney();
  const { calm } = usePrefs();
  const theme = THEMES[themeId];
  const silhouette = n === null ? "none" : sectionOfVerse(n).silhouette;
  const [count] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? 110 : 240,
  );

  return (
    <Canvas
      className="!pointer-events-none"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 8], fov: 45, near: 0.1, far: 220 }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      eventSource={document.body}
      eventPrefix="client"
      aria-hidden
    >
      <Atmosphere theme={theme} calm={calm} />
      <Sky theme={theme} calm={calm} />
      <Stage theme={theme} silhouette={silhouette} calm={calm} />
      <Particles theme={theme} calm={calm} count={count} />
      <Rig calm={calm} />
      <PostFX calm={calm} />
      <ReadySignal id="scene" />
    </Canvas>
  );
}
