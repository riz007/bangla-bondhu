"use client";

import { useMemo } from "react";
import { getTrackLessons } from "@/features/curriculum/loader";
import type { Lesson, TrackId } from "@/features/curriculum/schema";
import type { ItemProgress } from "@/features/progress/model";
import { useProgress } from "@/features/progress/progress-store";
import { getDueItems, getNextReviewAt } from "@/features/progress/scheduler";
import type { Settings } from "@/features/settings/settings-model";
import { useSettings } from "@/features/settings/settings-store";
import { useNow } from "@/lib/use-now";
import { reviewableItemIds } from "./review-session";

export function visibleTracks(settings: Settings): TrackId[] {
  const tracks: TrackId[] = ["bn"];
  if (settings.showArabicTrack) tracks.push("ar");
  if (settings.showIslamicTrack) tracks.push("islam");
  return tracks;
}

export function useAvailableLessons(): Lesson[] {
  const settings = useSettings();
  return useMemo(
    () =>
      visibleTracks(settings).flatMap((track) =>
        getTrackLessons(track, { includeDrafts: settings.contentPreview }),
      ),
    [settings],
  );
}

export interface ReviewStatus {
  ready: boolean;
  due: ItemProgress[];
  nextReviewAt: Date | null;
  lessons: Lesson[];
}

export function useReviewStatus(): ReviewStatus {
  const progress = useProgress();
  const lessons = useAvailableLessons();
  const now = useNow(progress.state);

  return useMemo(() => {
    if (progress.status !== "ready" || !now) {
      return { ready: false, due: [], nextReviewAt: null, lessons };
    }
    const allowed = reviewableItemIds(lessons);
    const items = Object.fromEntries(Object.entries(progress.state.items).filter(([id]) => allowed.has(id)));
    return {
      ready: true,
      due: getDueItems(items, now),
      nextReviewAt: getNextReviewAt(items, now),
      lessons,
    };
  }, [progress, lessons, now]);
}

export function useDueReviewCount(): number {
  return useReviewStatus().due.length;
}
