"use client";

import { Pause, Play } from "@/components/Icons";
import { useRecitation } from "@/components/providers/Recitation";
import { usePrefs } from "@/components/providers/Prefs";
import { pad } from "@/lib/paths";

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export function VerseAudio({ n }: { n: number }) {
  const player = useRecitation();
  const { autoplay } = usePrefs();
  return (
    <section aria-label={`Listen to verse ${n}`} aria-busy={player.loading} className="relative mt-7 rounded-2xl border border-gold/30 bg-black/25 p-4">
      <div className="flex items-center gap-3">
        <button type="button" onClick={player.toggle}
          aria-label={player.playing || player.loading ? "Pause recitation" : "Play recitation"}
          className="grid size-12 shrink-0 place-items-center rounded-full bg-gold text-black transition hover:bg-amber-200">
          {player.playing || player.loading ? <Pause width={22} height={22} /> : <Play width={22} height={22} />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold">Listen to the poem</p>
          <p className="mt-1 text-sm text-ink">Verse {pad(n)} <span className="font-sinhala text-ink-soft">· කවි ගායනය</span></p>
          <p className="mt-1 text-xs text-ink-faint">Heshani Sarathchandra</p>
        </div>
        <label className="text-xs text-ink-soft">
          <span className="sr-only">Playback speed</span>
          <select aria-label="Playback speed" value={player.rate} onChange={(e) => player.changeRate(Number(e.target.value))}
            className="rounded-lg border border-line bg-black/40 p-2">
            {[0.75, 1, 1.25, 1.5].map((rate) => <option key={rate} value={rate}>{rate}×</option>)}
          </select>
        </label>
      </div>
      <input type="range" aria-label="Recitation position" min={0} max={player.duration || 1} step={0.1}
        value={Math.min(player.time, player.duration)} onChange={(e) => player.seek(Number(e.target.value))}
        className="mt-4 block h-4 w-full cursor-pointer accent-[#f2c46d]" />
      <div aria-hidden="true" className="mt-1 h-0.5 overflow-hidden rounded-full bg-white/5">
        <div className="h-full bg-gold/40 transition-[width]" style={{ width: `${player.duration ? Math.min(100, player.buffered / player.duration * 100) : 0}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[11px] tabular-nums text-ink-faint">
        <span aria-live="polite">{player.loading ? "Loading recording…" : player.playing ? "Now singing" : "Sinhala recitation"}</span>
        <span>{clock(player.time)} / {clock(player.duration)}</span>
      </div>
      {player.error && <p role="alert" className="mt-2 text-xs text-amber-200">{player.error}</p>}
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
        <input type="checkbox" checked={autoplay} onChange={(e) => player.continueListening(e.target.checked)} className="size-4 accent-[#f2c46d]" />
        Continue to the next verse
      </label>
      <p className="mt-3 text-[10px] leading-relaxed text-ink-faint">
        <a href="https://archive.org/details/SS-online" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-gold">e-Pothgula · Buddhaghosa project</a>
        {" · "}<a href="https://creativecommons.org/licenses/by-nc-sa/3.0/us/" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-gold">CC BY-NC-SA 3.0 US</a>
      </p>
    </section>
  );
}
