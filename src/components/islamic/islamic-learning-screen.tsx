"use client";

import { BookMarked, EyeOff, Languages } from "lucide-react";
import Link from "next/link";
import { LearningPath } from "@/components/home/learning-path";
import { TargetText } from "@/components/script/target-text";
import { curriculum, getTrackPath } from "@/features/curriculum/loader";
import { topicTitle } from "@/features/curriculum/localize";
import { useProgress } from "@/features/progress/progress-store";
import { useHydrated, useLocale, useSettings, useT } from "@/features/settings/settings-store";

const ARABIC_SAMPLE_LETTERS = ["ا", "ب", "ت", "ث"];

export function IslamicLearningScreen() {
  const settings = useSettings();
  const locale = useLocale();
  const t = useT();
  const hydrated = useHydrated();
  const progress = useProgress();
  const arabicPaths = getTrackPath("ar", { includeDrafts: settings.contentPreview });
  const ready = hydrated && progress.status === "ready";

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-ink-soft">{t.home.optional}</p>
        <h1 className="font-display text-3xl font-medium">{t.home.optionalBoth}</h1>
        <p className="max-w-prose text-ink-soft">{t.extras.intro}</p>
      </header>

      {ready && !settings.showArabicTrack && !settings.showIslamicTrack ? (
        <p className="flex flex-wrap items-center gap-2 rounded-md bg-paper-deep p-4">
          <EyeOff aria-hidden="true" className="size-5 shrink-0" />
          {t.extras.hidden}
          <Link href="/settings" className="underline underline-offset-4">
            {t.common.settingsPage}
          </Link>
        </p>
      ) : null}

      <section aria-labelledby="arabic-title" className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <Languages aria-hidden="true" className="mt-1 size-7 shrink-0 text-teal" />
          <div>
            <h2 id="arabic-title" className="font-display text-2xl">
              {t.home.optionalArabic}
            </h2>
            <p className="text-ink-soft">{t.extras.arabicNote}</p>
          </div>
        </div>

        <div className="paper-card flex flex-col gap-3 p-5">
          <p>
            {t.extras.rtlBefore} <strong>{t.extras.rtlStrong}</strong>
            {t.extras.rtlAfter}
          </p>
          <div className="flex items-center justify-center gap-3" aria-label={t.extras.readingOrder}>
            <span aria-hidden="true" className="text-sm text-ink-soft">
              {t.extras.end}
            </span>
            <TargetText
              language="ar"
              className="whitespace-nowrap text-4xl [word-spacing:0.35em] sm:text-5xl"
              as="p"
            >
              {ARABIC_SAMPLE_LETTERS.join(" ")}
            </TargetText>
            <span aria-hidden="true" className="text-sm text-ink-soft">
              {t.extras.start}
            </span>
          </div>
          <p className="text-center text-sm text-ink-soft">
            {t.extras.firstBefore}
            <TargetText language="ar">ا</TargetText>
            {t.extras.firstAfter}
          </p>
        </div>

        {!ready ? (
          <p className="text-ink-soft" aria-busy="true">
            {t.common.loading}
          </p>
        ) : arabicPaths.length === 0 ? (
          <p className="paper-card p-5">
            {t.extras.arabicDraft}{" "}
            <Link href="/settings#content-preview" className="underline underline-offset-4">
              {t.common.settingsPage}
            </Link>
          </p>
        ) : (
          <LearningPath paths={arabicPaths} progress={progress.state} language="ar" currentLessonId={null} />
        )}
      </section>

      <section
        aria-labelledby="islam-title"
        className="flex flex-col gap-5 border-t-2 border-dashed border-rule pt-8"
      >
        <div className="flex items-start gap-3">
          <BookMarked aria-hidden="true" className="mt-1 size-7 shrink-0 text-leaf" />
          <div>
            <h2 id="islam-title" className="font-display text-2xl">
              {t.extras.islamTitle}
            </h2>
            <p className="text-ink-soft">{t.extras.islamNote}</p>
          </div>
        </div>
        <div className="paper-card flex flex-col gap-3 p-5">
          <h3 className="font-display text-xl">{t.extras.islamReviewTitle}</h3>
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
        </div>
      </section>
    </div>
  );
}
