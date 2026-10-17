import { describe, expect, it } from "vitest";
import { activityItemIds } from "@/features/curriculum/activity-helpers";
import { getTrackLessons } from "@/features/curriculum/loader";
import { findNextLesson, lessonStatus } from "@/features/lessons/path-status";
import { createEmptyProgress } from "@/features/progress/model";
import { applyOutcome } from "@/features/progress/scheduler";
import { buildReviewActivities, reviewableItemIds } from "./review-session";

const NOW = new Date("2026-10-17T08:00:00Z");
const lessons = getTrackLessons("bn", { includeDrafts: true });

function due(itemId: string, correctCount = 0) {
  return { ...applyOutcome(undefined, false, { itemId, trackId: "bn", now: NOW }), correctCount };
}

describe("buildReviewActivities", () => {
  it("picks authored activities that practise each due item", () => {
    const activities = buildReviewActivities([due("bn.word.boi"), due("bn.word.mach")], lessons);
    expect(activities).toHaveLength(2);
    expect(activityItemIds(activities[0])).toContain("bn.word.boi");
    expect(activityItemIds(activities[1])).toContain("bn.word.mach");
    expect(activities.every((a) => a.type !== "introduce")).toBe(true);
  });

  it("varies the activity format between reviews", () => {
    const first = buildReviewActivities([due("bn.word.aam", 0)], lessons)[0];
    const second = buildReviewActivities([due("bn.word.aam", 1)], lessons)[0];
    expect(first.id).not.toBe(second.id);
  });

  it("caps the session length", () => {
    const many = [...reviewableItemIds(lessons)].map((id) => due(id));
    expect(buildReviewActivities(many, lessons, 5)).toHaveLength(5);
  });

  it("skips items with no available lesson", () => {
    expect(buildReviewActivities([due("bn.word.aam")], [])).toEqual([]);
  });
});

describe("path unlocking", () => {
  it("unlocks lessons as prerequisites are completed", () => {
    const state = createEmptyProgress();
    const first = lessons[0];
    const second = lessons.find((l) => l.prerequisites.includes(first.id))!;
    expect(lessonStatus(first, state)).toBe("available");
    expect(lessonStatus(second, state)).toBe("locked");
    expect(findNextLesson(lessons, state)?.id).toBe(first.id);

    state.lessons[first.id] = {
      lessonId: first.id,
      trackId: "bn",
      lessonVersion: 1,
      completedCount: 1,
      firstCompletedAt: NOW.toISOString(),
      lastCompletedAt: NOW.toISOString(),
      bestAccuracy: 0.5,
      lastAccuracy: 0.5,
    };
    expect(lessonStatus(first, state)).toBe("complete");
    expect(lessonStatus(second, state)).toBe("available");
    expect(findNextLesson(lessons, state)?.id).not.toBe(first.id);
  });
});
