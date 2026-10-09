# සැළලිහිණි සංදේශය · The Starling's Message

An immersive reader for the fifteenth-century Sinhala poem *Salalihini Sandeshaya*
(Thotagamuwe Sri Rahula Thera, c. 1450). All 111 verses, with the original Elu text and
explanations in Sinhala and English, while a starling flies through a 3D sky that changes
with each stage of the journey from Kotte to Kelaniya.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Stack

Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, three.js via
`@react-three/fiber` with `@react-three/postprocessing` (bloom), and `motion` for UI animation.
Everything in the scene, including the bird, is generated in code in one faceted low-poly style, so there are no model files or licences to manage. The bird is a minimal flat-shaded Sri Lankan myna in `src/components/three/myna.ts`.

## Layout

- `src/data/poem.json`: the 111 verses (original text)
- `src/data/meanings-*.ts`: Sinhala and English explanations, plus context notes
- `src/data/sections.ts`: the 20 sections and which scene theme each uses
- `src/lib/themes.ts`: sky, particle and silhouette palette per theme
- `src/components/three/`: procedural 3D kit: the myna-like starling (`bird.ts`), stupa / palace / gopuram / palms (`models.ts`), water shader with shoreline foam, wind and rim-light materials
- `src/components/scene/`: the persistent reader background (sky, particles, valley `Stage`, flying starling, bloom)
- `src/components/map/`: the 3D map (`/map`): terrain and coast, Kelani river, Kotte, landmarks linked to verses, route, camera modes
- `src/components/VerseReader.tsx`: the reading experience (keys, swipe, guided flight)

## Content and credits

The Sinhala text is from Sinhala Wikibooks (sourced from e-Pothgula, CC BY-SA 4.0) and may
contain transcription errors; verse 1 is incomplete in that source. The Sinhala and English
explanations are interpretive paraphrases written for learners and have **not** been reviewed
by a scholar of Elu Sinhala. Verses flagged "General sense" (`APPROXIMATE` in `src/data/index.ts`)
are especially uncertain. Please have them checked before presenting this as authoritative.
See the About page for sources.
