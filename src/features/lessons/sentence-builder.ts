import type { ActivityOf, CurriculumItem } from "@/features/curriculum/schema";

type Frame = ActivityOf<"make-sentence">;

export interface AgreementProblem {
  slot: number;
  personItemId: string;
  requiredItemId: string;
}

// Slots with a single word (like না or আছে) are filled in for the learner.
export function initialChoices(frame: Frame): (string | null)[] {
  return frame.slots.map((slot) => (slot.options.length === 1 ? slot.options[0] : null));
}

export function findAgreementProblem(
  frame: Frame,
  choices: readonly (string | null)[],
): AgreementProblem | null {
  for (const rule of frame.agreement) {
    const person = choices[rule.dependsOn];
    const chosen = choices[rule.slot];
    if (!person || !chosen) continue;
    const required = rule.pairs[person];
    if (required && required !== chosen) {
      return { slot: rule.slot, personItemId: person, requiredItemId: required };
    }
  }
  return null;
}

export function composeSentence(
  frame: Frame,
  chosen: readonly CurriculumItem[],
): { text: string; transliteration: string; meaningTh: string; meaningEn: string } {
  const fill = (template: string, field: "glossTh" | "glossEn") =>
    template.replace(/\{(\d+)\}/g, (_, index: string) => chosen[Number(index)]?.[field] ?? "");
  return {
    text: chosen.map((item) => item.targetText).join(" "),
    transliteration: chosen.map((item) => item.transliteration ?? "").join(" "),
    meaningTh: fill(frame.templateTh, "glossTh"),
    meaningEn: fill(frame.templateEn, "glossEn"),
  };
}
