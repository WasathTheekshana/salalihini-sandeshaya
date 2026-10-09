"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, Pin } from "@/components/Icons";
import { JourneyRail } from "@/components/JourneyRail";
import { usePrefs, type Lang } from "@/components/providers/Prefs";
import { TOTAL_VERSES } from "@/data/sections";
import { pad, verseHref } from "@/lib/paths";

export type ReaderVerse = {
  n: number;
  lines: string[];
  si: string;
  en: string;
  note?: { si: string; en: string };
  approximate: boolean;
  section: {
    si: string;
    en: string;
    from: number;
    to: number;
    descSi: string;
    descEn: string;
  };
};

export type NeighbourInfo = { n: number; sectionEn: string; newSection: boolean } | null;

const LANGS: { id: Lang; label: string }[] = [
  { id: "si", label: "සිංහල" },
  { id: "both", label: "Both" },
  { id: "en", label: "English" },
];

const ease = [0.22, 1, 0.36, 1] as const;

function isTyping(el: EventTarget | null) {
  return el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
}

export function VerseReader({
  verse,
  prev,
  next,
}: {
  verse: ReaderVerse;
  prev: NeighbourInfo;
  next: NeighbourInfo;
}) {
  const router = useRouter();
  const { lang, setLang, autoplay, setAutoplay } = usePrefs();
  const [copied, setCopied] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (n: number | undefined) => {
      if (n) router.push(verseHref(n));
    },
    [router],
  );

  // Arrow keys move between verses.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.key === "ArrowRight") go(next?.n);
      else if (e.key === "ArrowLeft") go(prev?.n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, next, prev]);

  // Guided flight: advance after a reading pause that scales with verse length.
  useEffect(() => {
    if (!autoplay) return;
    if (!next) {
      setAutoplay(false);
      return;
    }
    const ms = 11000 + (verse.si.length + verse.en.length) * 22;
    const id = window.setTimeout(() => go(next.n), ms);
    return () => window.clearTimeout(id);
  }, [autoplay, next, verse.n, verse.si.length, verse.en.length, go, setAutoplay]);

  const copy = async () => {
    const text = `${verse.lines.join("\n")}\n\n${verse.en}\n\n— Salalihini Sandeshaya, verse ${verse.n}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };

  const long = verse.lines.length > 6;
  const showSi = lang === "si" || lang === "both";
  const showEn = lang === "en" || lang === "both";

  return (
    <>
      <main
        id="main"
        className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-36 pt-24 sm:px-6"
        onPointerDown={(e) => {
          if (e.pointerType === "touch") touch.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const s = touch.current;
          touch.current = null;
          if (!s || e.pointerType !== "touch") return;
          const dx = e.clientX - s.x;
          const dy = e.clientY - s.y;
          if (Math.abs(dx) > 70 && Math.abs(dy) < 45) go(dx < 0 ? next?.n : prev?.n);
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft"
        >
          <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-elu text-gold">
            {verse.section.si}
          </span>
          <span className="font-display text-lg italic">{verse.section.en}</span>
          <span className="text-xs tabular-nums text-ink-faint">
            verses {verse.section.from}
            {verse.section.to > verse.section.from ? `–${verse.section.to}` : ""}
          </span>
        </motion.div>

        <div className="grid flex-1 items-start gap-5 lg:grid-cols-[1.05fr_1fr] lg:gap-7">
          {/* ---------- the verse ---------- */}
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="glass relative overflow-hidden rounded-[1.75rem] p-6 sm:p-9 lg:sticky lg:top-24"
            aria-labelledby="verse-heading"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[9rem] font-semibold leading-none text-white/[0.06] sm:text-[12rem]"
            >
              {pad(verse.n)}
            </span>

            <div className="relative flex items-center gap-3">
              <h1 id="verse-heading" className="font-display text-sm uppercase tracking-[0.3em] text-gold">
                Verse {pad(verse.n)}
              </h1>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.1, delay: 0.2, ease }}
                className="rule-gold h-px w-16 origin-left sm:w-28"
              />
              <span className="text-xs text-ink-faint">of {TOTAL_VERSES}</span>
            </div>

            <div
              lang="si"
              className={`relative mt-7 space-y-2 font-elu text-ink ${
                long ? "text-[1.15rem] leading-[1.9] sm:text-[1.4rem]" : "text-[1.4rem] leading-[1.85] sm:text-[1.95rem] lg:text-[2.15rem]"
              }`}
            >
              {verse.lines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.95, delay: 0.35 + i * 0.17, ease }}
                  className="text-pretty font-medium"
                >
                  {line}
                </motion.p>
              ))}
            </div>

            <div className="relative mt-8 flex items-center justify-between gap-3 border-t border-line pt-4">
              <p className="hidden text-xs leading-relaxed text-ink-faint sm:block">
                <span lang="si" className="font-sinhala">මුල් පෙළ · </span>
                Original Elu text
              </p>
              <Link
                href={`/map?v=${verse.n}`}
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs text-gold transition hover:bg-gold/20"
              >
                <Pin width={14} height={14} />
                See on the 3D map
              </Link>
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft transition hover:bg-white/10 hover:text-ink"
              >
                {copied ? <Check width={14} height={14} /> : <Copy width={14} height={14} />}
                {copied ? "Copied" : "Copy verse"}
              </button>
            </div>
          </motion.article>

          {/* ---------- the meaning ---------- */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease }}
            className="glass rounded-[1.75rem] p-6 sm:p-8"
            aria-label="Meaning of the verse"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-sm uppercase tracking-[0.3em] text-ink-faint">Meaning</h2>
              <div role="tablist" aria-label="Language" className="relative flex rounded-full border border-line bg-black/25 p-1 text-sm">
                {LANGS.map((l) => (
                  <button
                    key={l.id}
                    role="tab"
                    aria-selected={lang === l.id}
                    onClick={() => setLang(l.id)}
                    className={`relative rounded-full px-3.5 py-1.5 transition-colors ${
                      lang === l.id ? "text-black" : "text-ink-soft hover:text-ink"
                    } ${l.id === "si" ? "font-sinhala" : ""}`}
                  >
                    {lang === l.id && (
                      <motion.span
                        layoutId="lang-pill"
                        className="absolute inset-0 rounded-full bg-gold"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={lang}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28 }}
                className="mt-6 space-y-6"
              >
                {showSi && (
                  <div>
                    <p className="mb-2 font-sinhala text-xs tracking-wide text-gold">සිංහල අර්ථය</p>
                    <p lang="si" className="font-sinhala text-[1.05rem] font-light leading-[2] text-ink sm:text-[1.15rem]">
                      {verse.si}
                    </p>
                  </div>
                )}
                {showSi && showEn && <div className="rule-gold opacity-60" />}
                {showEn && (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-gold">In English</p>
                    <p lang="en" className="font-display text-[1.3rem] leading-[1.6] text-ink sm:text-[1.45rem]">
                      {verse.en}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {verse.approximate && (
              <p className="mt-6 rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-xs leading-relaxed text-amber-100/90">
                <strong className="font-semibold">General sense.</strong> This verse is dense, heavy with wordplay, or
                partly damaged in the digital text, so the explanation conveys its overall meaning rather than a
                word-for-word rendering.
              </p>
            )}

            {verse.note && (
              <details className="group mt-6 rounded-xl border border-line bg-black/20 px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm text-ink-soft marker:hidden">
                  <span>
                    <span className="font-sinhala">පසුබිම</span> · Context
                  </span>
                  <span className="text-gold transition group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
                  {showSi && <p lang="si" className="font-sinhala leading-[1.9]">{verse.note.si}</p>}
                  {showEn && <p lang="en">{verse.note.en}</p>}
                </div>
              </details>
            )}

            <details className="group mt-3 rounded-xl border border-line bg-black/20 px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm text-ink-soft marker:hidden">
                <span>
                  <span className="font-sinhala">මෙම කොටස</span> · About this section
                </span>
                <span className="text-gold transition group-open:rotate-45">+</span>
              </summary>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
                {showSi && <p lang="si" className="font-sinhala leading-[1.9]">{verse.section.descSi}</p>}
                {showEn && <p lang="en">{verse.section.descEn}</p>}
              </div>
            </details>
          </motion.section>
        </div>

        {/* ---------- previous / next ---------- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-7 flex items-stretch justify-between gap-3"
        >
          {prev ? (
            <Link
              href={verseHref(prev.n)}
              className="group flex items-center gap-3 rounded-2xl border border-line bg-black/55 px-4 py-3 backdrop-blur-md transition hover:border-gold/40 hover:bg-black/70"
            >
              <ArrowLeft className="transition group-hover:-translate-x-1" />
              <span className="text-left leading-tight">
                <span className="block text-xs text-ink-faint">Previous · <span className="font-sinhala">පෙර</span></span>
                <span className="block text-sm">Verse {pad(prev.n)}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={verseHref(next.n)}
              className="group flex items-center gap-3 rounded-2xl border border-gold/60 bg-[#2b1c06]/75 px-5 py-3 shadow-[0_0_40px_-10px_rgba(242,196,109,0.6)] backdrop-blur-md transition hover:bg-[#3a2608]/85"
            >
              <span className="text-right leading-tight">
                <span className="block text-xs text-gold/90">
                  {next.newSection ? `Entering: ${next.sectionEn}` : <>Next · <span className="font-sinhala">ඊළඟ</span></>}
                </span>
                <span className="block text-sm font-medium">Verse {pad(next.n)}</span>
              </span>
              <ArrowRight className="text-gold transition group-hover:translate-x-1" />
            </Link>
          ) : (
            <Link
              href="/about"
              className="group flex items-center gap-3 rounded-2xl border border-gold/60 bg-[#2b1c06]/75 px-5 py-3 backdrop-blur-md transition hover:bg-[#3a2608]/85"
            >
              <span className="text-right leading-tight">
                <span className="block text-xs text-gold/90">The journey ends</span>
                <span className="block text-sm font-medium">About the poem</span>
              </span>
              <ArrowRight className="text-gold" />
            </Link>
          )}
        </motion.div>
      </main>
      <JourneyRail n={verse.n} />
    </>
  );
}
