import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { SECTIONS } from "@/data/sections";
import { pad, verseHref } from "@/lib/paths";
import { THEMES } from "@/lib/themes";

export const metadata: Metadata = {
  title: "The Journey",
  description:
    "Follow the starling's one-day flight from the royal city of Kotte to the temple of Kelaniya, section by section.",
};

export default function JourneyPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 pb-24 pt-28 sm:px-6">
      <Reveal>
        <p className="font-display text-sm uppercase tracking-[0.35em] text-gold">The Journey</p>
        <h1 className="mt-3 font-elu text-4xl font-semibold leading-tight sm:text-5xl">
          කෝට්ටේ සිට කැලණිය දක්වා
        </h1>
        <p className="mt-2 font-display text-2xl italic text-ink-soft sm:text-3xl">From Kotte to Kelaniya</p>
        <p className="mt-6 max-w-2xl leading-relaxed text-ink-soft">
          The poem is a single flight. Twenty passages carry the starling from a royal palace, through night and
          dawn, over mountains and rivers, to the shrine of a god. Choose any stop to begin reading there.
        </p>
      </Reveal>

      <ol className="relative mt-14 space-y-5 before:absolute before:bottom-0 before:left-[1.125rem] before:top-0 before:w-px before:bg-gradient-to-b before:from-transparent before:via-gold/50 before:to-transparent sm:before:left-[1.375rem]">
        {SECTIONS.map((s, i) => {
          const t = THEMES[s.theme];
          const count = s.to - s.from + 1;
          return (
            <li key={s.id} className="relative">
              <span
                aria-hidden
                className="absolute left-0 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-gold/60 bg-[#0b0820] text-xs font-medium tabular-nums text-gold sm:size-11 sm:text-sm"
              >
                {pad(i + 1)}
              </span>
              <Reveal delay={Math.min(i * 0.03, 0.2)}>
                <Link
                  href={verseHref(s.from)}
                  className="group relative ml-12 flex flex-col gap-4 overflow-hidden rounded-3xl border border-line p-5 transition hover:border-gold/50 sm:ml-16 sm:flex-row sm:items-center sm:p-6"
                  style={{
                    background: `linear-gradient(110deg, ${t.top}cc, ${t.mid}99 55%, ${t.bottom}66)`,
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <h2 className="font-elu text-xl font-semibold sm:text-2xl">{s.si}</h2>
                    <p className="font-display text-lg italic text-ink-soft sm:text-xl">{s.en}</p>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.descEn}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-sm sm:flex-col sm:items-end sm:gap-1">
                    <span className="rounded-full border border-line bg-black/30 px-3 py-1 tabular-nums">
                      {count === 1 ? `Verse ${s.from}` : `Verses ${s.from}–${s.to}`}
                    </span>
                    <span className="text-gold transition group-hover:translate-x-1">Begin here →</span>
                  </div>
                </Link>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
