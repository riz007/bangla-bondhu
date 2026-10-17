import { activityItemIds, isScoredActivity } from "@/features/curriculum/activity-helpers";
import type { Activity, Lesson } from "@/features/curriculum/schema";
import type { ItemProgress } from "@/features/progress/model";

export const REVIEW_SESSION_SIZE = 8;
export const REVIEW_SESSION_ID = "review";

export function reviewableItemIds(lessons: readonly Lesson[]): Set<string> {
  return new Set(lessons.flatMap((lesson) => lesson.itemIds));
}

export function buildReviewActivities(
  dueItems: readonly ItemProgress[],
  lessons: readonly Lesson[],
  size: number = REVIEW_SESSION_SIZE,
): Activity[] {
  const scored = lessons.flatMap((lesson) => lesson.activities.filter(isScoredActivity));
  const chosen: Activity[] = [];
  const chosenIds = new Set<string>();

  for (const item of dueItems) {
    if (chosen.length >= size) break;
    const candidates = scored.filter(
      (activity) => !chosenIds.has(activity.id) && activityItemIds(activity).includes(item.itemId),
    );
    const focused = candidates.filter((activity) => activity.type !== "match-pairs");
    const pool = focused.length ? focused : candidates;
    if (!pool.length) continue;
    const pick = pool[(item.correctCount + item.incorrectCount) % pool.length];
    chosen.push(pick);
    chosenIds.add(pick.id);
  }
  return chosen;
}
