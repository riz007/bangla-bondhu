import { describe, expect, it } from "vitest";
import { findLesson, getItem } from "@/features/curriculum/loader";
import type { Activity, ActivityOf, ActivityType, SequenceActivity } from "@/features/curriculum/schema";
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
import { composeSentence, findAgreementProblem, initialChoices } from "./sentence-builder";

const lesson = findLesson("bn-hello-1")!;
const activities = lesson.activities;
const byId = (id: string) => activities.find((a) => a.id === id)!;

function activityIn<T extends ActivityType>(lessonId: string, type: T, nth = 0): ActivityOf<T> {
  const found = findLesson(lessonId)!.activities.filter((a) => a.type === type)[nth];
  if (!found) throw new Error(`fixture: no ${type} in ${lessonId}`);
  return found as ActivityOf<T>;
}

const tileIds = (activity: SequenceActivity, ...texts: string[]) => {
  const used = new Set<string>();
  return texts.map((text) => {
    const tile = activity.tiles.find((t) => t.text === text && !used.has(t.id))!;
    used.add(tile.id);
    return tile.id;
  });
};

function answerAll(correctFor: (activity: Activity) => boolean) {
  let state = createEngine(lesson.id, activities);
  let guard = 0;
  while (!state.complete && guard++ < 50) {
    const activity = activities.find((a) => a.id === currentStep(state)!.activityId)!;
    if (activity.type !== "introduce") {
      const correct = correctFor(activity);
      const itemId =
        activity.type === "match-pairs"
          ? activity.itemIds[0]
          : "promptItemId" in activity
            ? activity.promptItemId
            : "";
      state = recordAnswer(state, { activityId: activity.id, correct, itemOutcomes: { [itemId]: correct } });
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
    for (let i = 0; i < 3; i += 1) state = advance(state, activities[i]);
    const blocked = advance(state, activities[3]);
    expect(blocked.position).toBe(3);
  });

  it("lets tips and the sentence maker pass without a scored answer", () => {
    const grammar = findLesson("bn-grammar-1")!.activities;
    const tipStep = grammar.find((a) => a.type === "tip")!;
    const frame = grammar.find((a) => a.type === "make-sentence")!;
    let state = createEngine("x", [tipStep, frame]);
    state = advance(state, tipStep);
    state = advance(state, frame);
    expect(state.complete).toBe(true);
  });

  it("queues a missed activity once more at the end of the session", () => {
    const missed = "bn-hello-1-5";
    const state = answerAll((a) => a.id !== missed);
    const retries = state.steps.filter((s) => s.isRetry);
    expect(retries).toEqual([{ activityId: missed, isRetry: true }]);
    expect(state.steps.at(-1)?.activityId).toBe(missed);
    expect(state.results[missed].correct).toBe(false);
    expect(state.retryResults[missed]).toBe(false);
  });

  it("ignores a second answer to the same step", () => {
    let state = createEngine(lesson.id, [byId("bn-hello-1-4")]);
    state = recordAnswer(state, { activityId: "bn-hello-1-4", correct: true, itemOutcomes: {} });
    const again = recordAnswer(state, { activityId: "bn-hello-1-4", correct: false, itemOutcomes: {} });
    expect(again).toBe(state);
  });

  it("rejects saved sessions that reference activities that no longer exist", () => {
    const state = createEngine(lesson.id, activities);
    expect(isEngineCompatible(state, new Set(activities.map((a) => a.id)))).toBe(true);
    expect(isEngineCompatible(state, new Set(["bn-hello-1-1"]))).toBe(false);
  });
});

describe("scoring", () => {
  it("separates first-try accuracy from finishing", () => {
    const state = answerAll((a) => a.id !== "bn-hello-1-5");
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
    const activity = activityIn("bn-hello-1", "word-to-image");
    expect(checkChoice(activity, "bn.word.aam").correct).toBe(true);
    expect(checkChoice(activity, "bn.word.boi")).toEqual({
      activityId: activity.id,
      correct: false,
      itemOutcomes: { "bn.word.aam": false },
    });
  });

  it("accepts identical tiles in either order", () => {
    const activity: SequenceActivity = {
      id: "test",
      type: "build-word",
      promptItemId: "bn.word.baba",
      tiles: [
        { id: "a", text: "বা" },
        { id: "b", text: "মা" },
        { id: "c", text: "বা" },
      ],
      answerTileIds: ["a", "c"],
    };
    expect(checkSequence(activity, ["c", "a"]).correct).toBe(true);
    expect(checkSequence(activity, ["a", "b"]).correct).toBe(false);
  });

  it("joins sentence tiles with spaces", () => {
    const activity = activityIn("bn-grammar-1", "listen-and-order");
    expect(checkSequence(activity, tileIds(activity, "আমি", "ভাত", "খাই")).correct).toBe(true);
    expect(checkSequence(activity, tileIds(activity, "ভাত", "আমি", "খাই")).correct).toBe(false);
  });

  it("builds ি-syllables in spoken order even though ি is written first", () => {
    const activity = activityIn("bn-kar-1", "build-syllable", 1);
    expect(getItem(activity.promptItemId).targetText).toBe("কি");
    expect(checkSequence(activity, tileIds(activity, "ক", "ি")).correct).toBe(true);
    expect(checkSequence(activity, tileIds(activity, "ি", "ক")).correct).toBe(false);
  });

  it("builds a joined letter with hosonto", () => {
    const activity = activityIn("bn-joined-1", "build-syllable");
    expect(checkSequence(activity, tileIds(activity, "স", "্", "ক")).correct).toBe(true);
  });

  it("checks the missing character by option id", () => {
    const activity = activityIn("bn-consonants-1", "missing-character");
    const option = (text: string) => activity.options.find((o) => o.text === text)!.id;
    expect(checkMissingCharacter(activity, option("ক")).correct).toBe(true);
    expect(checkMissingCharacter(activity, option("খ")).correct).toBe(false);
  });

  it("marks only the mismatched items in match-pairs", () => {
    const activity = activityIn("bn-hello-1", "match-pairs");
    const result = matchPairsResult(activity, new Set(["bn.word.boi"]));
    expect(result.correct).toBe(false);
    expect(result.itemOutcomes).toEqual({ "bn.word.aam": true, "bn.word.boi": false, "bn.word.mach": true });
  });
});

describe("sentence maker", () => {
  const eat = activityIn("bn-grammar-1", "make-sentence");
  const have = activityIn("bn-grammar-6", "make-sentence", 1);

  it("pre-fills slots that only have one word", () => {
    expect(initialChoices(have)).toEqual(["", "bn.word.ekta", "", "", "bn.word.achhe"].map((v) => v || null));
  });

  it("asks for the verb form that matches the person", () => {
    expect(findAgreementProblem(eat, ["bn.word.se", "bn.word.mach", "bn.word.khai"])).toEqual({
      slot: 2,
      personItemId: "bn.word.se",
      requiredItemId: "bn.word.khay",
    });
    expect(findAgreementProblem(eat, ["bn.word.se", "bn.word.mach", "bn.word.khay"])).toBeNull();
    expect(findAgreementProblem(eat, ["bn.word.amra", "bn.word.bhat", "bn.word.khai"])).toBeNull();
  });

  it("builds the Bengali sentence and both translations", () => {
    const items = ["bn.word.se", "bn.word.mach", "bn.word.khay"].map(getItem);
    expect(composeSentence(eat, items)).toEqual({
      text: "সে মাছ খায়",
      transliteration: "she machh khay",
      meaningTh: "เขากินปลา",
      meaningEn: "He/She eats fish.",
    });
  });

  it("translates 'I have' sentences with the describing word in each language's order", () => {
    const items = ["bn.word.amar", "bn.word.ekta", "bn.word.lal", "bn.word.bol", "bn.word.achhe"].map(
      getItem,
    );
    expect(composeSentence(have, items)).toMatchObject({
      text: "আমার একটা লাল বল আছে",
      meaningTh: "ฉันมีบอลสีแดง",
      meaningEn: "I have a red ball.",
    });
  });
});
