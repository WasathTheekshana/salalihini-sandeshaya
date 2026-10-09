import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS home-screen icon: the same myna mark as icon.svg, full-bleed (iOS rounds the corners itself). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="180" height="180">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1a1240" />
              <stop offset="0.55" stopColor="#8a2f6c" />
              <stop offset="1" stopColor="#f29a4d" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" fill="url(#sky)" />
          <path d="M33 35 C33 25 38 17 47 11 C47 22 44 31 40 37 Z" fill="#f0cf9c" />
          <path d="M18 38 L5 45 L8 38.5 L5 32.5 Z" fill="#fff1d6" />
          <ellipse cx="30" cy="40" rx="15" ry="7.6" transform="rotate(-8 30 40)" fill="#fff1d6" />
          <path d="M27 38 C19 30 17 20 11 11 C23 12 33 20 39 35 Z" fill="#fffaf0" />
          <circle cx="44.5" cy="35.5" r="6.6" fill="#241a36" />
          <path d="M49.5 33.4 L59 36.8 L50 38.8 Z" fill="#f6c32c" />
          <circle cx="46" cy="34" r="1.7" fill="#f6c32c" />
          <circle cx="46.4" cy="34" r="0.7" fill="#241a36" />
        </svg>
      </div>
    ),
    size,
  );
}
