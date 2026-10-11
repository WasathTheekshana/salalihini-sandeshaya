# PROMPT.md

One self-contained prompt for rebuilding this website from an empty folder, with no follow-up conversation.

**How to use it:** open a new Claude Code session in an empty directory and paste everything below the line
(from "You are building…" to the end). Do not edit it. It already says what to decide, what to avoid and how to verify.

**Two things a prompt cannot carry:** the 111 verses of the poem (they are fetched from an open source, see section 4)
and the written explanations (they are written fresh, so the wording will differ from this repository while the
structure, design and behaviour match).

---

You are building a complete, polished website from an empty directory. Work autonomously from start to finish. Do not
stop to ask me questions: wherever this brief leaves a detail open, choose the most sensible option, mention it in
your final report, and keep going. Do not ask me to confirm anything before you build. Build it all, run the checks in
section 15, and fix whatever fails.

## 0. Before you write any code

The project's Next.js version has breaking changes from what you may remember. After installing dependencies, read the
relevant guides in `node_modules/next/dist/docs/` (routing, Cache Components, `generateStaticParams`, metadata, fonts,
typed routes / `PageProps` / `LayoutProps`, `next typegen`) and follow them over your memory. Heed deprecation notices.
Create an `AGENTS.md` at the root containing exactly this notice, because `next dev` will re-add it anyway:

> ## This is NOT the Next.js you know
> This version has breaking changes — APIs, conventions, and file structure may all differ from your training data.
> Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## 1. The product

**සැළලිහිණි සංදේශය · The Starling's Message** is an educational, immersive website for *Salalihini Sandeshaya*, the
fifteenth-century Sinhala messenger poem (a *sandesa*) by the monk Thotagamuwe Sri Rahula, written around 1450 in the
royal city of Kotte. A starling (*salalihini*) carries a prayer from King Parakramabahu VI's palace at Kotte to the god
Vibhishana at Kelaniya, asking him to grant a son to Princess Ulakudaya Devi. The poem has **111 verses** in this
edition.

Goals, in priority order:
1. People can read **every verse in the original Elu Sinhala** and understand it through a **modern Sinhala
   explanation** and an **English explanation**.
2. It must be **enjoyable**: a living 3D and animated world that changes with the story, so that someone who would
   never open a poem keeps going to the next verse.
3. It must feel **hand-crafted and calm**, never noisy. Restraint beats spectacle.
4. It must follow **current Next.js best practice**.

The first thing a visitor sees after the loading screen is **verse 1 at the site root `/`**, with the full animated
background already running. A "next" action moves to verse 2, and so on.

The brand voice is warm, plain and honest. Never overclaim. Where a verse's wording is too dense to explain with
confidence, say so (see section 4). Never write "scholarly", "authoritative" or "definitive".

## 2. Stack (use exactly these)

- Next.js **16.4** (App Router, Cache Components enabled, `partialPrefetching`, TypeScript, Turbopack), React **19.3**
- Tailwind CSS **4** (`@tailwindcss/turbopack`)
- `three` ^0.186, `@react-three/fiber` ^9, `@react-three/postprocessing` ^3, `postprocessing` ^6, `motion` ^14
- Fonts via `next/font/google`: **Geist** (UI), **Cormorant Garamond** (display, weights 400-700, normal and italic),
  **Noto Serif Sinhala** (the Elu verses), **Noto Sans Sinhala** (Sinhala explanations). Do not pass explicit weight
  arrays to the two variable Sinhala fonts (it errors). Subsets: `sinhala` + `latin`.
- ESLint 9 with `eslint-config-next`. Node >= 20.9 (`.nvmrc` says 22).
- **No model files, no textures, no images.** Every 3D asset is generated in code. No audio. No analytics. No cookies.
- Package scripts: `dev`, `build`, `start`, `lint`, `typecheck` (`next typegen && tsc --noEmit`).

## 3. Routes

| Route | What it is |
| --- | --- |
| `/` | Verse 1 (the reader). `/verse/1` redirects to `/`. |
| `/verse/[n]` | Verses 2-111, statically generated with `generateStaticParams`; invalid numbers 404; per-verse `generateMetadata` (title `Verse N · <section>`, description = English line, canonical, Open Graph). `params` access must sit inside a `<Suspense>` boundary (Cache Components requires it). |
| `/journey` | The 20 sections as a vertical timeline of cards, each linking to its first verse. |
| `/map` | The 3D map of the route (section 9). |
| `/about` | About the poem: the story, the poet, the setting, honest notes on the text and the explanations, source credits. |
| `/developer` | "About the developer" (section 12). |
| `not-found` | Styled 404 in the same visual language. |

Header (fixed, translucent pill nav with blur): brand mark and the title in both languages, then links **3D Map**
(Globe icon), **Journey** (Map icon), **About** (Book icon), **Developer** (Smile icon, label hidden below `lg`), and on
verse pages a **play/pause** toggle for "fly with the starling" (auto-advance every ~14 s) and a **calm mode** toggle
(Wind icon). Icons are small inline SVGs in one `Icons.tsx`.

## 4. Content model

- `src/data/poem.json`: `[{ n, lines: string[] }]` for verses 1-111, the **original Elu text**. **Fetch it** from Sinhala
  Wikibooks (`si.wikibooks.org`, the page for සැළලිහිණි සංදේශය, originally from e-Pothgula). Use the real text. Never invent
  or "modernise" verse text. If a verse cannot be fetched cleanly, say so in your report rather than inventing it.
- `src/data/meanings-1.ts` ... `meanings-4.ts` (about 28 verses each): `{ n, si, en, note? }` where `si` is a plain modern
  Sinhala explanation, `en` is a plain English explanation, and `note` is an optional one-line context note (history,
  place, custom). Write these yourself, in simple language, to help a school student. Do not copy any copyrighted
  commentary. Work from the verse text and well-known public facts about the poem.
- `APPROXIMATE`: a `Set<number>` in `src/data/index.ts`. List every verse whose wording is dense or ambiguous enough
  that your explanation is only the general sense. The reader shows a small **"General sense"** badge with a short honest
  note for those verses. Honesty here is a feature.
- `src/data/types.ts`, and `src/data/index.ts` exporting `ALL_VERSES` (verse + meaning + section merged), `getVerse(n)`,
  `parseVerseNumber(raw)` (returns `number | null`, rejects anything outside 1-111 or non-integer), `TOTAL_VERSES`.
- `src/data/sections.ts`: exactly these **20 sections** (`id, from, to, si, en, theme, silhouette, descSi, descEn` -
  write a one-or-two-sentence Sinhala and English description for each). `ThemeId` is the union of the 13 themes in
  section 6; `Silhouette` is `"none" | "city" | "stupa" | "kovil" | "mountain" | "palms" | "temple"`.

| # | id | verses | Sinhala | English | theme | silhouette |
| - | --- | --- | --- | --- | --- | --- |
| 1 | blessing | 1 | ආසී | The Invocation | dawn | none |
| 2 | greeting | 2-3 | සැපදුක් විමසුම් | Greetings & Inquiry | dawn | none |
| 3 | errand | 4-5 | කටයුතු නිදෙස් | The Errand | dawn | none |
| 4 | city | 6-14 | ජයවද්දන පුර වැනුම් | The City of Jayawardhanapura | court | city |
| 5 | setting-out | 15-16 | ගමන් පිරුම | Setting Out | dusk | city |
| 6 | tooth-relic | 17 | දළදා වැනුම | The Tooth Relic | dusk | temple |
| 7 | king | 18-20 | රජ දැක්ම | Before the King | court | city |
| 8 | departure | 21 | නික්මුම | Departure | dusk | city |
| 9 | night | 22 | නිසා වැනුම් | The Night | night | kovil |
| 10 | dawn | 23-24 | උදා වැනුම් | Dawn | morning | palms |
| 11 | road | 25-42 | මග වැනුම් | The Road | road | mountain |
| 12 | river | 43-45 | කැලණි නදී වැනුම් | The Kelani River | river | palms |
| 13 | evening | 46-52 | සැඳෑ වැනුම් | Evening | sunset | palms |
| 14 | kelaniya-city | 53-58 | කැලණි පුර වැනුම් | The City of Kelaniya | lamplight | stupa |
| 15 | merit | 59-71 | පින්කම් වැනුම් | Worship at the Temple | sacred | stupa |
| 16 | devale | 72-76 | දෙව් මැඳුරු වැනුම් | The God's Shrine | devale | temple |
| 17 | vibhishana | 77-92 | විබිසණ දෙව් වැනුම් | Vibhishana, the God | divine | none |
| 18 | message | 93-107 | අස්න | The Message | moonlit | none |
| 19 | blessing-end | 108 | ආසී | Closing Blessing | dawn | none |
| 20 | colophon | 109-111 | පුරාණ සන්නයේ අගට යෙදුණු කවි | The Colophon | dawn | none |

## 5. The reader (`/` and `/verse/[n]`)

- A centred, glassy **verse card**: the Elu lines in Noto Serif Sinhala, large, generous line height, each line
  revealing in turn with a gentle fade/blur-up (`motion`). Above it: the section name in both languages and a one-line
  description. Below or beside it: the **Sinhala explanation** and the **English explanation** in two cards, with an
  optional context note.
- A **language switch** (Sinhala / English / Both, default Both) remembered in `localStorage` after mount (hydrate in
  an effect so server and client markup match).
- Navigation: big previous/next buttons, **keyboard** (left/right arrows, and number keys are not needed), **swipe** on
  touch, and clickable progress.
- **JourneyRail** fixed at the bottom: a segmented progress bar, one segment per section, filled in the section's accent
  colour, with a tiny starling mark gliding to the current verse, the current section name in both languages and
  `NN / 111`. Each segment links to that section's first verse.
- Reader entrance animations replay once after the loading screen finishes (a `loaded` flag used as a React `key`).
- Everything respects **calm mode**: opt-in (default OFF - do not default it from the OS reduced-motion setting, many
  desktops report it by default and it would silently flatten the experience). Calm mode uses `MotionConfig`
  `reducedMotion="always"`, slows or reduces 3D motion, and turns film-grain flicker off. Also honour
  `prefers-reduced-motion` in CSS for the grain and loader keyframes.
- Accessible: a skip link, `lang="si"` on Sinhala text, visible focus rings (gold), proper landmarks (`<main id="main">`,
  `<nav aria-label>`), buttons with accessible names. The 3D layers are `aria-hidden`.

## 6. Themes (the sky and mood for each section)

`src/lib/themes.ts` exports `THEMES: Record<ThemeId, Theme>` and `nightOf(theme)` where `Theme` has:
`top, mid, bottom` (sky gradient hex), `accent`, `particleA`, `particleB`, `petal` (0 glow dot / 1 petal), `drift`
(positive rises like embers, negative falls like petals), `sway`, `density` (0-1), `sun: [x, y, radius, strength]`
(x,y in -1..1 screen space), `sunColor`, `moon: [x, y, radius, strength]`, `stars` (0-1), `ground` (foreground
silhouette colour). `nightOf = clamp(stars*1.1 - sun[3]*0.6, 0, 1)`; it drives window glow and star-lit shading.

Use these values (palette matters; stay close):

| id | top / mid / bottom | accent | particles A / B | petal | drift | sway | density | sun [x,y,r,s] | sunColor | moon [x,y,r,s] | stars | ground |
| --- | --- | --- | --- | - | --- | --- | --- | --- | --- | --- | --- | --- |
| dawn | #241a52 / #b5527a / #f6b36a | #ffd58a | #ffe3a8 / #ffb3c7 | 1 | -0.12 | 0.9 | 0.7 | [0.1,-0.35,0.34,0.95] | #ffd9a0 | none | 0.2 | #1a0f2e |
| court | #3a0f22 / #b03a3a / #f2b84b | #ffcc66 | #ffd27a / #ff8a5c | 0 | 0.18 | 0.5 | 1 | [-0.35,-0.2,0.3,0.75] | #ffc56b | none | 0.05 | #26091a |
| dusk | #1c1a4a / #7a3f7e / #f0875a | #ffb27a | #ffd0a0 / #ff9ac0 | 0 | 0.1 | 0.7 | 0.8 | [0.35,-0.5,0.28,0.8] | #ff9a5c | [-0.55,0.55,0.06,0.4] | 0.35 | #150f33 |
| night | #03051a / #0b1440 / #1d2f6e | #a9c4ff | #cfe0ff / #ffe9a8 | 0 | 0.05 | 0.4 | 0.9 | none | - | [0.45,0.5,0.11,1] | 1 | #02030f |
| morning | #33346e / #ee8f6f / #ffd08a | #ffe0a0 | #fff0c0 / #ffc7a0 | 0 | 0.14 | 0.6 | 0.7 | [0.3,-0.4,0.42,1] | #fff1b8 | none | 0.1 | #1c1636 |
| road | #1a6aa0 / #6cc0c0 / #e9f0b0 | #d9ff9a | #ffffff / #fff6a8 | 1 | -0.05 | 1.2 | 0.6 | [-0.45,0.5,0.16,0.85] | #fffbe0 | none | 0 | #0b3b3a |
| river | #06303c / #13826f / #7fd6b0 | #9dffd8 | #bffff0 / #ffffd0 | 0 | 0.08 | 1 | 0.85 | [0.5,0.3,0.2,0.55] | #fff4c0 | none | 0 | #04201f |
| sunset | #2a1250 / #c0396e / #ff8a3d | #ffa860 | #ffd0a0 / #ff7a9a | 0 | 0.06 | 0.8 | 0.85 | [0,-0.62,0.38,1] | #ff9040 | [-0.6,0.55,0.05,0.35] | 0.25 | #1a0a2a |
| lamplight | #0d1445 / #3a2a7a / #e0a850 | #ffd27a | #ffd890 / #fff0c0 | 0 | 0.2 | 0.6 | 1 | none | - | [0.5,0.55,0.09,0.9] | 0.7 | #0a0d2c |
| sacred | #3a1a08 / #b5651d / #ffd36e | #ffd36e | #ffe9a0 / #ffb347 | 1 | -0.08 | 0.8 | 0.9 | [0,-0.1,0.45,0.6] | #ffe28a | none | 0.1 | #1d0d05 |
| devale | #220a30 / #8a2a6a / #f06a7a | #ff9ac0 | #ffb3d1 / #ffe0a0 | 1 | -0.1 | 1.3 | 1 | none | - | [0.5,0.5,0.07,0.6] | 0.4 | #13061c |
| divine | #030a2e / #0e3a9a / #3ea0ff | #a8d8ff | #bfe0ff / #ffe08a | 0 | 0.15 | 0.5 | 1 | [0,-0.1,0.5,0.35] | #6ac0ff | none | 1 | #020720 |
| moonlit | #070c2a / #243a8a / #9bb4f0 | #e8eeff | #e8f0ff / #ffe9a8 | 0 | 0.1 | 0.7 | 0.95 | none | - | [-0.35,0.45,0.14,1] | 0.9 | #050820 |

"none" means `[0,0,0,0]` and `#000000`. Default theme is `dawn`. Page themes outside the poem: `/about` -> `moonlit`,
`/journey` -> `dusk`, `/developer` -> `morning`, `/map` has its own scene. A `useJourney()` hook turns the pathname into
`{ themeId, progress 0..1 }`. All colour/fog/light values **ease toward the current theme** every frame, except that the
very first frame must **snap** to the theme (otherwise the first screenshot or a hidden browser tab shows white props
and sunken objects).

## 7. The persistent background (three.js)

Two persistent WebGL canvases live in the root layout, so navigating between verses never reloads them:

1. **SceneRoot** (`fixed inset-0 -z-10`): sky, stars, particles, the valley, water, film grain, post-processing.
2. **BirdOverlay** (`fixed inset-0 -z-[5]`, `pointer-events-none`): only the starling. It sits **behind the poem cards
   and in front of the sky**, and it must **never leave the visible viewport** (clamp its flight path to the screen).

`SceneLoader` loads both with `next/dynamic({ ssr: false })` after first paint, wraps each in an error boundary (if
WebGL is missing, fall back silently to the CSS gradient `Backdrop` underneath and mark the loader ready), and renders
nothing on `/map` (the map owns its own canvas; never run two WebGL contexts at once). **Do not give `<body>` a
background**: the canvases sit at negative z-index and an opaque body would hide them. Put the base colour on `<html>`.

### Visual style

One consistent **low-poly, faceted, flat-shaded style** for every object. Soft rim light and a faint wind sway on
foliage/props via shared uniforms in `kit.ts` (a `shared` object holding fog colour, night amount, rim colour). Do not
mix in photorealism anywhere.

### Sky (read this carefully, it was a recurring complaint)

- The sky must be a **perfectly smooth gradient**. There must be **no visible layers, bands, strips or hard edges**.
  Do not add a shader cloud band, and do not add cloud meshes in the valley. Add a small **dither** (a custom
  `DitherEffect` in post-processing) so 8-bit gradient banding cannot show.
- **Stars are tiny**, soft points that twinkle gently and fade in with `theme.stars`. Not big dots.
- A sun disc and glow, and a moon disc and glow, positioned by the theme.
- **Particles are small and few**: tiny soft glow dots or petals that drift per `drift`/`sway`/`density`. If in doubt,
  make them smaller and fewer.
- **Film grain**: a faint animated grain over the whole page. Use a CSS `body::after` fixed overlay with an inline SVG
  `feTurbulence` data-URI, `mix-blend-mode: overlay`, opacity ~0.13, stepping its `background-position` every 0.9 s
  (`steps(6)`), plus a subtle `Noise` pass in the 3D post-processing using the **OVERLAY** blend (SOFT_LIGHT turns HDR
  lamps teal).
- Post-processing: gentle **Bloom** (so lamps and the sun glow), **Vignette**, the grain, the dither. Keep it cheap;
  cap pixel ratio (about 1.5) and pause when the tab is hidden.

### The valley / stage

Behind the text, a layered valley whose objects change with the section's `silhouette`: a city of low-poly mansions
and a palace with gold finials (court/city), a three-tiered shrine (temple), a stupa with a harmika and a bo tree
(stupa), a small kovil with a gopuram and glowing lamps (kovil), palms (palms), jagged mountains (mountain). Include
low-poly **water** with a custom shader (soft ripples, a bright shoreline foam line, alpha fading to zero where the
water is shallow so it does not tint dry land), small boats, lotus, and lamps that glow at night (`nightOf`). Keep the
whole thing readable behind text: it is scenery, never a competitor to the poem.

### The bird (the starling)

This went through many iterations; the final answer is the key:
- **Minimal but a little bit realistic.** A faceted low-poly starling in the same style as everything else: a sleek
  body, a small head with a short pointed beak, a tail, and two wings made of a few flat feathers. Starling colours: dark
  iridescent body with a hint of purple/green, pale speckles, yellowish beak.
- It is generated in code (`myna.ts`/`Starling.tsx`); **do not load a downloaded model** and **do not make it
  photorealistic** (that was rejected as "too realistic"), and do not make it a seagull or a pigeon.
- Animation: wings flap with a soft up/down curve and a slight lag on the feather tips, the body bobs, the tail swings,
  and the whole bird glides along a smooth path that moves a little further along as the verse number advances. When a
  new verse arrives it swoops briefly. In calm mode the flap slows and the path flattens.
- It must stay inside the viewport at every viewport size, including phones, and sit behind the UI.

## 8. The loading screen

A full-screen overlay (above everything) shown on **first load only**. It shows the title in both languages, a small
animated starling in SVG (floating, wings flapping with CSS keyframes, twinkling stars) and a thin progress indicator.
It waits for real readiness: a tiny module `lib/loading.ts` exposes `markReady(key)` for `"fonts"`, `"scene"`, `"bird"`,
`"map"` and a hook to subscribe; a `ReadySignal` component inside each canvas calls `markReady` after the first frame
renders. When everything needed for the current route is ready (and fonts are loaded), fade it out, then flip a global
`loaded` flag so reader animations replay. Add a timeout fallback so it can never block forever, and mark scene/bird/map
ready if WebGL fails. Do not make people wait longer than necessary.

## 9. The 3D map (`/map`)

A separate full-page canvas with a stylised, low-poly **3D map of the starling's route**. One unit is roughly one
kilometre; distances between the main places are in proportion; the coastline is simplified. North is -z, east is +x,
the sea is to the west. Terrain is a height-field mesh (250 x 176 segments over a 68 x 48 plane) using fbm noise and the
functions in `geo.ts` (below), with a sea, a shoreline, the Kelani river carved as a Catmull-Rom curve, the Diyawanna
lake ring around Kotte with a causeway on the north side, and Adam's Peak plus a range in the far east.

`geo.ts` essentials: `MAP = { width:68, depth:48, segX:250, segZ:176, water:0, skirt:-2.4 }`;
`coastX(z) = -10.5 + 1.8*sin(0.3z+0.4) + 0.9*sin(0.85z+2)`; Kotte at `(0, 5)`; the river passes through
`(-12,-9.2) (-8.5,-9.9) (-5.2,-9.1) (-2.2,-8.7) (0.8,-9.6) (4.2,-8.6) (8,-10.2) (12,-9) (17,-11.6) (23,-10) (34,-12.5)`,
wide at the mouth and narrower inland. Adam's Peak at `(29, 6)` with height +7.2 (gaussian), a second ridge near
`(25, 1)`. Land that holds a landmark is levelled to a pad (about 0.24 high).

**Landmarks** (pin height above ground; "pad" = levelled radius), each with Sinhala and English name, a short bilingual
blurb, and the verse range it belongs to:

| id | English | x, z | verses | pin | pad |
| --- | --- | --- | --- | --- | --- |
| kotte | Jayawardhanapura (Kotte) | 0, 5 | 1-16 | 3.2 | 2.3 |
| dalada | Tooth Relic shrine | 1.25, 5.7 | 17 | 1.9 | 0.9 |
| palace | The royal palace | -0.9, 4.3 | 18-21 | 2.1 | 1.0 |
| kovil | Isvara kovil | -0.8, 1.3 | 22-24 | 2.3 | 0.9 |
| samanala | Samanalakanda (Adam's Peak) | 29, 6 | 25-26 | 8.8 | 0 |
| sea | The great ocean | -15.5, -3 | 27-28 | 2.2 | 0 |
| sapumal | Prince Sapumal's army | -1.5, -1.7 | 29-40 | 1.9 | 0.7 |
| kitsiri | Kitsirimevan Vihara | -1.0, -4.2 | 41-42 | 1.8 | 0.8 |
| kelani | The Kelani River | -2.6, -8.1 | 43-52 | 1.7 | 0 |
| kelaniya | Kelaniya temple | -1.0, -7.0 | 53-71 | 3.0 | 1.5 |
| devale | Vibhishana's shrine | 0.9, -6.2 | 72-111 | 2.4 | 0.9 |

Also two scenery-only labels: Colombo (`-8.2, -2.4`, y 1.4) and Kelani estuary (`-9.5, -9.6`, y 0.9). Each landmark gets
a procedurally built model (palace/city, three-tier shrine, kovil, stupa with bo tree, temple, army banners and
parasols for Sapumal, etc.) built from the same `models.ts` kit as the reader background.

**Route:** a centripetal Catmull-Rom curve through these nodes (index: x, z): 0 palace (-0.9, 4.3), 1 (-0.5, 2.7),
2 kovil (-0.8, 1.3), 3 (-1.5, -0.4), 4 Sapumal (-1.5, -1.7), 5 (-1.1, -2.9), 6 Kitsirimevan (-1.0, -4.2), 7 (-1.2, -5.0),
8 along the Kelani (-2.4, -7.1), 9 (-1.0, -5.8), 10 Vibhishana (0.9, -6.0). Flight altitude = max(terrain, 0.2) + 1.7.
Verse-to-position anchors (verse -> fractional node): 1->0, 16->0, 21->0.7, 22->2, 24->2, 25->3, 29->4, 41->6, 42->6,
43->7, 52->8, 53->9, 71->9, 72->10, 111->10, linearly interpolated.

**Map UI (MapExperience):** a left panel or bottom sheet listing the landmarks as chips; selecting one flies the camera
there and shows its blurb, its verse range and a "Read these verses" link. A **scrubber** (verse 1-111) flies the
**starling** along the route to that verse. Three **camera modes**: *Overview* (orbit-style tilted view), *Follow* (chase
camera behind the bird), *Free* (drag/zoom). A floating **pin and label** over each landmark, with these rules learned
the hard way: labels **fade out when the bird is near** so the bird is never hidden under text; unselected labels are
compact; labels are raised above the ground. The bird on the map is **small** (about a third of the size you first
think).

## 10. Other pages

- **`/journey`**: header with the title "The Journey", subtitle "From Kotte to Kelaniya", a short intro paragraph; a
  vertical gold hairline timeline with numbered circles; one card per section, with the card background a gradient built
  from that section's theme colours, the Sinhala and English names, the description, a pill with the verse range
  ("Verse 17" / "Verses 25-42"), and a hover glow. Each card links to its first verse.
- **`/about`**: sections for the story in plain English, the poet and the setting, how to read an Elu verse, the
  poem's structure (the 20 sections), honest notes about the text source and about the explanations being learner's aids,
  and a credits block linking to Sinhala Wikibooks / e-Pothgula and the fonts.
- **`not-found`**: a gentle "this verse is out of reach" message with a link back to verse 1.

## 11. Visual design system

Dark, rich, jewel-toned, warm gold highlights. CSS variables in `globals.css`: `--ink` (near white, warm), `--ink-soft`,
`--ink-faint`, `--gold` (`#f2c46d`), `--line` (translucent white hairline), the canvas fallback `#0b0820`, plus Tailwind
tokens (`text-ink`, `bg-gold`, `border-line`, `font-elu`, `font-sinhala`, `font-display`). A reusable `.glass` surface
(translucent dark fill, backdrop blur, hairline border, soft shadow) for cards. `.rule-gold` hairline divider. Thin
custom scrollbars (`.thin-scroll`). Selection colour in gold. `color-scheme: dark`. Layout is **responsive down to
360 px** with 16-24 px gutters and no horizontal scroll; the verse card, explanation cards and JourneyRail all adapt to
phones (stack vertically, bigger tap targets). Use `Reveal` (a small `motion` wrapper that fades/rises once in view) for
page sections.

## 12. Developer page (`/developer`)

Message: **"Made by an engineer, for the community."** with Sinhala "ඉංජිනේරුවෙකු විසින්, ප්‍රජාව වෙනුවෙන්."
- Hero text in two columns; on the right a glass card holding an **animated character** (`Engineer.tsx`, inline SVG): a
  small friendly person **wearing round glasses at a laptop-less, upper-body pose**. His **eyes and head follow the mouse
  cursor** smoothly (pupils clamp inside the glasses, the head tilts a little), with an occasional blink and a gentle
  idle bob. On touch devices with no cursor, he looks around slowly by himself. Respect calm mode.
- Sections: "Why it exists" (a gift, not a product), three promise cards (Free to read / No ads, no tracking / Honest
  about its limits, each with a Sinhala caption), "How you can help" (three numbered cards: check an explanation, share it
  with a student, tell me what is broken), an **Open source** section (buttons: *View the source*, *How to contribute*,
  *Correct a verse*, built from `repoUrl`), "Built with" pills (Next.js, React, three.js, Tailwind CSS, TypeScript), and
  a closing line "සැළලිහිණිය යළිත් පියඹයි. / The starling flies again." with a link back to the poem.
- **Do not put the phrase "Move your cursor around. Click for a surprise." anywhere on the page.**
- All personal details live in `src/data/developer.ts`: `{ name, contactUrl, contactLabel, repoUrl, sponsorUrl, links[] }`.
  Leave `name`, `contactUrl`, `sponsorUrl` empty and make the page hide any empty part. `repoUrl` and the one link are
  `https://github.com/WasathTheekshana/salalihini-sandeshaya` (label "Source on GitHub"). A **Sponsor** pill (heart in
  `#ea4aaa`) appears only when `sponsorUrl` is set. Never publish an email address.

## 13. Favicon and metadata

- `src/app/icon.svg`: a small, clean favicon - a faceted gold starling silhouette (matching `BirdMark`) on a deep indigo
  rounded square, readable at 16 px.
- `src/app/apple-icon.tsx`: the same mark via `ImageResponse`, 180 x 180.
- `metadata` in `layout.tsx`: title template `%s · Salalihini Sandeshaya` with default `සැළලිහිණි සංදේශය · Salalihini
  Sandeshaya`, a description ("Read all 111 verses of the fifteenth-century Sinhala classic Salalihini Sandeshaya (The
  Starling's Message) with explanations in Sinhala and English, as a starling flies from Kotte to Kelaniya."), Open
  Graph, `viewport` themeColor `#0b0820`, `lang="en"` on `<html>`.

## 14. Open-source package (do all of it)

Research is already done; create these (all text in plain, human, specific prose - no filler, no hype):
- `README.md`: centred title in Sinhala and English, one-paragraph pitch, badges (code MIT, content CC BY-SA 4.0, PRs
  welcome, Code of Conduct, Sponsor), quick links, "Why this exists", Features, Quick start (a scripts table; mention Node
  20.9+ and that fonts need a network on first build), How it is built (stack, folder tree, "how the content works"),
  Contributing (you do not have to write code), Ideas for the future (scholar review, a *human* recording of the verses -
  state that text-to-speech voices were tried and were not good enough for Elu verse, word-by-word glosses, the other
  sandesas, tests/offline), Sponsor, Credits and licences. Do **not** claim the site has audio.
- `LICENSE` (MIT, "Copyright (c) 2026 WasathTheekshana and Salalihini Sandeshaya contributors"), `LICENSE-CONTENT.md`
  (CC BY-SA 4.0 for the verse text, explanations and page copy, and why: the verse text comes from Wikibooks under
  CC BY-SA, which requires share-alike).
- `CONTRIBUTING.md` (opens with "you don't need to write code"; how to fix a verse explanation; dev setup; branch/PR
  flow; checks that must pass), `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1, enforcement via GitHub profile, plus a
  short note on respecting a living cultural work), `SECURITY.md` (GitHub private vulnerability reporting), `SUPPORT.md`,
  `CHANGELOG.md` (Keep a Changelog, `Unreleased` and `0.1.0`), `CREDITS.md` (poem sources, background reading,
  OFL fonts, software), `CITATION.cff`, `docs/content-style-guide.md` (how to write explanations; how to handle
  "General sense" verses; never copy copyrighted commentary).
- `.editorconfig`, `.nvmrc` (22).
- `.github/`: issue forms `content_correction.yml`, `bug_report.yml`, `feature_request.yml`, `config.yml` (blank issues
  disabled); `PULL_REQUEST_TEMPLATE.md` (separate content and code checklists); `FUNDING.yml` (`github:
  [WasathTheekshana]`, with a comment that GitHub Sponsors enrolment is required, and commented alternatives); `CODEOWNERS`
  (`* @WasathTheekshana`); `dependabot.yml` (npm weekly, grouped; actions monthly); `workflows/ci.yml` (checkout,
  setup-node from `.nvmrc`, `npm ci`, lint, typecheck, build); `workflows/codeql.yml` (javascript-typescript, weekly).
- `package.json` metadata: description, `license: MIT`, author, homepage, repository, bugs, funding, keywords, `engines`.
  Keep `"private": true`.
- `.gitignore` must ignore `.env*` (except an example), `.next`, `node_modules`, and local tooling folders.

## 15. Quality bar and verification

Build everything, then verify with real commands and fix every failure before you report:
1. `npm install`, then `npm audit --omit=dev` must report 0 vulnerabilities (production). If dev-only advisories remain with
   no patched version, leave them and say so; do not use `--force`.
2. `npm run typecheck`, `npx eslint src` and `npx next build` must all pass cleanly (the build lists `/`, `/verse/[n]`,
   `/journey`, `/map`, `/about`, `/developer`).
3. Run the app and look at it in a browser at desktop and phone widths: verse 1 on load, the loader, moving between
   verses and sections (sky eases, bird moves, no flashes), `/map`, `/journey`, `/about`, `/developer` (the character
   follows the cursor). Check the console is free of errors and warnings. Note: if the automated browser tab is hidden,
   `requestAnimationFrame` barely runs, which is why the first frame must snap to the theme - do not "fix" that by
   removing the snap.
4. Validate the YAML in `.github/` and `CITATION.cff` parses.

## 16. Pitfalls that were hit before (avoid them)

- Opaque `<body>` background hides negative-z canvases. Put the colour on `<html>` only.
- GLSL: a `#include <...>` must be alone on its line.
- Setting `emissive` on a material that doesn't support it triggers a three.js warning: only set it when provided.
- Do not give explicit weight arrays to the variable Sinhala fonts in `next/font`.
- `params` must be read inside `<Suspense>` with Cache Components, or `next dev` throws.
- Default calm mode to **off**; never derive it from the OS setting.
- Water planes must fade to alpha 0 over shallow depth or they tint land.
- Stale generated types after deleting a route: `rm -rf .next` then `npx next typegen`.
- Keep the bird behind the cards and inside the viewport; keep map labels from covering the bird.
- Do not reintroduce: layered/striped sky, cloud meshes, big stars, big particles, a photoreal or downloaded bird,
  text-to-speech/voice narration, API keys of any kind (there must be no `.env` file and no third-party services).
- Don't commit or push anything unless I ask. Don't create files outside the project.

## 17. Resources to look up on the web

Use web search/fetch for these. Do not rely on memory for them.

- **The poem text (required):** Sinhala Wikibooks page for the poem:
  `https://si.wikibooks.org/wiki/%E0%B7%83%E0%B7%90%E0%B7%85%E0%B6%BD%E0%B7%92%E0%B7%84%E0%B7%92%E0%B6%AB%E0%B7%92_%E0%B7%83%E0%B6%B1%E0%B7%8A%E0%B6%AF%E0%B7%9A%E0%B7%81%E0%B6%BA`
  (original source: `http://epothgula.com/selalihiniya`). The licence is CC BY-SA 4.0. Verse 1 is incomplete in that
  source: keep what exists and say so in the report. Parse it into `poem.json` carefully and check you ended with 111 verses.
- **Background for the explanations and the About page:** search for the poem's story, the poet (Thotagamuwe Sri Rahula),
  King Parakramabahu VI, Kotte, the Kelaniya temple and Vibhishana's shrine, Princess Ulakudaya Devi, Prince Sapumal
  and the Jaffna campaign, Adam's Peak (Samanalakanda), and the sandesa genre. Use them for facts only, written in your
  own words, and list the pages you used in `CREDITS.md`.
- **Next.js:** the docs shipped in `node_modules/next/dist/docs/` first, then nextjs.org/docs for anything missing.
- **three.js and React Three Fiber:** threejs.org docs (ShaderMaterial, BufferGeometry, flat shading, CatmullRomCurve3),
  the React Three Fiber docs from pmndrs (search for them to get the current address), and the `postprocessing` library docs (Bloom, Vignette,
  Noise, custom Effect). Look up current APIs, since versions move.
- **Design inspiration (look, do not copy code):** skiper-ui.com, animmasterlib.dev, threeui.com, and award-style
  history/culture sites with scroll-linked or story-driven 3D. Aim for that level of polish.
- **Open-source conventions:** Contributor Covenant 2.1 (contributor-covenant.org), Keep a Changelog
  (keepachangelog.com), Creative Commons CC BY-SA 4.0 (creativecommons.org/licenses/by-sa/4.0/), GitHub docs for issue
  forms, `FUNDING.yml`, CODEOWNERS, Dependabot, CodeQL and `CITATION.cff`, and well-run projects as models (Next.js,
  Astro, Docusaurus, and MDN's translated-content repo for the "make content corrections as easy as code" idea).
- **Fonts:** Google Fonts pages for Noto Serif Sinhala, Noto Sans Sinhala, Cormorant Garamond (all SIL OFL 1.1) and
  Geist (vercel.com/font); credit them in `CREDITS.md`.

## 18. Final report

When finished, reply with: what you built (routes and features), the commands you ran and their results, every decision
you made where this brief was open, which verses you marked as "General sense" and why, and any step I must do by hand
(for example enabling GitHub Sponsors, filling `src/data/developer.ts`, turning on GitHub private vulnerability
reporting). Keep it short and factual.
