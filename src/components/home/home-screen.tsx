"use client";

import { ArrowRight, NotebookPen, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { DoelMascot } from "@/components/app-shell/doel-mascot";
import { countLessons, getTrackPath } from "@/features/curriculum/loader";
import { lessonTitle } from "@/features/curriculum/localize";
import { hasAnyProgress } from "@/features/progress/model";
import { useProgress } from "@/features/progress/progress-store";
import { findLessonInProgress, findNextLesson } from "@/features/lessons/path-status";
import { useReviewStatus } from "@/features/review/use-review";
import { useHydrated, useLocale, useSettings, useT } from "@/features/settings/settings-store";
import { LearningPath } from "./learning-path";

export function HomeScreen() {
  const settings = useSettings();
  const locale = useLocale();
  const t = useT();
  const hydrated = useHydrated();
  const progress = useProgress();
  const review = useReviewStatus();

  const paths = useMemo(
    () => getTrackPath("bn", { includeDrafts: settings.contentPreview }),
    [settings.contentPreview],
  );
  const lessons = paths.flatMap((p) => p.lessons);
  const ready = hydrated && progress.status === "ready";
  const resume = ready ? findLessonInProgress(lessons, progress.state) : null;
  const next = ready ? findNextLesson(lessons, progress.state) : null;
  const target = resume ?? next;
  const returning = ready && hasAnyProgress(progress.state);
  const { drafts } = countLessons("bn");
  const showOptionalTracks = settings.showIslamicTrack;

  return (
    <div className="flex flex-col gap-12">
      <section aria-labelledby="hero-title" className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-4">
          <h1 id="hero-title" className="flex flex-col gap-1">
            <span
              lang="bn-BD"
              className="font-bengali text-[clamp(3rem,13vw,5.5rem)] font-semibold leading-[1.15] text-teal"
            >
              বাংলা বন্ধু
            </span>
            <span className="font-display text-2xl font-medium md:text-3xl">
              {returning ? t.home.welcomeBack : t.home.welcome}
            </span>
          </h1>
          <p className="max-w-prose text-lg text-ink-soft">{t.home.intro}</p>

          <div className="flex min-h-[52px] flex-wrap items-center gap-3" aria-live="polite">
            {!ready ? null : target ? (
              <Link href={`/lesson/${target.id}`} className="btn btn-primary">
                {resume
                  ? t.home.resume(lessonTitle(resume, locale))
                  : returning
                    ? t.home.next(lessonTitle(target, locale))
                    : t.home.start}
                <ArrowRight aria-hidden="true" className="size-5" />
              </Link>
            ) : lessons.length === 0 ? (
              <Link href="/settings#content-preview" className="btn btn-secondary">
                <NotebookPen aria-hidden="true" className="size-5" />
                {t.home.previewHowTo}
              </Link>
            ) : (
              <p className="font-display text-lg text-teal">{t.home.allDone}</p>
            )}
            {review.due.length > 0 ? (
              <Link
                href="/review"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-mango-ink bg-mango-soft px-4 font-medium text-ink"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                {t.home.due(review.due.length)}
              </Link>
            ) : null}
          </div>
        </div>
        <DoelMascot size={200} className="hidden justify-self-center md:block" />
      </section>

      <section aria-labelledby="path-title" className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 id="path-title" className="font-display text-2xl font-medium">
            {t.home.pathTitle}
          </h2>
          <p className="text-ink-soft">{t.home.pathIntro}</p>
        </div>

        {!ready ? (
          <p className="py-8 text-ink-soft" aria-busy="true">
            {t.common.loading}
          </p>
        ) : lessons.length === 0 ? (
          <div className="paper-card taped flex flex-col gap-3 px-6 pb-6 pt-8">
            <h3 className="font-display text-xl">{t.home.awaitingTitle}</h3>
            <p>{t.home.awaitingBody(drafts)}</p>
            <p className="text-ink-soft">{t.home.awaitingParent}</p>
          </div>
        ) : (
          <LearningPath
            paths={paths}
            progress={progress.state}
            language="bn-BD"
            currentLessonId={target?.id ?? null}
          />
        )}
      </section>

      {showOptionalTracks ? (
        <section aria-labelledby="optional-title">
          <Link
            href="/islamic-learning"
            className="paper-card flex flex-col gap-2 border-dashed px-5 py-5 transition-colors hover:bg-paper-deep sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="flex flex-col gap-1">
              <span className="text-sm text-ink-soft">{t.home.optional}</span>
              <span id="optional-title" className="font-display text-xl font-medium">
                {t.home.optionalIslam}
              </span>
              <span className="text-sm text-ink-soft">{t.home.optionalNote}</span>
            </span>
            <ArrowRight aria-hidden="true" className="size-6 shrink-0 self-end sm:self-center" />
          </Link>
        </section>
      ) : null}
    </div>
  );
}
