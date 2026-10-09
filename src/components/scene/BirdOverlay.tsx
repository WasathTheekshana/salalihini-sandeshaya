"use client";

import { Canvas } from "@react-three/fiber";
import { usePrefs } from "@/components/providers/Prefs";
import { ReadySignal } from "@/components/three/ReadySignal";
import { BirdLights, Starling } from "@/components/three/Starling";
import { useJourney } from "@/hooks/useJourney";

/**
 * The bird lives on its own transparent canvas between the sky and the page content, so she
 * flies behind the poem cards and stays crisp in the open margins.
 */
export default function BirdOverlay() {
  const { n, progress } = useJourney();
  const { calm } = usePrefs();
  return (
    <Canvas
      className="!pointer-events-none"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8], fov: 45, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      eventSource={document.body}
      eventPrefix="client"
      aria-hidden
    >
      <BirdLights />
      <Starling progress={progress} calm={calm} verse={n} />
      <ReadySignal id="bird" />
    </Canvas>
  );
}
