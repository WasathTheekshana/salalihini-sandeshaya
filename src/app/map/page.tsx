import type { Metadata } from "next";
import { Suspense } from "react";
import { MapExperience, type MapVerse } from "@/components/map/MapExperience";
import { ALL_VERSES } from "@/data";

export const metadata: Metadata = {
  title: "The Map",
  description:
    "A 3D map of the starling's flight from the royal city of Kotte to the temple of Kelaniya. Fly along the route and read each verse where it happens.",
};

const MAP_VERSES: MapVerse[] = ALL_VERSES.map((v) => ({
  n: v.n,
  lines: v.lines,
  en: v.en,
  si: v.si,
  sectionEn: v.section.en,
  sectionSi: v.section.si,
}));

export default function MapPage() {
  return (
    <main id="main">
      <Suspense fallback={null}>
        <MapExperience verses={MAP_VERSES} />
      </Suspense>
    </main>
  );
}
