"use client";

import { useSyncExternalStore } from "react";

export type PlaybackStatus = "idle" | "loading" | "playing" | "error";

export interface PlaybackState {
  key: string | null;
  status: PlaybackStatus;
}

const IDLE: PlaybackState = { key: null, status: "idle" };
let state: PlaybackState = IDLE;
let audio: HTMLAudioElement | null = null;
const listeners = new Set<() => void>();

function set(next: PlaybackState) {
  state = next;
  for (const listener of listeners) listener();
}

export function stopPlayback(): void {
  if (audio) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    audio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  set(IDLE);
}

export function playClip(src: string, volume: number): void {
  stopPlayback();
  const clip = new Audio(src);
  clip.preload = "auto";
  clip.volume = volume;
  audio = clip;
  set({ key: src, status: "loading" });
  const isCurrent = () => audio === clip;
  clip.addEventListener("playing", () => isCurrent() && set({ key: src, status: "playing" }));
  clip.addEventListener("ended", () => isCurrent() && set(IDLE));
  clip.addEventListener("error", () => isCurrent() && set({ key: src, status: "error" }));
  clip.play().catch(() => {
    if (isCurrent()) set({ key: src, status: "error" });
  });
}

export function findSyntheticVoice(langPrefix: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return (
    window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith(langPrefix.toLowerCase())) ?? null
  );
}

export function speakSynthetic(text: string, langPrefix: string, volume: number): boolean {
  const voice = findSyntheticVoice(langPrefix);
  if (!voice) return false;
  stopPlayback();
  const key = `tts:${text}`;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.volume = volume;
  utterance.rate = 0.85;
  utterance.onstart = () => set({ key, status: "playing" });
  utterance.onend = () => state.key === key && set(IDLE);
  utterance.onerror = () => state.key === key && set({ key, status: "error" });
  set({ key, status: "loading" });
  window.speechSynthesis.speak(utterance);
  return true;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePlayback(): PlaybackState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => IDLE,
  );
}

function subscribeVoices(listener: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return () => {};
  window.speechSynthesis.addEventListener("voiceschanged", listener);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", listener);
}

export function useSyntheticVoiceAvailable(langPrefix: string): boolean {
  return useSyncExternalStore(
    subscribeVoices,
    () => findSyntheticVoice(langPrefix) !== null,
    () => false,
  );
}
