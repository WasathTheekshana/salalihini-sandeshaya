# Credits and acknowledgements

This project stands on the work of many people. Thank you.

## The poem

- **Thotagamuwe Sri Rahula Thera** (c. 1408–1491), who composed the *Salalihini Sandeshaya* around 1450 at the
  Vijayabahu Pirivena, Totagamuwa, during the reign of **King Parakramabahu VI** of Kotte. The poem is in the public
  domain.
- **Sinhala text:** transcribed from [Sinhala Wikibooks](https://si.wikibooks.org/), which in turn republished it
  from the e-Pothgula website (<http://epothgula.com/selalihiniya>), under
  [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Verse 1 is incomplete in that source.

## Background reading

Facts about the poem, its date, route and purpose were gathered from the following. None of their text is copied
here; each was read and summarised in our own words.

- *Translating Worlds through Words: The Bird-View of the Selalihini Sandeshaya (The Starling's Message)*,
  Stanford Humanities Center, DIBUR.
- "Kala Korner: Selalihini Sandesa", The Sunday Times (Sri Lanka), on Edmund Jayasuriya's blank-verse English
  translation.
- Wikipedia articles on *Parakramabahu VI* and *Sandesha Kavya*, and the Sinhala Wikipedia article on the poem.

If you want to study the poem seriously, please read **Edmund Jayasuriya's English translation** and a printed
edition with the traditional *sannaya* (word-by-word gloss). They are far better than anything here.

## Typefaces

All under the [SIL Open Font License 1.1](https://openfontlicense.org/), served through `next/font`:

- [Noto Serif Sinhala](https://fonts.google.com/noto/specimen/Noto+Serif+Sinhala) and
  [Noto Sans Sinhala](https://fonts.google.com/noto/specimen/Noto+Sans+Sinhala), Google / the Noto project
- [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond), Christian Thalmann
- [Geist](https://vercel.com/font), Vercel

## Software

Next.js, React, three.js, React Three Fiber, `postprocessing` and `@react-three/postprocessing`, Motion,
Tailwind CSS, TypeScript and ESLint, each under its own open-source licence (see the packages in
[`package.json`](package.json)). The look of the water, sky and wind shaders draws on techniques shared openly by
the three.js community.

## Artwork and code

All 3D models, shaders, icons and illustrations (the palaces, stupas, palms, boats, the bird, the cartoon engineer
and the app icon) were created for this project and are covered by the licences in [`LICENSE`](LICENSE) and
[`LICENSE-CONTENT.md`](LICENSE-CONTENT.md).

## Contributors

Everyone who corrects a verse, fixes a bug or improves a sentence is a contributor. See the
[contributors graph](../../graphs/contributors) for the full list.

## Verse recitations

- **Voice:** Heshani Sarathchandra; recorded by Sudesh Mantillake for **e-Pothgula / the Buddhaghosa project**.
- **Source:** [Selalihini Sandeshaya — Internet Archive](https://archive.org/details/SS-online),
  linked verse by verse from [e-Pothgula](https://epothgula.wordpress.com/selalihiniya/1-10/).
- **Audio licence:** [CC BY-NC-SA 3.0 US](https://creativecommons.org/licenses/by-nc-sa/3.0/us/),
  as specified in the archive metadata. This separate, noncommercial licence applies to the recordings;
  it is not replaced by the repository's code or written-content licences.
- Recordings are unmodified. The first verse's 64 kbps MP3 is bundled in `public/audio/01.mp3` for a quick
  first listen; verses 2–111 stream the corresponding numbered 64 kbps MP3s over HTTPS from the archive.
  `src/data/recordings.json` records the verified 111-file mapping and source durations.
- Synchronization is at verse boundaries, not word or line timestamps. Continuous listening advances on
  the recording's `ended` event. Manual navigation stops the previous recording and loads the selected verse.
- During continuous listening, only the next verse is preloaded once the current recording has enough data.
  Its existing media element is reused on handoff. Lookahead is skipped when the browser reports Save-Data
  or a 2G connection; other streamed audio requires an internet connection. Browser buffering and network
  conditions still determine the transition delay.
