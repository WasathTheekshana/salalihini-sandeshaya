"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { sectionOfVerse, TOTAL_VERSES, type ThemeId } from "@/data/sections";
import { parseVerseNumber } from "@/data";

export type Journey = {
  /** Current verse number, or null on non-verse pages */
  n: number | null;
  themeId: ThemeId;
  /** 0..1 position of the starling along the poem */
  progress: number;
};

const PAGE_THEMES: Record<string, ThemeId> = {
  "/about": "moonlit",
  "/journey": "dusk",
  "/developer": "morning",
};

export function useJourney(): Journey {
  const pathname = usePathname();
  return useMemo(() => {
    let n: number | null = null;
    if (pathname === "/") n = 1;
    else {
      const m = pathname.match(/^\/verse\/([^/]+)/);
      if (m) n = parseVerseNumber(m[1]);
    }
    if (n !== null) {
      return { n, themeId: sectionOfVerse(n).theme, progress: (n - 1) / (TOTAL_VERSES - 1) };
    }
    return { n: null, themeId: PAGE_THEMES[pathname] ?? "dawn", progress: 0.5 };
  }, [pathname]);
}
