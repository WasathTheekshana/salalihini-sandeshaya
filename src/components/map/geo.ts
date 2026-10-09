import * as THREE from "three";
import { fbm, smooth } from "../three/kit";

/**
 * A stylised map of the starling's flight. One unit is roughly a kilometre, with the
 * distances between the main places kept in proportion and the coastline simplified.
 * North is -z, east is +x, the sea lies to the west.
 */

export const MAP = {
  width: 68,
  depth: 48,
  segX: 250,
  segZ: 176,
  /** Sea level */
  water: 0,
  skirt: -2.4,
} as const;

export const coastX = (z: number) => -10.5 + 1.8 * Math.sin(z * 0.3 + 0.4) + 0.9 * Math.sin(z * 0.85 + 2);

/* ------------------------------ Kelani river ------------------------------ */

const riverCurve = new THREE.CatmullRomCurve3(
  (
    [
      [-12, -9.2],
      [-8.5, -9.9],
      [-5.2, -9.1],
      [-2.2, -8.7],
      [0.8, -9.6],
      [4.2, -8.6],
      [8, -10.2],
      [12, -9],
      [17, -11.6],
      [23, -10],
      [34, -12.5],
    ] as [number, number][]
  ).map(([x, z]) => new THREE.Vector3(x, 0, z)),
  false,
  "catmullrom",
  0.5,
);
const riverPts = riverCurve.getPoints(420);

export function riverInfo(x: number, z: number): { d: number; w: number } {
  let best = Infinity;
  let bi = 0;
  for (let i = 0; i < riverPts.length; i++) {
    const p = riverPts[i];
    const dx = x - p.x;
    const dz = z - p.z;
    const dd = dx * dx + dz * dz;
    if (dd < best) {
      best = dd;
      bi = i;
    }
  }
  const t = bi / (riverPts.length - 1);
  // wide estuary at the mouth, narrowing inland
  return { d: Math.sqrt(best), w: 0.42 + 0.75 * smooth(0.2, 0, t) };
}

/* ------------------------- Diyawanna lake and marsh ------------------------ */

export const KOTTE = { x: 0, z: 5 };

function wrap(a: number) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function lakeMask(x: number, z: number): number {
  const dx = x - KOTTE.x;
  const dz = z - KOTTE.z;
  const r = Math.hypot(dx, dz);
  const ang = Math.atan2(dz, dx);
  const ring = smooth(0.62, 0.12, Math.abs(r - 2.8));
  // a causeway on the north side where the road leaves the city
  const gap = smooth(0.22, 0.5, Math.abs(wrap(ang + Math.PI / 2)));
  const marsh = smooth(1.5, 0.5, Math.hypot(x + 3.4, z - 3.2)) * 0.9;
  return Math.max(ring * gap, marsh);
}

/* -------------------------------- Landmarks -------------------------------- */

export type Landmark = {
  id: string;
  si: string;
  en: string;
  x: number;
  z: number;
  /** Verse range this place belongs to; null = scenery label only */
  verses: [number, number] | null;
  blurbEn: string;
  blurbSi: string;
  /** Height of the floating pin above the ground */
  pin: number;
  /** Radius of the levelled pad */
  pad: number;
};

export const LANDMARKS: Landmark[] = [
  {
    id: "kotte",
    si: "ජයවර්ධනපුරය (කෝට්ටේ)",
    en: "Jayawardhanapura (Kotte)",
    x: KOTTE.x,
    z: KOTTE.z,
    verses: [1, 16],
    blurbEn: "The royal capital, ringed by the Diyawanna waters. The poem opens here and the starling sets out at an auspicious hour.",
    blurbSi: "දියවන්නා ඔයෙන් වටවූ රාජධානිය. කවිය ඇරඹෙන්නේත් සැළලිහිණිය සුබ මොහොතක පිටත් වන්නේත් මෙතැනිනි.",
    pin: 3.2,
    pad: 2.3,
  },
  {
    id: "dalada",
    si: "දළදා මාළිගාව",
    en: "Tooth Relic shrine",
    x: 1.25,
    z: 5.7,
    verses: [17, 17],
    blurbEn: "A three-storey shrine for the Sacred Tooth Relic, built by Parakramabahu VI.",
    blurbSi: "හයවන පරාක්‍රමබාහු රජු කරවූ දළදා වහන්සේ වැඩ සිටින තෙමහල් මාළිගාව.",
    pin: 1.9,
    pad: 0.9,
  },
  {
    id: "palace",
    si: "රාජ මාළිගාව",
    en: "The royal palace",
    x: -0.9,
    z: 4.3,
    verses: [18, 21],
    blurbEn: "King Parakramabahu receives the bird, and she takes his leave as the moon rises.",
    blurbSi: "පරාක්‍රමබාහු රජු දැක අවසර ගෙන, සඳ පායන විට සැළලිහිණිය පිටත් වේ.",
    pin: 2.1,
    pad: 1.0,
  },
  {
    id: "kovil",
    si: "ඊශ්වර කෝවිල",
    en: "Isvara kovil",
    x: -0.8,
    z: 1.3,
    verses: [22, 24],
    blurbEn: "A Hindu shrine where the starling is told to rest for the night, then wakes at dawn.",
    blurbSi: "රාත්‍රිය ගත කිරීමට යෝජනා කෙරෙන හින්දු කෝවිල; උදාවන විට නැවත ගමන ඇරඹේ.",
    pin: 2.3,
    pad: 0.9,
  },
  {
    id: "samanala",
    si: "සමනළ කන්ද",
    en: "Samanalakanda (Adam's Peak)",
    x: 29,
    z: 6,
    verses: [25, 26],
    blurbEn: "Seen far to the east. The mountain of the sacred footprint, with the god Saman and celestial maidens worshipping it.",
    blurbSi: "නැගෙනහිරින් දුරින් පෙනෙන ශ්‍රී පාද කන්ද; සමන් දෙවියන් සහ සුරඟනන් එය වඳිති.",
    pin: 8.8,
    pad: 0,
  },
  {
    id: "sea",
    si: "මහ සයුර",
    en: "The great ocean",
    x: -15.5,
    z: -3,
    verses: [27, 28],
    blurbEn: "Waves rise as if to drink from the heavenly Ganges, and the shore glitters with pearls and conches.",
    blurbSi: "ගංගාවෙන් පානය කරන්නාක් මෙන් රළ නැගේ; වෙරළ මුතු සහ සක් කටුවලින් බබළයි.",
    pin: 2.2,
    pad: 0,
  },
  {
    id: "sapumal",
    si: "සපුමල් කුමරුගේ සේනාව",
    en: "Prince Sapumal's army",
    x: -1.5,
    z: -1.7,
    verses: [29, 40],
    blurbEn: "The prince returns in triumph from conquering Yapa Patuna (Jaffna), with parasols and banners. The road runs on through forest and paddy.",
    blurbSi: "යාපා පටුන ජයගෙන සපුමල් කුමරු සේනාව සමඟ ආපසු එයි. මඟ වන සහ කෙත් මැදින් දිගටම යයි.",
    pin: 1.9,
    pad: 0.7,
  },
  {
    id: "kitsiri",
    si: "කිත්සිරිමේවන් විහාරය",
    en: "Kitsirimevan Vihara",
    x: -1.0,
    z: -4.2,
    verses: [41, 42],
    blurbEn: "A temple and Bo tree on the road, where the starling is told to rest by afternoon.",
    blurbSi: "මඟ අසල පිහිටි විහාරය සහ බෝධිය; පස්වරුවේ මෙහි නැවතෙන්නැයි කියැවේ.",
    pin: 1.8,
    pad: 0.8,
  },
  {
    id: "kelani",
    si: "කැලණි ගඟ",
    en: "The Kelani River",
    x: -2.6,
    z: -8.1,
    verses: [43, 52],
    blurbEn: "Shaded banks, bathing women, naga maidens playing the veena, and a long red sunset.",
    blurbSi: "සෙවණ ඉවුරු, ස්නානය කරන කාන්තාවෝ, වීණා වයන නාග කුමරියෝ සහ දිගු රන් සැඳෑව.",
    pin: 1.7,
    pad: 0,
  },
  {
    id: "kelaniya",
    si: "කැලණි රජ මහා විහාරය",
    en: "Kelaniya temple",
    x: -1.0,
    z: -7.0,
    verses: [53, 71],
    blurbEn: "The destination city. The great stupa, the Bo tree and the images recall the Buddha's third visit to Lanka.",
    blurbSi: "ගමනාන්තය වන කැලණි පුරවරය; මහා චෛත්‍යය, බෝධිය සහ ප්‍රතිමා බුදුන්ගේ තුන්වන ලංකා ගමන සිහි කරවයි.",
    pin: 3.0,
    pad: 1.5,
  },
  {
    id: "devale",
    si: "විභීෂණ දේවාලය",
    en: "Vibhishana's shrine",
    x: 0.9,
    z: -6.2,
    verses: [72, 111],
    blurbEn: "The god's shrine: music, dancers, a portrait of Vibhishana, and the plea for a son for Princess Ulakudaya Devi.",
    blurbSi: "දෙවොල් මැඳුර: සංගීතය, නැටුම්, විභීෂණ දෙවියන්ගේ වර්ණනාව සහ උලකුඩය දේවියට පුතෙකු පතා කරන ආයාචනය.",
    pin: 2.4,
    pad: 0.9,
  },
];

export const SCENERY_LABELS: { id: string; en: string; si: string; x: number; z: number; y: number }[] = [
  { id: "colombo", en: "Colombo", si: "කොළඹ", x: -8.2, z: -2.4, y: 1.4 },
  { id: "mouth", en: "Kelani estuary", si: "කැලණි මෝය", x: -9.5, z: -9.6, y: 0.9 },
];

/* --------------------------------- Terrain --------------------------------- */

function padBlend(h: number, x: number, z: number): number {
  for (const l of LANDMARKS) {
    if (l.pad <= 0) continue;
    const d = Math.hypot(x - l.x, z - l.z);
    if (d < l.pad * 1.7) {
      const target = l.id === "kotte" ? 0.26 : 0.24;
      h += (target - h) * smooth(l.pad * 1.7, l.pad * 0.9, d);
    }
  }
  return h;
}

export function terrainHeight(x: number, z: number): number {
  const d = x - coastX(z);
  let h: number;
  if (d < 0) {
    h = -smooth(0, 8, -d) * 1.5 - 0.03;
  } else {
    const land = smooth(0, 0.9, d);
    h = 0.03 + land * (0.16 + 0.32 * fbm(x * 0.14 + 4, z * 0.14) * smooth(1.5, 10, d));
    h += smooth(9, 34, d) * 2.4 * fbm(x * 0.08, z * 0.08 + 7);
  }
  // Adam's Peak and its range, far east
  const px = x - 29;
  const pz = z - 6;
  h += 7.2 * Math.exp(-(px * px + pz * pz) / 22);
  h += 2.3 * Math.exp(-((x - 25) ** 2 / 70 + (z - 1) ** 2 / 110)) * (0.8 + 0.4 * fbm(x * 0.3, z * 0.3));

  const keep = padBlend(h, x, z);
  h = keep;

  const r = riverInfo(x, z);
  const carve = smooth(r.w * 2.4, r.w * 0.5, r.d);
  h = h * (1 - carve) + -0.4 * carve;
  const lake = lakeMask(x, z);
  h = h * (1 - lake) + -0.3 * lake;
  return h;
}

/** Cheap local terrain test used when scattering vegetation. */
export function isLand(x: number, z: number, margin = 0.1) {
  return terrainHeight(x, z) > margin;
}

/* ---------------------------------- Route ---------------------------------- */

type NodeDef = { x: number; z: number };
export const ROUTE_NODES: NodeDef[] = [
  { x: -0.9, z: 4.3 }, // 0 palace
  { x: -0.5, z: 2.7 }, // 1 leaving the city
  { x: -0.8, z: 1.3 }, // 2 kovil
  { x: -1.5, z: -0.4 }, // 3 road
  { x: -1.5, z: -1.7 }, // 4 Sapumal's army
  { x: -1.1, z: -2.9 }, // 5
  { x: -1.0, z: -4.2 }, // 6 Kitsirimevan
  { x: -1.2, z: -5.0 }, // 7 the river approach
  { x: -2.4, z: -7.1 }, // 8 along the Kelani
  { x: -1.0, z: -5.8 }, // 9 north of the Kelaniya stupa
  { x: 0.9, z: -6.0 }, // 10 Vibhishana's shrine
];

const ROUTE_HEIGHT = 1.7;

export function buildRoute() {
  const pts = ROUTE_NODES.map((n) => new THREE.Vector3(n.x, 0, n.z));
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  // arc-length parameter of each node
  const samples = 800;
  const lengths = curve.getLengths(samples);
  const total = lengths[samples];
  const nodeU: number[] = [];
  let cursor = 0;
  for (const n of ROUTE_NODES) {
    let best = Infinity;
    let bestI = cursor;
    for (let i = cursor; i <= samples; i++) {
      const p = curve.getPointAt(i / samples);
      const d = (p.x - n.x) ** 2 + (p.z - n.z) ** 2;
      if (d < best) {
        best = d;
        bestI = i;
      }
    }
    cursor = bestI;
    nodeU.push(bestI / samples);
  }
  void total;
  return { curve, nodeU };
}

/** Anchors tie verse numbers to (fractional) route node indices. */
const ANCHORS: [number, number][] = [
  [1, 0],
  [16, 0],
  [21, 0.7],
  [22, 2],
  [24, 2],
  [25, 3],
  [29, 4],
  [41, 6],
  [42, 6],
  [43, 7],
  [52, 8],
  [53, 9],
  [71, 9],
  [72, 10],
  [111, 10],
];

export function verseToNode(verse: number): number {
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const [v0, n0] = ANCHORS[i];
    const [v1, n1] = ANCHORS[i + 1];
    if (verse >= v0 && verse <= v1) {
      const t = v1 === v0 ? 0 : (verse - v0) / (v1 - v0);
      return n0 + (n1 - n0) * t;
    }
  }
  return 10;
}

export function nodeToU(nodeU: number[], f: number): number {
  const i = Math.min(Math.floor(f), nodeU.length - 2);
  const t = f - i;
  return nodeU[i] + (nodeU[i + 1] - nodeU[i]) * Math.min(Math.max(t, 0), 1);
}

export const routeAltitude = (x: number, z: number) => Math.max(terrainHeight(x, z), 0.2) + ROUTE_HEIGHT;

export function landmarkForVerse(verse: number): Landmark | undefined {
  // prefer the most specific (narrowest) range containing the verse
  let best: Landmark | undefined;
  let bestSpan = Infinity;
  for (const l of LANDMARKS) {
    if (!l.verses) continue;
    if (verse >= l.verses[0] && verse <= l.verses[1]) {
      const span = l.verses[1] - l.verses[0];
      if (span < bestSpan) {
        best = l;
        bestSpan = span;
      }
    }
  }
  return best;
}
