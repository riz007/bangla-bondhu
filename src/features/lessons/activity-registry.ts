import { activityInstruction } from "@/features/curriculum/localize";
import type { Activity, CurriculumItem } from "@/features/curriculum/schema";
import { messages, type Locale } from "@/lib/i18n/messages";

export function instructionFor(activity: Activity, locale: Locale, prompt?: CurriculumItem): string {
  const custom = activityInstruction(activity, locale);
  if (custom) return custom;
  const t = messages[locale].instructions;
  switch (activity.type) {
    case "introduce":
      return prompt?.kind === "letter" || prompt?.kind === "vowel-sign" ? t.introduceLetter : t.introduceWord;
    case "listen-and-select":
      return t.listenAndSelect;
    case "image-to-word":
      return t.imageToWord;
    case "word-to-image":
      return t.wordToImage;
    case "read-and-choose":
      return t.readAndChoose;
    case "recall":
      return t.recall;
    case "match-pairs":
      return activity.matchBy === "image" ? t.matchImages : t.matchMeanings;
    case "build-syllable":
      return t.buildSyllable;
    case "build-word":
      return t.buildWord;
    case "missing-character":
      return t.missingCharacter;
    case "listen-and-order":
      return t.listenAndOrder;
  }
}
