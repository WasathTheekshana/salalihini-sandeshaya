import type { ThemeId } from "@/data/sections";

export type Theme = {
  /** Sky gradient, top to bottom (hex) */
  top: string;
  mid: string;
  bottom: string;
  /** Accent used for UI highlights, glow, bird emissive */
  accent: string;
  /** Particle colours */
  particleA: string;
  particleB: string;
  /** 0 = glow dot, 1 = petal */
  petal: number;
  /** Vertical drift, positive rises (embers), negative falls (petals) */
  drift: number;
  sway: number;
  /** Particle brightness / density multiplier 0..1 */
  density: number;
  /** Sun: x,y in -1..1 screen space, radius, strength 0..1 */
  sun: [number, number, number, number];
  sunColor: string;
  /** Moon: x,y, radius, strength */
  moon: [number, number, number, number];
  /** Stars strength 0..1 */
  stars: number;
  /** Silhouette fill colour for the foreground skyline */
  ground: string;
};

export const THEMES: Record<ThemeId, Theme> = {
  dawn: {
    top: "#241a52",
    mid: "#b5527a",
    bottom: "#f6b36a",
    accent: "#ffd58a",
    particleA: "#ffe3a8",
    particleB: "#ffb3c7",
    petal: 1,
    drift: -0.12,
    sway: 0.9,
    density: 0.7,
    sun: [0.1, -0.35, 0.34, 0.95],
    sunColor: "#ffd9a0",
    moon: [0, 0, 0, 0],
    stars: 0.2,
    ground: "#1a0f2e",
  },
  court: {
    top: "#3a0f22",
    mid: "#b03a3a",
    bottom: "#f2b84b",
    accent: "#ffcc66",
    particleA: "#ffd27a",
    particleB: "#ff8a5c",
    petal: 0,
    drift: 0.18,
    sway: 0.5,
    density: 1,
    sun: [-0.35, -0.2, 0.3, 0.75],
    sunColor: "#ffc56b",
    moon: [0, 0, 0, 0],
    stars: 0.05,
    ground: "#26091a",
  },
  dusk: {
    top: "#1c1a4a",
    mid: "#7a3f7e",
    bottom: "#f0875a",
    accent: "#ffb27a",
    particleA: "#ffd0a0",
    particleB: "#ff9ac0",
    petal: 0,
    drift: 0.1,
    sway: 0.7,
    density: 0.8,
    sun: [0.35, -0.5, 0.28, 0.8],
    sunColor: "#ff9a5c",
    moon: [-0.55, 0.55, 0.06, 0.4],
    stars: 0.35,
    ground: "#150f33",
  },
  night: {
    top: "#03051a",
    mid: "#0b1440",
    bottom: "#1d2f6e",
    accent: "#a9c4ff",
    particleA: "#cfe0ff",
    particleB: "#ffe9a8",
    petal: 0,
    drift: 0.05,
    sway: 0.4,
    density: 0.9,
    sun: [0, 0, 0, 0],
    sunColor: "#000000",
    moon: [0.45, 0.5, 0.11, 1],
    stars: 1,
    ground: "#02030f",
  },
  morning: {
    top: "#33346e",
    mid: "#ee8f6f",
    bottom: "#ffd08a",
    accent: "#ffe0a0",
    particleA: "#fff0c0",
    particleB: "#ffc7a0",
    petal: 0,
    drift: 0.14,
    sway: 0.6,
    density: 0.7,
    sun: [0.3, -0.4, 0.42, 1],
    sunColor: "#fff1b8",
    moon: [0, 0, 0, 0],
    stars: 0.1,
    ground: "#1c1636",
  },
  road: {
    top: "#1a6aa0",
    mid: "#6cc0c0",
    bottom: "#e9f0b0",
    accent: "#d9ff9a",
    particleA: "#ffffff",
    particleB: "#fff6a8",
    petal: 1,
    drift: -0.05,
    sway: 1.2,
    density: 0.6,
    sun: [-0.45, 0.5, 0.16, 0.85],
    sunColor: "#fffbe0",
    moon: [0, 0, 0, 0],
    stars: 0,
    ground: "#0b3b3a",
  },
  river: {
    top: "#06303c",
    mid: "#13826f",
    bottom: "#7fd6b0",
    accent: "#9dffd8",
    particleA: "#bffff0",
    particleB: "#ffffd0",
    petal: 0,
    drift: 0.08,
    sway: 1,
    density: 0.85,
    sun: [0.5, 0.3, 0.2, 0.55],
    sunColor: "#fff4c0",
    moon: [0, 0, 0, 0],
    stars: 0,
    ground: "#04201f",
  },
  sunset: {
    top: "#2a1250",
    mid: "#c0396e",
    bottom: "#ff8a3d",
    accent: "#ffa860",
    particleA: "#ffd0a0",
    particleB: "#ff7a9a",
    petal: 0,
    drift: 0.06,
    sway: 0.8,
    density: 0.85,
    sun: [0.0, -0.62, 0.38, 1],
    sunColor: "#ff9040",
    moon: [-0.6, 0.55, 0.05, 0.35],
    stars: 0.25,
    ground: "#1a0a2a",
  },
  lamplight: {
    top: "#0d1445",
    mid: "#3a2a7a",
    bottom: "#e0a850",
    accent: "#ffd27a",
    particleA: "#ffd890",
    particleB: "#fff0c0",
    petal: 0,
    drift: 0.2,
    sway: 0.6,
    density: 1,
    sun: [0, 0, 0, 0],
    sunColor: "#000000",
    moon: [0.5, 0.55, 0.09, 0.9],
    stars: 0.7,
    ground: "#0a0d2c",
  },
  sacred: {
    top: "#3a1a08",
    mid: "#b5651d",
    bottom: "#ffd36e",
    accent: "#ffd36e",
    particleA: "#ffe9a0",
    particleB: "#ffb347",
    petal: 1,
    drift: -0.08,
    sway: 0.8,
    density: 0.9,
    sun: [0.0, -0.1, 0.45, 0.6],
    sunColor: "#ffe28a",
    moon: [0, 0, 0, 0],
    stars: 0.1,
    ground: "#1d0d05",
  },
  devale: {
    top: "#220a30",
    mid: "#8a2a6a",
    bottom: "#f06a7a",
    accent: "#ff9ac0",
    particleA: "#ffb3d1",
    particleB: "#ffe0a0",
    petal: 1,
    drift: -0.1,
    sway: 1.3,
    density: 1,
    sun: [0, 0, 0, 0],
    sunColor: "#000000",
    moon: [0.5, 0.5, 0.07, 0.6],
    stars: 0.4,
    ground: "#13061c",
  },
  divine: {
    top: "#030a2e",
    mid: "#0e3a9a",
    bottom: "#3ea0ff",
    accent: "#a8d8ff",
    particleA: "#bfe0ff",
    particleB: "#ffe08a",
    petal: 0,
    drift: 0.15,
    sway: 0.5,
    density: 1,
    sun: [0, -0.1, 0.5, 0.35],
    sunColor: "#6ac0ff",
    moon: [0, 0, 0, 0],
    stars: 1,
    ground: "#020720",
  },
  moonlit: {
    top: "#070c2a",
    mid: "#243a8a",
    bottom: "#9bb4f0",
    accent: "#e8eeff",
    particleA: "#e8f0ff",
    particleB: "#ffe9a8",
    petal: 0,
    drift: 0.1,
    sway: 0.7,
    density: 0.95,
    sun: [0, 0, 0, 0],
    sunColor: "#000000",
    moon: [-0.35, 0.45, 0.14, 1],
    stars: 0.9,
    ground: "#050820",
  },
};

export const DEFAULT_THEME: ThemeId = "dawn";

/** 0 = bright day, 1 = deep night. Drives window glow and star-lit shading. */
export function nightOf(t: Theme): number {
  return Math.min(1, Math.max(0, t.stars * 1.1 - t.sun[3] * 0.6));
}
