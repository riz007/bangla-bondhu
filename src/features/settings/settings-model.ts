import type { Locale } from "@/lib/i18n/messages";

export const SETTINGS_VERSION = 1;
export const SETTINGS_STORAGE_KEY = "bangla-bondhu:settings";

export type TransliterationMode = "fade" | "always" | "hidden";
export type MotionPreference = "system" | "reduce" | "full";

export interface Settings {
  version: typeof SETTINGS_VERSION;
  uiLanguage: Locale;
  transliteration: TransliterationMode;
  soundMuted: boolean;
  volume: number;
  motion: MotionPreference;
  showArabicTrack: boolean;
  showIslamicTrack: boolean;
  contentPreview: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  version: SETTINGS_VERSION,
  uiLanguage: "th",
  transliteration: "fade",
  soundMuted: false,
  volume: 0.8,
  motion: "system",
  showArabicTrack: true,
  showIslamicTrack: true,
  contentPreview: false,
};

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

// Bad or missing fields fall back one by one, so a corrupt value never breaks the app.
export function parseSettings(raw: string | null): Settings {
  if (!raw) return DEFAULT_SETTINGS;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return DEFAULT_SETTINGS;
  }
  if (typeof data !== "object" || data === null) return DEFAULT_SETTINGS;
  const value = data as Record<string, unknown>;
  if (value.version !== SETTINGS_VERSION) return DEFAULT_SETTINGS;
  const volume =
    typeof value.volume === "number" && Number.isFinite(value.volume)
      ? Math.min(1, Math.max(0, value.volume))
      : DEFAULT_SETTINGS.volume;
  return {
    version: SETTINGS_VERSION,
    uiLanguage: oneOf(value.uiLanguage, ["th", "en"], DEFAULT_SETTINGS.uiLanguage),
    transliteration: oneOf(
      value.transliteration,
      ["fade", "always", "hidden"],
      DEFAULT_SETTINGS.transliteration,
    ),
    soundMuted: bool(value.soundMuted, DEFAULT_SETTINGS.soundMuted),
    volume,
    motion: oneOf(value.motion, ["system", "reduce", "full"], DEFAULT_SETTINGS.motion),
    showArabicTrack: bool(value.showArabicTrack, DEFAULT_SETTINGS.showArabicTrack),
    showIslamicTrack: bool(value.showIslamicTrack, DEFAULT_SETTINGS.showIslamicTrack),
    contentPreview: bool(value.contentPreview, DEFAULT_SETTINGS.contentPreview),
  };
}

export function shouldShowTransliteration(
  mode: TransliterationMode,
  mastery: "new" | "learning" | "familiar" | "mastered",
): boolean {
  if (mode === "always") return true;
  if (mode === "hidden") return false;
  return mastery === "new" || mastery === "learning";
}
