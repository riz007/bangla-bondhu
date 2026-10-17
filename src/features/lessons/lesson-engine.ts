import { isScoredActivity } from "@/features/curriculum/activity-helpers";
import type { Activity } from "@/features/curriculum/schema";
import type { ActivityResult, EngineState, SessionStep } from "@/features/progress/model";

// A missed activity comes back once at the end of the session. Only first attempts count.
export function createEngine(sessionId: string, activities: readonly Activity[]): EngineState {
  if (activities.length === 0) throw new Error("A session needs at least one activity");
  return {
    sessionId,
    steps: activities.map((activity) => ({ activityId: activity.id, isRetry: false })),
    position: 0,
    results: {},
    retryResults: {},
    complete: false,
  };
}

export function currentStep(state: EngineState): SessionStep | null {
  return state.complete ? null : (state.steps[state.position] ?? null);
}

export function isCurrentAnswered(state: EngineState): boolean {
  const step = currentStep(state);
  if (!step) return false;
  return step.isRetry ? step.activityId in state.retryResults : step.activityId in state.results;
}

export function recordAnswer(state: EngineState, result: ActivityResult): EngineState {
  const step = currentStep(state);
  if (!step || step.activityId !== result.activityId || isCurrentAnswered(state)) return state;

  if (step.isRetry) {
    return { ...state, retryResults: { ...state.retryResults, [step.activityId]: result.correct } };
  }

  const alreadyQueued = state.steps.some((s) => s.isRetry && s.activityId === step.activityId);
  return {
    ...state,
    results: { ...state.results, [step.activityId]: result },
    steps:
      result.correct || alreadyQueued
        ? state.steps
        : [...state.steps, { activityId: step.activityId, isRetry: true }],
  };
}

export function advance(state: EngineState, activity: Activity): EngineState {
  const step = currentStep(state);
  if (!step) return state;
  if (isScoredActivity(activity) && !isCurrentAnswered(state)) return state;
  const position = state.position + 1;
  return { ...state, position, complete: position >= state.steps.length };
}

export function progressFraction(state: EngineState): number {
  if (state.complete) return 1;
  return state.position / state.steps.length;
}

export function isEngineCompatible(state: EngineState, activityIds: ReadonlySet<string>): boolean {
  return (
    state.steps.every((step) => activityIds.has(step.activityId)) && state.position <= state.steps.length
  );
}
