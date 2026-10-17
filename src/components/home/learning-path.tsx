"use client";

import { Check, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { TargetText } from "@/components/script/target-text";
import type { WorldPath } from "@/features/curriculum/loader";
import { lessonTitle, worldDescription, worldTitle } from "@/features/curriculum/localize";
import type { Lesson, TargetLanguage } from "@/features/curriculum/schema";
import type { ProgressState } from "@/features/progress/model";
import { lessonStatus, type LessonStatus } from "@/features/lessons/path-status";
import { useLocale, useT } from "@/features/settings/settings-store";

interface LearningPathProps {
  paths: WorldPath[];
  progress: ProgressState;
  language: TargetLanguage;
  currentLessonId: string | null;
}

export function LearningPath({ paths, progress, language, currentLessonId }: LearningPathProps) {
  const locale = useLocale();
  const t = useT();
  return (
    <ol className="flex flex-col gap-10">
      {paths.map(({ world, lessons }, worldIndex) => (
        <li key={world.id} aria-labelledby={`${world.id}-title`}>
          <div className="mb-4 flex items-baseline gap-3">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-mango font-display text-lg font-semibold"
            >
              {worldIndex + 1}
            </span>
            <div>
              <h3 id={`${world.id}-title`} className="font-display text-xl font-medium">
                <span className="sr-only">{t.path.part(worldIndex + 1)}</span>
                {worldTitle(world, locale)}
              </h3>
              <p className="text-sm text-ink-soft">{worldDescription(world, locale)}</p>
            </div>
          </div>
          <ol className="relative ml-4 flex flex-col gap-4 border-l-[3px] border-dashed border-teal/40 pl-6 sm:ml-[18px]">
            {lessons.map((lesson, index) => (
              <li key={lesson.id} className={index % 2 === 1 ? "sm:pl-16" : ""}>
                <LessonSticker
                  lesson={lesson}
                  status={lessonStatus(lesson, progress)}
                  language={language}
                  isCurrent={lesson.id === currentLessonId}
                  inProgress={Boolean(progress.sessions[lesson.id])}
                />
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  );
}

// Emblems sit in a fixed 80px circle, so longer words get a smaller size.
function emblemSize(emblem: string): string {
  const length = [...emblem].length;
  if (length <= 1) return "text-4xl";
  if (length <= 3) return "text-2xl";
  if (length <= 4) return "text-xl";
  return "text-base";
}

function LessonSticker({
  lesson,
  status,
  language,
  isCurrent,
  inProgress,
}: {
  lesson: Lesson;
  status: LessonStatus;
  language: TargetLanguage;
  isCurrent: boolean;
  inProgress: boolean;
}) {
  const locale = useLocale();
  const t = useT();
  const locked = status === "locked";
  const body = (
    <>
      <span
        className={`relative flex size-20 shrink-0 items-center justify-center rounded-full border-[3px] ${
          locked
            ? "border-dashed border-ink/30 bg-paper-deep text-ink-soft"
            : status === "complete"
              ? "border-teal bg-teal-soft"
              : "border-ink bg-card shadow-[0_4px_0_var(--ink)]"
        }`}
      >
        <TargetText language={language} className={emblemSize(lesson.emblem)}>
          {lesson.emblem}
        </TargetText>
        <span
          aria-hidden="true"
          className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-ink bg-card"
        >
          {status === "complete" ? (
            <Check className="size-4 text-teal" strokeWidth={3} />
          ) : locked ? (
            <Lock className="size-3.5" />
          ) : (
            <Sparkles className="size-4 text-mango-ink" />
          )}
        </span>
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="font-display text-lg font-medium leading-snug">{lessonTitle(lesson, locale)}</span>
        <span className="flex flex-wrap gap-x-3 text-sm text-ink-soft">
          <span>{inProgress ? t.path.inProgress : t.path[status]}</span>
          <span>{t.path.minutes(lesson.estimatedMinutes)}</span>
          {lesson.contentStatus === "draft" ? <span className="text-mango-ink">{t.path.draft}</span> : null}
        </span>
      </span>
    </>
  );

  if (locked) {
    return <div className="flex items-center gap-4 rounded-lg p-2 opacity-80">{body}</div>;
  }
  return (
    <Link
      href={`/lesson/${lesson.id}`}
      aria-current={isCurrent ? "step" : undefined}
      className={`flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-card/80 ${
        isCurrent ? "taped taped-teal bg-card shadow-[var(--shadow-print)] ring-2 ring-teal/30" : ""
      }`}
    >
      {body}
    </Link>
  );
}
