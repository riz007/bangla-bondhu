import type { Locale } from "@/lib/i18n/messages";
import type { Activity, CurriculumItem, Lesson, PlannedTopic, World } from "./schema";

const pick = (locale: Locale, th: string, en: string) => (locale === "en" ? en : th);

export const itemMeaning = (item: CurriculumItem, locale: Locale) =>
  pick(locale, item.meaningTh, item.meaningEn);

export const itemNote = (item: CurriculumItem, locale: Locale) =>
  locale === "en" ? item.noteEn : item.noteTh;

export const itemAlt = (item: CurriculumItem, locale: Locale) =>
  (locale === "en" ? item.altEn : item.altTh) ?? itemMeaning(item, locale);

export const lessonTitle = (lesson: Lesson, locale: Locale) => pick(locale, lesson.titleTh, lesson.titleEn);

export const lessonObjective = (lesson: Lesson, locale: Locale) =>
  pick(locale, lesson.objectiveTh, lesson.objectiveEn);

export const worldTitle = (world: World, locale: Locale) => pick(locale, world.titleTh, world.titleEn);

export const worldDescription = (world: World, locale: Locale) =>
  pick(locale, world.descriptionTh, world.descriptionEn);

export const topicTitle = (topic: PlannedTopic, locale: Locale) => pick(locale, topic.titleTh, topic.titleEn);

export const activityInstruction = (activity: Activity, locale: Locale) =>
  locale === "en" ? activity.instructionEn : activity.instructionTh;
