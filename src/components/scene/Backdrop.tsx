"use client";

import { usePathname } from "next/navigation";
import { useJourney } from "@/hooks/useJourney";
import { THEMES } from "@/lib/themes";

/** CSS sky shown while WebGL loads, or if it is unavailable. The 3D scene paints over it. */
export default function Backdrop() {
  const { themeId } = useJourney();
  const pathname = usePathname();
  if (pathname.startsWith("/map")) return null;
  const theme = THEMES[themeId];
  return (
    <div
      className="fixed inset-0 -z-20"
      style={{ background: `linear-gradient(to top, ${theme.bottom}, ${theme.mid} 45%, ${theme.top})` }}
      aria-hidden
    />
  );
}
