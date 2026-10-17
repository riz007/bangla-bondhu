import type { TrackId } from "@/features/curriculum/schema";
import type { ItemProgress, MasteryLevel } from "./model";

// Days between reviews. A correct answer only moves an item up the ladder when it was due,
// and a missed item is due again straight away.
export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;

const MASTERY_ORDER: readonly MasteryLevel[] = ["new", "learning", "familiar", "mastered"];
const FAMILIAR_STREAK = 2;
const MASTERED_STREAK = 4;

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addLocalDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function intervalForStreak(streak: number): number {
  const index = Math.min(Math.max(streak, 1), REVIEW_INTERVAL_DAYS.length) - 1;
  return REVIEW_INTERVAL_DAYS[index];
}

export function masteryForStreak(streak: number): MasteryLevel {
  if (streak >= MASTERED_STREAK) return "mastered";
  if (streak >= FAMILIAR_STREAK) return "familiar";
  return "learning";
}

function higher(a: MasteryLevel, b: MasteryLevel): MasteryLevel {
  return MASTERY_ORDER.indexOf(a) >= MASTERY_ORDER.indexOf(b) ? a : b;
}

function oneStepDown(level: MasteryLevel): MasteryLevel {
  const index = Math.max(MASTERY_ORDER.indexOf(level) - 1, MASTERY_ORDER.indexOf("learning"));
  return MASTERY_ORDER[index];
}

export function isDue(item: Pick<ItemProgress, "nextReviewAt">, now: Date): boolean {
  return Date.parse(item.nextReviewAt) <= now.getTime();
}

export interface OutcomeContext {
  itemId: string;
  trackId: TrackId;
  now: Date;
}

export function applyOutcome(
  previous: ItemProgress | undefined,
  correct: boolean,
  { itemId, trackId, now }: OutcomeContext,
): ItemProgress {
  const nowIso = now.toISOString();
  const base: ItemProgress = previous ?? {
    itemId,
    trackId,
    firstSeenAt: nowIso,
    lastSeenAt: nowIso,
    nextReviewAt: nowIso,
    correctCount: 0,
    incorrectCount: 0,
    streakCorrect: 0,
    masteryLevel: "new",
  };

  if (!correct) {
    return {
      ...base,
      lastSeenAt: nowIso,
      nextReviewAt: nowIso,
      incorrectCount: base.incorrectCount + 1,
      streakCorrect: 0,
      masteryLevel: previous ? oneStepDown(base.masteryLevel) : "learning",
    };
  }

  const advances = !previous || isDue(previous, now);
  const streakCorrect = advances ? base.streakCorrect + 1 : base.streakCorrect;
  return {
    ...base,
    lastSeenAt: nowIso,
    correctCount: base.correctCount + 1,
    streakCorrect,
    nextReviewAt: advances
      ? addLocalDays(startOfLocalDay(now), intervalForStreak(streakCorrect)).toISOString()
      : base.nextReviewAt,
    masteryLevel: higher(base.masteryLevel, masteryForStreak(streakCorrect)),
  };
}

export function getDueItems(items: Record<string, ItemProgress>, now: Date): ItemProgress[] {
  return Object.values(items)
    .filter((item) => isDue(item, now))
    .sort((a, b) => Date.parse(a.nextReviewAt) - Date.parse(b.nextReviewAt));
}

export function getNextReviewAt(items: Record<string, ItemProgress>, now: Date): Date | null {
  const upcoming = Object.values(items)
    .map((item) => Date.parse(item.nextReviewAt))
    .filter((time) => time > now.getTime())
    .sort((a, b) => a - b);
  return upcoming.length ? new Date(upcoming[0]) : null;
}
