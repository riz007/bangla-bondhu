import { activityInstruction } from "@/features/curriculum/localize";
import type { Activity, CurriculumItem } from "@/features/curriculum/schema";
import { messages, type Locale } from "@/lib/i18n/messages";

export function instructionFor(activity: Activity, locale: Locale, prompt?: CurriculumItem): string {
  const custom = activityInstruction(activity, locale);
  if (custom) return custom;
  const t = messages[locale].instructions;
  switch (activity.type) {
    case "introduce":
      return prompt?.kind === "word" || prompt?.kind === "phrase" ? t.introduceWord : t.introduceLetter;
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
      return prompt?.kind === "phrase" ? t.fillSentence : t.missingCharacter;
    case "tip":
      return locale === "en" ? activity.titleEn : activity.titleTh;
    case "make-sentence":
      return t.makeSentence;
    case "listen-and-order":
      return t.listenAndOrder;
  }
}
