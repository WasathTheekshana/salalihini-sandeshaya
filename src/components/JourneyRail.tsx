"use client";

import Link from "next/link";
import { BirdMark } from "@/components/Icons";
import { SECTIONS, TOTAL_VERSES, sectionOfVerse } from "@/data/sections";
import { THEMES } from "@/lib/themes";
import { pad, verseHref } from "@/lib/paths";

/** Bottom rail: the whole poem as a flight path, one segment per section. */
export function JourneyRail({ n }: { n: number }) {
  const current = sectionOfVerse(n);

  return (
    <nav
      aria-label="Poem progress"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-6 sm:pb-4"
    >
      <div className="mx-auto max-w-6xl rounded-2xl border border-line bg-black/55 px-4 pb-2 pt-3 backdrop-blur-md">
        <div className="mb-2.5 flex items-baseline justify-between gap-3 text-xs">
          <span className="truncate text-ink-soft">
            <span className="font-elu text-ink">{current.si}</span>
            <span className="mx-2 text-ink-faint">·</span>
            <span className="font-display italic">{current.en}</span>
          </span>
          <span className="shrink-0 tabular-nums text-ink-faint">
            <span className="text-ink">{pad(n)}</span> / {TOTAL_VERSES}
          </span>
        </div>
        <div className="flex items-center gap-[3px]">
          {SECTIONS.map((s) => {
            const count = s.to - s.from + 1;
            const done = n > s.to ? 1 : n < s.from ? 0 : (n - s.from + 1) / count;
            const active = n >= s.from && n <= s.to;
            return (
              <Link
                key={s.id}
                href={verseHref(s.from)}
                style={{ flexGrow: count, flexBasis: 0, minWidth: 6 }}
                className="group relative block py-2.5"
                aria-label={`${s.en}, verses ${s.from} to ${s.to}`}
                aria-current={active ? "step" : undefined}
                title={`${s.en} (${s.from}–${s.to})`}
              >
                <span className="relative block h-1.5 overflow-visible rounded-full bg-white/15 transition-colors group-hover:bg-white/30">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
                    style={{ width: `${done * 100}%`, background: THEMES[s.theme].accent }}
                  />
                  {active && (
                    <span
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-[115%] text-gold drop-shadow-[0_0_8px_rgba(242,196,109,0.8)] transition-[left] duration-700 ease-out"
                      style={{ left: `${((n - s.from + 0.5) / count) * 100}%` }}
                    >
                      <BirdMark />
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
