"use client";

import { useSyncExternalStore } from "react";
import { messages, type Locale, type Messages } from "@/lib/i18n/messages";
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY, parseSettings, type Settings } from "./settings-model";

type Listener = () => void;

const listeners = new Set<Listener>();
let cached: Settings | null = null;

function read(): Settings {
  if (cached) return cached;
  try {
    cached = parseSettings(window.localStorage.getItem(SETTINGS_STORAGE_KEY));
  } catch {
    cached = DEFAULT_SETTINGS;
  }
  return cached;
}

function emit() {
  for (const listener of listeners) listener();
}

export function updateSettings(patch: Partial<Omit<Settings, "version">>): void {
  cached = { ...read(), ...patch };
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(cached));
  } catch {
    // Storage may be blocked (private mode); keep the change for this visit.
  }
  emit();
}

export function resetSettings(): void {
  cached = DEFAULT_SETTINGS;
  try {
    window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
  } catch {}
  emit();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === SETTINGS_STORAGE_KEY) {
      cached = null;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_SETTINGS);
}

export function useLocale(): Locale {
  return useSettings().uiLanguage;
}

export function useT(): Messages {
  return messages[useLocale()];
}

const noopSubscribe = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
