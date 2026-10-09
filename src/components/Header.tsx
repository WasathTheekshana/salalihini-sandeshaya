"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BirdMark, Book, Globe, Map, Pause, Play, Wind } from "@/components/Icons";
import { usePrefs } from "@/components/providers/Prefs";

const linkBase =
  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-ink-soft transition hover:bg-white/10 hover:text-ink";

function IconToggle({
  pressed,
  onClick,
  label,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      className={`inline-flex size-10 items-center justify-center rounded-full border transition ${
        pressed
          ? "border-gold/60 bg-gold/15 text-gold"
          : "border-line text-ink-soft hover:bg-white/10 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function Header() {
  const pathname = usePathname();
  const { calm, setCalm, autoplay, setAutoplay } = usePrefs();
  const onVerse = pathname === "/" || pathname.startsWith("/verse/");

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <Link
        href="/"
        className="group flex items-center gap-3 rounded-full py-1 pr-4"
        aria-label="Salalihini Sandeshaya, home"
      >
        <span className="grid size-10 place-items-center rounded-full border border-line bg-black/25 text-gold backdrop-blur transition group-hover:border-gold/50">
          <BirdMark />
        </span>
        <span className="leading-tight">
          <span className="block font-elu text-base font-semibold tracking-wide sm:text-lg">
            සැළලිහිණි සංදේශය
          </span>
          <span className="block font-display text-[0.8rem] italic tracking-wider text-ink-faint">
            The Starling&rsquo;s Message
          </span>
        </span>
      </Link>

      <nav aria-label="Primary" className="flex items-center gap-1 rounded-full border border-line bg-black/25 p-1 backdrop-blur-md">
        <Link
          href="/map"
          className={`${linkBase} ${pathname === "/map" ? "bg-white/10 text-ink" : ""}`}
          aria-current={pathname === "/map" ? "page" : undefined}
        >
          <Globe /> <span className="hidden sm:inline">3D Map</span>
        </Link>
        <Link
          href="/journey"
          className={`${linkBase} ${pathname === "/journey" ? "bg-white/10 text-ink" : ""}`}
          aria-current={pathname === "/journey" ? "page" : undefined}
        >
          <Map /> <span className="hidden sm:inline">Journey</span>
        </Link>
        <Link
          href="/about"
          className={`${linkBase} ${pathname === "/about" ? "bg-white/10 text-ink" : ""}`}
          aria-current={pathname === "/about" ? "page" : undefined}
        >
          <Book /> <span className="hidden sm:inline">About</span>
        </Link>
        {onVerse && (
          <IconToggle
            pressed={autoplay}
            onClick={() => setAutoplay(!autoplay)}
            label={autoplay ? "Stop the guided flight" : "Fly with the starling (auto-advance)"}
          >
            {autoplay ? <Pause /> : <Play />}
          </IconToggle>
        )}
        <IconToggle pressed={calm} onClick={() => setCalm(!calm)} label={calm ? "Calm mode on" : "Calm mode off"}>
          <Wind />
        </IconToggle>
      </nav>
    </header>
  );
}
