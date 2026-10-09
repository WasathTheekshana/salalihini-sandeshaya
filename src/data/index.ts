import poem from "./poem.json";
import { MEANINGS_1 } from "./meanings-1";
import { MEANINGS_2 } from "./meanings-2";
import { MEANINGS_3 } from "./meanings-3";
import { MEANINGS_4 } from "./meanings-4";
import { sectionOfVerse, TOTAL_VERSES, type Section } from "./sections";
import type { Meaning, Verse } from "./types";

export { SECTIONS, TOTAL_VERSES, sectionOfVerse } from "./sections";
export type { Section } from "./sections";
export type { Meaning, Verse } from "./types";

/**
 * Verses whose wording is dense, damaged in the digital source, or heavily
 * punning. Their explanations are a general sense, not a close translation.
 */
const APPROXIMATE = new Set([
  1, 26, 30, 31, 35, 36, 37, 38, 39, 40, 46, 49, 50, 51, 52, 54, 56, 57, 63, 72,
  79, 83, 84, 86, 87, 88, 90, 94, 96, 101, 104, 106,
]);

export type FullVerse = Verse &
  Meaning & {
    section: Section;
    approximate: boolean;
  };

const meaningByN = new Map<number, Meaning>(
  [...MEANINGS_1, ...MEANINGS_2, ...MEANINGS_3, ...MEANINGS_4].map((m) => [m.n, m]),
);

const verses: FullVerse[] = (poem as Verse[]).map((v) => {
  const m = meaningByN.get(v.n);
  if (!m) throw new Error(`Missing meaning for verse ${v.n}`);
  return { ...v, ...m, section: sectionOfVerse(v.n), approximate: APPROXIMATE.has(v.n) };
});

if (verses.length !== TOTAL_VERSES) {
  throw new Error(`Expected ${TOTAL_VERSES} verses, got ${verses.length}`);
}

export const ALL_VERSES: readonly FullVerse[] = verses;

export function getVerse(n: number): FullVerse | undefined {
  return verses[n - 1];
}

export function parseVerseNumber(raw: string): number | null {
  if (!/^\d{1,3}$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 1 && n <= TOTAL_VERSES ? n : null;
}
