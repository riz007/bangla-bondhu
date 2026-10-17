import { openDB, type IDBPDatabase } from "idb";
import type { ProgressState } from "./model";

export interface ProgressRepository {
  readonly kind: "indexeddb" | "memory";
  readRaw(): Promise<unknown>;
  write(state: ProgressState): Promise<void>;
  clear(): Promise<void>;
}

const DB_NAME = "bangla-bondhu";
const DB_VERSION = 1;
const STORE = "progress";
const KEY = "state";

export function createIndexedDbRepository(): ProgressRepository {
  let dbPromise: Promise<IDBPDatabase> | null = null;
  const db = () => {
    dbPromise ??= openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE);
      },
    });
    return dbPromise;
  };
  return {
    kind: "indexeddb",
    async readRaw() {
      return (await db()).get(STORE, KEY);
    },
    async write(state) {
      await (await db()).put(STORE, state, KEY);
    },
    async clear() {
      await (await db()).delete(STORE, KEY);
    },
  };
}

export function createMemoryRepository(): ProgressRepository {
  let value: unknown;
  return {
    kind: "memory",
    async readRaw() {
      return value === undefined ? undefined : structuredClone(value);
    },
    async write(state) {
      value = structuredClone(state);
    },
    async clear() {
      value = undefined;
    },
  };
}

export async function createBestRepository(): Promise<ProgressRepository> {
  if (typeof indexedDB === "undefined") return createMemoryRepository();
  const repository = createIndexedDbRepository();
  try {
    await repository.readRaw();
    return repository;
  } catch {
    return createMemoryRepository();
  }
}
