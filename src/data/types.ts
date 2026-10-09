export type Meaning = {
  n: number;
  /** Modern Sinhala explanation */
  si: string;
  /** English explanation */
  en: string;
  /** Optional cultural / historical context */
  note?: { si: string; en: string };
};

export type Verse = {
  n: number;
  lines: string[];
};
