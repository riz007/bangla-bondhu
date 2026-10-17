"use client";

import { CircleCheckBig, Lightbulb } from "lucide-react";
import { TargetText, Transliteration } from "@/components/script/target-text";
import { findItem } from "@/features/curriculum/loader";
import { itemMeaning } from "@/features/curriculum/localize";
import type { ActivityResult } from "@/features/progress/model";
import { useLocale, useT } from "@/features/settings/settings-store";
import type { FeedbackDetail } from "./types";

interface FeedbackPanelProps {
  result: ActivityResult;
  detail: FeedbackDetail | null;
  isRetry: boolean;
  retryQueued: boolean;
}

export function FeedbackPanel({ result, detail, isRetry, retryQueued }: FeedbackPanelProps) {
  const locale = useLocale();
  const t = useT();
  const answerItem = detail?.answerItemId ? findItem(detail.answerItemId) : undefined;
  const chosenItem = detail?.chosenItemId ? findItem(detail.chosenItemId) : undefined;
  const headline =
    detail?.headline ??
    (result.correct ? (isRetry ? t.feedback.correctRetry : t.feedback.correct) : t.feedback.incorrect);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex gap-3 rounded-md border-2 p-4 animate-pop ${
        result.correct ? "border-leaf bg-leaf-soft" : "border-dashed border-coral-ink bg-coral-soft"
      }`}
    >
      {result.correct ? (
        <CircleCheckBig aria-hidden="true" className="mt-0.5 size-7 shrink-0 text-leaf" strokeWidth={2.5} />
      ) : (
        <Lightbulb aria-hidden="true" className="mt-0.5 size-7 shrink-0 text-coral-ink" strokeWidth={2.5} />
      )}
      <div className="flex flex-col gap-1">
        <p className="font-display text-xl font-medium">{headline}</p>
        {answerItem ? (
          <p className="flex flex-wrap items-baseline gap-x-2">
            {result.correct ? null : <span>{t.feedback.answerIs}</span>}
            <TargetText language={answerItem.targetLanguage} className="text-2xl">
              {answerItem.displayText ?? answerItem.targetText}
            </TargetText>
            {answerItem.transliteration ? <Transliteration value={answerItem.transliteration} /> : null}
            <span>{t.feedback.meaning(itemMeaning(answerItem, locale))}</span>
          </p>
        ) : null}
        {!result.correct && chosenItem && chosenItem.id !== answerItem?.id ? (
          <p className="text-ink-soft">
            {t.feedback.chose}{" "}
            <TargetText language={chosenItem.targetLanguage}>
              {chosenItem.displayText ?? chosenItem.targetText}
            </TargetText>{" "}
            {t.feedback.whichMeans(itemMeaning(chosenItem, locale))}
          </p>
        ) : null}
        {!result.correct && !chosenItem && detail?.chosenText && answerItem ? (
          <p className="text-ink-soft">
            {t.feedback.built}{" "}
            <TargetText language={answerItem.targetLanguage}>{detail.chosenText}</TargetText>
          </p>
        ) : null}
        {!result.correct ? (
          <p className="text-sm text-ink-soft">
            {retryQueued ? t.feedback.retryQueued : t.feedback.reviewLater}
          </p>
        ) : null}
      </div>
    </div>
  );
}
