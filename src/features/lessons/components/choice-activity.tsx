"use client";

import { useId, useState } from "react";
import { ItemText, Transliteration } from "@/components/script/target-text";
import { AudioButton, hasRecordedAudio } from "@/features/audio/audio-player";
import { getItem } from "@/features/curriculum/loader";
import { itemAlt, itemMeaning } from "@/features/curriculum/localize";
import type { ChoiceActivity, CurriculumItem } from "@/features/curriculum/schema";
import { useLocale, useT } from "@/features/settings/settings-store";
import type { Locale } from "@/lib/i18n/messages";
import { instructionFor } from "../activity-registry";
import { checkChoice } from "../answers";
import {
  ActionBar,
  ActivityHeading,
  CheckButton,
  ItemImage,
  ItemWithReading,
  OptionMark,
  type MarkState,
} from "./shared";
import type { ActivityViewProps } from "./types";

type OptionMode = "text" | "image" | "meaning";

function optionModeFor(activity: ChoiceActivity): OptionMode {
  switch (activity.type) {
    case "word-to-image":
      return "image";
    case "listen-and-select":
      return activity.optionsAs;
    case "read-and-choose":
      return "meaning";
    case "image-to-word":
    case "recall":
      return "text";
  }
}

function describe(item: CurriculumItem, mode: OptionMode, locale: Locale): string {
  if (mode === "meaning") return itemMeaning(item, locale);
  if (mode === "image") return itemAlt(item, locale);
  return item.displayText ?? item.targetText;
}

export function ChoiceActivityView({
  activity,
  answered,
  onAnswer,
  showTransliteration,
}: ActivityViewProps<ChoiceActivity>) {
  const groupName = useId();
  const locale = useLocale();
  const t = useT();
  const [selected, setSelected] = useState<string | null>(null);
  const prompt = getItem(activity.promptItemId);
  const options = activity.optionItemIds.map(getItem);
  const mode = optionModeFor(activity);
  const hintsAllowed = activity.type !== "recall";

  const submit = () => {
    if (!selected) return;
    const chosen = getItem(selected);
    const answer = getItem(activity.answerItemId);
    onAnswer(checkChoice(activity, selected), {
      answerItemId: answer.id,
      answerText: describe(answer, mode, locale),
      chosenItemId: chosen.id,
      chosenText: describe(chosen, mode, locale),
    });
  };

  const markFor = (id: string): MarkState => {
    if (!answered) return undefined;
    if (id === activity.answerItemId) return "correct";
    if (id === selected) return "incorrect";
    return "dimmed";
  };

  return (
    <div className="flex flex-col gap-6">
      <ActivityHeading>{instructionFor(activity, locale, prompt)}</ActivityHeading>

      <ChoicePrompt
        activity={activity}
        prompt={prompt}
        mode={mode}
        showTransliteration={hintsAllowed && showTransliteration(prompt)}
      />

      <fieldset>
        <legend className="sr-only">{t.activity.choices}</legend>
        <div
          className={`grid gap-3 sm:gap-4 ${
            mode === "image"
              ? options.length === 4
                ? "grid-cols-2 sm:grid-cols-4"
                : "grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2"
          }`}
        >
          {options.map((option) => {
            const inputId = `${groupName}-${option.id}`;
            const state = markFor(option.id);
            return (
              <div key={option.id} className="relative">
                <input
                  id={inputId}
                  type="radio"
                  name={groupName}
                  value={option.id}
                  className="option-input peer sr-only"
                  checked={selected === option.id}
                  disabled={Boolean(answered)}
                  onChange={() => setSelected(option.id)}
                />
                <label htmlFor={inputId} className="option-card" data-state={state}>
                  {mode === "image" ? (
                    <span className="flex flex-col items-center gap-1 py-1">
                      <ItemImage item={option} size="small" decorative />
                      <span className="sr-only">{itemAlt(option, locale)}</span>
                    </span>
                  ) : mode === "meaning" ? (
                    <span className="text-lg font-medium">{itemMeaning(option, locale)}</span>
                  ) : (
                    <ItemWithReading
                      item={option}
                      showTransliteration={hintsAllowed && showTransliteration(option)}
                      textClassName="text-3xl"
                    />
                  )}
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

function ChoicePrompt({
  activity,
  prompt,
  mode,
  showTransliteration,
}: {
  activity: ChoiceActivity;
  prompt: CurriculumItem;
  mode: OptionMode;
  showTransliteration: boolean;
}) {
  const locale = useLocale();
  const t = useT();
  const frame =
    "paper-card taped flex min-h-40 flex-col items-center justify-center gap-3 px-4 py-6 text-center";

  switch (activity.type) {
    case "listen-and-select":
      return (
        <div className={frame}>
          <AudioButton item={prompt} />
          {hasRecordedAudio(prompt) ? null : <ListenFallback prompt={prompt} mode={mode} />}
        </div>
      );
    case "image-to-word":
      return (
        <div className={frame}>
          <ItemImage item={prompt} size="large" />
        </div>
      );
    case "word-to-image":
    case "read-and-choose":
      return (
        <div className={frame}>
          <ItemWithReading item={prompt} showTransliteration={showTransliteration} textClassName="text-5xl" />
          <AudioButton item={prompt} size="compact" />
        </div>
      );
    case "recall":
      return (
        <div className={frame}>
          <p className="text-sm text-ink-soft">{t.activity.thisMeans}</p>
          <p className="font-display text-2xl font-medium">{itemMeaning(prompt, locale)}</p>
        </div>
      );
  }
}

// With no recording yet, show a written clue so the question can still be answered.
function ListenFallback({ prompt, mode }: { prompt: CurriculumItem; mode: OptionMode }) {
  const locale = useLocale();
  const t = useT();
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-sm text-ink-soft">{t.activity.clue}</p>
      {mode === "image" ? (
        <ItemText item={prompt} className="text-4xl" />
      ) : (
        <>
          <p className="font-display text-xl">{itemMeaning(prompt, locale)}</p>
          {prompt.transliteration ? <Transliteration value={prompt.transliteration} /> : null}
        </>
      )}
    </div>
  );
}
