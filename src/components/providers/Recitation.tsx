"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useJourney } from "@/hooks/useJourney";
import { usePrefs } from "@/components/providers/Prefs";
import { verseHref } from "@/lib/paths";
import { initialPlayback, RecitationController, type PlaybackState } from "@/lib/recitation";
import recordings from "@/data/recordings.json";

type Recitation = PlaybackState & {
  toggle: () => void;
  seek: (time: number) => void;
  changeRate: (rate: number) => void;
  continueListening: (value: boolean) => void;
};

const Context = createContext<Recitation | null>(null);

// Persist the transport above route transitions, preserving its preloaded media element.
export function RecitationProvider({ children }: { children: ReactNode }) {
  const { n } = useJourney();
  const router = useRouter();
  const { autoplay, setAutoplay } = usePrefs();
  const controller = useRef<RecitationController | null>(null);
  const [state, setState] = useState(initialPlayback);

  useEffect(() => {
    const transport = new RecitationController({
      recordings,
      createAudio: () => new Audio(),
      changed: setState,
      ended: (next) => {
        if (next) router.push(verseHref(next));
        else setAutoplay(false);
      },
      prefetch: (next) => router.prefetch(verseHref(next)),
      allowPreload: () => {
        const connection = (navigator as Navigator & {
          connection?: { saveData?: boolean; effectiveType?: string };
        }).connection;
        return !connection?.saveData && !["slow-2g", "2g"].includes(connection?.effectiveType ?? "");
      },
    });
    controller.current = transport;
    return () => { controller.current = null; transport.destroy(); };
  }, [router, setAutoplay]);

  useEffect(() => { controller.current?.select(n); }, [n]);
  useEffect(() => { controller.current?.setContinuing(autoplay); }, [autoplay]);

  return (
    <Context.Provider value={{ ...state,
      toggle: () => controller.current?.toggle(),
      seek: (time) => controller.current?.seek(time),
      changeRate: (rate) => controller.current?.changeRate(rate),
      continueListening: (value) => {
        controller.current?.enableListening();
        setAutoplay(value);
      },
    }}>
      {children}
    </Context.Provider>
  );
}

export function useRecitation() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useRecitation must be used inside RecitationProvider");
  return ctx;
}
