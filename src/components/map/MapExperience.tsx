"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "@/components/Icons";
import { usePrefs } from "@/components/providers/Prefs";
import { TOTAL_VERSES } from "@/data/sections";
import { pad, verseHref } from "@/lib/paths";
import { LANDMARKS, SCENERY_LABELS, landmarkForVerse } from "./geo";
import type { CamMode } from "./MapScene";

const MapScene = dynamic(() => import("./MapScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center text-ink-soft">
      <p className="font-display text-xl italic">Unfolding the map…</p>
    </div>
  ),
});

export type MapVerse = {
  n: number;
  lines: string[];
  en: string;
  si: string;
  sectionEn: string;
  sectionSi: string;
};

const MODES: { id: CamMode; label: string; hint: string }[] = [
  { id: "orbit", label: "Explore", hint: "Drag to rotate, scroll to zoom" },
  { id: "follow", label: "Follow the bird", hint: "The camera trails the starling" },
  { id: "top", label: "Map", hint: "Looking straight down" },
];

export function MapExperience({ verses }: { verses: MapVerse[] }) {
  const params = useSearchParams();
  const { calm } = usePrefs();
  const initial = (() => {
    const v = Number(params.get("v"));
    return Number.isInteger(v) && v >= 1 && v <= TOTAL_VERSES ? v : 1;
  })();

  const [verse, setVerse] = useState(initial);
  const [mode, setMode] = useState<CamMode>("orbit");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [focusNonce, setFocusNonce] = useState(0);
  const [playing, setPlaying] = useState(false);
  const labels = useRef<Record<string, HTMLElement | null>>({});
  const progressRef = useRef(0);

  const current = verses[verse - 1];
  const place = landmarkForVerse(verse);
  const modeInfo = MODES.find((m) => m.id === mode)!;

  // keep the URL shareable without re-rendering the route
  useEffect(() => {
    window.history.replaceState(null, "", `?v=${verse}`);
  }, [verse]);

  // guided flight along the route
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setVerse((v) => {
        if (v >= TOTAL_VERSES) {
          setPlaying(false);
          return v;
        }
        return v + 1;
      });
    }, 1200);
    return () => window.clearInterval(id);
  }, [playing]);

  const pick = useCallback((id: string) => {
    const l = LANDMARKS.find((x) => x.id === id);
    if (!l) return;
    setFocusId(id);
    setFocusNonce((n) => n + 1);
    if (l.verses) setVerse(l.verses[0]);
    setPlaying(false);
  }, []);

  const focusLandmark = LANDMARKS.find((l) => l.id === (focusId ?? place?.id)) ?? place;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <MapScene
        verse={verse}
        mode={mode}
        focusId={focusId}
        focusNonce={focusNonce}
        labels={labels}
        calm={calm}
        progressRef={progressRef}
      />

      {/* landmark labels are positioned from the 3D scene every frame */}
      <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
        {LANDMARKS.map((l) => {
          const active = place?.id === l.id;
          return (
            <button
              key={l.id}
              ref={(el) => {
                labels.current[l.id] = el;
              }}
              type="button"
              onClick={() => pick(l.id)}
              className={`absolute left-0 top-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-left text-[0.7rem] leading-tight backdrop-blur-md transition-colors will-change-transform ${
                active
                  ? "border-gold bg-[#2b1c06]/85 text-ink shadow-[0_0_24px_-4px_rgba(242,196,109,0.8)]"
                  : "border-line bg-black/55 text-ink-soft hover:border-gold/60 hover:text-ink"
              }`}
              style={{ opacity: 0 }}
            >
              <span className="block font-medium">{l.en}</span>
              {active && (
                <span lang="si" className="block font-sinhala text-[0.7rem] text-ink-faint">
                  {l.si}
                </span>
              )}
            </button>
          );
        })}
        {SCENERY_LABELS.map((l) => (
          <span
            key={l.id}
            ref={(el) => {
              labels.current[l.id] = el;
            }}
            className="absolute left-0 top-0 whitespace-nowrap font-display text-sm italic text-white/70 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]"
            style={{ opacity: 0 }}
          >
            {l.en}
          </span>
        ))}
      </div>

      {/* top-right camera modes */}
      <div className="absolute right-4 top-20 z-10 flex flex-col items-end gap-2 sm:right-6">
        <div role="tablist" aria-label="Camera" className="flex rounded-full border border-line bg-black/50 p-1 text-sm backdrop-blur-md">
          {MODES.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => setMode(m.id)}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                mode === m.id ? "bg-gold text-black" : "text-ink-soft hover:text-ink"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="rounded-full bg-black/40 px-3 py-1 text-xs text-ink-faint backdrop-blur">{modeInfo.hint}</p>
      </div>

      {/* top-left place card */}
      {focusLandmark && (
        <aside className="glass absolute left-4 top-20 z-10 hidden w-[19rem] rounded-3xl p-5 sm:left-6 md:block">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-gold">
            {focusLandmark.verses
              ? focusLandmark.verses[0] === focusLandmark.verses[1]
                ? `Verse ${focusLandmark.verses[0]}`
                : `Verses ${focusLandmark.verses[0]}–${focusLandmark.verses[1]}`
              : "Scenery"}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-tight">{focusLandmark.en}</h2>
          <p lang="si" className="font-elu text-base text-ink-soft">
            {focusLandmark.si}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{focusLandmark.blurbEn}</p>
          <p lang="si" className="mt-2 font-sinhala text-sm leading-[1.9] text-ink-faint">
            {focusLandmark.blurbSi}
          </p>
          {focusLandmark.verses && (
            <Link
              href={verseHref(focusLandmark.verses[0])}
              className="mt-4 inline-flex rounded-full border border-gold/50 bg-gold/15 px-4 py-2 text-sm transition hover:bg-gold/25"
            >
              Read these verses →
            </Link>
          )}
        </aside>
      )}

      {/* bottom verse bar */}
      <section
        aria-label="Verse on the map"
        className="glass absolute inset-x-3 bottom-3 z-10 mx-auto max-w-4xl rounded-3xl p-4 sm:bottom-5 sm:p-5"
      >
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause the flight" : "Play the flight"}
            className="mt-1 grid size-12 shrink-0 place-items-center rounded-full border border-gold/60 bg-gold/15 text-gold transition hover:bg-gold/25"
          >
            {playing ? <Pause /> : <Play />}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 text-xs text-ink-faint">
              <span className="font-display text-sm uppercase tracking-[0.25em] text-gold">Verse {pad(verse)}</span>
              <span className="font-elu text-ink-soft">{current.sectionSi}</span>
              <span className="font-display italic">{current.sectionEn}</span>
            </div>
            <p lang="si" className="mt-1.5 line-clamp-2 font-elu text-[1.05rem] leading-snug text-ink sm:text-lg">
              {current.lines.slice(0, 2).join("  ")}
            </p>
            <p className="mt-1 line-clamp-2 font-display text-[1.02rem] leading-snug text-ink-soft sm:text-lg">{current.en}</p>
          </div>
          <Link
            href={verseHref(verse)}
            className="hidden shrink-0 self-center rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition hover:border-gold/50 hover:text-ink sm:block"
          >
            Read verse →
          </Link>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setVerse((v) => Math.max(1, v - 1))}
            className="rounded-full border border-line px-3 py-1 text-sm text-ink-soft hover:text-ink"
            aria-label="Previous verse"
          >
            ←
          </button>
          <input
            type="range"
            min={1}
            max={TOTAL_VERSES}
            value={verse}
            onChange={(e) => {
              setPlaying(false);
              setVerse(Number(e.target.value));
            }}
            aria-label="Verse"
            className="h-2 w-full cursor-pointer accent-[#f2c46d]"
          />
          <button
            type="button"
            onClick={() => setVerse((v) => Math.min(TOTAL_VERSES, v + 1))}
            className="rounded-full border border-line px-3 py-1 text-sm text-ink-soft hover:text-ink"
            aria-label="Next verse"
          >
            →
          </button>
        </div>
      </section>
    </div>
  );
}
