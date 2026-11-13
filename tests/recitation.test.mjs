import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// Exercise the actual transport without a DOM or an extra test dependency (Node 20+).
const source = readFileSync(new URL("../src/lib/recitation.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
});
const { RecitationController } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

class AudioDouble extends EventTarget {
  src = "";
  preload = "";
  currentTime = 0;
  duration = 75;
  playbackRate = 1;
  readyState = 4;
  paused = true;
  ended = false;
  error = null;
  loads = 0;
  plays = 0;
  playResult = () => Promise.resolve();
  buffered = { length: 1, start: () => 0, end: () => 40 };
  load() { this.loads++; this.currentTime = 0; }
  play() { this.paused = false; this.plays++; return this.playResult(); }
  pause() { this.paused = true; this.dispatchEvent(new Event("pause")); }
  getAttribute() { return this.src || null; }
  removeAttribute() { this.src = ""; }
  emit(name) { this.dispatchEvent(new Event(name)); }
}

function setup(allowPreload = true) {
  const slots = [], snapshots = [], ends = [], prefetches = [];
  const recordings = Array.from({ length: 111 }, (_, i) => ({ n: i + 1, file: `${String(i + 1).padStart(2, "0")}_64kb.mp3`, duration: 75 }));
  const controller = new RecitationController({ recordings,
    createAudio: () => { const el = new AudioDouble(); slots.push(el); return el; },
    changed: (state) => snapshots.push(state), ended: (n) => ends.push(n),
    allowPreload: () => allowPreload, prefetch: (n) => prefetches.push(n),
  });
  return { controller, slots, snapshots, ends, prefetches };
}

test("continuous playback reuses the buffered next element without reloading", () => {
  const { controller: c, slots, ends, prefetches } = setup();
  c.select(1);
  c.setContinuing(true);
  assert.equal(slots[1].src, ""); // No download before the listener presses play.
  c.toggle();
  slots[0].emit("playing");
  assert.match(slots[1].src, /02_64kb.mp3$/);
  assert.equal(slots[1].preload, "auto");
  assert.deepEqual(prefetches, [2]);
  const loads = slots[1].loads;
  slots[0].emit("ended");
  assert.deepEqual(ends, [2]);
  c.select(2);
  assert.equal(slots[1].loads, loads);
  assert.equal(slots[1].plays, 1);
  assert.equal(slots[0].paused, true);
  slots[1].emit("playing");
  assert.match(slots[0].src, /03_64kb.mp3$/);
  c.destroy();
});

test("data saver and slow connections skip lookahead", () => {
  const { controller: c, slots, prefetches } = setup(false);
  c.select(1); c.setContinuing(true); c.toggle(); slots[0].emit("playing");
  assert.equal(slots[1].src, "");
  assert.deepEqual(prefetches, []);
  c.destroy();
});

test("lookahead waits until the current recording is ready", () => {
  const { controller: c, slots } = setup();
  slots[0].readyState = 2;
  c.select(1); c.setContinuing(true); c.toggle(); slots[0].emit("playing");
  assert.equal(slots[1].src, "");
  slots[0].readyState = 4; slots[0].emit("canplaythrough");
  assert.match(slots[1].src, /02_64kb.mp3$/);
  c.destroy();
});

test("pause survives navigation, speed persists, jumps discard unrelated preloads", () => {
  const { controller: c, slots } = setup();
  c.select(1); c.setContinuing(true); c.toggle(); slots[0].emit("playing");
  c.changeRate(1.25); c.toggle(); c.select(40);
  assert.equal(slots[0].paused, true);
  assert.equal(slots[1].src, "");
  assert.match(slots[0].src, /40_64kb.mp3$/);
  assert.equal(slots[0].playbackRate, 1.25);
  assert.equal(c.state.loading, false);
  c.destroy();
});

test("stale play rejections after pause or navigation do not overwrite current playback", async () => {
  const { controller: c, slots } = setup();
  let reject;
  slots[0].playResult = () => new Promise((_, fail) => { reject = fail; });
  c.select(1); c.toggle(); c.toggle();
  reject(new Error("interrupted"));
  await Promise.resolve();
  assert.equal(c.state.error, "");
  c.toggle(); const oldReject = reject;
  slots[0].playResult = () => Promise.resolve();
  c.select(2); slots[0].emit("playing");
  oldReject(new Error("obsolete resource"));
  await Promise.resolve();
  assert.equal(c.state.playing, true);
  assert.equal(c.state.error, "");
  c.destroy();
});

test("buffering and media errors expose a recoverable state; retry reloads failed audio", () => {
  const { controller: c, slots } = setup();
  c.select(1); c.toggle(); slots[0].emit("playing"); slots[0].emit("waiting");
  assert.equal(c.state.loading, true);
  slots[0].emit("progress");
  assert.equal(c.state.buffered, 40);
  slots[0].error = { code: 2 }; slots[0].emit("error");
  assert.equal(c.state.playing, false);
  assert.equal(c.state.loading, false);
  assert.match(c.state.error, /unavailable/);
  const loads = slots[0].loads;
  c.toggle();
  assert.equal(slots[0].loads, loads + 1);
  assert.equal(c.state.error, "");
  c.destroy();
});

test("prefetch errors do not interrupt the current verse; disabling continuation releases preload", () => {
  const { controller: c, slots } = setup();
  c.select(1); c.setContinuing(true); c.toggle(); slots[0].emit("playing");
  slots[1].emit("error");
  assert.equal(c.state.error, "");
  assert.equal(c.state.playing, true);
  c.setContinuing(false);
  assert.equal(slots[1].src, "");
  c.destroy();
});

test("the final verse does not advance beyond 111 and leaving the reader releases both sources", () => {
  const { controller: c, slots, ends } = setup();
  c.select(111); c.setContinuing(true); c.toggle(); slots[0].emit("playing"); slots[0].emit("ended");
  assert.deepEqual(ends, [null]);
  c.select(null);
  assert.ok(slots.every((el) => el.paused && !el.src));
  assert.equal(c.state.active, false);
  c.destroy();
});

test("destroy invalidates outstanding play promises and removes listeners", async () => {
  const { controller: c, slots, snapshots } = setup();
  let reject;
  slots[0].playResult = () => new Promise((_, fail) => { reject = fail; });
  c.select(1); c.toggle(); c.destroy();
  const count = snapshots.length;
  reject(new Error("unmounted")); slots[0].emit("playing");
  await Promise.resolve();
  assert.equal(snapshots.length, count);
});
