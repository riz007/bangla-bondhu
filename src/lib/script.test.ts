import { describe, expect, it } from "vitest";
import { languageAttributes, splitForHighlight } from "./script";
import { seededShuffle } from "./seeded-shuffle";

describe("languageAttributes", () => {
  it("marks Arabic as right-to-left and Bengali as left-to-right", () => {
    expect(languageAttributes("ar")).toEqual({ lang: "ar", dir: "rtl" });
    expect(languageAttributes("bn-BD")).toEqual({ lang: "bn-BD", dir: "ltr" });
    expect(languageAttributes("th")).toEqual({ lang: "th", dir: "ltr" });
  });
});

describe("splitForHighlight", () => {
  it("splits at safe grapheme boundaries", () => {
    expect(splitForHighlight("আম", "আ")).toEqual(["", "আ", "ম"]);
    expect(splitForHighlight("বই", "ই")).toEqual(["ব", "ই", ""]);
  });

  it("refuses to split a consonant from its vowel sign", () => {
    // ম in মা carries া; highlighting ম alone would break shaping.
    expect(splitForHighlight("মা", "ম")).toBeNull();
  });

  it("refuses to split a conjunct joined by the virama", () => {
    // ধন্যবাদ: য follows ন + ্ and is part of the conjunct ন্য.
    expect(splitForHighlight("ধন্যবাদ", "য")).toBeNull();
  });

  it("refuses to highlight a lone combining sign", () => {
    expect(splitForHighlight("মা", "া")).toBeNull();
  });
});

describe("seededShuffle", () => {
  it("is deterministic and keeps every element", () => {
    const items = ["a", "b", "c", "d"];
    expect(seededShuffle(items, "seed")).toEqual(seededShuffle(items, "seed"));
    expect([...seededShuffle(items, "seed")].sort()).toEqual(items);
  });
});
