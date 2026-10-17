"use client";

import { HardDrive } from "lucide-react";
import Link from "next/link";
import { ItemChips, itemsById } from "@/components/script/item-chips";
import { getTrackLessons } from "@/features/curriculum/loader";
import { lessonTitle } from "@/features/curriculum/localize";
import { useProgress } from "@/features/progress/progress-store";
import { useLocale, useSettings, useT } from "@/features/settings/settings-store";
import { findNextLesson } from "../path-status";
import type { SessionSummary } from "../scoring";
import type { SessionDefinition } from "./lesson-runner";

const STRONG_ITEMS_SHOWN = 2;

export function SessionSummaryView({
  definition,
  summary,
}: {
  definition: SessionDefinition;
  summary: SessionSummary;
}) {
  const progress = useProgress();
  const settings = useSettings();
  const locale = useLocale();
  const t = useT();
  const practised = itemsById(summary.practisedItemIds);
  const strong = itemsById(summary.strongItemIds).slice(0, STRONG_ITEMS_SHOWN);
  const toReview = itemsById(summary.needsReviewItemIds);
  const shown = new Set([...strong, ...toReview].map((item) => item.id));
  const otherPractised = practised.filter((item) => !shown.has(item.id));

  const trackLessons = getTrackLessons(definition.trackId, { includeDrafts: settings.contentPreview });
  const next = findNextLesson(trackLessons, progress.state);

  return (
    <main id="main" className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-8">
      <div className="paper-card taped relative flex flex-col items-center gap-3 px-6 pb-8 pt-10 text-center">
        <p
          className="animate-stamp rounded-md border-[3px] border-teal px-4 py-1 font-display text-2xl font-semibold text-teal"
          style={{ transform: "rotate(-8deg)" }}
        >
          {t.summary.stamp}
        </p>
        <h1 className="mt-2 font-display text-2xl font-medium">{definition.title[locale]}</h1>
        <p className="text-ink-soft">{t.summary.effort}</p>

        {summary.scoredCount > 0 ? (
          <div className="mt-2 flex flex-col items-center gap-2">
            <p className="text-lg">{t.summary.firstTry(summary.firstTryCorrect, summary.scoredCount)}</p>
            <p aria-hidden="true" className="flex flex-wrap justify-center gap-1.5">
              {Array.from({ length: summary.scoredCount }, (_, i) => (
                <span
                  key={i}
                  className={`size-4 rounded-full border-2 border-teal ${i < summary.firstTryCorrect ? "bg-teal" : "bg-transparent"}`}
                />
              ))}
            </p>
          </div>
        ) : null}
      </div>

      {strong.length > 0 ? (
        <section aria-labelledby="strong-heading" className="flex flex-col gap-2">
          <h2 id="strong-heading" className="font-display text-lg">
            {t.summary.strong}
          </h2>
          <ItemChips items={strong} tone="leaf" />
        </section>
      ) : null}

      {toReview.length > 0 ? (
        <section aria-labelledby="review-heading" className="flex flex-col gap-2">
          <h2 id="review-heading" className="font-display text-lg">
            {t.summary.toReview}
          </h2>
          <p className="text-sm text-ink-soft">{t.summary.toReviewNote}</p>
          <ItemChips items={toReview} tone="mango" />
        </section>
      ) : null}

      {otherPractised.length > 0 ? (
        <section aria-labelledby="practised-heading" className="flex flex-col gap-2">
          <h2 id="practised-heading" className="font-display text-lg">
            {shown.size > 0 ? t.summary.alsoPractised : t.summary.practised}
          </h2>
          <ItemChips items={otherPractised} />
        </section>
      ) : null}

      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <HardDrive aria-hidden="true" className="size-4" />
        {t.summary.saved}
      </p>

      <div className="mt-auto flex flex-col gap-3">
        {toReview.length > 0 && definition.kind === "lesson" ? (
          <Link href="/review" className="btn btn-primary w-full">
            {t.summary.reviewMissed}
          </Link>
        ) : next ? (
          <Link href={`/lesson/${next.id}`} className="btn btn-primary w-full">
            {t.summary.nextLesson(lessonTitle(next, locale))}
          </Link>
        ) : null}
        <Link
          href={definition.exitHref}
          className={`btn w-full ${toReview.length > 0 || next ? "btn-secondary" : "btn-primary"}`}
        >
          {definition.exitHref === "/review" ? t.summary.backToReview : t.common.backToMap}
        </Link>
      </div>
    </main>
  );
}
