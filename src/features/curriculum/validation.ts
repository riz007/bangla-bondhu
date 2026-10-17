import {
  curriculumSchema,
  type Activity,
  type Curriculum,
  type CurriculumItem,
  type Lesson,
  type TrackId,
} from "./schema";
import { activityItemIds, isScoredActivity, joinSequence, normaliseForSequence } from "./activity-helpers";

export interface ValidationOptions {
  assetExists?: (publicPath: string) => boolean;
}

const LANGUAGE_FOR_TRACK: Record<TrackId, readonly CurriculumItem["targetLanguage"][]> = {
  bn: ["bn-BD"],
  ar: ["ar"],
  islam: ["ar", "th"],
};

const MIN_SCORED_ACTIVITIES = 4;
const MAX_SCORED_ACTIVITIES = 10;
const MIN_SCORED_ACTIVITY_TYPES = 2;

function findDuplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates];
}

// Returns a list of problems; an empty list means the curriculum is valid.
export function validateCurriculum(input: unknown, options: ValidationOptions = {}): string[] {
  const parsed = curriculumSchema.safeParse(input);
  if (!parsed.success) {
    return parsed.error.issues.map((issue) => `schema: ${issue.path.join(".")}: ${issue.message}`);
  }
  const curriculum = parsed.data;
  const problems: string[] = [];
  const items = new Map(curriculum.items.map((item) => [item.id, item]));
  const lessons = new Map(curriculum.lessons.map((lesson) => [lesson.id, lesson]));
  const worlds = new Map(curriculum.worlds.map((world) => [world.id, world]));

  for (const [label, ids] of [
    ["item", curriculum.items.map((i) => i.id)],
    ["lesson", curriculum.lessons.map((l) => l.id)],
    ["world", curriculum.worlds.map((w) => w.id)],
    ["activity", curriculum.lessons.flatMap((l) => l.activities.map((a) => a.id))],
    ["planned topic", curriculum.plannedTopics.map((t) => t.id)],
  ] as const) {
    for (const duplicate of findDuplicates([...ids])) {
      problems.push(`duplicate ${label} id: ${duplicate}`);
    }
  }

  for (const item of curriculum.items) {
    problems.push(...validateItem(item, options));
  }

  for (const lesson of curriculum.lessons) {
    const where = `lesson ${lesson.id}`;
    const world = worlds.get(lesson.worldId);
    if (!world) problems.push(`${where}: unknown world ${lesson.worldId}`);
    else if (world.trackId !== lesson.trackId) problems.push(`${where}: world is on another track`);

    for (const prerequisite of lesson.prerequisites) {
      const required = lessons.get(prerequisite);
      if (!required) problems.push(`${where}: unknown prerequisite ${prerequisite}`);
      else if (required.trackId !== lesson.trackId) {
        problems.push(`${where}: prerequisite ${prerequisite} is on another track`);
      } else if (lesson.contentStatus !== "draft" && required.contentStatus === "draft") {
        problems.push(`${where}: published lesson depends on draft lesson ${prerequisite}`);
      }
    }

    for (const itemId of lesson.itemIds) {
      const item = items.get(itemId);
      if (!item) problems.push(`${where}: unknown item ${itemId}`);
      else if (item.trackId !== lesson.trackId) problems.push(`${where}: item ${itemId} is on another track`);
    }

    problems.push(...validateLessonShape(lesson));
    problems.push(...validateLessonReview(lesson, items));

    for (const activity of lesson.activities) {
      problems.push(...validateActivity(activity, items).map((p) => `${where} / ${activity.id}: ${p}`));
    }
  }

  problems.push(...findPrerequisiteCycles(curriculum));
  return problems;
}

function validateItem(item: CurriculumItem, { assetExists }: ValidationOptions): string[] {
  const where = `item ${item.id}`;
  const problems: string[] = [];
  if (!item.id.startsWith(`${item.trackId}.`))
    problems.push(`${where}: id must start with "${item.trackId}."`);
  if (!LANGUAGE_FOR_TRACK[item.trackId].includes(item.targetLanguage)) {
    problems.push(`${where}: language ${item.targetLanguage} does not belong on track ${item.trackId}`);
  }
  if (item.transliteration && !item.transliterationScheme) {
    problems.push(`${where}: transliteration needs a transliterationScheme`);
  }
  if (item.imageSrc && (!item.altTh || !item.altEn))
    problems.push(`${where}: image needs Thai and English alt text`);
  if (Boolean(item.noteTh) !== Boolean(item.noteEn))
    problems.push(`${where}: noteTh and noteEn must come together`);
  if (item.contentStatus !== "draft" && (!item.reviewedAt || !item.reviewerNote)) {
    problems.push(`${where}: reviewed items need reviewedAt and reviewerNote`);
  }
  if (assetExists) {
    for (const asset of [item.imageSrc, item.audioSrc]) {
      if (asset && !assetExists(asset)) problems.push(`${where}: missing asset ${asset}`);
    }
  }
  return problems;
}

function validateLessonShape(lesson: Lesson): string[] {
  const where = `lesson ${lesson.id}`;
  const problems: string[] = [];
  const scored = lesson.activities.filter(isScoredActivity);
  if (scored.length < MIN_SCORED_ACTIVITIES || scored.length > MAX_SCORED_ACTIVITIES) {
    problems.push(
      `${where}: needs ${MIN_SCORED_ACTIVITIES}–${MAX_SCORED_ACTIVITIES} practice activities, has ${scored.length}`,
    );
  }
  if (new Set(scored.map((a) => a.type)).size < MIN_SCORED_ACTIVITY_TYPES) {
    problems.push(`${where}: needs at least ${MIN_SCORED_ACTIVITY_TYPES} different activity types`);
  }
  for (const activity of lesson.activities) {
    for (const id of activityItemIds(activity)) {
      if (!lesson.itemIds.includes(id)) {
        problems.push(`${where}: activity ${activity.id} uses ${id}, which is not listed in itemIds`);
      }
    }
  }
  return problems;
}

function validateLessonReview(lesson: Lesson, items: Map<string, CurriculumItem>): string[] {
  const where = `lesson ${lesson.id}`;
  const problems: string[] = [];
  if (lesson.trackId === "islam") {
    if (lesson.contentStatus === "draft") problems.push(`${where}: Islamic lessons cannot ship as draft`);
    if (!lesson.sourceNote || !lesson.reviewerNote || !lesson.reviewedAt) {
      problems.push(`${where}: Islamic lessons need sourceNote, reviewerNote and reviewedAt`);
    }
  }
  if (lesson.contentStatus === "draft") return problems;

  if (!lesson.reviewedAt) problems.push(`${where}: reviewed lessons need reviewedAt`);
  const usedIds = new Set([...lesson.itemIds, ...lesson.activities.flatMap(exampleIds)]);
  for (const id of usedIds) {
    const item = items.get(id);
    if (!item) continue;
    if (item.contentStatus === "draft") problems.push(`${where}: uses draft item ${id}`);
    if (!item.audioSrc) problems.push(`${where}: item ${id} needs reviewed audio before publishing`);
  }
  return problems;
}

function exampleIds(activity: Activity): string[] {
  return activity.type === "introduce" && activity.exampleItemId ? [activity.exampleItemId] : [];
}

function validateActivity(activity: Activity, items: Map<string, CurriculumItem>): string[] {
  const problems: string[] = [];
  if (Boolean(activity.instructionTh) !== Boolean(activity.instructionEn)) {
    problems.push("instructionTh and instructionEn must come together");
  }
  const get = (id: string) => {
    const item = items.get(id);
    if (!item) problems.push(`unknown item ${id}`);
    return item;
  };

  switch (activity.type) {
    case "introduce": {
      get(activity.itemId);
      if (activity.exampleItemId) {
        const example = get(activity.exampleItemId);
        const target = items.get(activity.itemId);
        if (example && target && !example.targetText.includes(target.targetText)) {
          problems.push(`example ${example.id} does not contain ${target.targetText}`);
        }
      }
      break;
    }
    case "listen-and-select":
    case "image-to-word":
    case "word-to-image":
    case "read-and-choose":
    case "recall": {
      const prompt = get(activity.promptItemId);
      const options = activity.optionItemIds.map(get);
      if (findDuplicates(activity.optionItemIds).length) problems.push("options repeat");
      if (!activity.optionItemIds.includes(activity.answerItemId))
        problems.push("answer is not one of the options");
      if (activity.answerItemId !== activity.promptItemId) problems.push("answer must be the prompt item");
      const showsImages =
        activity.type === "word-to-image" ||
        (activity.type === "listen-and-select" && activity.optionsAs === "image");
      if (showsImages && options.some((o) => o && !o.imageSrc))
        problems.push("every image option needs imageSrc");
      if (activity.type === "image-to-word" && prompt && !prompt.imageSrc)
        problems.push("prompt needs imageSrc");
      const fields =
        activity.type === "read-and-choose"
          ? (["meaningTh", "meaningEn"] as const)
          : showsImages
            ? (["imageSrc"] as const)
            : (["targetText"] as const);
      for (const field of fields) {
        const shown = options.map((o) => o?.[field]).filter((s): s is string => Boolean(s));
        if (findDuplicates(shown).length) problems.push(`options look identical (${field})`);
      }
      break;
    }
    case "match-pairs": {
      const pairItems = activity.itemIds.map(get);
      if (findDuplicates(activity.itemIds).length) problems.push("pairs repeat");
      const fields =
        activity.matchBy === "image" ? (["imageSrc"] as const) : (["meaningTh", "meaningEn"] as const);
      for (const field of fields) {
        if (pairItems.some((i) => i && !i[field])) problems.push(`every pair needs ${field}`);
        const values = pairItems.map((i) => i?.[field]).filter((s): s is string => Boolean(s));
        if (findDuplicates(values).length) problems.push(`pairs share the same ${field}`);
      }
      break;
    }
    case "build-syllable":
    case "build-word":
    case "listen-and-order": {
      const prompt = get(activity.promptItemId);
      const tileIds = activity.tiles.map((t) => t.id);
      if (findDuplicates(tileIds).length) problems.push("tile ids repeat");
      if (findDuplicates(activity.answerTileIds).length) problems.push("answer uses a tile twice");
      const answerTiles = activity.answerTileIds.map((id) => activity.tiles.find((t) => t.id === id));
      if (answerTiles.some((t) => !t)) {
        problems.push("answer references a missing tile");
        break;
      }
      const built = joinSequence(
        activity.type,
        answerTiles.map((t) => t!.text),
      );
      const expected = normaliseForSequence(activity.type, prompt?.targetText ?? "");
      if (prompt && built !== expected) problems.push(`answer builds "${built}", expected "${expected}"`);
      break;
    }
    case "missing-character": {
      const prompt = get(activity.promptItemId);
      const answer = activity.options.find((o) => o.id === activity.answerOptionId);
      if (findDuplicates(activity.options.map((o) => o.id)).length) problems.push("option ids repeat");
      if (!answer) {
        problems.push("answer is not one of the options");
        break;
      }
      if (prompt && activity.before + answer.text + activity.after !== prompt.targetText) {
        problems.push(`before + answer + after does not spell ${prompt.targetText}`);
      }
      const alsoCorrect = activity.options.filter(
        (o) => o.id !== answer.id && activity.before + o.text + activity.after === prompt?.targetText,
      );
      if (alsoCorrect.length) problems.push("more than one option spells the word");
      break;
    }
  }
  return problems;
}

function findPrerequisiteCycles(curriculum: Curriculum): string[] {
  const graph = new Map(curriculum.lessons.map((l) => [l.id, l.prerequisites]));
  const state = new Map<string, "visiting" | "done">();
  const problems: string[] = [];
  const visit = (id: string, trail: string[]) => {
    if (state.get(id) === "done") return;
    if (state.get(id) === "visiting") {
      problems.push(`prerequisite cycle: ${[...trail, id].join(" → ")}`);
      return;
    }
    state.set(id, "visiting");
    for (const next of graph.get(id) ?? []) visit(next, [...trail, id]);
    state.set(id, "done");
  };
  for (const id of graph.keys()) visit(id, []);
  return problems;
}
