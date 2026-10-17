import { describe, expect, it } from "vitest";
import { findLesson } from "@/features/curriculum/loader";
import type { Activity, ActivityOf, SequenceActivity } from "@/features/curriculum/schema";
import { checkChoice, checkMissingCharacter, checkSequence, matchPairsResult } from "./answers";
import {
  advance,
  createEngine,
  currentStep,
  isEngineCompatible,
  progressFraction,
  recordAnswer,
} from "./lesson-engine";
import { summariseSession } from "./scoring";

const lesson = findLesson("bn-w0-l1")!;
const activities = lesson.activities;
const byId = (id: string) => activities.find((a) => a.id === id)!;

function answerAll(correctFor: (activity: Activity) => boolean) {
  let state = createEngine(lesson.id, activities);
  let guard = 0;
  while (!state.complete && guard++ < 50) {
    const activity = activities.find((a) => a.id === currentStep(state)!.activityId)!;
    if (activity.type !== "introduce") {
      const correct = correctFor(activity);
      state = recordAnswer(state, {
        activityId: activity.id,
        correct,
        itemOutcomes: {
          [activity.type === "match-pairs" ? activity.itemIds[0] : activity.promptItemId]: correct,
        },
      });
    }
    state = advance(state, activity);
  }
  return state;
}

describe("lesson engine", () => {
  it("walks through every activity and completes", () => {
    const state = answerAll(() => true);
    expect(state.complete).toBe(true);
    expect(state.steps).toHaveLength(activities.length);
    expect(progressFraction(state)).toBe(1);
  });

  it("will not move past an unanswered question", () => {
    let state = createEngine(lesson.id, activities);
    for (let i = 0; i < 3; i += 1) state = advance(state, activities[i]); // introductions
    const blocked = advance(state, activities[3]);
    expect(blocked.position).toBe(3);
  });

  it("queues a missed activity once more at the end of the session", () => {
    const missed = "bn-w0-l1-a5";
    const state = answerAll((a) => a.id !== missed);
    const retries = state.steps.filter((s) => s.isRetry);
    expect(retries).toEqual([{ activityId: missed, isRetry: true }]);
    expect(state.steps.at(-1)?.activityId).toBe(missed);
    // The retry answer is recorded separately and never overwrites the first attempt.
    expect(state.results[missed].correct).toBe(false);
    expect(state.retryResults[missed]).toBe(false);
  });

  it("ignores a second answer to the same step", () => {
    let state = createEngine(lesson.id, [byId("bn-w0-l1-a4")]);
    state = recordAnswer(state, { activityId: "bn-w0-l1-a4", correct: true, itemOutcomes: {} });
    const again = recordAnswer(state, { activityId: "bn-w0-l1-a4", correct: false, itemOutcomes: {} });
    expect(again).toBe(state);
  });

  it("rejects saved sessions that reference activities that no longer exist", () => {
    const state = createEngine(lesson.id, activities);
    expect(isEngineCompatible(state, new Set(activities.map((a) => a.id)))).toBe(true);
    expect(isEngineCompatible(state, new Set(["bn-w0-l1-a1"]))).toBe(false);
  });
});

describe("scoring", () => {
  it("separates first-try accuracy from finishing", () => {
    const missed = "bn-w0-l1-a5";
    const state = answerAll((a) => a.id !== missed);
    const summary = summariseSession(state, activities);
    expect(summary.scoredCount).toBe(5);
    expect(summary.firstTryCorrect).toBe(4);
    expect(summary.accuracy).toBeCloseTo(0.8);
    expect(summary.needsReviewItemIds).toEqual(["bn.word.boi"]);
  });

  it("never reports a perfect score just for reaching the end", () => {
    const state = answerAll(() => false);
    expect(summariseSession(state, activities).accuracy).toBe(0);
  });
});

describe("answer checking", () => {
  it("checks choices against the stored answer key", () => {
    const activity = byId("bn-w0-l1-a4") as ActivityOf<"word-to-image">;
    expect(checkChoice(activity, "bn.word.aam").correct).toBe(true);
    expect(checkChoice(activity, "bn.word.boi")).toEqual({
      activityId: activity.id,
      correct: false,
      itemOutcomes: { "bn.word.aam": false },
    });
  });

  it("accepts identical tiles in either order (বা + বা)", () => {
    const activity = findLesson("bn-w2-l1")!.activities.find(
      (a) => a.id === "bn-w2-l1-a8",
    ) as SequenceActivity;
    expect(checkSequence(activity, ["t-ba-2", "t-ba-1"]).correct).toBe(true);
    expect(checkSequence(activity, ["t-ba-1", "t-ma"]).correct).toBe(false);
  });

  it("joins sentence tiles with spaces", () => {
    const activity = findLesson("bn-w4-l1")!.activities.find(
      (a) => a.id === "bn-w4-l1-a5",
    ) as SequenceActivity;
    expect(checkSequence(activity, ["t-ami", "t-bhat", "t-khai"]).correct).toBe(true);
    expect(checkSequence(activity, ["t-bhat", "t-ami", "t-khai"]).correct).toBe(false);
  });

  it("builds a syllable from a consonant and a vowel sign", () => {
    const activity = findLesson("bn-w2-l1")!.activities.find(
      (a) => a.id === "bn-w2-l1-a2",
    ) as SequenceActivity;
    expect(checkSequence(activity, ["t-mo", "t-aa-kar"]).correct).toBe(true);
    expect(checkSequence(activity, ["t-aa-kar", "t-mo"]).correct).toBe(false);
  });

  it("checks the missing character by option id", () => {
    const activity = findLesson("bn-w1-l1")!.activities.find(
      (a) => a.id === "bn-w1-l1-a7",
    ) as ActivityOf<"missing-character">;
    expect(checkMissingCharacter(activity, "opt-mo").correct).toBe(true);
    expect(checkMissingCharacter(activity, "opt-bo").correct).toBe(false);
  });

  it("marks only the mismatched items in match-pairs", () => {
    const activity = byId("bn-w0-l1-a8") as ActivityOf<"match-pairs">;
    const result = matchPairsResult(activity, new Set(["bn.word.boi"]));
    expect(result.correct).toBe(false);
    expect(result.itemOutcomes).toEqual({ "bn.word.aam": true, "bn.word.boi": false, "bn.word.mach": true });
  });
});
