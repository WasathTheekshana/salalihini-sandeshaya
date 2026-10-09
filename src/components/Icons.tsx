import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export const ArrowLeft = (p: P) => (
  <svg {...base} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
export const ArrowRight = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const Play = (p: P) => (
  <svg {...base} {...p}>
    <path d="M7 5l12 7-12 7z" />
  </svg>
);
export const Pause = (p: P) => (
  <svg {...base} {...p}>
    <path d="M8 5v14M16 5v14" />
  </svg>
);
export const Wind = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7" />
  </svg>
);
export const Map = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14" />
  </svg>
);
export const Book = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M9 7h6" />
  </svg>
);
export const Copy = (p: P) => (
  <svg {...base} {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
  </svg>
);
export const Check = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);
export const Feather = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20 4c-6 0-12 3-12 10v4M20 4c0 6-3 10-9 10M8 18l-4 2M13 11H8" />
  </svg>
);

/** Little starling used as the progress marker and logo glyph. */
export const BirdMark = (p: P) => (
  <svg viewBox="0 0 32 24" fill="currentColor" aria-hidden width={20} height={15} {...p}>
    <path d="M30 8l-5 1.6C23 5 19 3 13 4 8 5 5 8 3 13l7-2c-1 3-1 6 1 9 2-3 5-5 9-5l6-1c3 0 4-3 4-6z" />
    <circle cx="25.5" cy="8.2" r="0.9" fill="#0b0820" />
  </svg>
);

export const Globe = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
  </svg>
);
export const Pin = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </svg>
);

export const Smile = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 14c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4M9 9.5h.01M15 9.5h.01" />
  </svg>
);
