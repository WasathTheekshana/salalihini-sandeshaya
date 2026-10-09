import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "About the Poem",
  description:
    "Who wrote the Salalihini Sandeshaya, why, and how to read it: the poet, the princess, the starling, and the craft of fifteenth-century Sinhala verse.",
};

const FACTS = [
  { k: "111", v: "verses", s: "සිවුපද කවි" },
  { k: "c. 1450", v: "composed", s: "කෝට්ටේ යුගය" },
  { k: "1 day", v: "of flight", s: "එක් දිනක ගමන" },
  { k: "Elu", v: "Sinhala", s: "එළු සිංහලය" },
];

const FLIGHT = [
  { t: "Greeting & the errand", si: "සැපදුක් විමසුම්", v: 2, d: "The poet welcomes the starling and asks her to carry a message to the god at Kelaniya." },
  { t: "The royal city", si: "ජයවද්දන පුර වැනුම්", v: 6, d: "A tour of Kotte: moat and ramparts, elephants and horses, mansions, and the women of the city." },
  { t: "Palace and departure", si: "රජ දැක්ම", v: 18, d: "She bows to the Tooth Relic and takes leave of King Parakramabahu, then leaves at moonrise." },
  { t: "Night, dawn and the road", si: "මග වැනුම්", v: 22, d: "A night at a Hindu kovil; dawn; then Adam's Peak to the east, the sea to the north, paddy fields and lotus lakes." },
  { t: "River and evening", si: "කැලණි නදී වැනුම්", v: 43, d: "The Kelani River, naga maidens playing the veena, a long glowing sunset." },
  { t: "The temple", si: "පින්කම් වැනුම්", v: 59, d: "Worship at the Kelaniya temple and a recollection of the Buddha's visit to the island." },
  { t: "The god", si: "විබිසණ දෙව් වැනුම්", v: 77, d: "Vibhishana, brother of Ravana, described from crown to feet over fifteen verses." },
  { t: "The message", si: "අස්න", v: 93, d: "The plea: grant a son to Princess Ulakudaya Devi, so that the royal line may continue." },
];

const SOURCES = [
  {
    label: "Sinhala text of the poem",
    note: "Sinhala Wikibooks, itself taken from e-Pothgula (CC BY-SA 4.0)",
    href: "https://si.wikibooks.org/wiki/%E0%B7%83%E0%B7%90%E0%B7%85%E0%B6%BD%E0%B7%92%E0%B7%84%E0%B7%92%E0%B6%AB%E0%B7%92_%E0%B7%83%E0%B6%B1%E0%B7%8A%E0%B6%AF%E0%B7%9A%E0%B7%81%E0%B6%BA",
  },
  {
    label: "Translating Worlds through Words: The Bird-View of the Selalihini Sandeshaya",
    note: "Stanford Humanities Center, DIBUR. Background, structure, route and date",
    href: "https://shc.stanford.edu/arcade/publications/dibur/curated/translating-worlds-through-words-bird-view-selalihini-sandeshaya",
  },
  {
    label: "Kala Korner: Selalihini Sandesa",
    note: "The Sunday Times (Sri Lanka), on Edmund Jayasuriya's blank-verse translation",
    href: "https://www.sundaytimes.lk/040208/plus/kala.html",
  },
  {
    label: "Parakramabahu VI",
    note: "Wikipedia. Reign, patronage of poetry, Prince Sapumal and Jaffna",
    href: "https://en.wikipedia.org/wiki/Parakramabahu_VI",
  },
  {
    label: "Sandesha Kavya",
    note: "Wikipedia. The messenger-poem genre",
    href: "https://en.wikipedia.org/wiki/Sandesha_Kavya",
  },
  {
    label: "Sinhala Wikipedia: සැළලිහිණි සන්දේශය",
    note: "Author, purpose and number of verses",
    href: "https://si.wikipedia.org/wiki/%E0%B7%83%E0%B7%90%E0%B7%85%E0%B6%BD%E0%B7%92%E0%B7%84%E0%B7%92%E0%B6%AB%E0%B7%92_%E0%B7%83%E0%B6%B1%E0%B7%8A%E0%B6%AF%E0%B7%9A%E0%B7%81%E0%B6%BA",
  },
];

function Section({
  eyebrow,
  title,
  si,
  children,
}: {
  eyebrow: string;
  title: string;
  si?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal className="mt-20">
      <p className="font-display text-sm uppercase tracking-[0.35em] text-gold">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{title}</h2>
      {si && <p className="mt-1 font-elu text-lg text-ink-soft">{si}</p>}
      <div className="mt-6 space-y-5 leading-relaxed text-ink-soft">{children}</div>
    </Reveal>
  );
}

export default function AboutPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 pb-28 pt-28 sm:px-6">
      <Reveal>
        <p className="font-display text-sm uppercase tracking-[0.35em] text-gold">About the poem</p>
        <h1 className="mt-3 font-elu text-4xl font-semibold leading-tight sm:text-5xl">සැළලිහිණි සංදේශය</h1>
        <p className="mt-2 font-display text-3xl italic text-ink-soft sm:text-4xl">The Starling&rsquo;s Message</p>
        <p className="mt-8 text-lg leading-relaxed text-ink">
          Around 1450, a Buddhist monk in the royal capital of Kotte wrote a prayer for a princess and gave it wings.
          The poem is a letter carried by a starling: a one-day flight from the palace to a river, a temple and a
          god, told in 111 four-line verses that are still counted among the finest in Sinhala.
        </p>
        <p lang="si" className="mt-5 font-sinhala leading-[2] text-ink-soft">
          පසළොස්වන සියවසේ කෝට්ටේ රාජධානියේ දී තොටගමුවේ ශ්‍රී රාහුල හිමියන් විසින් රචිත මෙම සංදේශ කාව්‍යය,
          සැළලිහිණි කුරුලු දූතියක් ලවා කැලණි විභීෂණ දෙවියන්ට යවන ලද පණිවුඩයකි. සිංහල සාහිත්‍යයේ උසස්ම
          සන්දේශ කාව්‍යයක් ලෙස එය සැලකේ.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-5 py-3 text-sm font-medium text-ink transition hover:bg-gold/25"
          >
            Begin reading at verse 1 →
          </Link>
        </div>
      </Reveal>

      <Reveal className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FACTS.map((f) => (
          <div key={f.k} className="glass rounded-2xl p-4 text-center">
            <p className="font-display text-3xl font-semibold text-gold">{f.k}</p>
            <p className="text-sm text-ink">{f.v}</p>
            <p lang="si" className="font-sinhala text-xs text-ink-faint">{f.s}</p>
          </div>
        ))}
      </Reveal>

      <Section eyebrow="The genre" title="What is a sandesa?" si="සන්දේශ කාව්‍යය යනු කුමක්ද?">
        <p>
          A <em>sandesa</em> (&ldquo;message&rdquo;) poem has four parts: a sender, a messenger, a recipient and the
          message itself. The form came to Sinhala from Sanskrit tradition, where lovers sent word through clouds and
          swans. In Sri Lanka, the messengers became birds: the peacock, the cuckoo, the parrot, the swan, and here
          the starling.
        </p>
        <p>
          But Sinhala sandesas turned the form to a new purpose. They are not love letters. A monk-poet asks a deity
          for something the kingdom needs, and the bird&rsquo;s route becomes an excuse to paint the land: cities,
          rivers, temples, seasons, people. Read today, they are also a portrait of life in the fifteenth century.
        </p>
      </Section>

      <Section eyebrow="The poet" title="Thotagamuwe Sri Rahula" si="තොටගමුවේ ශ්‍රී රාහුල හිමි">
        <p>
          Sri Rahula (c. 1408–1491) was a monk and scholar, head of the Vijayabahu Pirivena at Totagamuwa, and a
          favourite of the Kotte court. He was honoured with the title <em>Shadbhasha Parameshwara</em>,
          &ldquo;supreme master of six languages.&rdquo; He is also credited with other poems in the same tradition,
          and the final verses of this poem name the Vijayabahu Pirivena as the place where it was composed.
        </p>
      </Section>

      <Section eyebrow="The patron and the purpose" title="A prayer for an heir" si="අරමුණ: රජ පෙළපත රැකීම">
        <p>
          The poem is addressed to Vibhishana, the guardian deity of Kelaniya, and asks him to grant a son to Princess
          Ulakudaya Devi, a daughter of King Parakramabahu VI (reigned 1412&ndash;1467). In the closing verses, the poet
          records that the prayer was answered; the prince, tradition says, was Vijayabahu, who later took the throne.
        </p>
        <p>
          Parakramabahu VI united the island under Kotte and was a great patron of literature; his reign is seen as a
          golden age of Sinhala poetry. The poem also glances at real events: verse 29 greets Prince Sapumal, returning
          in triumph from the conquest of Jaffna.
        </p>
      </Section>

      <Section eyebrow="The flight" title="The poem in eight scenes" si="කවියේ පෙළගැස්ම">
        <ol className="space-y-3">
          {FLIGHT.map((f, i) => (
            <li key={f.t}>
              <Link
                href={f.v === 1 ? "/" : `/verse/${f.v}`}
                className="glass group flex gap-4 rounded-2xl p-4 transition hover:border-gold/40"
              >
                <span className="font-display text-3xl font-semibold text-gold/80">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-display text-xl text-ink">{f.t}</span>
                    <span lang="si" className="font-elu text-sm text-ink-faint">{f.si}</span>
                  </span>
                  <span className="mt-1 block text-sm">{f.d}</span>
                  <span className="mt-2 block text-xs text-gold transition group-hover:translate-x-1">
                    Read from verse {f.v} →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="The craft" title="Why it sounds the way it does" si="කාව්‍ය ශිල්පය">
        <p>
          The poem is written in <em>Elu</em>, a literary form of Sinhala that is older and more compressed than
          everyday speech, so many verses need a gloss even for Sinhala readers. That is why this site pairs every verse
          with an explanation in modern Sinhala and in English.
        </p>
        <p>
          Each verse is a quatrain with strong end-rhyme and heavy internal sound-play. The metre, called{" "}
          <em>samudraghosa</em> (&ldquo;the sound of the ocean&rdquo;), rises and falls like waves. The poet speaks
          directly to the bird, flatters her, teases her, and gives her stage directions. Notice, too, how warmly a
          Buddhist monk describes a Hindu kovil and its Tamil hymns, and how women appear as dancers, bathers and
          worshippers in public life.
        </p>
      </Section>

      <Section eyebrow="Please read" title="A note on the explanations">
        <p>
          The Sinhala text comes from an open digital edition and may contain transcription errors; verse 1 appears to
          be incomplete in that source. The Sinhala and English explanations on this site were written to help
          learners follow each verse. They are <strong className="text-ink">interpretive paraphrases</strong>, not
          authoritative translations, and have not been reviewed by a scholar of Elu Sinhala. Verses marked
          &ldquo;General sense&rdquo; are especially dense, and a few passages are obscure even to specialists.
        </p>
        <p>
          Who made this, and how you can help improve it, is on the{" "}
          <Link href="/developer" className="text-ink underline decoration-gold/50 underline-offset-4 hover:decoration-gold">
            developer page
          </Link>
          .
        </p>
        <p>
          For serious study, consult a printed edition with the traditional <em>sannaya</em> (word-by-word gloss), or
          Edmund Jayasuriya&rsquo;s English translation. Corrections are very welcome.
        </p>
      </Section>

      <Section eyebrow="Sources" title="Where this comes from">
        <ul className="space-y-3">
          {SOURCES.map((s) => (
            <li key={s.href} className="text-sm">
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-ink underline decoration-gold/50 underline-offset-4 transition hover:decoration-gold"
              >
                {s.label}
              </a>
              <span className="block text-ink-faint">{s.note}</span>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
