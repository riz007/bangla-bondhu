import type { Lesson } from "@/features/curriculum/schema";
import type { ProgressState } from "@/features/progress/model";
import { arePrerequisitesMet, isLessonComplete } from "@/features/progress/operations";

export type LessonStatus = "complete" | "available" | "locked";

export function lessonStatus(lesson: Lesson, state: ProgressState): LessonStatus {
  if (isLessonComplete(state, lesson.id)) return "complete";
  return arePrerequisitesMet(state, lesson.prerequisites) ? "available" : "locked";
}

export function isChapterComplete(lessons: readonly Lesson[], state: ProgressState): boolean {
  return lessons.length > 0 && lessons.every((lesson) => isLessonComplete(state, lesson.id));
}

export function findNextLesson(lessons: readonly Lesson[], state: ProgressState): Lesson | null {
  return lessons.find((lesson) => lessonStatus(lesson, state) === "available") ?? null;
}

export function findLessonInProgress(lessons: readonly Lesson[], state: ProgressState): Lesson | null {
  return lessons.find((lesson) => state.sessions[lesson.id]) ?? null;
}
