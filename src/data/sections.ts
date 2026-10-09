export type ThemeId =
  | "dawn"
  | "court"
  | "dusk"
  | "night"
  | "morning"
  | "road"
  | "river"
  | "sunset"
  | "lamplight"
  | "sacred"
  | "devale"
  | "divine"
  | "moonlit";

export type Silhouette = "none" | "city" | "stupa" | "kovil" | "mountain" | "palms" | "temple";

export type Section = {
  id: string;
  /** Verse range, inclusive */
  from: number;
  to: number;
  si: string;
  en: string;
  theme: ThemeId;
  silhouette: Silhouette;
  /** Short orienting paragraph shown above the verse */
  descSi: string;
  descEn: string;
};

export const SECTIONS: Section[] = [
  {
    id: "blessing",
    from: 1,
    to: 1,
    si: "ආසී",
    en: "The Invocation",
    theme: "dawn",
    silhouette: "none",
    descSi: "කවිය ආරම්භ වන්නේ ආශිර්වාදයකිනි. කවියා සැළලිහිණි දූතියට ආමන්ත්‍රණය කරයි.",
    descEn: "Every classical Sinhala poem opens with a blessing. Here the poet turns to greet the starling who will carry his message.",
  },
  {
    id: "greeting",
    from: 2,
    to: 3,
    si: "සැපදුක් විමසුම්",
    en: "Greetings & Inquiry",
    theme: "dawn",
    silhouette: "none",
    descSi: "කවියා දූතියගේ රූපශ්‍රීය වර්ණනා කරමින්, ඇය පැමිණි ගමන පහසුවෙන් අවසන් වූයේදැයි සුවදුක් විමසයි.",
    descEn: "The poet praises the starling's beauty and asks, as a good host would, whether her journey here was safe and easy.",
  },
  {
    id: "errand",
    from: 4,
    to: 5,
    si: "කටයුතු නිදෙස්",
    en: "The Errand",
    theme: "dawn",
    silhouette: "none",
    descSi: "සැබෑ මිතුරුකමේ ගුණ කියා, කවියා තම ඉල්ලීම පළමු වරට හෙළි කරයි: කැලණි විභීෂණ දෙවියන්ට පණිවුඩයක් ගෙන යන්න.",
    descEn: "After a word on true friendship, the poet names the task: carry a message to the god Vibhishana at Kelaniya.",
  },
  {
    id: "city",
    from: 6,
    to: 14,
    si: "ජයවද්දන පුර වැනුම්",
    en: "The City of Jayawardhanapura",
    theme: "court",
    silhouette: "city",
    descSi: "කෝට්ටේ රාජධානිය වන ජයවර්ධනපුරයේ ප්‍රාකාර, දොරටු, උයන්, මාළිගා සහ නගර කාන්තාවන් පිළිබඳ ආකර්ෂණීය වර්ණනාවකි.",
    descEn: "A dazzling portrait of Jayawardhanapura Kotte, the capital: its moat, gates, gardens, mansions and the women of the city.",
  },
  {
    id: "setting-out",
    from: 15,
    to: 16,
    si: "ගමන් පිරුම",
    en: "Setting Out",
    theme: "dusk",
    silhouette: "city",
    descSi: "ගමන ආරම්භ කළ යුතු සුබ මොහොත සහ මඟ දිගට පෙනෙන සුබ නිමිති පිළිබඳ කවි.",
    descEn: "Choosing the auspicious hour to leave, and the good omens that greet the traveller on the road.",
  },
  {
    id: "tooth-relic",
    from: 17,
    to: 17,
    si: "දළදා වැනුම",
    en: "The Tooth Relic",
    theme: "dusk",
    silhouette: "temple",
    descSi: "දළදා වහන්සේ වැඩ සිටින තෙමහල් මාළිගාව වැඳ ගැනීමට දූතියට උපදෙස් ලැබේ.",
    descEn: "The starling is told to pay homage to the Sacred Tooth Relic, kept in its three-storey shrine at Kotte.",
  },
  {
    id: "king",
    from: 18,
    to: 20,
    si: "රජ දැක්ම",
    en: "Before the King",
    theme: "court",
    silhouette: "city",
    descSi: "රන් කොත් දිලිහෙන රාජ මාළිගාව සහ සෙංකඩගල සිංහාසනයේ වැඩ සිටින හයවන පරාක්‍රමබාහු රජතුමා පිළිබඳ වර්ණනාව.",
    descEn: "The golden-spired palace, and King Parakramabahu VI seated on his lion throne. The bird must take the king's leave.",
  },
  {
    id: "departure",
    from: 21,
    to: 21,
    si: "නික්මුම",
    en: "Departure",
    theme: "dusk",
    silhouette: "city",
    descSi: "සඳ පායන සැඳෑවේ දී සැළලිහිණිය නගරයෙන් පිටත් වේ.",
    descEn: "As moonlight opens the night lilies, the starling finally takes wing from the city.",
  },
  {
    id: "night",
    from: 22,
    to: 22,
    si: "නිසා වැනුම්",
    en: "The Night",
    theme: "night",
    silhouette: "kovil",
    descSi: "රාත්‍රිය ගත කිරීමට යෝජනා කෙරෙන කෝවිලේ දර්ශනය: කපුරු දුම, සක් හඬ, දෙමළ ගී.",
    descEn: "A night's rest at a Hindu kovil: camphor smoke, conch calls and Tamil hymns, all described with warmth.",
  },
  {
    id: "dawn",
    from: 23,
    to: 24,
    si: "උදා වැනුම්",
    en: "Dawn",
    theme: "morning",
    silhouette: "palms",
    descSi: "උදාවන හිරු සහ මලින් සුවඳ ගෙන එන පාන්දර සුළං සමඟ දූතිය අවදි කෙරේ.",
    descEn: "Morning breezes and the rising sun wake the starling for the long day's flight.",
  },
  {
    id: "road",
    from: 25,
    to: 42,
    si: "මග වැනුම්",
    en: "The Road",
    theme: "road",
    silhouette: "mountain",
    descSi: "සමනළ කන්ද, මහ සයුර, වෙල්යායවල්, විල් සහ වන රොක් පසු කරමින් කැලණිය කරා යන ගමනේ සිතුවම්.",
    descEn: "The longest stretch: mountains, sea, paddy fields, lotus lakes and forest, all seen from the starling's wings.",
  },
  {
    id: "river",
    from: 43,
    to: 45,
    si: "කැලණි නදී වැනුම්",
    en: "The Kelani River",
    theme: "river",
    silhouette: "palms",
    descSi: "කැලණි ගඟේ දෙපස තුරු සෙවණ, ස්නානය කරන කාන්තාවන් සහ බුදුගුණ ගී වයන නාග කුමරියන්.",
    descEn: "Shaded riverbanks, bathing women, and naga maidens playing the veena and singing the Buddha's virtues.",
  },
  {
    id: "evening",
    from: 46,
    to: 52,
    si: "සැඳෑ වැනුම්",
    en: "Evening",
    theme: "sunset",
    silhouette: "palms",
    descSi: "හිරු බසින රතු අහස, සවස ගඟේ කෙළි සහ සඳ උදාවන ආකාරය විස්තර වේ.",
    descEn: "A long, glowing sunset: women playing in the river, the red sky, and the first moonrise.",
  },
  {
    id: "kelaniya-city",
    from: 53,
    to: 58,
    si: "කැලණි පුර වැනුම්",
    en: "The City of Kelaniya",
    theme: "lamplight",
    silhouette: "stupa",
    descSi: "ගමනේ ගමනාන්තය වන කැලණි පුරවරයේ වර්ණනාව.",
    descEn: "At last the starling reaches Kelaniya, shining under the moon with lamps and festivals.",
  },
  {
    id: "merit",
    from: 59,
    to: 71,
    si: "පින්කම් වැනුම්",
    en: "Worship at the Temple",
    theme: "sacred",
    silhouette: "stupa",
    descSi: "කැලණි රජ මහා විහාරයේ බුද්ධ ප්‍රතිමා, චෛත්‍ය සහ බෝධිය වැඳීමට යොමු කරන කවි. බුදුන්ගේ තුන්වන ලංකා ගමන සිහිපත් කෙරේ.",
    descEn: "A pilgrimage through Kelaniya's great temple: its Buddha images and stupa, recalling the Buddha's third visit to Lanka.",
  },
  {
    id: "devale",
    from: 72,
    to: 76,
    si: "දෙව් මැඳුරු වැනුම්",
    en: "The God's Shrine",
    theme: "devale",
    silhouette: "temple",
    descSi: "දෙවොල් මැඳුරේ සංගීතය හා නැටුම්, සුරඟනන් මෙන් රඟන නර්තන ශිල්පිනීන්.",
    descEn: "Entering the shrine of the deity: music, offerings and dancers who move like celestial nymphs.",
  },
  {
    id: "vibhishana",
    from: 77,
    to: 92,
    si: "විබිසණ දෙව් වැනුම්",
    en: "Vibhishana, the God",
    theme: "divine",
    silhouette: "none",
    descSi: "කිරුළේ සිට පා දක්වා විභීෂණ දෙවියන්ගේ අලංකාර වර්ණනාව. කවි පහළොවක් පුරා විහිදේ.",
    descEn: "Fifteen verses portray the deity from crown to feet, ending with his legendary role as Ravana's wise brother.",
  },
  {
    id: "message",
    from: 93,
    to: 107,
    si: "අස්න",
    en: "The Message",
    theme: "moonlit",
    silhouette: "none",
    descSi: "කවියේ හදවත: රජුගේ දියණිය උලකුඩය දේවියට පුතෙකු දෙන ලෙස විභීෂණ දෙවියන්ට කරන ආයාචනය.",
    descEn: "The heart of the poem: the plea that Vibhishana grant a son to Princess Ulakudaya Devi, daughter of the king.",
  },
  {
    id: "blessing-end",
    from: 108,
    to: 108,
    si: "ආසී",
    en: "Closing Blessing",
    theme: "dawn",
    silhouette: "none",
    descSi: "සියලු අදහස් සඳහා සැළලිහිණියට සුබ පැතුම්.",
    descEn: "A closing blessing: may the starling return safely, her task done.",
  },
  {
    id: "colophon",
    from: 109,
    to: 111,
    si: "පුරාණ සන්නයේ අගට යෙදුණු කවි",
    en: "The Colophon",
    theme: "dawn",
    silhouette: "none",
    descSi: "පැරණි සන්නයේ අගට එක් කළ කවි තුන: කාලය, අරමුණ සහ කවියාගේ ගුරුකුලය සඳහන් කරයි.",
    descEn: "Three verses added in the old commentary: when the poem was made, why, and who inspired it.",
  },
];

export const TOTAL_VERSES = 111;

export function sectionOfVerse(n: number): Section {
  return SECTIONS.find((s) => n >= s.from && n <= s.to) ?? SECTIONS[0];
}
