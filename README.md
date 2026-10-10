<div align="center">

# සැළලිහිණි සංදේශය
### The Starling's Message

**An immersive, bilingual reader for a 15th-century Sinhala classic.**
Read all 111 verses of the *Salalihini Sandeshaya* in the original, understand each one in Sinhala and English,
and follow a starling's flight from Kotte to Kelaniya through a living 3D world.

[![Code: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Content: CC BY-SA 4.0](https://img.shields.io/badge/content-CC%20BY--SA%204.0-lightgrey.svg)](LICENSE-CONTENT.md)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-Contributor%20Covenant-ff69b4.svg)](CODE_OF_CONDUCT.md)
[![Sponsor](https://img.shields.io/badge/sponsor-%E2%9D%A4-ea4aaa.svg)](https://github.com/sponsors/WasathTheekshana)

[Contribute](CONTRIBUTING.md) · [Report a problem](../../issues/new/choose) · [Fix a verse explanation](../../issues/new?template=content_correction.yml) · [Credits](CREDITS.md) · [Changelog](CHANGELOG.md)

</div>

---

## Why this exists

The *Salalihini Sandeshaya* ("the Starling's Message") was written around 1450 by the monk Thotagamuwe Sri Rahula
in the royal city of Kotte. A starling carries a prayer from the palace to the god Vibhishana at Kelaniya,
asking him to grant a son to Princess Ulakudaya Devi. It is counted among the finest poems in Sinhala, but its Elu
Sinhala can feel like a locked door, even to people who speak Sinhala every day.

This project is a way in. It was made by an engineer, for the community, and it is meant to be shared freely.

## Features

- **All 111 verses**, in the original Elu text, each on its own shareable page.
- **Explanations in modern Sinhala and in English** for every verse, plus context notes on history, places and customs.
  Verses that are especially hard are honestly marked "General sense".
- **A living sky.** Colour, light, fog and the valley behind the text change with each of the poem's 20 sections,
  from dawn to the night at the kovil to the sunset on the Kelani River.
- **A starling that flies while you read**, behind the cards, crossing the sky as you turn the page.
- **A 3D map** of the route from Kotte to Kelaniya, with landmarks linked to the verses that describe them, three
  camera modes, and a scrubber that flies the bird along the path.
- **Guided flight**, an auto-advancing mode, and keyboard, swipe and touch navigation.
- **Calm mode** for slower, quieter motion; reduced-motion settings are respected.
- **A first-load screen** that waits for the real 3D scene to be ready.
- **No ads, no tracking, no accounts.** Only your language and calm-mode choice are remembered, on your own device.

## Quick start

You need Node.js 20.9 or newer (22 is recommended; see [`.nvmrc`](.nvmrc)).

```bash
git clone https://github.com/WasathTheekshana/salalihini-sandeshaya.git
cd salalihini-sandeshaya
npm install
npm run dev          # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (also type-checks) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types, then run TypeScript |

Fonts are fetched from Google Fonts at build time, so the first build needs a network connection.

## How it is built

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 ·
three.js via `@react-three/fiber` and `@react-three/postprocessing` · `motion` for UI animation.

Every 3D model (palaces, stupas, palms, boats, the bird) and every shader (sky, water, drifting embers) is
generated in code in one faceted style, so there are no model files, textures or licences to manage.

```
src/
  app/                 routes: / , /verse/[n], /journey, /map, /about, /developer
  components/
    scene/             the persistent reader background (sky, particles, valley, bird)
    three/             shared 3D kit: materials, models, water shader, the starling
    map/               the 3D map: terrain, landmarks, route, camera rig
  data/
    poem.json          the 111 verses (original text)
    meanings-*.ts      Sinhala and English explanations, context notes
    sections.ts        the 20 sections of the poem and the scene theme for each
  lib/themes.ts        sky, light and particle palette for each theme
docs/                  guides for contributors (content style guide)
```

### How the content works

- A verse is `{ n, lines[] }` in [`src/data/poem.json`](src/data/poem.json).
- Its explanation is `{ n, si, en, note? }` in one of the `src/data/meanings-*.ts` files.
- Verses whose wording is dense or damaged are listed in `APPROXIMATE` in [`src/data/index.ts`](src/data/index.ts);
  the reader then shows a "General sense" note. Fixing a verse well enough to remove it from that list is one of
  the most valuable contributions you can make.
- Sections, their names and which scene they use live in [`src/data/sections.ts`](src/data/sections.ts).

## Contributing

Contributions of every size are welcome, and **you do not have to write code**.

- **Read Sinhala?** Check an explanation. This is the single most useful thing anyone can do.
- **Found a typo in a verse, a wrong place on the map, or a screen where it runs badly?** Open an issue.
- **Engineer?** The scene, map, accessibility and performance all have room to improve.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and the [content style guide](docs/content-style-guide.md) first, and
note that everyone taking part is expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ideas for the future

These are possibilities, not promises. Pick one up and say so in an issue.

- A scholar's review of every explanation, with sources.
- A human recording of the verses, recited by a Sinhala reader. (Text-to-speech voices were tried and were not good enough for Elu verse.)
- Word-by-word glosses (the traditional *sannaya*).
- The other great sandesas: *Mayura*, *Tisara*, *Parevi*, *Gira*, *Hansa*, *Kokila*.
- Automated tests and an offline-capable version.
-----------

## Sponsor

If this project means something to you, you can help it grow by sponsoring on
[GitHub Sponsors](https://github.com/sponsors/WasathTheekshana). Sponsorship pays for time, hosting and, above all,
paying scholars and reciters for their work. Sharing the site with a student or a teacher helps just as much.

## Credits and licences

- **Code** is released under the [MIT License](LICENSE).
- **Poem text, explanations and other written content** are released under
  [CC BY-SA 4.0](LICENSE-CONTENT.md).
- The poem's Sinhala text comes from Sinhala Wikibooks (originally e-Pothgula). Fonts, libraries and background
  sources are acknowledged in [CREDITS.md](CREDITS.md).

*Made with care by an engineer, for the community.*
