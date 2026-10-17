import { isScoredActivity } from "@/features/curriculum/activity-helpers";
import type { Activity } from "@/features/curriculum/schema";
import type { EngineState } from "@/features/progress/model";
import { aggregateItemOutcomes } from "@/features/progress/operations";

export interface SessionSummary {
  scoredCount: number;
  firstTryCorrect: number;
  accuracy: number;
  practisedItemIds: string[];
  strongItemIds: string[];
  needsReviewItemIds: string[];
}

export function summariseSession(state: EngineState, activities: readonly Activity[]): SessionSummary {
  const scored = activities.filter(isScoredActivity);
  const results = scored
    .map((activity) => state.results[activity.id])
    .filter((result) => result !== undefined);
  const firstTryCorrect = results.filter((result) => result.correct).length;
  const outcomes = aggregateItemOutcomes(results);
  const practisedItemIds = [...outcomes.keys()];

  return {
    scoredCount: scored.length,
    firstTryCorrect,
    accuracy: scored.length === 0 ? 0 : firstTryCorrect / scored.length,
    practisedItemIds,
    strongItemIds: practisedItemIds.filter((id) => outcomes.get(id)),
    needsReviewItemIds: practisedItemIds.filter((id) => !outcomes.get(id)),
  };
}
