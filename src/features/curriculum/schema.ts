import { z } from "zod";

// Client code imports only types from this file, so Zod stays out of the browser bundle.

export const trackIdSchema = z.enum(["bn", "ar", "islam"]);
export type TrackId = z.infer<typeof trackIdSchema>;

export const contentStatusSchema = z.enum(["draft", "reviewed", "published"]);
export type ContentStatus = z.infer<typeof contentStatusSchema>;

export const targetLanguageSchema = z.enum(["bn-BD", "ar", "th"]);
export type TargetLanguage = z.infer<typeof targetLanguageSchema>;

export const itemKindSchema = z.enum(["letter", "vowel-sign", "syllable", "word", "phrase"]);
export type ItemKind = z.infer<typeof itemKindSchema>;

const idSchema = z
  .string()
  .regex(/^[a-z0-9]+([.-][a-z0-9]+)*$/, "IDs use lowercase letters, digits, '.' and '-'");

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

const publicAssetPath = (folder: string) =>
  z
    .string()
    .regex(
      new RegExp(`^/${folder}/[a-z0-9/_-]+\\.(svg|png|webp|jpg|mp3|m4a|ogg|webm)$`),
      `Asset must live under /${folder}/`,
    );

export const curriculumItemSchema = z.object({
  id: idSchema,
  trackId: trackIdSchema,
  kind: itemKindSchema,
  targetText: z.string().min(1),
  targetLanguage: targetLanguageSchema,
  // A lone vowel sign is shown on a dotted circle, e.g. "◌া".
  displayText: z.string().min(1).optional(),
  meaningTh: z.string().min(1),
  meaningEn: z.string().min(1),
  transliteration: z.string().min(1).optional(),
  transliterationScheme: z.literal("bb-simple-latin-v1").optional(),
  noteTh: z.string().min(1).optional(),
  noteEn: z.string().min(1).optional(),
  audioSrc: publicAssetPath("audio").optional(),
  imageSrc: publicAssetPath("images").optional(),
  altTh: z.string().min(1).optional(),
  altEn: z.string().min(1).optional(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  contentStatus: contentStatusSchema,
  sourceNote: z.string().min(1).optional(),
  reviewerNote: z.string().min(1).optional(),
  reviewedAt: isoDateSchema.optional(),
});
export type CurriculumItem = z.infer<typeof curriculumItemSchema>;

const tileSchema = z.object({
  id: idSchema,
  text: z.string().min(1),
  display: z.string().min(1).optional(),
});
export type Tile = z.infer<typeof tileSchema>;

const activityBase = {
  id: idSchema,
  instructionTh: z.string().min(1).optional(),
  instructionEn: z.string().min(1).optional(),
};

const choiceFields = {
  promptItemId: idSchema,
  optionItemIds: z.array(idSchema).min(2).max(4),
  answerItemId: idSchema,
};

export const introduceActivitySchema = z.object({
  ...activityBase,
  type: z.literal("introduce"),
  itemId: idSchema,
  exampleItemId: idSchema.optional(),
});

export const listenAndSelectSchema = z.object({
  ...activityBase,
  type: z.literal("listen-and-select"),
  ...choiceFields,
  optionsAs: z.enum(["text", "image"]),
});

export const imageToWordSchema = z.object({
  ...activityBase,
  type: z.literal("image-to-word"),
  ...choiceFields,
});

export const wordToImageSchema = z.object({
  ...activityBase,
  type: z.literal("word-to-image"),
  ...choiceFields,
});

export const readAndChooseSchema = z.object({
  ...activityBase,
  type: z.literal("read-and-choose"),
  ...choiceFields,
});

export const recallSchema = z.object({
  ...activityBase,
  type: z.literal("recall"),
  ...choiceFields,
});

export const matchPairsSchema = z.object({
  ...activityBase,
  type: z.literal("match-pairs"),
  itemIds: z.array(idSchema).min(2).max(4),
  matchBy: z.enum(["meaning", "image"]),
});

const sequenceFields = {
  promptItemId: idSchema,
  tiles: z.array(tileSchema).min(2).max(6),
  answerTileIds: z.array(idSchema).min(1),
};

export const buildSyllableSchema = z.object({
  ...activityBase,
  type: z.literal("build-syllable"),
  ...sequenceFields,
});

export const buildWordSchema = z.object({
  ...activityBase,
  type: z.literal("build-word"),
  ...sequenceFields,
});

export const listenAndOrderSchema = z.object({
  ...activityBase,
  type: z.literal("listen-and-order"),
  ...sequenceFields,
});

export const missingCharacterSchema = z.object({
  ...activityBase,
  type: z.literal("missing-character"),
  promptItemId: idSchema,
  before: z.string(),
  after: z.string(),
  options: z.array(tileSchema).min(2).max(4),
  answerOptionId: idSchema,
});

export const activitySchema = z.discriminatedUnion("type", [
  introduceActivitySchema,
  listenAndSelectSchema,
  imageToWordSchema,
  wordToImageSchema,
  readAndChooseSchema,
  recallSchema,
  matchPairsSchema,
  buildSyllableSchema,
  buildWordSchema,
  listenAndOrderSchema,
  missingCharacterSchema,
]);
export type Activity = z.infer<typeof activitySchema>;
export type ActivityType = Activity["type"];
export type ActivityOf<T extends ActivityType> = Extract<Activity, { type: T }>;
export type ChoiceActivity = ActivityOf<
  "listen-and-select" | "image-to-word" | "word-to-image" | "read-and-choose" | "recall"
>;
export type SequenceActivity = ActivityOf<"build-syllable" | "build-word" | "listen-and-order">;

export const lessonSchema = z.object({
  id: idSchema,
  trackId: trackIdSchema,
  worldId: idSchema,
  order: z.number().int().positive(),
  titleTh: z.string().min(1),
  titleEn: z.string().min(1),
  objectiveTh: z.string().min(1),
  objectiveEn: z.string().min(1),
  emblem: z.string().min(1),
  prerequisites: z.array(idSchema),
  itemIds: z.array(idSchema).min(1),
  activities: z.array(activitySchema).min(5).max(14),
  estimatedMinutes: z.number().int().min(1).max(10),
  contentStatus: contentStatusSchema,
  version: z.number().int().positive(),
  reviewedAt: isoDateSchema.optional(),
  sourceNote: z.string().min(1).optional(),
  reviewerNote: z.string().min(1).optional(),
});
export type Lesson = z.infer<typeof lessonSchema>;

export const worldSchema = z.object({
  id: idSchema,
  trackId: trackIdSchema,
  order: z.number().int().nonnegative(),
  titleTh: z.string().min(1),
  titleEn: z.string().min(1),
  descriptionTh: z.string().min(1),
  descriptionEn: z.string().min(1),
});
export type World = z.infer<typeof worldSchema>;

export const plannedTopicSchema = z.object({
  id: idSchema,
  titleTh: z.string().min(1),
  titleEn: z.string().min(1),
  status: z.literal("awaiting-review"),
});
export type PlannedTopic = z.infer<typeof plannedTopicSchema>;

export const curriculumSchema = z.object({
  version: z.number().int().positive(),
  items: z.array(curriculumItemSchema),
  lessons: z.array(lessonSchema),
  worlds: z.array(worldSchema),
  plannedTopics: z.array(plannedTopicSchema),
});
export type Curriculum = z.infer<typeof curriculumSchema>;
