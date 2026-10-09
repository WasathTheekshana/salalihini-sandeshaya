"use client";

import { BlendFunction, Effect } from "postprocessing";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { useMemo } from "react";
import { Uniform } from "three";

/**
 * Triangular-noise dither applied in sRGB just before output. Smooth gradients (the sky) are
 * quantised to 8 bits on screen, which shows up as bands; a little noise breaks them up.
 */
class DitherEffect extends Effect {
  constructor() {
    super(
      "DitherEffect",
      /* glsl */ `
      uniform float strength;
      float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec3 srgb = pow(max(inputColor.rgb, 0.0), vec3(1.0 / 2.2));
        float n = h(gl_FragCoord.xy) + h(gl_FragCoord.yx * 1.31 + 17.0) - 1.0;
        srgb += n * strength;
        outputColor = vec4(pow(max(srgb, 0.0), vec3(2.2)), inputColor.a);
      }`,
      { blendFunction: BlendFunction.NORMAL, uniforms: new Map([["strength", new Uniform(1.8 / 255)]]) },
    );
  }
}

/** Soft glow on lamps, sun and embers, film grain, a vignette, and banding-free output. */
export function PostFX({ calm, bloom = 0.85 }: { calm: boolean; bloom?: number }) {
  const dither = useMemo(() => new DitherEffect(), []);
  return (
    <EffectComposer multisampling={calm ? 0 : 4}>
      <Bloom intensity={bloom} luminanceThreshold={0.72} luminanceSmoothing={0.25} mipmapBlur radius={0.75} />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={calm ? 0.3 : 0.5} />
      <Vignette eskil={false} offset={0.25} darkness={0.6} />
      <primitive object={dither} />
    </EffectComposer>
  );
}
