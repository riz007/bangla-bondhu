"use client";

import Link from "next/link";
import { useState } from "react";
import { LessonRunner, type SessionDefinition } from "@/features/lessons/components/lesson-runner";
import { useProgress } from "@/features/progress/progress-store";
import { REVIEW_SESSION_ID, buildReviewActivities } from "@/features/review/review-session";
import { useReviewStatus } from "@/features/review/use-review";
import { useHydrated, useT } from "@/features/settings/settings-store";
import { messages } from "@/lib/i18n/messages";

// The question set is fixed when the page opens, so it doesn't shift while answers are saved.
export function ReviewSessionGate() {
  const hydrated = useHydrated();
  const progress = useProgress();
  const status = useReviewStatus();
  const t = useT();
  const [definition, setDefinition] = useState<SessionDefinition | null>(null);

  if (!hydrated || !status.ready || progress.status !== "ready") {
    return <p className="p-10 text-center text-ink-soft">{t.review.preparing}</p>;
  }

  if (!definition) {
    const activities = buildReviewActivities(status.due, status.lessons);
    const hasSaved = Boolean(progress.state.sessions[REVIEW_SESSION_ID]);
    if (activities.length === 0 && !hasSaved) {
      return (
        <main
          id="main"
          className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-4 text-center"
        >
          <h1 className="font-display text-2xl">{t.review.emptyTitle}</h1>
          <Link href="/" className="btn btn-primary">
            {t.review.learnNew}
          </Link>
        </main>
      );
    }
    setDefinition({
      kind: "review",
      sessionId: REVIEW_SESSION_ID,
      title: { th: messages.th.review.sessionTitle, en: messages.en.review.sessionTitle },
      trackId: "bn",
      isDraft: false,
      activities,
      exitHref: "/review",
    });
    return null;
  }

  return <LessonRunner definition={definition} />;
}
