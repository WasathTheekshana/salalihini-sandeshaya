"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { markReady } from "@/lib/loading";

/**
 * Drop inside a <Canvas>. Reports "ready" after a few frames have actually rendered, which is
 * after shaders are compiled and textures uploaded, so the loading screen never lifts early.
 */
export function ReadySignal({ id }: { id: string }) {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current > 4) return;
    frames.current++;
    if (frames.current === 4) markReady(id);
  });
  return null;
}
