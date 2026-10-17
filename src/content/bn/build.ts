import { activityItemIds } from "@/features/curriculum/activity-helpers";
import type {
  Activity,
  ActivityOf,
  CurriculumItem,
  ItemKind,
  Lesson,
  Tile,
  World,
} from "@/features/curriculum/schema";
import { isCombiningMark } from "@/lib/script";
import { seededShuffle } from "@/lib/seeded-shuffle";

const SOURCE = "Standard Bangladeshi Bengali, awaiting review by a native speaker.";

type Pair = [th: string, en: string];

interface ItemExtras {
  note?: Pair;
  image?: string;
  alt?: Pair;
  display?: string;
  gloss?: Pair;
  difficulty?: CurriculumItem["difficulty"];
}

export function bnItem(
  kind: ItemKind,
  id: string,
  text: string,
  transliteration: string,
  meaning: Pair,
  extras: ItemExtras = {},
): CurriculumItem {
  return {
    id,
    trackId: "bn",
    kind,
    targetText: text,
    targetLanguage: "bn-BD",
    displayText: extras.display,
    meaningTh: meaning[0],
    meaningEn: meaning[1],
    transliteration,
    transliterationScheme: "bb-simple-latin-v1",
    noteTh: extras.note?.[0],
    noteEn: extras.note?.[1],
    imageSrc: extras.image ? `/images/vocab/${extras.image}.svg` : undefined,
    altTh: extras.alt?.[0],
    altEn: extras.alt?.[1],
    glossTh: extras.gloss?.[0],
    glossEn: extras.gloss?.[1],
    difficulty: extras.difficulty ?? 1,
    contentStatus: "draft",
    sourceNote: SOURCE,
  };
}

// A step becomes an activity once the lesson gives it an id.
type Step = (id: string) => Activity;

const dotted = (text: string) => (isCombiningMark(text[0] ?? "") ? `◌${text}` : undefined);

function tilesFor(id: string, parts: string[], extra: string[]): { tiles: Tile[]; answer: string[] } {
  const tiles = [...parts, ...extra].map((text, index) => ({
    id: `t${index + 1}`,
    text,
    display: dotted(text),
  }));
  const answer = tiles.slice(0, parts.length).map((tile) => tile.id);
  let shuffled = seededShuffle(tiles, id);
  // Never show the tiles already in the right order.
  if (shuffled.slice(0, answer.length).every((tile, index) => tile.id === answer[index])) {
    shuffled = [...shuffled.slice(1), shuffled[0]];
  }
  return { tiles: shuffled, answer };
}

const shuffled = (id: string, answer: string, others: string[]) => seededShuffle([answer, ...others], id);

export const intro =
  (itemId: string, exampleItemId?: string): Step =>
  (id) => ({ id, type: "introduce", itemId, exampleItemId });

export const tip =
  (title: Pair, body: Pair, exampleItemIds: string[] = []): Step =>
  (id) => ({
    id,
    type: "tip",
    titleTh: title[0],
    titleEn: title[1],
    bodyTh: body[0],
    bodyEn: body[1],
    exampleItemIds,
  });

export const listen =
  (answer: string, others: string[], optionsAs: "text" | "image" = "text"): Step =>
  (id) => ({
    id,
    type: "listen-and-select",
    promptItemId: answer,
    optionItemIds: shuffled(id, answer, others),
    answerItemId: answer,
    optionsAs,
  });

const choice =
  (type: "image-to-word" | "word-to-image" | "read-and-choose" | "recall") =>
  (answer: string, others: string[]): Step =>
  (id) => ({
    id,
    type,
    promptItemId: answer,
    optionItemIds: shuffled(id, answer, others),
    answerItemId: answer,
  });

export const nameThePicture = choice("image-to-word");
export const findThePicture = choice("word-to-image");
export const meaning = choice("read-and-choose");
export const recall = choice("recall");

export const match =
  (itemIds: string[], matchBy: "meaning" | "image" = "meaning"): Step =>
  (id) => ({ id, type: "match-pairs", itemIds, matchBy });

const sequence =
  (type: "build-syllable" | "build-word" | "listen-and-order") =>
  (prompt: string, parts: string[], extra: string[] = []): Step =>
  (id) => {
    const { tiles, answer } = tilesFor(id, parts, extra);
    return { id, type, promptItemId: prompt, tiles, answerTileIds: answer };
  };

export const buildSyllable = sequence("build-syllable");
export const buildWord = sequence("build-word");
export const orderWords = sequence("listen-and-order");

export const fillBlank =
  (
    prompt: string,
    before: string,
    answer: string,
    after: string,
    wrong: string[],
    instruction?: Pair,
  ): Step =>
  (id) => {
    const options = seededShuffle(
      [answer, ...wrong].map((text, index) => ({ id: `o${index + 1}`, text, display: dotted(text) })),
      id,
    );
    return {
      id,
      type: "missing-character",
      instructionTh: instruction?.[0],
      instructionEn: instruction?.[1],
      promptItemId: prompt,
      before,
      after,
      options,
      answerOptionId: "o1",
    };
  };

export const makeSentence =
  (frame: Omit<ActivityOf<"make-sentence">, "id" | "type">): Step =>
  (id) => ({ id, type: "make-sentence", ...frame });

export const withInstruction =
  (instruction: Pair, step: Step): Step =>
  (id) => ({ ...step(id), instructionTh: instruction[0], instructionEn: instruction[1] });

interface LessonMeta {
  id: string;
  world: string;
  order: number;
  title: Pair;
  objective: Pair;
  emblem: string;
  after: string[];
  minutes: number;
}

export function lesson(meta: LessonMeta, steps: Step[]): Lesson {
  const activities = steps.map((step, index) => step(`${meta.id}-${index + 1}`));
  return {
    id: meta.id,
    trackId: "bn",
    worldId: meta.world,
    order: meta.order,
    titleTh: meta.title[0],
    titleEn: meta.title[1],
    objectiveTh: meta.objective[0],
    objectiveEn: meta.objective[1],
    emblem: meta.emblem,
    prerequisites: meta.after,
    itemIds: [...new Set(activities.flatMap(activityItemIds))],
    activities,
    estimatedMinutes: meta.minutes,
    contentStatus: "draft",
    version: 1,
  };
}

export function world(id: string, order: number, title: Pair, description: Pair): World {
  return {
    id,
    trackId: "bn",
    order,
    titleTh: title[0],
    titleEn: title[1],
    descriptionTh: description[0],
    descriptionEn: description[1],
  };
}
