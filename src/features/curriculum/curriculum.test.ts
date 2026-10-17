import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assetManifest } from "@/content/assets";
import { curriculum, getTrackPath } from "./loader";
import type { ActivityOf, ActivityType, Curriculum, Lesson } from "./schema";
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

function activityOf<T extends ActivityType>(c: Curriculum, lessonId: string, type: T): ActivityOf<T> {
  const found = lesson(c, lessonId).activities.find((a) => a.type === type);
  if (!found) throw new Error(`fixture: no ${type} in ${lessonId}`);
  return found as ActivityOf<T>;
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

  it("teaches the whole alphabet: 11 vowels, every consonant and every vowel sign", () => {
    const introduced = new Set(
      curriculum.lessons.flatMap((l) =>
        l.activities.flatMap((a) => (a.type === "introduce" ? [a.itemId] : [])),
      ),
    );
    const vowels = curriculum.items.filter((i) => i.id.startsWith("bn.vowel."));
    const consonants = curriculum.items.filter((i) => i.id.startsWith("bn.cons."));
    const kars = curriculum.items.filter((i) => i.id.startsWith("bn.kar."));
    expect(vowels.map((i) => i.targetText).join("")).toBe("অআইঈউঊঋএঐওঔ");
    expect(consonants).toHaveLength(39);
    expect(kars).toHaveLength(10);
    for (const item of [...vowels, ...consonants, ...kars]) {
      expect(introduced, `${item.id} is never introduced`).toContain(item.id);
    }
  });

  it("includes sentence-maker frames for children to build their own sentences", () => {
    const frames = curriculum.lessons.flatMap((l) => l.activities.filter((a) => a.type === "make-sentence"));
    expect(frames.length).toBeGreaterThanOrEqual(5);
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
    const activity = activityOf(c, "bn-hello-1", "word-to-image");
    activity.optionItemIds = ["bn.word.boi", "bn.word.mach"];
    expect(validateCurriculum(c).join("\n")).toMatch(/answer is not one of the options/);
  });

  it("rejects a build-word answer that does not spell the target", () => {
    const c = clone();
    const activity = activityOf(c, "bn-consonants-5", "build-word");
    const id = (text: string) => activity.tiles.find((t) => t.text === text)!.id;
    activity.answerTileIds = [id("ই"), id("ব")];
    expect(validateCurriculum(c).join("\n")).toMatch(/answer builds "ইব", expected "বই"/);
  });

  it("rejects a missing-character activity that does not spell the word", () => {
    const c = clone();
    const activity = activityOf(c, "bn-consonants-1", "missing-character");
    activity.answerOptionId = activity.options.find((o) => o.text === "খ")!.id;
    expect(validateCurriculum(c).join("\n")).toMatch(/does not spell কলা/);
  });

  it("rejects a published lesson that uses draft items or lacks audio", () => {
    const c = clone();
    const l = lesson(c, "bn-hello-1");
    l.contentStatus = "published";
    l.reviewedAt = "2026-10-01";
    l.reviewerNote = "Checked by a native speaker";
    const problems = validateCurriculum(c).join("\n");
    expect(problems).toMatch(/uses draft item bn\.word\.aam/);
    expect(problems).toMatch(/needs reviewed audio/);
  });

  it("lets a reviewed lesson ship without audio once its items are reviewed", () => {
    const c = clone();
    const l = lesson(c, "bn-hello-1");
    l.contentStatus = "reviewed";
    l.reviewedAt = "2026-10-01";
    l.reviewerNote = "Checked by a native speaker";
    for (const item of c.items.filter((i) => l.itemIds.includes(i.id))) {
      Object.assign(item, { contentStatus: "reviewed", reviewedAt: "2026-10-01", reviewerNote: "ok" });
    }
    const problems = validateCurriculum(c).filter((p) => p.startsWith("lesson bn-hello-1:"));
    expect(problems).toEqual([]);
  });

  it("rejects a sentence frame whose agreement leaves a person without a verb form", () => {
    const c = clone();
    const frame = activityOf(c, "bn-grammar-1", "make-sentence");
    delete frame.agreement[0].pairs["bn.word.se"];
    expect(validateCurriculum(c).join("\n")).toMatch(/agreement has no form for bn\.word\.se/);
  });

  it("rejects a sentence frame whose translation forgets a slot", () => {
    const c = clone();
    activityOf(c, "bn-grammar-1", "make-sentence").templateEn = "{0} {2}.";
    expect(validateCurriculum(c).join("\n")).toMatch(/leaves out slot 1/);
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
    const base = lesson(c, "bn-hello-1");
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
    lesson(c, "bn-hello-1").prerequisites = ["bn-hello-2"];
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
