export type Recording = { n: number; file: string; duration: number };

export type PlaybackState = {
  active: boolean;
  playing: boolean;
  loading: boolean;
  error: string;
  time: number;
  duration: number;
  buffered: number;
  rate: number;
};

export const initialPlayback: PlaybackState = {
  active: false, playing: false, loading: false, error: "",
  time: 0, duration: 0, buffered: 0, rate: 1,
};

export const recordingUrl = (recording: Recording) => recording.n === 1
  ? "/audio/01.mp3"
  : `https://archive.org/download/SS-online/${recording.file}`;

/** Two media elements let the next verse retain its downloaded bytes on handoff. */
export class RecitationController {
  state = { ...initialPlayback };
  private slots: HTMLAudioElement[];
  private current = 0;
  private verse: number | null = null;
  private continuing = false;
  private wantsPlayback = false;
  private request = 0;
  private disposed = false;
  private unsubscribe: (() => void)[] = [];

  constructor(private options: {
    recordings: Recording[];
    createAudio: () => HTMLAudioElement;
    changed: (state: PlaybackState) => void;
    ended: (next: number | null) => void;
    allowPreload: () => boolean;
    prefetch: (n: number) => void;
  }) {
    this.slots = [options.createAudio(), options.createAudio()];
    for (const el of this.slots) {
      const on = (event: string, callback: () => void) => {
        const handler = () => { if (!this.disposed && this.audio === el && this.verse) callback(); };
        el.addEventListener(event, handler);
        this.unsubscribe.push(() => el.removeEventListener(event, handler));
      };
      on("playing", () => {
        if (!this.wantsPlayback) { el.pause(); return; }
        this.update({ playing: true, loading: false, error: "" });
        this.preloadNext();
      });
      on("waiting", () => { if (this.wantsPlayback) this.update({ loading: true }); });
      on("pause", () => this.update({ playing: false }));
      on("timeupdate", () => this.update({ time: el.currentTime }));
      on("loadedmetadata", () => {
        if (Number.isFinite(el.duration)) this.update({ duration: el.duration });
      });
      on("progress", () => {
        const ranges = el.buffered;
        let buffered = 0;
        for (let i = 0; i < ranges.length; i++) {
          if (ranges.start(i) <= el.currentTime && ranges.end(i) >= el.currentTime) buffered = ranges.end(i);
        }
        this.update({ buffered });
      });
      on("canplaythrough", () => this.preloadNext());
      on("error", () => this.fail("Recording unavailable. Retry or open the recording source below."));
      on("ended", () => {
        this.update({ playing: false, loading: false });
        const next = this.continuing && this.verse! < options.recordings.length ? this.verse! + 1 : null;
        if (next === null) this.wantsPlayback = false;
        options.ended(next);
      });
    }
  }

  private get audio() { return this.slots[this.current]; }

  private update(patch: Partial<PlaybackState>) {
    this.state = { ...this.state, ...patch };
    this.options.changed(this.state);
  }

  private release(el: HTMLAudioElement) {
    el.pause();
    el.removeAttribute("src");
    el.load();
  }

  select(n: number | null) {
    if (this.disposed || n === this.verse) return;
    ++this.request;
    this.audio.pause();
    this.verse = n;
    if (!n) {
      this.wantsPlayback = false;
      this.slots.forEach((el) => this.release(el));
      this.update({ ...initialPlayback, rate: this.state.rate });
      return;
    }
    const recording = this.options.recordings[n - 1];
    const source = recordingUrl(recording);
    const spare = this.slots[1 - this.current];
    if (spare.getAttribute("src") === source && !spare.error) {
      this.current = 1 - this.current;
    } else {
      // Remove an unrelated lookahead on jumps, so it cannot compete for bandwidth.
      this.release(spare);
      this.audio.preload = this.wantsPlayback ? "auto" : "metadata";
      this.audio.src = source;
      this.audio.load();
    }
    this.audio.playbackRate = this.state.rate;
    this.update({ time: 0, duration: recording.duration, buffered: 0, playing: false, loading: false, error: "" });
    if (this.wantsPlayback) this.play();
  }

  setContinuing(value: boolean) {
    this.continuing = value;
    if (value) this.preloadNext();
    else this.release(this.slots[1 - this.current]);
  }

  enableListening() {
    this.update({ active: true });
  }

  private preloadNext() {
    if (!this.continuing || !this.wantsPlayback || !this.verse ||
      this.verse >= this.options.recordings.length || this.audio.readyState < 4 || !this.options.allowPreload()) return;
    const next = this.verse + 1;
    const source = recordingUrl(this.options.recordings[next - 1]);
    const spare = this.slots[1 - this.current];
    if (spare.getAttribute("src") === source) return;
    spare.preload = "auto";
    spare.src = source;
    spare.load();
    this.options.prefetch(next);
  }

  private fail(message: string) {
    ++this.request;
    this.wantsPlayback = false;
    this.update({ playing: false, loading: false, error: message });
  }

  private play() {
    const el = this.audio;
    const request = ++this.request;
    this.wantsPlayback = true;
    el.preload = "auto";
    if (el.error) el.load();
    if (el.ended) el.currentTime = 0;
    this.update({ active: true, loading: true, error: "" });
    void el.play().catch(() => {
      if (this.disposed || request !== this.request || !this.wantsPlayback) return;
      this.fail("Playback stopped. Press play to retry.");
    });
  }

  toggle() {
    if (this.disposed || !this.verse) return;
    if (this.wantsPlayback) {
      ++this.request;
      this.wantsPlayback = false;
      this.audio.pause();
      this.update({ playing: false, loading: false });
    } else this.play();
  }

  seek(time: number) {
    if (!Number.isFinite(time) || !Number.isFinite(this.audio.duration)) return;
    this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration));
    this.update({ time: this.audio.currentTime });
  }

  changeRate(rate: number) {
    if (![0.75, 1, 1.25, 1.5].includes(rate)) return;
    this.slots.forEach((el) => { el.playbackRate = rate; });
    this.update({ rate });
  }

  destroy() {
    this.disposed = true;
    ++this.request;
    this.unsubscribe.forEach((off) => off());
    this.slots.forEach((el) => this.release(el));
  }
}
