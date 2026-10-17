"use client";

import { useSyncExternalStore } from "react";
import { createEmptyProgress, type ProgressState, type SavedSentence, type SavedSession } from "./model";
import {
  addSentence,
  discardSession,
  recordCompletedSession,
  saveSession,
  type CompletedSession,
} from "./operations";
import { createBestRepository, type ProgressRepository } from "./repository";
import { loadStoredProgress } from "./transfer";

export interface ProgressSnapshot {
  status: "loading" | "ready";
  state: ProgressState;
  storage: ProgressRepository["kind"] | null;
  recovered: boolean;
  writeError: boolean;
}

const LOADING: ProgressSnapshot = {
  status: "loading",
  state: createEmptyProgress(),
  storage: null,
  recovered: false,
  writeError: false,
};

let snapshot: ProgressSnapshot = LOADING;
let repository: ProgressRepository | null = null;
let loadPromise: Promise<void> | null = null;
let writeChain: Promise<void> = Promise.resolve();
const listeners = new Set<() => void>();

function setSnapshot(next: ProgressSnapshot) {
  snapshot = next;
  for (const listener of listeners) listener();
}

function ensureLoaded(): Promise<void> {
  loadPromise ??= (async () => {
    repository = await createBestRepository();
    let raw: unknown;
    try {
      raw = await repository.readRaw();
    } catch {
      raw = undefined;
    }
    const { state, recovered } = loadStoredProgress(raw);
    setSnapshot({ status: "ready", state, storage: repository.kind, recovered, writeError: false });
  })();
  return loadPromise;
}

async function commit(transition: (state: ProgressState) => ProgressState): Promise<void> {
  await ensureLoaded();
  const next = transition(snapshot.state);
  setSnapshot({ ...snapshot, state: next });
  const repo = repository;
  if (!repo) return;
  writeChain = writeChain
    .then(() => repo.write(next))
    .then(
      () => {
        if (snapshot.writeError) setSnapshot({ ...snapshot, writeError: false });
      },
      () => setSnapshot({ ...snapshot, writeError: true }),
    );
  return writeChain;
}

export const progressActions = {
  saveSession(session: SavedSession) {
    return commit((state) => saveSession(state, session));
  },
  discardSession(sessionId: string) {
    return commit((state) => discardSession(state, sessionId));
  },
  completeSession(session: CompletedSession) {
    return commit((state) => recordCompletedSession(state, session));
  },
  saveSentence(sentence: SavedSentence) {
    return commit((state) => addSentence(state, sentence));
  },
  replaceAll(state: ProgressState) {
    return commit(() => state);
  },
  async reset() {
    await ensureLoaded();
    await writeChain;
    await repository?.clear();
    setSnapshot({ ...snapshot, state: createEmptyProgress(), recovered: false });
  },
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  void ensureLoaded();
  return () => listeners.delete(listener);
}

export function useProgress(): ProgressSnapshot {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => LOADING,
  );
}

export function getProgressSnapshot(): ProgressSnapshot {
  return snapshot;
}

export async function __resetProgressStoreForTests(): Promise<void> {
  await writeChain;
  snapshot = LOADING;
  repository = null;
  loadPromise = null;
  writeChain = Promise.resolve();
}
