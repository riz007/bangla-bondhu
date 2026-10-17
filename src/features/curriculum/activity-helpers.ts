import type { Activity, ActivityType } from "./schema";

export function isScoredActivity(activity: Activity): boolean {
  return activity.type !== "introduce";
}

export function activityItemIds(activity: Activity): string[] {
  switch (activity.type) {
    case "introduce":
      return [activity.itemId];
    case "match-pairs":
      return [...activity.itemIds];
    case "listen-and-select":
    case "image-to-word":
    case "word-to-image":
    case "read-and-choose":
    case "recall":
      return [activity.promptItemId];
    case "build-syllable":
    case "build-word":
    case "listen-and-order":
    case "missing-character":
      return [activity.promptItemId];
  }
}

export function joinSequence(type: ActivityType, parts: string[]): string {
  return type === "listen-and-order" ? parts.join(" ") : parts.join("");
}

export function normaliseForSequence(type: ActivityType, text: string): string {
  return type === "listen-and-order" ? text.replace(/[?!।.,]+$/u, "").trim() : text;
}
