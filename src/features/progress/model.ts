import { z } from "zod/mini";

// zod/mini: these schemas run in the browser, and the full build is much larger.

export const PROGRESS_SCHEMA_VERSION = 1;

export const masteryLevelSchema = z.enum(["new", "learning", "familiar", "mastered"]);
export type MasteryLevel = z.infer<typeof masteryLevelSchema>;

const nonEmpty = () => z.string().check(z.minLength(1));
const isoDateTime = z.string().check(z.refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date"));
const trackId = z.enum(["bn", "ar", "islam"]);
const count = z.int().check(z.nonnegative());
const positiveInt = z.int().check(z.positive());
const fraction = z.number().check(z.gte(0), z.lte(1));

export const itemProgressSchema = z.object({
  itemId: nonEmpty(),
  trackId,
  firstSeenAt: isoDateTime,
  lastSeenAt: isoDateTime,
  nextReviewAt: isoDateTime,
  correctCount: count,
  incorrectCount: count,
  streakCorrect: count,
  masteryLevel: masteryLevelSchema,
});
export type ItemProgress = z.infer<typeof itemProgressSchema>;

export const lessonRecordSchema = z.object({
  lessonId: nonEmpty(),
  trackId,
  lessonVersion: positiveInt,
  completedCount: positiveInt,
  firstCompletedAt: isoDateTime,
  lastCompletedAt: isoDateTime,
  bestAccuracy: fraction,
  lastAccuracy: fraction,
});
export type LessonRecord = z.infer<typeof lessonRecordSchema>;

export const activityResultSchema = z.object({
  activityId: nonEmpty(),
  correct: z.boolean(),
  itemOutcomes: z.record(z.string(), z.boolean()),
});
export type ActivityResult = z.infer<typeof activityResultSchema>;

export const sessionStepSchema = z.object({
  activityId: nonEmpty(),
  isRetry: z.boolean(),
});
export type SessionStep = z.infer<typeof sessionStepSchema>;

export const engineStateSchema = z.object({
  sessionId: nonEmpty(),
  steps: z.array(sessionStepSchema).check(z.minLength(1)),
  position: count,
  results: z.record(z.string(), activityResultSchema),
  retryResults: z.record(z.string(), z.boolean()),
  complete: z.boolean(),
});
export type EngineState = z.infer<typeof engineStateSchema>;

export const savedSessionSchema = z.object({
  kind: z.enum(["lesson", "review"]),
  sessionId: nonEmpty(),
  lessonVersion: z.optional(positiveInt),
  startedAt: isoDateTime,
  updatedAt: isoDateTime,
  engine: engineStateSchema,
});
export type SavedSession = z.infer<typeof savedSessionSchema>;

export const progressStateSchema = z.object({
  schemaVersion: z.literal(PROGRESS_SCHEMA_VERSION),
  items: z.record(z.string(), itemProgressSchema),
  lessons: z.record(z.string(), lessonRecordSchema),
  sessions: z.record(z.string(), savedSessionSchema),
});
export type ProgressState = z.infer<typeof progressStateSchema>;

export function createEmptyProgress(): ProgressState {
  return { schemaVersion: PROGRESS_SCHEMA_VERSION, items: {}, lessons: {}, sessions: {} };
}

export function hasAnyProgress(state: ProgressState): boolean {
  return (
    Object.keys(state.items).length > 0 ||
    Object.keys(state.lessons).length > 0 ||
    Object.keys(state.sessions).length > 0
  );
}
