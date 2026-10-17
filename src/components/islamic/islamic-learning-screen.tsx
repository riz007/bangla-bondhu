"use client";

import { BookMarked, EyeOff } from "lucide-react";
import Link from "next/link";
import { curriculum } from "@/features/curriculum/loader";
import { topicTitle } from "@/features/curriculum/localize";
import { useHydrated, useLocale, useSettings, useT } from "@/features/settings/settings-store";

export function IslamicLearningScreen() {
  const settings = useSettings();
  const locale = useLocale();
  const t = useT();
  const hydrated = useHydrated();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-ink-soft">{t.home.optional}</p>
        <h1 className="flex items-center gap-3 font-display text-3xl font-medium">
          <BookMarked aria-hidden="true" className="size-8 shrink-0 text-leaf" />
          {t.extras.islamTitle}
        </h1>
        <p className="max-w-prose text-ink-soft">{t.extras.islamNote}</p>
        <p className="max-w-prose text-ink-soft">{t.extras.intro}</p>
      </header>

      {hydrated && !settings.showIslamicTrack ? (
        <p className="flex flex-wrap items-center gap-2 rounded-md bg-paper-deep p-4">
          <EyeOff aria-hidden="true" className="size-5 shrink-0" />
          {t.extras.hidden}
          <Link href="/settings" className="underline underline-offset-4">
            {t.common.settingsPage}
          </Link>
        </p>
      ) : null}

      <section aria-labelledby="islam-review" className="paper-card flex flex-col gap-3 p-5">
        <h2 id="islam-review" className="font-display text-xl">
          {t.extras.islamReviewTitle}
        </h2>
        <p>{t.extras.islamReviewBody}</p>
        <p className="text-ink-soft">{t.extras.planned}</p>
        <ul className="flex flex-col gap-2">
          {curriculum.plannedTopics.map((topic) => (
            <li
              key={topic.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border-2 border-dashed border-rule px-3 py-2"
            >
              <span>{topicTitle(topic, locale)}</span>
              <span className="text-sm text-ink-soft">{t.extras.awaiting}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
