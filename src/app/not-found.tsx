import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto grid min-h-dvh max-w-xl place-items-center px-6 text-center">
      <div>
        <p className="font-display text-sm uppercase tracking-[0.35em] text-gold">Lost in the sky</p>
        <h1 className="mt-3 font-elu text-4xl font-semibold">මේ පිටුව සොයාගත නොහැක</h1>
        <p className="mt-3 text-ink-soft">
          The starling could not find this page. The poem has verses 1 to 111.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full border border-gold/50 bg-gold/15 px-5 py-3 text-sm font-medium transition hover:bg-gold/25"
        >
          Return to verse 1
        </Link>
      </div>
    </main>
  );
}
