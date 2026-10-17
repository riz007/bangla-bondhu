"use client";

import { ItemText, TargetText, Transliteration } from "@/components/script/target-text";
import { AudioButton } from "@/features/audio/audio-player";
import { getItem } from "@/features/curriculum/loader";
import { itemMeaning, itemNote } from "@/features/curriculum/localize";
import type { ActivityOf, CurriculumItem } from "@/features/curriculum/schema";
import { useLocale, useT } from "@/features/settings/settings-store";
import { splitForHighlight } from "@/lib/script";
import { instructionFor } from "../activity-registry";
import { ActionBar, ActivityHeading, ItemImage } from "./shared";

interface IntroduceCardProps {
  activity: ActivityOf<"introduce">;
  onContinue: () => void;
  showTransliteration: (item: CurriculumItem) => boolean;
}

export function IntroduceCard({ activity, onContinue, showTransliteration }: IntroduceCardProps) {
  const locale = useLocale();
  const t = useT();
  const item = getItem(activity.itemId);
  const example = activity.exampleItemId ? getItem(activity.exampleItemId) : null;
  const note = itemNote(item, locale);

  return (
    <div className="flex flex-col gap-6">
      <ActivityHeading>{instructionFor(activity, locale, item)}</ActivityHeading>

      <article className="paper-card taped mx-auto flex w-full max-w-md flex-col items-center gap-4 px-6 pb-6 pt-8 text-center animate-rise">
        <ItemImage item={item} size="large" />
        <ItemText item={item} className={item.kind === "phrase" ? "text-5xl" : "glyph"} />
        {showTransliteration(item) && item.transliteration ? (
          <Transliteration value={item.transliteration} className="text-lg" />
        ) : null}
        <AudioButton item={item} />
        <div className="w-full border-t-2 border-dashed border-rule pt-4">
          <p className="font-display text-2xl font-medium">{itemMeaning(item, locale)}</p>
          {note ? <p className="mt-2 text-base text-ink-soft">{note}</p> : null}
        </div>
        {example ? <ExampleWord example={example} target={item} /> : null}
      </article>

      <ActionBar>
        <button type="button" className="btn btn-primary w-full" onClick={onContinue}>
          {t.lesson.gotIt}
        </button>
      </ActionBar>
    </div>
  );
}

function ExampleWord({ example, target }: { example: CurriculumItem; target: CurriculumItem }) {
  const locale = useLocale();
  const t = useT();
  const parts = target.kind === "letter" ? splitForHighlight(example.targetText, target.targetText) : null;
  return (
    <div className="flex items-center gap-3 rounded-md bg-sky-soft px-4 py-2">
      <span className="text-sm text-ink-soft">{t.activity.example}</span>
      <TargetText language={example.targetLanguage} className="text-4xl">
        {parts ? (
          <>
            {parts[0]}
            <mark className="rounded bg-mango-soft px-0.5 text-mango-ink underline decoration-mango decoration-4 underline-offset-8">
              {parts[1]}
            </mark>
            {parts[2]}
          </>
        ) : (
          example.targetText
        )}
      </TargetText>
      <span className="text-base">= {itemMeaning(example, locale)}</span>
    </div>
  );
}
