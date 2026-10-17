"use client";

import { Eraser } from "lucide-react";
import { useState } from "react";
import { TargetText, Transliteration } from "@/components/script/target-text";
import { AudioButton, hasRecordedAudio } from "@/features/audio/audio-player";
import { getItem } from "@/features/curriculum/loader";
import { itemMeaning } from "@/features/curriculum/localize";
import type { SequenceActivity, Tile } from "@/features/curriculum/schema";
import { useLocale, useT } from "@/features/settings/settings-store";
import { languageAttributes, scriptClass } from "@/lib/script";
import { instructionFor } from "../activity-registry";
import { checkSequence, sequenceText } from "../answers";
import { ActionBar, ActivityHeading, CheckButton, ItemImage } from "./shared";
import type { ActivityViewProps } from "./types";

export function SequenceActivityView({
  activity,
  answered,
  onAnswer,
  showTransliteration,
}: ActivityViewProps<SequenceActivity>) {
  const locale = useLocale();
  const t = useT();
  const prompt = getItem(activity.promptItemId);
  const [placed, setPlaced] = useState<string[]>([]);
  const attrs = languageAttributes(prompt.targetLanguage);
  const fontClass = scriptClass(prompt.targetLanguage);
  const isSentence = activity.type === "listen-and-order";
  const tileById = new Map(activity.tiles.map((tile) => [tile.id, tile]));
  const built = sequenceText(activity, placed);

  const place = (tile: Tile) => {
    if (answered || placed.includes(tile.id)) return;
    setPlaced([...placed, tile.id]);
  };
  const remove = (id: string) => {
    if (answered) return;
    setPlaced(placed.filter((placedId) => placedId !== id));
  };

  const submit = () => {
    const result = checkSequence(activity, placed);
    onAnswer(result, {
      answerItemId: prompt.id,
      answerText: prompt.targetText,
      chosenText: result.correct ? undefined : built,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <ActivityHeading>{instructionFor(activity, locale, prompt)}</ActivityHeading>

      <div className="paper-card taped flex flex-col items-center gap-3 px-4 py-6 text-center">
        <ItemImage item={prompt} size="medium" />
        <AudioButton item={prompt} size={isSentence ? "large" : "compact"} />
        {isSentence || !hasRecordedAudio(prompt) || !prompt.imageSrc ? (
          <p className="font-display text-xl">“{itemMeaning(prompt, locale)}”</p>
        ) : null}
        {!hasRecordedAudio(prompt) && prompt.transliteration && showTransliteration(prompt) ? (
          <Transliteration value={prompt.transliteration} />
        ) : null}
      </div>

      <section aria-label={t.activity.myAnswer} className="flex flex-col items-center gap-3">
        <div
          className="flex min-h-20 w-full flex-wrap items-center justify-center gap-2 rounded-md border-2 border-dashed border-ink/30 bg-card/60 p-3"
          dir={attrs.dir}
        >
          {placed.length === 0 ? (
            <span className="text-ink-soft" dir="ltr">
              {t.activity.placeHint}
            </span>
          ) : (
            placed.map((id, index) => {
              const tile = tileById.get(id);
              if (!tile) return null;
              return (
                <button
                  key={id}
                  type="button"
                  className="tile bg-mango-soft"
                  lang={attrs.lang}
                  onClick={() => remove(id)}
                  disabled={Boolean(answered)}
                  aria-label={t.activity.removeTile(tile.display ?? tile.text, index + 1)}
                >
                  <span className={fontClass}>{tile.display ?? tile.text}</span>
                </button>
              );
            })
          )}
        </div>
        {!isSentence && placed.length > 0 ? (
          <p className="flex items-baseline gap-2" aria-live="polite">
            <span className="text-sm text-ink-soft">{t.activity.readsAs}</span>
            <TargetText language={prompt.targetLanguage} className="text-5xl">
              {built}
            </TargetText>
          </p>
        ) : null}
      </section>

      <section aria-label={t.activity.choices}>
        <ul className="flex flex-wrap justify-center gap-3" dir={attrs.dir}>
          {activity.tiles.map((tile) => {
            const used = placed.includes(tile.id);
            return (
              <li key={tile.id}>
                <button
                  type="button"
                  className="tile"
                  lang={attrs.lang}
                  data-tile-id={tile.id}
                  disabled={used || Boolean(answered)}
                  onClick={() => place(tile)}
                  aria-label={used ? t.activity.placedTile(tile.display ?? tile.text) : undefined}
                >
                  <span className={fontClass}>{tile.display ?? tile.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {answered ? null : (
        <ActionBar>
          <div className="flex gap-3">
            <button
              type="button"
              className="btn btn-secondary shrink-0 px-4"
              onClick={() => setPlaced([])}
              disabled={placed.length === 0}
            >
              <Eraser aria-hidden="true" className="size-5" />
              <span>{t.lesson.clear}</span>
            </button>
            <div className="flex-1">
              <CheckButton disabled={placed.length === 0} onClick={submit} />
            </div>
          </div>
        </ActionBar>
      )}
    </div>
  );
}
