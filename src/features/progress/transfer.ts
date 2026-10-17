import { z } from "zod/mini";
import {
  PROGRESS_SCHEMA_VERSION,
  createEmptyProgress,
  progressStateSchema,
  type ProgressState,
} from "./model";

export const EXPORT_FORMAT = "bangla-bondhu-progress";
const MAX_IMPORT_BYTES = 1_000_000;

const exportFileSchema = z.object({
  format: z.literal(EXPORT_FORMAT),
  exportedAt: z.string(),
  progress: z.unknown(),
});

type Migration = (raw: Record<string, unknown>) => Record<string, unknown>;

function withoutArabic(record: unknown): Record<string, unknown> {
  if (typeof record !== "object" || record === null) return {};
  return Object.fromEntries(
    Object.entries(record).filter(
      ([, value]) =>
        !(typeof value === "object" && value !== null && "trackId" in value && value.trackId === "ar"),
    ),
  );
}

// Keyed by the version being upgraded from.
const MIGRATIONS: Record<number, Migration> = {
  // v2 adds the sentence book, drops the retired Arabic track, and clears
  // half-finished lessons because the course was reorganised.
  1: (raw) => ({
    ...raw,
    schemaVersion: 2,
    items: withoutArabic(raw.items),
    lessons: withoutArabic(raw.lessons),
    sessions: {},
    sentences: [],
  }),
};

export type MigrationResult =
  { ok: true; state: ProgressState } | { ok: false; reason: "invalid" | "too-new" };

export function migrateProgress(raw: unknown): MigrationResult {
  if (typeof raw !== "object" || raw === null) return { ok: false, reason: "invalid" };
  let data = raw as Record<string, unknown>;
  let version = data.schemaVersion;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    return { ok: false, reason: "invalid" };
  }
  if (version > PROGRESS_SCHEMA_VERSION) return { ok: false, reason: "too-new" };
  while (version < PROGRESS_SCHEMA_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) return { ok: false, reason: "invalid" };
    data = migrate(data);
    version = data.schemaVersion;
    if (typeof version !== "number") return { ok: false, reason: "invalid" };
  }
  const parsed = progressStateSchema.safeParse(data);
  return parsed.success ? { ok: true, state: parsed.data } : { ok: false, reason: "invalid" };
}

export function loadStoredProgress(raw: unknown): { state: ProgressState; recovered: boolean } {
  if (raw === undefined || raw === null) return { state: createEmptyProgress(), recovered: false };
  const result = migrateProgress(raw);
  return result.ok
    ? { state: result.state, recovered: false }
    : { state: createEmptyProgress(), recovered: true };
}

export function serializeProgress(state: ProgressState, now: Date): string {
  return JSON.stringify({ format: EXPORT_FORMAT, exportedAt: now.toISOString(), progress: state }, null, 2);
}

export type ImportResult =
  | { ok: true; state: ProgressState }
  | { ok: false; reason: "too-large" | "not-json" | "wrong-format" | "invalid" | "too-new" };

export function parseProgressImport(text: string): ImportResult {
  if (text.length > MAX_IMPORT_BYTES) return { ok: false, reason: "too-large" };
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, reason: "not-json" };
  }
  const file = exportFileSchema.safeParse(json);
  if (!file.success) return { ok: false, reason: "wrong-format" };
  return migrateProgress(file.data.progress);
}
