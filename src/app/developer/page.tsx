import type { Metadata } from "next";
import Link from "next/link";
import { Engineer } from "@/components/Engineer";
import { Reveal } from "@/components/Reveal";
import { DEVELOPER } from "@/data/developer";

export const metadata: Metadata = {
  title: "About the Developer",
  description:
    "This site was made by an engineer, for the community: a free, bilingual way to read and enjoy the Salalihini Sandeshaya.",
};

const PROMISES = [
  { t: "Free to read", si: "නොමිලේ", d: "No paywall, no sign-up, no accounts." },
  { t: "No ads, no tracking", si: "දැන්වීම් නැත", d: "The only thing remembered is your language and calm-mode choice, stored on your own device." },
  { t: "Honest about its limits", si: "අඩුපාඩු පිළිගනී", d: "The explanations are learner's aids, and verses that are hard to read are marked as such." },
];

const HELP = [
  {
    t: "Check an explanation",
    si: "අර්ථ පරීක්ෂා කරන්න",
    d: "If you read Elu Sinhala, you can spot what a machine and an engineer miss. Verses marked “General sense” need you most.",
  },
  {
    t: "Share it with a student",
    si: "ශිෂ්‍යයෙකුට බෙදා දෙන්න",
    d: "A teacher, a pirivena student, a grandparent who loves the poem. Every verse has its own link to share.",
  },
  {
    t: "Tell me what is broken",
    si: "දෝෂ දන්වන්න",
    d: "A typo in a verse, a place on the map that is wrong, a screen where it runs badly. All of it helps.",
  },
];

const BUILT_WITH = ["Next.js", "React", "three.js", "Tailwind CSS", "TypeScript"];

export default function DeveloperPage() {
  const who = DEVELOPER.name.trim();
  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 pb-28 pt-28 sm:px-6">
      <section className="grid items-center gap-10 md:grid-cols-[1.15fr_1fr]">
        <Reveal>
          <p className="font-display text-sm uppercase tracking-[0.35em] text-gold">About the developer</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.1] sm:text-5xl">
            Made by an engineer,
            <br />
            for the community.
          </h1>
          <p lang="si" className="mt-3 font-elu text-xl text-ink-soft">
            ඉංජිනේරුවෙකු විසින්, ප්‍රජාව වෙනුවෙන්.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-ink">
            {who ? (
              <>
                Hi, I&rsquo;m <strong className="font-semibold text-gold">{who}</strong>, a software engineer. I built this site
                because a poem this good should be easy to love.
              </>
            ) : (
              <>I&rsquo;m a software engineer, and I built this site because a poem this good should be easy to love.</>
            )}
          </p>
          <p className="mt-4 leading-relaxed text-ink-soft">
            The <em>Salalihini Sandeshaya</em> has been read in Sri Lanka for almost six hundred years, but its Elu Sinhala
            can feel like a locked door, even to people who speak Sinhala every day. I wanted a way in: the original verse,
            a plain explanation in Sinhala and in English, and a world around it that makes you want to keep going.
          </p>

          {(DEVELOPER.contactUrl || DEVELOPER.sponsorUrl || DEVELOPER.links.length > 0) && (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {DEVELOPER.contactUrl && (
                <a
                  href={DEVELOPER.contactUrl}
                  className="inline-flex items-center rounded-full border border-gold/50 bg-gold/15 px-5 py-3 text-sm font-medium transition hover:bg-gold/25"
                >
                  {DEVELOPER.contactLabel}
                </a>
              )}
              {DEVELOPER.sponsorUrl && (
                <a
                  href={DEVELOPER.sponsorUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm text-ink transition hover:border-gold/60 hover:bg-white/5"
                >
                  <span aria-hidden className="text-[#ea4aaa]">&#9829;</span> Sponsor
                </a>
              )}
              {DEVELOPER.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-full border border-line px-4 py-2.5 text-sm text-ink-soft transition hover:border-gold/50 hover:text-ink"
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.15} className="mx-auto w-full max-w-[22rem]">
          <div className="glass relative rounded-[2rem] p-5">
            <Engineer className="h-auto w-full touch-manipulation select-none" />
          </div>
        </Reveal>
      </section>

      <Reveal className="mt-24">
        <p className="font-display text-sm uppercase tracking-[0.35em] text-gold">Why it exists</p>
        <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">A gift, not a product</h2>
        <div className="mt-6 space-y-5 leading-relaxed text-ink-soft">
          <p>
            Engineers spend their days building things for companies. This one is for everybody else: students facing the
            poem for an exam, expatriates reconnecting with a language they miss, curious readers who have never opened a
            sandesa, and anyone who simply enjoys beautiful things on the web.
          </p>
          <p>
            It is deliberately a little over the top, with a sky that changes with the story, a starling that flies
            while you read, and a 3D map of the route from Kotte to Kelaniya. A poem about a bird&rsquo;s journey deserves to
            feel like one.
          </p>
        </div>
      </Reveal>

      <Reveal className="mt-20 grid gap-4 sm:grid-cols-3">
        {PROMISES.map((p) => (
          <div key={p.t} className="glass rounded-3xl p-5">
            <p className="font-display text-xl font-semibold text-ink">{p.t}</p>
            <p lang="si" className="font-sinhala text-xs text-gold">
              {p.si}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.d}</p>
          </div>
        ))}
      </Reveal>

      <Reveal className="mt-24">
        <p className="font-display text-sm uppercase tracking-[0.35em] text-gold">How you can help</p>
        <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">It gets better with the community</h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink-soft">
          I am an engineer, not a scholar of Elu Sinhala. The verse text comes from an open edition and the explanations
          are my best attempt, so they will have mistakes. If you can fix one, you are making it better for everyone who
          comes after you.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {HELP.map((h, i) => (
            <div key={h.t} className="glass rounded-3xl p-5">
              <span className="font-display text-3xl font-semibold text-gold/80">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-1 font-display text-xl text-ink">{h.t}</p>
              <p lang="si" className="font-sinhala text-xs text-ink-faint">
                {h.si}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{h.d}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-24">
        <p className="font-display text-sm uppercase tracking-[0.35em] text-gold">Open source</p>
        <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Yours to read, fix and share</h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink-soft">
          The code is open under the MIT licence, and the poem text and explanations are open under CC BY-SA 4.0. You
          can read how everything works, fix a verse, add a feature, or take any of it for your own project, as long as
          you give credit and share alike.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={DEVELOPER.repoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full border border-gold/50 bg-gold/15 px-5 py-3 text-sm font-medium transition hover:bg-gold/25"
          >
            View the source
          </a>
          <a
            href={`${DEVELOPER.repoUrl}/blob/main/CONTRIBUTING.md`}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full border border-line px-5 py-3 text-sm text-ink-soft transition hover:border-gold/50 hover:text-ink"
          >
            How to contribute
          </a>
          <a
            href={`${DEVELOPER.repoUrl}/issues/new?template=content_correction.yml`}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full border border-line px-5 py-3 text-sm text-ink-soft transition hover:border-gold/50 hover:text-ink"
          >
            Correct a verse
          </a>
        </div>
      </Reveal>

      <Reveal className="mt-24">
        <p className="font-display text-sm uppercase tracking-[0.35em] text-gold">Under the hood</p>
        <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Built with</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {BUILT_WITH.map((b) => (
            <span key={b} className="rounded-full border border-line bg-black/20 px-4 py-2 text-sm text-ink-soft">
              {b}
            </span>
          ))}
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink-faint">
          The sky, the valley, the starling and the map are all drawn in code, in one faceted style. The poem&rsquo;s text and
          the background of the story are credited on the{" "}
          <Link href="/about" className="text-ink underline decoration-gold/50 underline-offset-4 hover:decoration-gold">
            About the poem
          </Link>{" "}
          page.
        </p>
      </Reveal>

      <Reveal className="mt-20 text-center">
        <p lang="si" className="font-elu text-2xl text-ink">
          සැළලිහිණිය යළිත් පියඹයි.
        </p>
        <p className="mt-1 font-display text-xl italic text-ink-soft">The starling flies again.</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full border border-gold/50 bg-gold/15 px-5 py-3 text-sm font-medium transition hover:bg-gold/25"
        >
          Back to the poem →
        </Link>
      </Reveal>
    </main>
  );
}
