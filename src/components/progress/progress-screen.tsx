"use client";

import { BookHeart, Check, HardDrive } from "lucide-react";
import Link from "next/link";
import { ItemChips, itemsById } from "@/components/script/item-chips";
import { TargetText } from "@/components/script/target-text";
import { curriculum, findLesson, getTrackPath } from "@/features/curriculum/loader";
import { lessonTitle, worldTitle } from "@/features/curriculum/localize";
import { isChapterComplete } from "@/features/lessons/path-status";
import type { ItemProgress, MasteryLevel } from "@/features/progress/model";
import { useProgress } from "@/features/progress/progress-store";
import { useReviewStatus } from "@/features/review/use-review";
import { useHydrated, useLocale, useSettings, useT } from "@/features/settings/settings-store";
import type { Messages } from "@/lib/i18n/messages";
import { StorageWarning } from "./storage-warning";

type JournalText = Messages["journal"];

const MASTERY_SECTIONS: { level: MasteryLevel; title: keyof JournalText; note: keyof JournalText }[] = [
  { level: "mastered", title: "mastered", note: "masteredNote" },
  { level: "familiar", title: "familiar", note: "familiarNote" },
  { level: "learning", title: "learning", note: "learningNote" },
];

export function ProgressScreen() {
  const hydrated = useHydrated();
  const progress = useProgress();
  const review = useReviewStatus();
  const locale = useLocale();
  const settings = useSettings();
  const t = useT();

  if (!hydrated || progress.status !== "ready") {
    return (
      <p className="py-10 text-ink-soft" aria-busy="true">
        {t.common.loading}
      </p>
    );
  }

  const formatDate = new Intl.DateTimeFormat(t.common.dateLocale, { day: "numeric", month: "short" });
  const lessonRecords = Object.values(progress.state.lessons).sort(
    (a, b) => Date.parse(b.lastCompletedAt) - Date.parse(a.lastCompletedAt),
  );
  const itemEntries = Object.values(progress.state.items);
  const letterIds = curriculum.items
    .filter((item) => item.id.startsWith("bn.vowel.") || item.id.startsWith("bn.cons."))
    .map((item) => item.id);
  const lettersMet = letterIds.filter((id) => progress.state.items[id]).length;
  const chapters = getTrackPath("bn", { includeDrafts: settings.contentPreview });

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-3xl font-medium">{t.journal.title}</h1>
        <p className="flex items-start gap-2 text-ink-soft">
          <HardDrive aria-hidden="true" className="mt-1 size-4 shrink-0" />
          {t.journal.localNote}
        </p>
        <StorageWarning snapshot={progress} />
      </header>

      {lessonRecords.length === 0 && itemEntries.length === 0 && progress.state.sentences.length === 0 ? (
        <section className="paper-card taped flex flex-col items-start gap-4 px-6 pb-6 pt-8">
          <h2 className="font-display text-2xl">{t.journal.emptyTitle}</h2>
          <p className="text-ink-soft">{t.journal.emptyBody}</p>
          <Link href="/" className="btn btn-primary">
            {t.common.goToMap}
          </Link>
        </section>
      ) : (
        <>
          <section
            aria-labelledby="review-status"
            className="paper-card flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 id="review-status" className="font-display text-xl">
                {t.journal.reviewTitle}
              </h2>
              <p className="text-ink-soft">
                {review.due.length > 0
                  ? t.journal.dueNow(review.due.length)
                  : review.nextReviewAt
                    ? t.journal.nextReview(formatDate.format(review.nextReviewAt))
                    : t.journal.noneDue}
              </p>
            </div>
            {review.due.length > 0 ? (
              <Link href="/review" className="btn btn-secondary">
                {t.journal.goReview}
              </Link>
            ) : null}
          </section>

          <section aria-labelledby="stamps-heading" className="flex flex-col gap-3">
            <div>
              <h2 id="stamps-heading" className="font-display text-2xl">
                {t.journal.stamps}
              </h2>
              <p className="text-sm text-ink-soft">{t.journal.stampsNote}</p>
            </div>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
              {chapters.map(({ world, lessons }) => {
                const earned = isChapterComplete(lessons, progress.state);
                return (
                  <li key={world.id} className="flex flex-col items-center gap-1 text-center">
                    <span
                      className={`relative flex size-16 items-center justify-center rounded-full border-[3px] ${
                        earned
                          ? "-rotate-6 border-teal bg-teal-soft text-teal"
                          : "border-dashed border-ink/25 text-ink-soft opacity-60"
                      }`}
                    >
                      <TargetText language="bn-BD" className="text-xl">
                        {lessons[0]?.emblem}
                      </TargetText>
                      {earned ? (
                        <Check
                          aria-hidden="true"
                          className="absolute -bottom-1 -right-1 size-6 rounded-full border-2 border-ink bg-card p-0.5 text-teal"
                          strokeWidth={3}
                        />
                      ) : null}
                    </span>
                    <span className="text-xs leading-tight">{worldTitle(world, locale)}</span>
                    <span className="sr-only">{earned ? t.journal.stampEarned : t.journal.stampWaiting}</span>
                  </li>
                );
              })}
            </ul>
            <p className="font-medium text-teal">{t.journal.lettersMet(lettersMet, letterIds.length)}</p>
          </section>

          <section
            aria-labelledby="sentence-book"
            className="paper-card taped flex flex-col gap-3 px-5 pb-5 pt-8"
          >
            <h2 id="sentence-book" className="flex items-center gap-2 font-display text-2xl">
              <BookHeart aria-hidden="true" className="size-6 text-coral-ink" />
              {t.journal.sentenceBook} ({progress.state.sentences.length})
            </h2>
            {progress.state.sentences.length === 0 ? (
              <p className="text-ink-soft">{t.journal.sentenceBookEmpty}</p>
            ) : (
              <ol className="flex flex-col gap-2">
                {progress.state.sentences.map((sentence) => (
                  <li
                    key={sentence.id}
                    className="flex flex-col border-b border-dashed border-rule pb-2 last:border-0"
                  >
                    <TargetText language="bn-BD" className="text-2xl">
                      {sentence.text}
                    </TargetText>
                    <span className="text-sm text-ink-soft">
                      {locale === "en" ? sentence.meaningEn : sentence.meaningTh}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section aria-labelledby="lessons-done" className="flex flex-col gap-4">
            <h2 id="lessons-done" className="font-display text-2xl">
              {t.journal.lessonsDone(lessonRecords.length)}
            </h2>
            {lessonRecords.length === 0 ? (
              <p className="text-ink-soft">{t.journal.noLessons}</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lessonRecords.map((record) => {
                  const lesson = findLesson(record.lessonId);
                  if (!lesson) return null;
                  return (
                    <li key={record.lessonId} className="paper-card flex items-center gap-4 p-4">
                      <span
                        aria-hidden="true"
                        className="flex size-14 shrink-0 -rotate-6 items-center justify-center rounded-md border-[3px] border-teal text-teal"
                      >
                        <span lang="bn-BD" className="font-bengali text-xl">
                          {lesson.emblem}
                        </span>
                      </span>
                      <span className="flex flex-col">
                        <span className="font-display text-lg leading-snug">
                          {lessonTitle(lesson, locale)}
                        </span>
                        <span className="text-sm text-ink-soft">
                          {t.journal.lastDone(
                            formatDate.format(new Date(record.lastCompletedAt)),
                            record.completedCount,
                          )}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section aria-labelledby="words-heading" className="flex flex-col gap-6">
            <h2 id="words-heading" className="font-display text-2xl">
              {t.journal.collected}
            </h2>
            {MASTERY_SECTIONS.map(({ level, title, note }) => (
              <MasteryGroup
                key={level}
                title={t.journal[title] as string}
                note={t.journal[note] as string}
                entries={itemEntries.filter((entry) => entry.masteryLevel === level)}
              />
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function MasteryGroup({ title, note, entries }: { title: string; note: string; entries: ItemProgress[] }) {
  const items = itemsById(entries.map((entry) => entry.itemId));
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-display text-lg">
        {title} <span className="text-ink-soft">({items.length})</span>
      </h3>
      <p className="text-sm text-ink-soft">{note}</p>
      {items.length > 0 ? <ItemChips items={items} /> : null}
    </div>
  );
}
