import { bnItems } from "@/content/bn/items";
import { bnLessons, bnWorlds } from "@/content/bn/lessons";
import { islamLessons, islamPlannedTopics } from "@/content/islam";
import type { Activity, Curriculum, CurriculumItem, Lesson, TrackId, World } from "./schema";

export const CURRICULUM_VERSION = 2;

export const curriculum: Curriculum = {
  version: CURRICULUM_VERSION,
  items: bnItems,
  lessons: [...bnLessons, ...islamLessons],
  worlds: bnWorlds,
  plannedTopics: islamPlannedTopics,
};

const itemsById = new Map(curriculum.items.map((item) => [item.id, item]));
const lessonsById = new Map(curriculum.lessons.map((lesson) => [lesson.id, lesson]));
const activitiesById = new Map<string, { activity: Activity; lesson: Lesson }>(
  curriculum.lessons.flatMap((lesson) =>
    lesson.activities.map((activity) => [activity.id, { activity, lesson }] as const),
  ),
);

export function findActivity(id: string): Activity | undefined {
  return activitiesById.get(id)?.activity;
}

export function findLessonOfActivity(id: string): Lesson | undefined {
  return activitiesById.get(id)?.lesson;
}

export function findItem(id: string): CurriculumItem | undefined {
  return itemsById.get(id);
}

export function getItem(id: string): CurriculumItem {
  const item = itemsById.get(id);
  if (!item) throw new Error(`Unknown curriculum item: ${id}`);
  return item;
}

export function findLesson(id: string): Lesson | undefined {
  return lessonsById.get(id);
}

export interface VisibilityOptions {
  includeDrafts: boolean;
}

export function isLessonAvailable(lesson: Lesson, { includeDrafts }: VisibilityOptions): boolean {
  return lesson.contentStatus !== "draft" || includeDrafts;
}

export interface WorldPath {
  world: World;
  lessons: Lesson[];
}

export function getTrackPath(trackId: TrackId, options: VisibilityOptions): WorldPath[] {
  return curriculum.worlds
    .filter((world) => world.trackId === trackId)
    .sort((a, b) => a.order - b.order)
    .map((world) => ({
      world,
      lessons: curriculum.lessons
        .filter((lesson) => lesson.worldId === world.id && isLessonAvailable(lesson, options))
        .sort((a, b) => a.order - b.order),
    }))
    .filter((path) => path.lessons.length > 0);
}

export function getTrackLessons(trackId: TrackId, options: VisibilityOptions): Lesson[] {
  return getTrackPath(trackId, options).flatMap((path) => path.lessons);
}

export function countLessons(trackId: TrackId): { total: number; drafts: number } {
  const lessons = curriculum.lessons.filter((lesson) => lesson.trackId === trackId);
  return {
    total: lessons.length,
    drafts: lessons.filter((lesson) => lesson.contentStatus === "draft").length,
  };
}
