import { joinSequence } from "@/features/curriculum/activity-helpers";
import type { ActivityOf, ChoiceActivity, SequenceActivity } from "@/features/curriculum/schema";
import type { ActivityResult } from "@/features/progress/model";

export function checkChoice(activity: ChoiceActivity, selectedItemId: string): ActivityResult {
  const correct = selectedItemId === activity.answerItemId;
  return { activityId: activity.id, correct, itemOutcomes: { [activity.promptItemId]: correct } };
}

export function sequenceText(activity: SequenceActivity, tileIds: readonly string[]): string {
  const texts = tileIds.map((id) => activity.tiles.find((tile) => tile.id === id)?.text ?? "");
  return joinSequence(activity.type, texts);
}

// Compare text, not tile ids, so the two বা tiles in বাবা can go in either order.
export function checkSequence(activity: SequenceActivity, tileIds: readonly string[]): ActivityResult {
  const built = sequenceText(activity, tileIds);
  const expected = sequenceText(activity, activity.answerTileIds);
  const correct = built === expected;
  return { activityId: activity.id, correct, itemOutcomes: { [activity.promptItemId]: correct } };
}

export function checkMissingCharacter(
  activity: ActivityOf<"missing-character">,
  optionId: string,
): ActivityResult {
  const correct = optionId === activity.answerOptionId;
  return { activityId: activity.id, correct, itemOutcomes: { [activity.promptItemId]: correct } };
}

export function matchPairsResult(
  activity: ActivityOf<"match-pairs">,
  mismatchedItemIds: ReadonlySet<string>,
): ActivityResult {
  const itemOutcomes = Object.fromEntries(activity.itemIds.map((id) => [id, !mismatchedItemIds.has(id)]));
  return { activityId: activity.id, correct: mismatchedItemIds.size === 0, itemOutcomes };
}
