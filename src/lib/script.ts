import type { TargetLanguage } from "@/features/curriculum/schema";

export interface LanguageAttributes {
  lang: string;
  dir: "ltr" | "rtl";
}

export function languageAttributes(language: TargetLanguage): LanguageAttributes {
  switch (language) {
    case "ar":
      return { lang: "ar", dir: "rtl" };
    case "bn-BD":
      return { lang: "bn-BD", dir: "ltr" };
    case "th":
      return { lang: "th", dir: "ltr" };
  }
}

export function scriptClass(language: TargetLanguage): string {
  if (language === "ar") return "font-arabic";
  if (language === "bn-BD") return "font-bengali";
  return "";
}

// Characters that attach to the one before; splitting in front of them breaks shaping.
const COMBINING_MARK =
  /[\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u064B-\u065F\u0670\u200C\u200D]/u;

export function isCombiningMark(char: string): boolean {
  return COMBINING_MARK.test(char);
}

export function splitForHighlight(
  text: string,
  target: string,
): [before: string, match: string, after: string] | null {
  if (!target) return null;
  const index = text.indexOf(target);
  if (index === -1) return null;
  const before = text.slice(0, index);
  const after = text.slice(index + target.length);
  if (isCombiningMark(target[0] ?? "")) return null;
  if (after && isCombiningMark(after[0])) return null;
  // A virama (্) before the target would join them into a conjunct.
  if (before.endsWith("\u09CD")) return null;
  return [before, target, after];
}
