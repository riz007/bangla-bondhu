import { beforeEach, describe, expect, it } from "vitest";
import { createEmptyProgress, PROGRESS_SCHEMA_VERSION, type ProgressState } from "./model";
import { aggregateItemOutcomes, recordCompletedSession } from "./operations";
import { __resetProgressStoreForTests, getProgressSnapshot, progressActions } from "./progress-store";
import { createIndexedDbRepository, createMemoryRepository } from "./repository";
import { loadStoredProgress, migrateProgress, parseProgressImport, serializeProgress } from "./transfer";

const NOW = new Date("2026-10-17T08:00:00Z");

function completedLesson(state: ProgressState, accuracy: number, correct = true): ProgressState {
  return recordCompletedSession(state, {
    kind: "lesson",
    sessionId: "bn-w0-l1",
    lessonVersion: 1,
    trackId: "bn",
    itemTracks: new Map(),
    results: [{ activityId: "a1", correct, itemOutcomes: { "bn.word.aam": correct } }],
    accuracy,
    now: NOW,
  });
}

describe("operations", () => {
  it("counts an item as missed if any first attempt with it was wrong", () => {
    const outcomes = aggregateItemOutcomes([
      { activityId: "a", correct: true, itemOutcomes: { x: true, y: true } },
      { activityId: "b", correct: false, itemOutcomes: { y: false } },
    ]);
    expect(Object.fromEntries(outcomes)).toEqual({ x: true, y: false });
  });

  it("records completion, schedules items and clears the saved session", () => {
    const withSession: ProgressState = {
      ...createEmptyProgress(),
      sessions: {
        "bn-w0-l1": {
          kind: "lesson",
          sessionId: "bn-w0-l1",
          startedAt: NOW.toISOString(),
          updatedAt: NOW.toISOString(),
          engine: {
            sessionId: "bn-w0-l1",
            steps: [{ activityId: "a1", isRetry: false }],
            position: 0,
            results: {},
            retryResults: {},
            complete: false,
          },
        },
      },
    };
    const next = completedLesson(withSession, 0.8);
    expect(next.lessons["bn-w0-l1"].completedCount).toBe(1);
    expect(next.items["bn.word.aam"].streakCorrect).toBe(1);
    expect(next.sessions["bn-w0-l1"]).toBeUndefined();
  });

  it("never lowers the best accuracy after a weaker attempt", () => {
    const first = completedLesson(createEmptyProgress(), 1);
    const second = completedLesson(first, 0.4, false);
    expect(second.lessons["bn-w0-l1"].bestAccuracy).toBe(1);
    expect(second.lessons["bn-w0-l1"].lastAccuracy).toBe(0.4);
    expect(second.lessons["bn-w0-l1"].completedCount).toBe(2);
  });
});

describe("migration and import/export", () => {
  const sample = completedLesson(createEmptyProgress(), 0.75);

  it("round-trips through an export file", () => {
    const text = serializeProgress(sample, NOW);
    const result = parseProgressImport(text);
    expect(result).toEqual({ ok: true, state: sample });
  });

  it("rejects text that is not JSON", () => {
    expect(parseProgressImport("{not json")).toEqual({ ok: false, reason: "not-json" });
  });

  it("rejects JSON from another app", () => {
    expect(parseProgressImport(JSON.stringify({ hello: "world" }))).toEqual({
      ok: false,
      reason: "wrong-format",
    });
  });

  it("rejects corrupted progress inside a valid file", () => {
    const text = JSON.stringify({
      format: "bangla-bondhu-progress",
      exportedAt: NOW.toISOString(),
      progress: { ...sample, items: { "bn.word.aam": { itemId: "bn.word.aam", correctCount: -3 } } },
    });
    expect(parseProgressImport(text)).toEqual({ ok: false, reason: "invalid" });
  });

  it("rejects progress from a newer app version", () => {
    expect(migrateProgress({ ...sample, schemaVersion: PROGRESS_SCHEMA_VERSION + 1 })).toEqual({
      ok: false,
      reason: "too-new",
    });
  });

  it("rejects oversized files before parsing", () => {
    expect(parseProgressImport("x".repeat(1_000_001))).toEqual({ ok: false, reason: "too-large" });
  });

  it("starts fresh, and says so, when stored data is unreadable", () => {
    expect(loadStoredProgress("garbage")).toEqual({ state: createEmptyProgress(), recovered: true });
    expect(loadStoredProgress(undefined)).toEqual({ state: createEmptyProgress(), recovered: false });
  });
});

describe("repositories", () => {
  it("persists to IndexedDB and reads back", async () => {
    const repo = createIndexedDbRepository();
    const state = completedLesson(createEmptyProgress(), 1);
    await repo.write(state);
    const again = createIndexedDbRepository();
    expect(loadStoredProgress(await again.readRaw()).state).toEqual(state);
    await again.clear();
    expect(await again.readRaw()).toBeUndefined();
  });

  it("keeps an isolated copy in the memory fallback", async () => {
    const repo = createMemoryRepository();
    const state = createEmptyProgress();
    await repo.write(state);
    state.lessons.x = completedLesson(createEmptyProgress(), 1).lessons["bn-w0-l1"];
    expect(loadStoredProgress(await repo.readRaw()).state.lessons).toEqual({});
  });
});

describe("progress store", () => {
  beforeEach(async () => {
    await __resetProgressStoreForTests();
    await createIndexedDbRepository().clear();
  });

  it("saves completed sessions and survives a reload", async () => {
    await progressActions.completeSession({
      kind: "lesson",
      sessionId: "bn-w0-l1",
      lessonVersion: 1,
      trackId: "bn",
      itemTracks: new Map(),
      results: [{ activityId: "a1", correct: false, itemOutcomes: { "bn.word.boi": false } }],
      accuracy: 0,
      now: NOW,
    });
    expect(getProgressSnapshot().storage).toBe("indexeddb");

    await __resetProgressStoreForTests(); // simulate a page refresh
    await progressActions.discardSession("nothing"); // triggers a load
    const reloaded = getProgressSnapshot().state;
    expect(reloaded.lessons["bn-w0-l1"]).toBeDefined();
    expect(reloaded.items["bn.word.boi"].incorrectCount).toBe(1);
  });

  it("resets everything", async () => {
    await progressActions.replaceAll(completedLesson(createEmptyProgress(), 1));
    await progressActions.reset();
    expect(getProgressSnapshot().state).toEqual(createEmptyProgress());
    await __resetProgressStoreForTests();
    await progressActions.discardSession("nothing");
    expect(getProgressSnapshot().state).toEqual(createEmptyProgress());
  });
});
