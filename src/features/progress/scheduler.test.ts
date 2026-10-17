import { afterEach, describe, expect, it } from "vitest";
import {
  REVIEW_INTERVAL_DAYS,
  addLocalDays,
  applyOutcome,
  getDueItems,
  getNextReviewAt,
  isDue,
  startOfLocalDay,
} from "./scheduler";

const ctx = (now: Date) => ({ itemId: "bn.word.aam", trackId: "bn" as const, now });
const originalTz = process.env.TZ;

afterEach(() => {
  process.env.TZ = originalTz;
});

describe("applyOutcome", () => {
  it("schedules a first correct answer for tomorrow at local midnight", () => {
    const now = new Date(2026, 9, 17, 15, 30);
    const item = applyOutcome(undefined, true, ctx(now));
    expect(item.streakCorrect).toBe(1);
    expect(item.masteryLevel).toBe("learning");
    expect(new Date(item.nextReviewAt)).toEqual(new Date(2026, 9, 18));
  });

  it("follows the 1, 3, 7, 14 day ladder when each review happens on time", () => {
    let now = new Date(2026, 0, 1, 9);
    let item = applyOutcome(undefined, true, ctx(now));
    const gaps: number[] = [];
    for (let step = 0; step < 4; step += 1) {
      const due = new Date(item.nextReviewAt);
      gaps.push(Math.round((due.getTime() - startOfLocalDay(now).getTime()) / 86_400_000));
      now = new Date(due.getTime() + 10 * 3_600_000);
      item = applyOutcome(item, true, ctx(now));
    }
    expect(gaps).toEqual(REVIEW_INTERVAL_DAYS.slice(0, 4));
    expect(item.masteryLevel).toBe("mastered");
  });

  it("does not advance the schedule when practised again before it is due", () => {
    const now = new Date(2026, 9, 17, 10);
    const first = applyOutcome(undefined, true, ctx(now));
    const again = applyOutcome(first, true, ctx(new Date(2026, 9, 17, 11)));
    expect(again.streakCorrect).toBe(1);
    expect(again.nextReviewAt).toBe(first.nextReviewAt);
    expect(again.correctCount).toBe(2);
  });

  it("brings a missed item back immediately and resets the streak", () => {
    const now = new Date(2026, 9, 17, 10);
    const missed = applyOutcome(undefined, false, ctx(now));
    expect(missed.streakCorrect).toBe(0);
    expect(missed.incorrectCount).toBe(1);
    expect(isDue(missed, now)).toBe(true);
  });

  it("lowers mastery by at most one step after a mistake", () => {
    const now = new Date(2026, 9, 17);
    const mastered = {
      ...applyOutcome(undefined, true, ctx(now)),
      masteryLevel: "mastered" as const,
      streakCorrect: 4,
    };
    const after = applyOutcome(mastered, false, ctx(now));
    expect(after.masteryLevel).toBe("familiar");
    const again = applyOutcome(after, false, ctx(now));
    expect(again.masteryLevel).toBe("learning");
    expect(applyOutcome(again, false, ctx(now)).masteryLevel).toBe("learning");
  });
});

describe("date handling across time zones", () => {
  it("counts calendar days across a DST change", () => {
    process.env.TZ = "America/New_York";
    // US clocks spring forward at 02:00 on 8 March 2026, so that day has 23 hours.
    const due = addLocalDays(new Date(2026, 2, 7, 20), 2);
    expect(due.getDate()).toBe(9);
    expect(due.getHours()).toBe(0);
    expect(due.getTime() - new Date(2026, 2, 7).getTime()).toBe(47 * 3_600_000);
  });

  it("schedules relative to the learner's local day, not UTC", () => {
    process.env.TZ = "Asia/Bangkok";
    // 23:30 in Bangkok is still 16:30 UTC of the same day.
    const lateEvening = new Date(2026, 9, 17, 23, 30);
    const item = applyOutcome(undefined, true, ctx(lateEvening));
    const due = new Date(item.nextReviewAt);
    expect(due.getDate()).toBe(18);
    expect(due.getHours()).toBe(0);
  });

  it("treats an item as due exactly at its review time", () => {
    const item = { nextReviewAt: "2026-10-18T00:00:00.000Z" };
    expect(isDue(item, new Date("2026-10-17T23:59:59.999Z"))).toBe(false);
    expect(isDue(item, new Date("2026-10-18T00:00:00.000Z"))).toBe(true);
  });
});

describe("queues", () => {
  it("lists due items most overdue first and finds the next review", () => {
    const now = new Date("2026-10-17T12:00:00Z");
    const make = (id: string, at: string) => ({
      ...applyOutcome(undefined, true, { itemId: id, trackId: "bn", now }),
      nextReviewAt: at,
    });
    const items = {
      a: make("a", "2026-10-16T00:00:00Z"),
      b: make("b", "2026-10-10T00:00:00Z"),
      c: make("c", "2026-10-20T00:00:00Z"),
    };
    expect(getDueItems(items, now).map((i) => i.itemId)).toEqual(["b", "a"]);
    expect(getNextReviewAt(items, now)?.toISOString()).toBe("2026-10-20T00:00:00.000Z");
  });
});
