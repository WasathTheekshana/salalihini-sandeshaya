"use client";

import { useSyncExternalStore } from "react";
import { getLoadedSnapshot, getServerFalse, subscribe } from "@/lib/loading";

/** False until the first-load screen has finished; true for the rest of the session. */
export function useLoaded(): boolean {
  return useSyncExternalStore(subscribe, getLoadedSnapshot, getServerFalse);
}
