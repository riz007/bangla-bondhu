"use client";

import { BookHeart, Lightbulb, Sparkles } from "lucide-react";
import { useState } from "react";
import { ItemText, TargetText, Transliteration } from "@/components/script/target-text";
import { getItem } from "@/features/curriculum/loader";
import type { ActivityOf } from "@/features/curriculum/schema";
import { progressActions } from "@/features/progress/progress-store";
import { useLocale, useT } from "@/features/settings/settings-store";
import { instructionFor } from "../activity-registry";
import { composeSentence, findAgreementProblem, initialChoices } from "../sentence-builder";
import { ActionBar, ActivityHeading } from "./shared";

interface MakeSentenceProps {
  activity: ActivityOf<"make-sentence">;
  onContinue: () => void;
}

export function MakeSentenceActivityView({ activity, onContinue }: MakeSentenceProps) {
  const locale = useLocale();
  const t = useT();
  const [choices, setChoices] = useState(() => initialChoices(activity));
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  const complete = choices.every((choice) => choice !== null);
  const problem = checked ? findAgreementProblem(activity, choices) : null;
  const accepted = checked && !problem;
  const chosenItems = complete ? choices.map((id) => getItem(id as string)) : [];
  const sentence = complete ? composeSentence(activity, chosenItems) : null;

  const choose = (slot: number, itemId: string) => {
    if (accepted) return;
    setChoices((previous) => previous.map((choice, index) => (index === slot ? itemId : choice)));
    setChecked(false);
  };

  const save = async () => {
    if (!sentence || saving) return;
    setSaving(true);
    await progressActions.saveSentence({
      id: `${activity.id}-${Date.now()}`,
      text: sentence.text,
      meaningTh: sentence.meaningTh,
      meaningEn: sentence.meaningEn,
      createdAt: new Date().toISOString(),
    });
    onContinue();
  };

  return (
    <div className="flex flex-col gap-6">
      <ActivityHeading>{instructionFor(activity, locale)}</ActivityHeading>

      <section
        aria-label={t.sentence.mine}
        className="paper-card taped flex flex-wrap items-center justify-center gap-2 px-4 pb-5 pt-8"
      >
        {choices.map((choice, slot) => (
          <span
            key={slot}
            className={`inline-flex min-h-16 min-w-16 items-center justify-center rounded-md border-[3px] px-3 ${
              choice ? "border-teal bg-teal-soft" : "border-dashed border-mango-ink bg-mango-soft"
            } ${problem?.slot === slot ? "!border-coral-ink !border-dashed !bg-coral-soft" : ""}`}
          >
            {choice ? (
              <ItemText item={getItem(choice)} className="text-3xl" />
            ) : (
              <span className="text-2xl text-mango-ink" aria-label={t.sentence.box(slot + 1)}>
                ?
              </span>
            )}
          </span>
        ))}
      </section>

      {accepted ? null : (
        <div className="flex flex-col gap-4">
          {activity.slots.map((slot, slotIndex) =>
            slot.options.length === 1 ? null : (
              <fieldset key={slotIndex} className="flex flex-col gap-2">
                <legend className="mb-1 text-sm font-semibold text-ink-soft">
                  {t.sentence.box(slotIndex + 1)}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {slot.options.map((optionId) => {
                    const item = getItem(optionId);
                    const selected = choices[slotIndex] === optionId;
                    return (
                      <button
                        key={optionId}
                        type="button"
                        data-slot={slotIndex}
                        data-item-id={optionId}
                        aria-pressed={selected}
                        onClick={() => choose(slotIndex, optionId)}
                        className={`flex min-h-14 min-w-14 flex-col items-center justify-center rounded-md border-2 px-3 py-1 transition-colors ${
                          selected
                            ? "border-[3px] border-teal bg-teal-soft"
                            : "border-ink/20 bg-card hover:border-teal"
                        }`}
                      >
                        <ItemText item={item} className="text-2xl" />
                        <span className="text-xs text-ink-soft">
                          {locale === "en" ? item.glossEn : item.glossTh}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ),
          )}
        </div>
      )}

      <div role="status" aria-live="polite">
        {problem ? (
          <p className="flex gap-2 rounded-md border-2 border-dashed border-coral-ink bg-coral-soft p-4">
            <Lightbulb aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-coral-ink" />
            {t.sentence.agree(
              getItem(problem.personItemId).targetText,
              getItem(problem.requiredItemId).targetText,
            )}
          </p>
        ) : null}
        {accepted && sentence ? (
          <div className="flex flex-col items-center gap-2 rounded-md border-2 border-leaf bg-leaf-soft p-5 text-center animate-pop">
            <p className="flex items-center gap-2 font-display text-xl font-medium">
              <Sparkles aria-hidden="true" className="size-6 text-leaf" />
              {t.sentence.great}
            </p>
            <TargetText language="bn-BD" className="text-4xl" as="p">
              {sentence.text}
            </TargetText>
            <Transliteration value={sentence.transliteration} />
            <p>
              {t.sentence.means} “{locale === "en" ? sentence.meaningEn : sentence.meaningTh}”
            </p>
          </div>
        ) : null}
      </div>

      <ActionBar>
        {accepted ? (
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={() => void save()}
            disabled={saving}
          >
            <BookHeart aria-hidden="true" className="size-5" />
            {t.sentence.save}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary w-full"
            disabled={!complete}
            onClick={() => setChecked(true)}
          >
            {t.sentence.check}
          </button>
        )}
      </ActionBar>
    </div>
  );
}
