"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Component, type ReactNode } from "react";
import { markReady } from "@/lib/loading";

// three.js is large and WebGL-only: load it after first paint, never on the server.
const SceneRoot = dynamic(() => import("./SceneRoot"), { ssr: false });
const BirdOverlay = dynamic(() => import("./BirdOverlay"), { ssr: false });

/** If WebGL is unavailable the CSS backdrop underneath still gives a calm gradient. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    // no WebGL: the CSS sky stays, and the loading screen must not wait for the canvases
    markReady("scene");
    markReady("bird");
    markReady("map");
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function SceneLoader() {
  // The map page owns its own canvas; never run two WebGL contexts at once.
  const pathname = usePathname();
  if (pathname.startsWith("/map")) return null;
  return (
    <>
      <div className="fixed inset-0 -z-10" aria-hidden>
        <SceneBoundary>
          <SceneRoot />
        </SceneBoundary>
      </div>
      {/* the bird flies behind the poem and meaning cards, in front of the sky */}
      <div className="pointer-events-none fixed inset-0 -z-[5]" aria-hidden>
        <SceneBoundary>
          <BirdOverlay />
        </SceneBoundary>
      </div>
    </>
  );
}
