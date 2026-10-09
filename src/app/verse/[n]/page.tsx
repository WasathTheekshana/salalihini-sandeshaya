import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { VerseScreen } from "@/components/VerseScreen";
import { ALL_VERSES, getVerse, parseVerseNumber } from "@/data";

export function generateStaticParams() {
  // Verse 1 is served from the site root, so it is not pre-rendered here.
  return ALL_VERSES.filter((v) => v.n > 1).map((v) => ({ n: String(v.n) }));
}

export async function generateMetadata({ params }: PageProps<"/verse/[n]">): Promise<Metadata> {
  const { n: raw } = await params;
  const n = parseVerseNumber(raw);
  const v = n ? getVerse(n) : undefined;
  if (!v) return {};
  return {
    title: `Verse ${v.n} · ${v.section.en}`,
    description: v.en,
    alternates: { canonical: v.n === 1 ? "/" : `/verse/${v.n}` },
    openGraph: { title: `Verse ${v.n} · ${v.section.en}`, description: v.en },
  };
}

export default function VersePage({ params }: PageProps<"/verse/[n]">) {
  return (
    <Suspense fallback={<main id="main" className="min-h-dvh" />}>
      <VerseContent params={params} />
    </Suspense>
  );
}

async function VerseContent({ params }: { params: PageProps<"/verse/[n]">["params"] }) {
  const { n: raw } = await params;
  const n = parseVerseNumber(raw);
  if (n === null) notFound();
  if (n === 1) redirect("/");
  return <VerseScreen n={n} />;
}
