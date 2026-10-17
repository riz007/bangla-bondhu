"use client";

import { CalendarClock, RotateCcw } from "lucide-react";
import Link from "next/link";
import { ItemChips, itemsById } from "@/components/script/item-chips";
import { useProgress } from "@/features/progress/progress-store";
import { REVIEW_SESSION_ID, REVIEW_SESSION_SIZE } from "@/features/review/review-session";
import { useReviewStatus } from "@/features/review/use-review";
import { useHydrated, useT } from "@/features/settings/settings-store";

export function ReviewScreen() {
  const hydrated = useHydrated();
  const progress = useProgress();
  const status = useReviewStatus();
  const t = useT();

  if (!hydrated || !status.ready) {
    return (
      <p className="py-10 text-ink-soft" aria-busy="true">
        {t.common.loading}
      </p>
    );
  }

  const dueItems = itemsById(status.due.map((entry) => entry.itemId));
  const hasSavedSession = Boolean(progress.state.sessions[REVIEW_SESSION_ID]);
  const missed = status.due.filter((entry) => entry.streakCorrect === 0 && entry.incorrectCount > 0).length;
  const formatDate = new Intl.DateTimeFormat(t.common.dateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-medium">{t.review.title}</h1>
        <p className="max-w-prose text-ink-soft">{t.review.intro}</p>
      </header>

      {dueItems.length === 0 ? (
        <section className="paper-card taped flex flex-col items-start gap-4 px-6 pb-6 pt-8">
          <CalendarClock aria-hidden="true" className="size-9 text-teal" />
          <h2 className="font-display text-2xl">{t.review.emptyTitle}</h2>
          <p className="text-ink-soft">
            {status.nextReviewAt
              ? t.review.nextOn(formatDate.format(status.nextReviewAt))
              : t.review.emptyNew}
          </p>
          <Link href="/" className="btn btn-primary">
            {t.review.learnNew}
          </Link>
        </section>
      ) : (
        <section aria-labelledby="due-heading" className="flex flex-col gap-5">
          <div className="paper-card taped flex flex-col gap-4 px-6 pb-6 pt-8">
            <h2 id="due-heading" className="font-display text-2xl">
              {t.home.due(dueItems.length)}
            </h2>
            {missed > 0 ? <p className="text-ink-soft">{t.review.missed(missed)}</p> : null}
            <ItemChips items={dueItems} />
            <Link href="/review-session" className="btn btn-primary self-stretch sm:self-start">
              <RotateCcw aria-hidden="true" className="size-5" />
              {hasSavedSession ? t.review.resume : t.review.start}
            </Link>
            <p className="text-sm text-ink-soft">{t.review.size(REVIEW_SESSION_SIZE)}</p>
          </div>
        </section>
      )}
    </div>
  );
}
