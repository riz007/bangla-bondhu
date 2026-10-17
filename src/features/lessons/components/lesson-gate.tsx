"use client";

import { Lock, NotebookPen } from "lucide-react";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { findLesson, isLessonAvailable } from "@/features/curriculum/loader";
import { lessonTitle } from "@/features/curriculum/localize";
import type { Lesson } from "@/features/curriculum/schema";
import { useProgress } from "@/features/progress/progress-store";
import { useHydrated, useLocale, useSettings, useT } from "@/features/settings/settings-store";
import { lessonStatus } from "../path-status";
import { LessonRunner, type SessionDefinition } from "./lesson-runner";

export function LessonGate({ lessonId }: { lessonId: string }) {
  const lesson = findLesson(lessonId);
  const settings = useSettings();
  const locale = useLocale();
  const t = useT();
  const progress = useProgress();
  const hydrated = useHydrated();

  const definition = useMemo<SessionDefinition | null>(
    () =>
      lesson
        ? {
            kind: "lesson",
            sessionId: lesson.id,
            title: { th: lesson.titleTh, en: lesson.titleEn },
            trackId: lesson.trackId,
            lessonVersion: lesson.version,
            isDraft: lesson.contentStatus === "draft",
            activities: lesson.activities,
            exitHref: lesson.trackId === "bn" ? "/" : "/islamic-learning",
          }
        : null,
    [lesson],
  );

  if (!lesson || !definition) return null;
  if (!hydrated || progress.status !== "ready") {
    return (
      <Notice>
        <p className="text-ink-soft" aria-busy="true">
          {t.common.loading}
        </p>
      </Notice>
    );
  }

  if (!isLessonAvailable(lesson, { includeDrafts: settings.contentPreview })) {
    return (
      <Notice>
        <NotebookPen aria-hidden="true" className="size-10 text-mango-ink" />
        <h1 className="font-display text-2xl">{t.lesson.draftTitle}</h1>
        <p className="text-ink-soft">{t.lesson.draftBody}</p>
        <Link href="/settings#content-preview" className="btn btn-secondary">
          {t.common.goToSettings}
        </Link>
        <Link href="/" className="btn btn-quiet">
          {t.common.backToMap}
        </Link>
      </Notice>
    );
  }

  if (lessonStatus(lesson, progress.state) === "locked") {
    const required = lesson.prerequisites
      .map(findLesson)
      .filter((l): l is Lesson => l !== undefined && !progress.state.lessons[l.id]);
    return (
      <Notice>
        <Lock aria-hidden="true" className="size-10 text-teal" />
        <h1 className="font-display text-2xl">{t.lesson.lockedTitle}</h1>
        <p className="text-ink-soft">{t.lesson.lockedBody(lessonTitle(lesson, locale))}</p>
        <ul className="flex w-full flex-col gap-2">
          {required.map((r) => (
            <li key={r.id}>
              <Link href={`/lesson/${r.id}`} className="btn btn-secondary w-full">
                {lessonTitle(r, locale)}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/" className="btn btn-quiet">
          {t.common.backToMap}
        </Link>
      </Notice>
    );
  }

  return <LessonRunner definition={definition} />;
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <div className="paper-card taped flex flex-col items-center gap-4 px-6 pb-6 pt-10 text-center">
        {children}
      </div>
    </main>
  );
}
