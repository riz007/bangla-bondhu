"use client";

import { LoaderCircle, Square, Volume2, VolumeX } from "lucide-react";
import { useEffect } from "react";
import type { CurriculumItem } from "@/features/curriculum/schema";
import { useSettings, useT } from "@/features/settings/settings-store";
import { playClip, speakSynthetic, stopPlayback, usePlayback, useSyntheticVoiceAvailable } from "./playback";

export function hasRecordedAudio(item: CurriculumItem): boolean {
  return Boolean(item.audioSrc);
}

function voicePrefix(item: CurriculumItem): string {
  return item.targetLanguage === "ar" ? "ar" : "bn";
}

interface AudioButtonProps {
  item: CurriculumItem;
  size?: "large" | "compact";
}

// Without a recording, say so plainly. Device speech is only offered when the
// device has a voice for the language, and it is labelled as a computer voice.
export function AudioButton({ item, size = "large" }: AudioButtonProps) {
  const settings = useSettings();
  const t = useT();
  const playback = usePlayback();
  const syntheticAvailable = useSyntheticVoiceAvailable(voicePrefix(item));
  const ttsKey = `tts:${item.targetText}`;

  useEffect(() => stopPlayback, []);

  if (settings.soundMuted) {
    return (
      <p className="inline-flex items-center gap-2 rounded-md bg-paper-deep px-3 py-2 text-sm text-ink-soft">
        <VolumeX aria-hidden="true" className="size-5" />
        {t.audio.muted}
      </p>
    );
  }

  const sizeClass = size === "large" ? "btn btn-secondary" : "btn btn-secondary min-h-11 px-3 text-base";

  if (item.audioSrc) {
    const src = item.audioSrc;
    const mine = playback.key === src;
    const status = mine ? playback.status : "idle";
    const busy = status === "loading" || status === "playing";
    return (
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          className={sizeClass}
          onClick={() => (busy ? stopPlayback() : playClip(src, settings.volume))}
          aria-label={busy ? t.audio.stopLabel : status === "error" ? t.audio.retryLabel : t.audio.listen}
        >
          {status === "loading" ? (
            <LoaderCircle aria-hidden="true" className="size-6 animate-spin" />
          ) : status === "playing" ? (
            <Square aria-hidden="true" className="size-5 fill-current" />
          ) : (
            <Volume2 aria-hidden="true" className="size-6" />
          )}
          <span aria-hidden="true">
            {status === "playing" ? t.audio.stop : status === "loading" ? t.audio.loading : t.audio.listen}
          </span>
        </button>
        <p role="status" className="min-h-5 text-sm text-coral-ink">
          {status === "error" ? t.audio.error : ""}
        </p>
      </div>
    );
  }

  const ttsBusy = playback.key === ttsKey && playback.status !== "idle" && playback.status !== "error";
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="inline-flex items-center gap-2 rounded-md border-2 border-dashed border-rule px-3 py-1.5 text-sm text-ink-soft">
        <VolumeX aria-hidden="true" className="size-4 shrink-0" />
        {t.audio.noRecording}
      </p>
      {syntheticAvailable ? (
        <button
          type="button"
          className="btn btn-quiet text-sm underline decoration-dotted underline-offset-4"
          onClick={() =>
            ttsBusy ? stopPlayback() : speakSynthetic(item.targetText, voicePrefix(item), settings.volume)
          }
        >
          {ttsBusy ? t.audio.stopVoice : t.audio.tryVoice}
        </button>
      ) : null}
    </div>
  );
}
