"use client";

/**
 * A tiny shared store for the first-load screen. Parts of the app report when they are ready
 * ("fonts", "scene", "bird", "map"); the loading screen waits for the ones it needs and then
 * flips `loaded`, which the reader uses to replay its entrance animations.
 */

type Listener = () => void;

const ready = new Set<string>();
let loaded = false;
const listeners = new Set<Listener>();
let readySnapshot = "";

function emit() {
  readySnapshot = [...ready].sort().join(",");
  listeners.forEach((l) => l());
}

export function markReady(key: string) {
  if (ready.has(key)) return;
  ready.add(key);
  emit();
}

export function markLoaded() {
  if (loaded) return;
  loaded = true;
  emit();
}

export function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export const getReadySnapshot = () => readySnapshot;
export const getLoadedSnapshot = () => loaded;
export const getServerFalse = () => false;
export const getServerEmpty = () => "";
