// Every image and audio file in /public, with its source and licence.

export interface AssetRecord {
  path: string;
  kind: "image" | "audio";
  creator: string;
  licence: string;
  source: string;
  intendedUse: string;
  notes?: string;
}

const ORIGINAL = {
  creator: "Bangla Bondhu project (drawn for this app)",
  licence: "Project-owned original artwork",
  source: "Hand-written SVG in this repository",
} as const;

const vocabImage = (name: string, intendedUse: string): AssetRecord => ({
  path: `/images/vocab/${name}.svg`,
  kind: "image",
  intendedUse,
  ...ORIGINAL,
});

export const assetManifest: AssetRecord[] = [
  vocabImage("mango", "Vocabulary picture for আম (mango)"),
  vocabImage("rice", "Vocabulary picture for ভাত (cooked rice)"),
  vocabImage("fish", "Vocabulary picture for মাছ (fish)"),
  vocabImage("egg", "Vocabulary picture for ডিম (egg)"),
  vocabImage("water", "Vocabulary picture for পানি (water)"),
  vocabImage("book", "Vocabulary picture for বই (book)"),
  vocabImage("pen", "Vocabulary picture for কলম (pen)"),
  vocabImage("cat", "Vocabulary picture for বিড়াল (cat)"),
  vocabImage("house", "Vocabulary picture for বাড়ি (house)"),
  vocabImage("tree", "Vocabulary picture for গাছ (tree)"),
  {
    path: "/icons/icon.svg",
    kind: "image",
    intendedUse: "App icon: the দোয়েল (magpie-robin) mascot",
    ...ORIGINAL,
  },
];
