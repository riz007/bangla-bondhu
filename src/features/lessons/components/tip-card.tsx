"use client";

import { Lightbulb } from "lucide-react";
import { ItemText, Transliteration } from "@/components/script/target-text";
import { getItem } from "@/features/curriculum/loader";
import { itemMeaning } from "@/features/curriculum/localize";
import type { ActivityOf } from "@/features/curriculum/schema";
import { useLocale, useT } from "@/features/settings/settings-store";
import { ActionBar, ActivityHeading } from "./shared";

export function TipCard({ activity, onContinue }: { activity: ActivityOf<"tip">; onContinue: () => void }) {
  const locale = useLocale();
  const t = useT();
  const examples = activity.exampleItemIds.map(getItem);

  return (
    <div className="flex flex-col gap-6">
      <ActivityHeading>{locale === "en" ? activity.titleEn : activity.titleTh}</ActivityHeading>

      <article className="paper-card taped taped-teal mx-auto flex w-full max-w-lg flex-col gap-4 px-6 pb-6 pt-8 animate-rise">
        <p className="flex items-center gap-2 text-sm font-semibold text-teal">
          <Lightbulb aria-hidden="true" className="size-5" />
          {t.tip.label}
        </p>
        <p className="text-lg leading-relaxed">{locale === "en" ? activity.bodyEn : activity.bodyTh}</p>
        {examples.length > 0 ? (
          <ul className="flex flex-col gap-2 border-t-2 border-dashed border-rule pt-4">
            {examples.map((item) => (
              <li key={item.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <ItemText item={item} className="text-3xl" />
                {item.transliteration ? <Transliteration value={item.transliteration} /> : null}
                <span className="text-ink-soft">{itemMeaning(item, locale)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </article>

      <ActionBar>
        <button type="button" className="btn btn-primary w-full" onClick={onContinue}>
          {t.lesson.gotIt}
        </button>
      </ActionBar>
    </div>
  );
}
