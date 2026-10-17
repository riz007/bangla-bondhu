"use client";

import { useId, useState } from "react";
import { TargetText } from "@/components/script/target-text";
import { AudioButton } from "@/features/audio/audio-player";
import { getItem } from "@/features/curriculum/loader";
import { itemMeaning } from "@/features/curriculum/localize";
import type { ActivityOf } from "@/features/curriculum/schema";
import { useLocale, useT } from "@/features/settings/settings-store";
import { instructionFor } from "../activity-registry";
import { checkMissingCharacter } from "../answers";
import { ActionBar, ActivityHeading, CheckButton, ItemImage, OptionMark, type MarkState } from "./shared";
import type { ActivityViewProps } from "./types";

export function MissingCharacterActivityView({
  activity,
  answered,
  onAnswer,
}: ActivityViewProps<ActivityOf<"missing-character">>) {
  const groupName = useId();
  const locale = useLocale();
  const t = useT();
  const prompt = getItem(activity.promptItemId);
  const [selected, setSelected] = useState<string | null>(null);
  const chosen = activity.options.find((option) => option.id === selected);

  const submit = () => {
    if (!chosen) return;
    onAnswer(checkMissingCharacter(activity, chosen.id), {
      answerItemId: prompt.id,
      answerText: prompt.targetText,
      chosenText: activity.before + chosen.text + activity.after,
    });
  };

  const markFor = (id: string): MarkState => {
    if (!answered) return undefined;
    if (id === activity.answerOptionId) return "correct";
    if (id === selected) return "incorrect";
    return "dimmed";
  };

  return (
    <div className="flex flex-col gap-6">
      <ActivityHeading>{instructionFor(activity, locale, prompt)}</ActivityHeading>

      <div className="paper-card taped flex flex-col items-center gap-3 px-4 py-6 text-center">
        <ItemImage item={prompt} size="medium" />
        <p className="text-lg">{t.activity.wordFor(itemMeaning(prompt, locale))}</p>
        {answered ? (
          <TargetText language={prompt.targetLanguage} className="text-6xl">
            {prompt.targetText}
          </TargetText>
        ) : (
          // Split around the blank on purpose; the whole word is shown once answered.
          <p
            className="flex items-center gap-1"
            aria-label={t.activity.blank(activity.before, activity.after)}
          >
            {activity.before ? (
              <TargetText language={prompt.targetLanguage} className="text-6xl">
                {activity.before}
              </TargetText>
            ) : null}
            <span
              className="inline-flex min-h-20 min-w-16 items-center justify-center rounded-md border-[3px] border-dashed border-mango-ink bg-mango-soft px-2"
              aria-hidden="true"
            >
              {chosen ? (
                <TargetText language={prompt.targetLanguage} className="text-5xl">
                  {chosen.display ?? chosen.text}
                </TargetText>
              ) : (
                <span className="text-3xl text-mango-ink">?</span>
              )}
            </span>
            {activity.after ? (
              <TargetText language={prompt.targetLanguage} className="text-6xl">
                {activity.after}
              </TargetText>
            ) : null}
          </p>
        )}
        <AudioButton item={prompt} size="compact" />
      </div>

      <fieldset>
        <legend className="sr-only">{t.activity.choices}</legend>
        <div className="flex flex-wrap justify-center gap-4">
          {activity.options.map((option) => {
            const inputId = `${groupName}-${option.id}`;
            const state = markFor(option.id);
            return (
              <div key={option.id} className="relative min-w-24">
                <input
                  id={inputId}
                  type="radio"
                  name={groupName}
                  value={option.id}
                  className="option-input sr-only"
                  checked={selected === option.id}
                  disabled={Boolean(answered)}
                  onChange={() => setSelected(option.id)}
                />
                <label htmlFor={inputId} className="option-card" data-state={state}>
                  <TargetText language={prompt.targetLanguage} className="text-4xl">
                    {option.display ?? option.text}
                  </TargetText>
                </label>
                <OptionMark state={state} />
              </div>
            );
          })}
        </div>
      </fieldset>

      {answered ? null : (
        <ActionBar>
          <CheckButton disabled={!selected} onClick={submit} />
        </ActionBar>
      )}
    </div>
  );
}
