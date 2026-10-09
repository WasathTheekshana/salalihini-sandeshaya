"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getReadySnapshot, markLoaded, markReady } from "@/lib/loading";

const MIN_MS = 1500; // never flash: always show the screen at least this long
const MAX_MS = 12000; // never trap: give up waiting after this long
const FADE_MS = 750;

const STATUS = [
  { at: 0, en: "Waking the starling…", si: "සැළලිහිණිය අවදි වේ…" },
  { at: 0.35, en: "Painting the sky…", si: "අහස සිතුවම් කරයි…" },
  { at: 0.72, en: "Filling the valley…", si: "මිටියාවත පුරවයි…" },
  { at: 0.97, en: "Ready", si: "සූදානම්" },
];

const STARS = [
  "radial-gradient(1.2px 1.2px at 12% 18%, #fff, transparent)",
  "radial-gradient(1px 1px at 27% 62%, #ffe9c4, transparent)",
  "radial-gradient(1.4px 1.4px at 41% 12%, #fff, transparent)",
  "radial-gradient(1px 1px at 63% 28%, #ffe9c4, transparent)",
  "radial-gradient(1.2px 1.2px at 78% 70%, #fff, transparent)",
  "radial-gradient(1px 1px at 88% 15%, #fff, transparent)",
  "radial-gradient(1px 1px at 8% 80%, #ffe9c4, transparent)",
  "radial-gradient(1.3px 1.3px at 52% 84%, #fff, transparent)",
  "radial-gradient(1px 1px at 93% 46%, #ffe9c4, transparent)",
  "radial-gradient(1px 1px at 34% 36%, #fff, transparent)",
].join(",");

/**
 * First-load screen. It is part of the server HTML, so it paints before any JavaScript runs,
 * waits for the fonts and for the 3D sky and bird to render their first frames, then fades out.
 */
export function LoadingScreen() {
  const pathname = usePathname();
  // which parts must be ready depends on the page we landed on
  const required = useRef<string[] | null>(null);
  if (required.current === null) {
    required.current = pathname.startsWith("/map") ? ["fonts", "map"] : ["fonts", "scene", "bird"];
  }

  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const en = useRef<HTMLSpanElement>(null);
  const si = useRef<HTMLSpanElement>(null);

  // keep the page from scrolling behind the screen
  useEffect(() => {
    if (gone) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [gone]);

  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => markReady("fonts"), () => markReady("fonts"));

    const start = performance.now();
    let last = start;
    let p = 0;
    let statusIdx = -1;
    let finishing = false;
    let raf = 0;

    const finish = () => {
      if (finishing) return;
      finishing = true;
      setLeaving(true);
      markLoaded(); // lets the reader replay its entrance while the screen fades
      window.setTimeout(() => !cancelled && setGone(true), FADE_MS);
    };

    const tick = (now: number) => {
      if (cancelled) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const elapsed = now - start;

      const readyKeys = getReadySnapshot().split(",");
      const need = required.current!;
      const frac = need.filter((k) => readyKeys.includes(k)).length / need.length;
      const allReady = frac >= 1;

      // real progress, with a slow creep so the bar never looks frozen between signals
      const creep = Math.min(elapsed / 7000, 1) * 0.1;
      const target = allReady ? 1 : Math.min(0.92, frac * 0.82 + creep);
      p += (target - p) * (1 - Math.exp(-dt * 4.5));

      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
      if (pct.current) pct.current.textContent = `${Math.round(p * 100)}`;
      let idx = 0;
      for (let i = 0; i < STATUS.length; i++) if (p >= STATUS[i].at) idx = i;
      if (idx !== statusIdx) {
        statusIdx = idx;
        if (en.current) en.current.textContent = STATUS[idx].en;
        if (si.current) si.current.textContent = STATUS[idx].si;
      }

      if ((allReady && elapsed >= MIN_MS && p > 0.985) || elapsed > MAX_MS) {
        if (bar.current) bar.current.style.transform = "scaleX(1)";
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={!leaving}
      aria-label="Loading"
      className={`fixed inset-0 z-[100] grid place-items-center overflow-hidden transition-opacity ease-out ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{
        transitionDuration: `${FADE_MS}ms`,
        background:
          "radial-gradient(120% 80% at 50% 112%, rgba(242,154,77,0.55), rgba(138,47,108,0.28) 45%, transparent 70%), linear-gradient(180deg, #100a2c 0%, #1d1342 55%, #32164f 100%)",
      }}
    >
      <div aria-hidden className="loader-stars absolute inset-0" style={{ backgroundImage: STARS }} />

      <div className="relative flex flex-col items-center px-6 text-center">
        {/* the app icon, with its wing beating */}
        <svg viewBox="0 0 64 64" width="104" height="104" className="loader-float drop-shadow-[0_18px_40px_rgba(242,154,77,0.35)]" aria-hidden>
          <defs>
            <linearGradient id="ld-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1a1240" />
              <stop offset="0.55" stopColor="#8a2f6c" />
              <stop offset="1" stopColor="#f29a4d" />
            </linearGradient>
            <radialGradient id="ld-glow" cx="0.5" cy="1" r="0.8">
              <stop offset="0" stopColor="#ffd58a" stopOpacity="0.9" />
              <stop offset="1" stopColor="#ffd58a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="64" height="64" rx="15" fill="url(#ld-sky)" />
          <rect width="64" height="64" rx="15" fill="url(#ld-glow)" />
          <g className="loader-wing-far">
            <path d="M33 35 C33 25 38 17 47 11 C47 22 44 31 40 37 Z" fill="#f0cf9c" />
          </g>
          <path d="M18 38 L5 45 L8 38.5 L5 32.5 Z" fill="#fff1d6" />
          <ellipse cx="30" cy="40" rx="15" ry="7.6" transform="rotate(-8 30 40)" fill="#fff1d6" />
          <g className="loader-wing">
            <path d="M27 38 C19 30 17 20 11 11 C23 12 33 20 39 35 Z" fill="#fffaf0" />
            <path d="M27 38 C21 31 18 24 15 17 C22 20 29 26 33 35 Z" fill="#e9c58f" opacity="0.55" />
          </g>
          <circle cx="44.5" cy="35.5" r="6.6" fill="#241a36" />
          <path d="M49.5 33.4 L59 36.8 L50 38.8 Z" fill="#f6c32c" />
          <circle cx="46" cy="34" r="1.7" fill="#f6c32c" />
          <circle cx="46.4" cy="34" r="0.7" fill="#241a36" />
        </svg>

        <p className="mt-8 font-elu text-3xl font-semibold tracking-wide text-ink sm:text-4xl">සැළලිහිණි සංදේශය</p>
        <p className="mt-1 font-display text-xl italic text-ink-soft sm:text-2xl">The Starling&rsquo;s Message</p>

        <div className="mt-10 w-60 sm:w-72">
          <div className="h-[3px] overflow-hidden rounded-full bg-white/15">
            <div
              ref={bar}
              className="h-full origin-left rounded-full"
              style={{
                transform: "scaleX(0)",
                background: "linear-gradient(90deg, #f29a4d, #ffd58a)",
                boxShadow: "0 0 14px rgba(255,213,138,0.7)",
              }}
            />
          </div>
          <div className="mt-3 flex items-baseline justify-between text-xs text-ink-faint">
            <span>
              <span ref={en}>{STATUS[0].en}</span>
              <span className="mx-2 opacity-50">·</span>
              <span ref={si} lang="si" className="font-sinhala">
                {STATUS[0].si}
              </span>
            </span>
            <span className="tabular-nums">
              <span ref={pct}>0</span>%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
