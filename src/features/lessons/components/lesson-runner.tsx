"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { findActivity, findItem } from "@/features/curriculum/loader";
import type { Activity, CurriculumItem, TrackId } from "@/features/curriculum/schema";
import type { ActivityResult, EngineState } from "@/features/progress/model";
import { progressActions, useProgress } from "@/features/progress/progress-store";
import { shouldShowTransliteration } from "@/features/settings/settings-model";
import { useLocale, useSettings, useT } from "@/features/settings/settings-store";
import type { Locale } from "@/lib/i18n/messages";
import {
  advance,
  createEngine,
  currentStep,
  isCurrentAnswered,
  isEngineCompatible,
  progressFraction,
  recordAnswer,
} from "../lesson-engine";
import { summariseSession, type SessionSummary } from "../scoring";
import { ActivityView } from "./activity-view";
import { FeedbackPanel } from "./feedback-panel";
import { LanguageToggle } from "@/components/navigation/language-toggle";
import { ActionBar } from "./shared";
import { SessionSummaryView } from "./session-summary";
import type { FeedbackDetail } from "./types";

export interface SessionDefinition {
  kind: "lesson" | "review";
  sessionId: string;
  title: Record<Locale, string>;
  trackId: TrackId;
  lessonVersion?: number;
  isDraft: boolean;
  activities: readonly Activity[];
  exitHref: "/" | "/review" | "/islamic-learning";
}

type StartChoice = "undecided" | "resume" | "restart";

// After a reload mid-feedback, the answer can still be explained from the data.
function fallbackFeedback(activity: Activity): FeedbackDetail | null {
  switch (activity.type) {
    case "match-pairs":
    case "introduce":
    case "tip":
    case "make-sentence":
      return null;
    default:
      return { answerItemId: activity.promptItemId };
  }
}

function activitiesOf(engine: EngineState): Activity[] {
  const ids = [...new Set(engine.steps.map((step) => step.activityId))];
  return ids.map((id) => findActivity(id)).filter((a): a is Activity => a !== undefined);
}

export function LessonRunner({ definition }: { definition: SessionDefinition }) {
  const progress = useProgress();
  const settings = useSettings();
  const t = useT();
  const { sessionId, activities } = definition;

  const fresh = useMemo(
    () => (activities.length ? createEngine(sessionId, activities) : null),
    [sessionId, activities],
  );
  const [choice, setChoice] = useState<StartChoice>("undecided");
  const [engine, setEngine] = useState<EngineState | null>(null);
  const [feedback, setFeedback] = useState<{ position: number; detail: FeedbackDetail } | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const startedAt = useRef<string | null>(null);
  const headingFocusPending = useRef(false);
  const finishing = useRef(false);

  const saved = useMemo(() => {
    if (progress.status !== "ready") return null;
    const session = progress.state.sessions[sessionId];
    if (!session || session.kind !== definition.kind) return null;
    if (definition.lessonVersion && session.lessonVersion !== definition.lessonVersion) return null;
    const known = new Set(activitiesOf(session.engine).map((a) => a.id));
    if (!isEngineCompatible(session.engine, known) || session.engine.complete) return null;
    return session;
  }, [progress, sessionId, definition.kind, definition.lessonVersion]);

  const active: EngineState | null =
    engine ?? (choice === "resume" && saved ? saved.engine : choice === "undecided" && saved ? null : fresh);

  // Start each step at its heading for keyboard and screen-reader users.
  useEffect(() => {
    if (!headingFocusPending.current) return;
    headingFocusPending.current = false;
    document.querySelector<HTMLElement>("[data-activity-heading]")?.focus();
  });

  const showTransliteration = (item: CurriculumItem) =>
    shouldShowTransliteration(settings.transliteration, progress.state.items[item.id]?.masteryLevel ?? "new");

  if (progress.status !== "ready") {
    return <RunnerFrame definition={definition} fraction={0} busy />;
  }

  if (summary) {
    return <SessionSummaryView definition={definition} summary={summary} />;
  }

  if (!active && !(choice === "undecided" && saved)) {
    return (
      <RunnerFrame definition={definition} fraction={0}>
        <div className="paper-card mx-auto flex max-w-md flex-col items-center gap-4 p-6 text-center">
          <h2 className="font-display text-2xl">{t.lesson.empty}</h2>
          <Link href={definition.exitHref} className="btn btn-primary w-full">
            {t.lesson.back}
          </Link>
        </div>
      </RunnerFrame>
    );
  }

  if (!active) {
    return (
      <RunnerFrame definition={definition} fraction={0}>
        <div className="paper-card taped mx-auto flex max-w-md flex-col items-center gap-4 px-6 pb-6 pt-8 text-center">
          <h2 className="font-display text-2xl">{t.lesson.resumeTitle}</h2>
          <p className="text-ink-soft">{t.lesson.resumeBody}</p>
          <button type="button" className="btn btn-primary w-full" onClick={() => setChoice("resume")}>
            {t.lesson.resume}
          </button>
          <button
            type="button"
            className="btn btn-secondary w-full"
            onClick={() => {
              void progressActions.discardSession(sessionId);
              setChoice("restart");
            }}
          >
            {t.lesson.restart}
          </button>
        </div>
      </RunnerFrame>
    );
  }

  if (active.complete) {
    return <RunnerFrame definition={definition} fraction={1} busy busyLabel={t.lesson.saving} />;
  }

  const step = currentStep(active);
  const activity = step ? findActivity(step.activityId) : undefined;
  if (!step || !activity) {
    return (
      <RunnerFrame definition={definition} fraction={0}>
        <p role="alert" className="paper-card p-6 text-center">
          {t.lesson.broken}
        </p>
      </RunnerFrame>
    );
  }

  const answeredNow = isCurrentAnswered(active);
  const answered: ActivityResult | null = !answeredNow
    ? null
    : step.isRetry
      ? { activityId: activity.id, correct: active.retryResults[activity.id] ?? false, itemOutcomes: {} }
      : (active.results[activity.id] ?? null);

  const persist = (next: EngineState) => {
    const now = new Date().toISOString();
    startedAt.current ??= saved?.startedAt ?? now;
    void progressActions.saveSession({
      kind: definition.kind,
      sessionId,
      lessonVersion: definition.lessonVersion,
      startedAt: startedAt.current,
      updatedAt: now,
      engine: next,
    });
  };

  const finish = (next: EngineState) => {
    const used = activitiesOf(next);
    const result = summariseSession(next, used);
    const itemTracks = new Map<string, TrackId>();
    for (const id of result.practisedItemIds) {
      const item = findItem(id);
      if (item) itemTracks.set(id, item.trackId);
    }
    if (finishing.current) return;
    finishing.current = true;
    // Wait for the write so "saved on this device" is true even if the tab closes right away.
    void progressActions
      .completeSession({
        kind: definition.kind,
        sessionId,
        lessonVersion: definition.lessonVersion,
        trackId: definition.trackId,
        itemTracks,
        results: Object.values(next.results),
        accuracy: result.accuracy,
        now: new Date(),
      })
      .finally(() => setSummary(result));
  };

  const onAnswer = (result: ActivityResult, detail: FeedbackDetail) => {
    const next = recordAnswer(active, result);
    setEngine(next);
    setFeedback({ position: active.position, detail });
    persist(next);
  };

  const onContinue = () => {
    const next = advance(active, activity);
    setEngine(next);
    setFeedback(null);
    headingFocusPending.current = true;
    if (next.complete) finish(next);
    else persist(next);
  };

  const retryQueued = !step.isRetry && active.steps.some((s) => s.isRetry && s.activityId === activity.id);

  return (
    <RunnerFrame definition={definition} fraction={progressFraction(active)}>
      <div data-activity-id={activity.id} data-activity-type={activity.type}>
        <ActivityView
          key={`${active.position}-${activity.id}`}
          activity={activity}
          answered={answered}
          onAnswer={onAnswer}
          onContinue={onContinue}
          showTransliteration={showTransliteration}
        />
      </div>
      {answered ? (
        <ActionBar sticky={false}>
          <FeedbackPanel
            result={answered}
            detail={feedback?.position === active.position ? feedback.detail : fallbackFeedback(activity)}
            isRetry={step.isRetry}
            retryQueued={retryQueued}
          />
          <button type="button" className="btn btn-primary w-full" onClick={onContinue} autoFocus>
            {t.lesson.next}
          </button>
        </ActionBar>
      ) : null}
    </RunnerFrame>
  );
}

function RunnerFrame({
  definition,
  fraction,
  busy = false,
  busyLabel,
  children,
}: {
  definition: SessionDefinition;
  fraction: number;
  busy?: boolean;
  busyLabel?: string;
  children?: ReactNode;
}) {
  const t = useT();
  const locale = useLocale();
  const percent = Math.round(fraction * 100);
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pt-3">
      <header className="flex items-center gap-3">
        <Link
          href={definition.exitHref}
          className="btn btn-quiet size-11 shrink-0 rounded-full p-0"
          aria-label={t.lesson.exit}
        >
          <X aria-hidden="true" className="size-6" />
        </Link>
        <div
          role="progressbar"
          aria-label={t.lesson.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-4 flex-1 overflow-hidden rounded-full border-2 border-ink/20 bg-card"
        >
          <div
            className="h-full rounded-full bg-leaf transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <LanguageToggle />
      </header>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="font-display text-base font-normal text-ink-soft">{definition.title[locale]}</h1>
        {definition.isDraft ? (
          <span className="rounded-sm border-2 border-dashed border-mango-ink px-2 text-sm text-mango-ink">
            {t.lesson.draftBadge}
          </span>
        ) : null}
      </div>
      <main id="main" className="flex-1 pb-6 pt-4" aria-busy={busy}>
        {busy ? <p className="py-16 text-center text-ink-soft">{busyLabel ?? t.common.loading}</p> : children}
      </main>
    </div>
  );
}
