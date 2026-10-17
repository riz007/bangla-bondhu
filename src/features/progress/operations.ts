import type { TrackId } from "@/features/curriculum/schema";
import {
  SENTENCE_BOOK_LIMIT,
  type ActivityResult,
  type ProgressState,
  type SavedSentence,
  type SavedSession,
} from "./model";
import { applyOutcome } from "./scheduler";

// An item only counts as correct if every first attempt that used it was right.
export function aggregateItemOutcomes(results: ActivityResult[]): Map<string, boolean> {
  const outcomes = new Map<string, boolean>();
  for (const result of results) {
    for (const [itemId, correct] of Object.entries(result.itemOutcomes)) {
      outcomes.set(itemId, (outcomes.get(itemId) ?? true) && correct);
    }
  }
  return outcomes;
}

export interface CompletedSession {
  kind: SavedSession["kind"];
  sessionId: string;
  lessonVersion?: number;
  trackId: TrackId;
  itemTracks: Map<string, TrackId>;
  results: ActivityResult[];
  accuracy: number;
  now: Date;
}

export function recordCompletedSession(state: ProgressState, session: CompletedSession): ProgressState {
  const items = { ...state.items };
  for (const [itemId, correct] of aggregateItemOutcomes(session.results)) {
    items[itemId] = applyOutcome(items[itemId], correct, {
      itemId,
      trackId: session.itemTracks.get(itemId) ?? session.trackId,
      now: session.now,
    });
  }

  const lessons = { ...state.lessons };
  if (session.kind === "lesson") {
    const nowIso = session.now.toISOString();
    const previous = lessons[session.sessionId];
    lessons[session.sessionId] = {
      lessonId: session.sessionId,
      trackId: session.trackId,
      lessonVersion: session.lessonVersion ?? 1,
      completedCount: (previous?.completedCount ?? 0) + 1,
      firstCompletedAt: previous?.firstCompletedAt ?? nowIso,
      lastCompletedAt: nowIso,
      // Never take away earned progress after a weaker attempt.
      bestAccuracy: Math.max(previous?.bestAccuracy ?? 0, session.accuracy),
      lastAccuracy: session.accuracy,
    };
  }

  const sessions = { ...state.sessions };
  delete sessions[session.sessionId];
  return { ...state, items, lessons, sessions };
}

export function saveSession(state: ProgressState, session: SavedSession): ProgressState {
  return { ...state, sessions: { ...state.sessions, [session.sessionId]: session } };
}

export function discardSession(state: ProgressState, sessionId: string): ProgressState {
  if (!state.sessions[sessionId]) return state;
  const sessions = { ...state.sessions };
  delete sessions[sessionId];
  return { ...state, sessions };
}

export function isLessonComplete(state: ProgressState, lessonId: string): boolean {
  return Boolean(state.lessons[lessonId]);
}

export function arePrerequisitesMet(state: ProgressState, prerequisites: readonly string[]): boolean {
  return prerequisites.every((id) => isLessonComplete(state, id));
}

// Newest first. Making the same sentence again moves it back to the top.
export function addSentence(state: ProgressState, sentence: SavedSentence): ProgressState {
  const others = state.sentences.filter((saved) => saved.text !== sentence.text);
  return { ...state, sentences: [sentence, ...others].slice(0, SENTENCE_BOOK_LIMIT) };
}
