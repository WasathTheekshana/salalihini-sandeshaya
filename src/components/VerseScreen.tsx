import { VerseReader, type NeighbourInfo, type ReaderVerse } from "@/components/VerseReader";
import { getVerse, TOTAL_VERSES } from "@/data";

function neighbour(from: number, to: number): NeighbourInfo {
  const a = getVerse(from);
  const b = getVerse(to);
  if (!a || !b) return null;
  return { n: b.n, sectionEn: b.section.en, newSection: a.section.id !== b.section.id };
}

/** Server component: looks up a verse and hands the reader plain serialisable props. */
export function VerseScreen({ n }: { n: number }) {
  const v = getVerse(n);
  if (!v) return null;

  const verse: ReaderVerse = {
    n: v.n,
    lines: v.lines,
    si: v.si,
    en: v.en,
    note: v.note,
    approximate: v.approximate,
    section: {
      si: v.section.si,
      en: v.section.en,
      from: v.section.from,
      to: v.section.to,
      descSi: v.section.descSi,
      descEn: v.section.descEn,
    },
  };

  return (
    <VerseReader
      verse={verse}
      prev={n > 1 ? neighbour(n, n - 1) : null}
      next={n < TOTAL_VERSES ? neighbour(n, n + 1) : null}
    />
  );
}
