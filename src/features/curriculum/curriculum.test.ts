import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assetManifest } from "@/content/assets";
import { curriculum, getTrackPath } from "./loader";
import type { Curriculum, Lesson } from "./schema";
import { validateCurriculum } from "./validation";

const publicDir = join(process.cwd(), "public");
const assetExists = (path: string) => existsSync(join(publicDir, path));

function clone(): Curriculum {
  return structuredClone(curriculum);
}

function lesson(c: Curriculum, id: string): Lesson {
  const found = c.lessons.find((l) => l.id === id);
  if (!found) throw new Error(`fixture lesson ${id} missing`);
  return found;
}

describe("shipped curriculum", () => {
  it("passes every validation rule, including asset paths", () => {
    expect(validateCurriculum(curriculum, { assetExists })).toEqual([]);
  });

  it("lists every referenced media file in the attribution manifest", () => {
    const listed = new Set(assetManifest.map((a) => a.path));
    const used = curriculum.items
      .flatMap((i) => [i.imageSrc, i.audioSrc])
      .filter((p): p is string => Boolean(p));
    expect(used.filter((p) => !listed.has(p))).toEqual([]);
    expect(assetManifest.filter((a) => !assetExists(a.path)).map((a) => a.path)).toEqual([]);
  });

  it("keeps draft lessons out of the learner path unless preview is on", () => {
    const learner = getTrackPath("bn", { includeDrafts: false }).flatMap((p) => p.lessons);
    expect(learner.every((l) => l.contentStatus !== "draft")).toBe(true);
    const preview = getTrackPath("bn", { includeDrafts: true }).flatMap((p) => p.lessons);
    expect(preview.length).toBeGreaterThanOrEqual(7);
  });

  it("ships no Islamic lesson content until it has been human-reviewed", () => {
    const islam = curriculum.lessons.filter((l) => l.trackId === "islam");
    for (const l of islam) {
      expect(l.contentStatus).not.toBe("draft");
      expect(l.reviewerNote && l.sourceNote && l.reviewedAt).toBeTruthy();
    }
  });

  it("marks every Arabic item with Arabic language metadata", () => {
    const arabic = curriculum.items.filter((i) => i.trackId === "ar");
    expect(arabic.length).toBeGreaterThan(0);
    expect(arabic.every((i) => i.targetLanguage === "ar")).toBe(true);
  });
});

describe("validateCurriculum catches broken content", () => {
  it("rejects duplicate item ids", () => {
    const c = clone();
    c.items.push({ ...c.items[0] });
    expect(validateCurriculum(c)).toContain(`duplicate item id: ${c.items[0].id}`);
  });

  it("rejects an answer that is not among the options", () => {
    const c = clone();
    const activity = lesson(c, "bn-w0-l1").activities.find((a) => a.id === "bn-w0-l1-a4");
    if (activity?.type !== "word-to-image") throw new Error("fixture changed");
    activity.optionItemIds = ["bn.word.boi", "bn.word.mach"];
    expect(validateCurriculum(c).join("\n")).toMatch(/answer is not one of the options/);
  });

  it("rejects a build-word answer that does not spell the target", () => {
    const c = clone();
    const activity = lesson(c, "bn-w1-l1").activities.find((a) => a.id === "bn-w1-l1-a8");
    if (activity?.type !== "build-word") throw new Error("fixture changed");
    activity.answerTileIds = ["t-i", "t-bo"];
    expect(validateCurriculum(c).join("\n")).toMatch(/answer builds "ইব", expected "বই"/);
  });

  it("rejects a missing-character activity that does not spell the word", () => {
    const c = clone();
    const activity = lesson(c, "bn-w1-l1").activities.find((a) => a.id === "bn-w1-l1-a7");
    if (activity?.type !== "missing-character") throw new Error("fixture changed");
    activity.answerOptionId = "opt-bo";
    expect(validateCurriculum(c).join("\n")).toMatch(/does not spell আম/);
  });

  it("rejects a published lesson that uses draft items or lacks audio", () => {
    const c = clone();
    const l = lesson(c, "bn-w0-l1");
    l.contentStatus = "published";
    l.reviewedAt = "2026-10-01";
    const problems = validateCurriculum(c).join("\n");
    expect(problems).toMatch(/uses draft item bn\.word\.aam/);
    expect(problems).toMatch(/needs reviewed audio/);
  });

  it("rejects an Islamic lesson without source and reviewer notes", () => {
    const c = clone();
    c.worlds.push({
      id: "islam-w0",
      trackId: "islam",
      order: 0,
      titleTh: "ทดสอบ",
      titleEn: "Test",
      descriptionTh: "ทดสอบ",
      descriptionEn: "Test",
    });
    c.items.push({
      id: "islam.word.test",
      trackId: "islam",
      kind: "word",
      targetText: "ทดสอบ",
      targetLanguage: "th",
      meaningTh: "ทดสอบ",
      meaningEn: "test",
      difficulty: 1,
      contentStatus: "draft",
    });
    const base = lesson(c, "bn-w0-l1");
    c.lessons.push({
      ...structuredClone(base),
      id: "islam-w0-l1",
      trackId: "islam",
      worldId: "islam-w0",
      prerequisites: [],
      itemIds: ["islam.word.test"],
      activities: base.activities.map((a) => ({ ...a, id: `islam-${a.id}` })),
    });
    expect(validateCurriculum(c).join("\n")).toMatch(
      /Islamic lessons need sourceNote, reviewerNote and reviewedAt/,
    );
  });

  it("requires notes to be translated into both languages", () => {
    const c = clone();
    const aam = c.items.find((i) => i.id === "bn.word.aam");
    if (!aam) throw new Error("fixture changed");
    delete aam.noteEn;
    expect(validateCurriculum(c).join("\n")).toMatch(/noteTh and noteEn must come together/);
  });

  it("rejects options whose English meanings are identical", () => {
    const c = clone();
    const boi = c.items.find((i) => i.id === "bn.word.boi");
    if (!boi) throw new Error("fixture changed");
    boi.meaningEn = "mango";
    expect(validateCurriculum(c).join("\n")).toMatch(/options look identical \(meaningEn\)/);
  });

  it("rejects prerequisite cycles", () => {
    const c = clone();
    lesson(c, "bn-w0-l1").prerequisites = ["bn-w0-l2"];
    expect(validateCurriculum(c).join("\n")).toMatch(/prerequisite cycle/);
  });

  it("rejects image activities whose options have no picture", () => {
    const c = clone();
    const boi = c.items.find((i) => i.id === "bn.word.boi");
    if (!boi) throw new Error("fixture changed");
    delete boi.imageSrc;
    expect(validateCurriculum(c).join("\n")).toMatch(/every image option needs imageSrc/);
  });

  it("reports missing asset files", () => {
    const c = clone();
    c.items[0].audioSrc = "/audio/bn/does-not-exist.mp3";
    expect(validateCurriculum(c, { assetExists }).join("\n")).toMatch(/missing asset/);
  });

  it("rejects malformed data via the schema", () => {
    expect(validateCurriculum({ version: 1, items: [{ id: "BAD ID" }] })[0]).toMatch(/^schema:/);
  });
});
