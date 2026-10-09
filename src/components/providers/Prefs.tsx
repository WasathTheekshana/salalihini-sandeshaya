"use client";

import { MotionConfig } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "both" | "si" | "en";

type Prefs = {
  /** Calm mode: slower, sparser background for comfort or low-power devices */
  calm: boolean;
  setCalm: (v: boolean) => void;
  lang: Lang;
  setLang: (v: Lang) => void;
  /** Auto-advance through the poem */
  autoplay: boolean;
  setAutoplay: (v: boolean) => void;
};

const PrefsContext = createContext<Prefs | null>(null);

const KEY = "salalihini:prefs:v1";

function readStored(): Partial<Pick<Prefs, "calm" | "lang">> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [calm, setCalmState] = useState(false);
  const [lang, setLangState] = useState<Lang>("both");
  const [autoplay, setAutoplay] = useState(false);

  // Hydrate from storage after mount so server and client markup match.
  useEffect(() => {
    const stored = readStored();
    // Calm mode is opt-in via the header toggle. Many desktops report "reduce motion"
    // by default (animations disabled in the OS), which would silently flatten the whole experience.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
    setCalmState(stored.calm ?? false);
    if (stored.lang === "si" || stored.lang === "en" || stored.lang === "both") {
      setLangState(stored.lang);
    }
  }, []);

  const persist = useCallback((patch: Partial<Pick<Prefs, "calm" | "lang">>) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...readStored(), ...patch }));
    } catch {
      /* storage unavailable: preferences simply won't persist */
    }
  }, []);

  const setCalm = useCallback(
    (v: boolean) => {
      setCalmState(v);
      persist({ calm: v });
    },
    [persist],
  );

  const setLang = useCallback(
    (v: Lang) => {
      setLangState(v);
      persist({ lang: v });
    },
    [persist],
  );

  const value = useMemo(
    () => ({ calm, setCalm, lang, setLang, autoplay, setAutoplay }),
    [calm, setCalm, lang, setLang, autoplay],
  );

  return (
    <PrefsContext.Provider value={value}>
      <MotionConfig reducedMotion={calm ? "always" : "never"}>{children}</MotionConfig>
    </PrefsContext.Provider>
  );
}

export function usePrefs(): Prefs {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used inside <PrefsProvider>");
  return ctx;
}
