/** Verse 1 lives at the site root so the poem opens straight away. */
export function verseHref(n: number): string {
  return n <= 1 ? "/" : `/verse/${n}`;
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}
