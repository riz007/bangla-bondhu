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
  vocabImage("banana", "Vocabulary picture for কলা (banana)"),
  vocabImage("boat", "Vocabulary picture for নৌকা (boat)"),
  vocabImage("bird", "Vocabulary picture for পাখি (bird)"),
  vocabImage("flower", "Vocabulary picture for ফুল (flower)"),
  vocabImage("moon", "Vocabulary picture for চাঁদ (moon)"),
  vocabImage("ball", "Vocabulary picture for বল (ball)"),
  vocabImage("milk", "Vocabulary picture for দুধ (milk)"),
  vocabImage("dog", "Vocabulary picture for কুকুর (dog)"),
  vocabImage("cow", "Vocabulary picture for গরু (cow)"),
  vocabImage("duck", "Vocabulary picture for হাঁস (duck)"),
  vocabImage("red", "Colour swatch for লাল (red)"),
  vocabImage("blue", "Colour swatch for নীল (blue)"),
  vocabImage("green", "Colour swatch for সবুজ (green)"),
  vocabImage("yellow", "Colour swatch for হলুদ (yellow)"),
  vocabImage("white", "Colour swatch for সাদা (white)"),
  vocabImage("black", "Colour swatch for কালো (black)"),
  {
    path: "/icons/icon.svg",
    kind: "image",
    intendedUse: "App icon: the দোয়েল (magpie-robin) mascot",
    ...ORIGINAL,
  },
];
