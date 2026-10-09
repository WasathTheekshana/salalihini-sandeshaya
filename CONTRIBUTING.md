# Contributing to the Salalihini Sandeshaya

Thank you for helping. This project exists so that more people can read and love a great Sinhala poem, and it gets
better the more people look after it. Please take a moment to read this guide, and the
[Code of Conduct](CODE_OF_CONDUCT.md), which applies everywhere we work together.

## You don't need to write code

| If you... | You can... |
| --- | --- |
| read Elu or modern Sinhala | check an explanation and [report a correction](../../issues/new?template=content_correction.yml) |
| are a teacher, student or poet | tell us where an explanation confuses a learner |
| speak English and Sinhala | improve the English wording of an explanation |
| are a historian or geographer | fix a note about a place, person or custom, with a source |
| use the site on an unusual device | [report a bug](../../issues/new?template=bug_report.yml) with your device and browser |
| are a designer or 3D artist | [suggest or build](../../issues/new?template=feature_request.yml) something for the scene or the map |
| are an engineer | pick an issue, or see "Ideas for the future" in the [README](README.md) |

Not sure where to start? Verses marked **"General sense"** need the most help. They are listed in `APPROXIMATE` in
[`src/data/index.ts`](src/data/index.ts).

## Ground rules

- Be kind and patient. People here range from poetry scholars to first-time contributors.
- **Never copy text from a printed edition, a commentary (*sannaya*) or another copyrighted source.** Write your own
  explanation, in your own words. The poem itself is in the public domain, but modern commentaries are not.
- Say what you are unsure about. An honest "I think this means X, but the word Y puzzles me" is welcome; false
  certainty is not. Explanations are learners' aids and should read as such.
- Content you contribute is released under [CC BY-SA 4.0](LICENSE-CONTENT.md) and code under the [MIT License](LICENSE).

## Reporting problems

Search the [existing issues](../../issues) first. Then use the issue forms; they ask for what we need:

- **Content correction**: a wrong word in a verse, a mistaken or unclear explanation.
- **Bug report**: something broken, slow or ugly, ideally with your device, browser and what you expected.
- **Feature request**: an idea, and the problem it would solve.

Security problems should *not* go in a public issue; see [SECURITY.md](SECURITY.md).

## Improving a verse or its explanation

Everything about a verse lives in `src/data/`:

| File | Contents |
| --- | --- |
| `poem.json` | the original text: `{ "n": 13, "lines": ["…", "…"] }` |
| `meanings-1.ts` … `meanings-4.ts` | `{ n, si, en, note? }` for verses 1–28, 29–56, 57–84, 85–111 |
| `sections.ts` | the 20 sections, their names and descriptions, and the scene theme each uses |
| `index.ts` | joins it all together; `APPROXIMATE` lists verses shown with a "General sense" note |

Read the [content style guide](docs/content-style-guide.md) before writing. In short:

1. Explain the **meaning**, not the words one by one. Keep it short enough to read in a breath.
2. Write modern, plain Sinhala in `si`, and clear, natural English in `en`.
3. Use `note` only for real context (history, geography, custom), and only when you are confident of it.
4. If the verse is genuinely obscure, say so in the text, and keep the verse in `APPROXIMATE`. Remove a verse from
   `APPROXIMATE` only when you are confident in the explanation, and say how you checked in the pull request.
5. If you change the original text in `poem.json`, **cite the edition or manuscript** you compared it with.

## Setting up the code

You need Node.js 20.9+ (22 recommended, see [`.nvmrc`](.nvmrc)).

```bash
git clone https://github.com/<your-username>/salalihini-sandeshaya.git
cd salalihini-sandeshaya
npm install
npm run dev          # http://localhost:3000
```

Before you push, run the same checks CI runs:

```bash
npm run lint
npm run typecheck
npm run build
```

### Code guidelines

- **TypeScript, strictly.** No `any` unless you explain why in a comment.
- **Match the surrounding code**: naming, comment density, file layout. Comments say *why*, not *what*.
- **Keep the style consistent.** The 3D world is one faceted, flat-shaded low-poly style; new assets should match it.
  Everything is generated in code, so please do not add model or texture files without discussing it first.
- **Performance matters.** The scene must stay smooth on modest hardware. Reuse geometry and materials, instance
  repeated objects, and never set React state inside `useFrame`.
- **Accessibility matters.** Keep keyboard navigation, focus rings and `lang` attributes; respect
  `prefers-reduced-motion`; keep text contrast readable over the changing sky.
- **Next.js 16 has breaking changes.** Read the relevant guide in `node_modules/next/dist/docs/` before changing
  routing, caching or data fetching.
- **Add dependencies sparingly**, and explain why in the pull request.

### Commits and branches

- Branch from `main`: `fix/verse-27-explanation`, `feat/map-night-lights`, `docs/readme-typo`.
- Use [Conventional Commits](https://www.conventionalcommits.org/): `fix(content): clarify verse 27`,
  `feat(map): add Isvara kovil model`, `docs: improve setup steps`.
- Keep pull requests focused: one change you can describe in a sentence.

## Pull requests

1. Open an issue first for anything big, so we can agree on the approach before you spend time on it.
2. Fill in the pull request template. For content changes, say what you checked the meaning against.
3. Include a screenshot or a short recording for anything visual.
4. Make sure the three checks above pass. CI runs them on every pull request.
5. Be ready for friendly review. We may ask for changes; that is how the project stays coherent.

By contributing you confirm that you wrote the work, or have the right to submit it, under the licences above
(a lightweight [Developer Certificate of Origin](https://developercertificate.org/)).

## Getting help

Questions are welcome. See [SUPPORT.md](SUPPORT.md). You can also comment on the issue you are working on.

Thank you for taking care of a poem that has been loved for almost six hundred years.
