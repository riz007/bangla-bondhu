"use client";

import { Download, ShieldCheck, Upload } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { StorageWarning } from "@/components/progress/storage-warning";
import type { ProgressState } from "@/features/progress/model";
import { progressActions, useProgress } from "@/features/progress/progress-store";
import { parseProgressImport, serializeProgress, type ImportResult } from "@/features/progress/transfer";
import type { MotionPreference, TransliterationMode } from "@/features/settings/settings-model";
import {
  resetSettings,
  updateSettings,
  useHydrated,
  useSettings,
  useT,
} from "@/features/settings/settings-store";
import type { Locale } from "@/lib/i18n/messages";
import { ConfirmDialog } from "./confirm-dialog";

type ImportError = Exclude<ImportResult, { ok: true }>["reason"];
type Notice = { kind: "exported" | "resetDone" | "imported" } | { kind: "importError"; reason: ImportError };

export function SettingsScreen() {
  const settings = useSettings();
  const hydrated = useHydrated();
  const progress = useProgress();
  const t = useT();
  const fileInput = useRef<HTMLInputElement>(null);
  const [dialog, setDialog] = useState<"reset" | "import" | null>(null);
  const [pendingImport, setPendingImport] = useState<ProgressState | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const exportProgress = () => {
    const now = new Date();
    const blob = new Blob([serializeProgress(progress.state, now)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bangla-bondhu-progress-${now.toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice({ kind: "exported" });
  };

  const readImport = async (file: File) => {
    const result = parseProgressImport(await file.text());
    if (fileInput.current) fileInput.current.value = "";
    if (!result.ok) {
      setNotice({ kind: "importError", reason: result.reason });
      return;
    }
    setPendingImport(result.state);
    setDialog("import");
  };

  const noticeText = !notice
    ? ""
    : notice.kind === "importError"
      ? t.settings.importErrors[notice.reason]
      : t.settings[notice.kind];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-medium">{t.settings.title}</h1>
        <p className="text-ink-soft">{t.settings.intro}</p>
      </header>

      <section
        aria-labelledby="parent-note"
        className="paper-card taped taped-teal flex flex-col gap-3 px-5 pb-5 pt-8"
      >
        <h2 id="parent-note" className="flex items-center gap-2 font-display text-xl">
          <ShieldCheck aria-hidden="true" className="size-6 text-teal" />
          {t.settings.parentTitle}
        </h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          {t.settings.parentPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <StorageWarning snapshot={progress} />
      </section>

      {!hydrated ? (
        <p className="text-ink-soft" aria-busy="true">
          {t.settings.loading}
        </p>
      ) : (
        <>
          <Group id="language" title={t.settings.languageTitle} description={t.settings.languageNote}>
            <RadioGroup<Locale>
              name="ui-language"
              value={settings.uiLanguage}
              onChange={(uiLanguage) => updateSettings({ uiLanguage })}
              options={[
                { value: "th", label: "ภาษาไทย", lang: "th" },
                { value: "en", label: "English", lang: "en" },
              ]}
            />
          </Group>

          <Group title={t.settings.readingTitle} description={t.settings.readingNote}>
            <RadioGroup<TransliterationMode>
              name="transliteration"
              value={settings.transliteration}
              onChange={(transliteration) => updateSettings({ transliteration })}
              options={[
                { value: "fade", label: t.settings.readingFade, hint: t.settings.readingFadeHint },
                { value: "always", label: t.settings.readingAlways },
                { value: "hidden", label: t.settings.readingHidden },
              ]}
            />
          </Group>

          <Group title={t.settings.soundTitle}>
            <Checkbox
              label={t.settings.mute}
              checked={settings.soundMuted}
              onChange={(soundMuted) => updateSettings({ soundMuted })}
            />
            <VolumeSlider
              label={t.settings.volume(Math.round(settings.volume * 100))}
              value={settings.volume}
              disabled={settings.soundMuted}
              onChange={(volume) => updateSettings({ volume })}
            />
            <p className="text-sm text-ink-soft">{t.settings.noAutoplay}</p>
          </Group>

          <Group title={t.settings.motionTitle}>
            <RadioGroup<MotionPreference>
              name="motion"
              value={settings.motion}
              onChange={(motion) => updateSettings({ motion })}
              options={[
                { value: "system", label: t.settings.motionSystem },
                { value: "reduce", label: t.settings.motionReduce },
                { value: "full", label: t.settings.motionFull },
              ]}
            />
          </Group>

          <Group title={t.settings.tracksTitle} description={t.settings.tracksNote}>
            <Checkbox
              label={t.settings.showArabic}
              checked={settings.showArabicTrack}
              onChange={(showArabicTrack) => updateSettings({ showArabicTrack })}
            />
            <Checkbox
              label={t.settings.showIslam}
              checked={settings.showIslamicTrack}
              onChange={(showIslamicTrack) => updateSettings({ showIslamicTrack })}
            />
          </Group>

          <Group id="content-preview" title={t.settings.previewTitle} description={t.settings.previewNote}>
            <Checkbox
              label={t.settings.previewToggle}
              checked={settings.contentPreview}
              onChange={(contentPreview) => updateSettings({ contentPreview })}
            />
          </Group>
        </>
      )}

      <Group title={t.settings.backupTitle} description={t.settings.backupNote}>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={exportProgress}
            disabled={progress.status !== "ready"}
          >
            <Download aria-hidden="true" className="size-5" />
            {t.settings.export}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fileInput.current?.click()}
            disabled={progress.status !== "ready"}
          >
            <Upload aria-hidden="true" className="size-5" />
            {t.settings.import}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-label={t.settings.chooseFile}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void readImport(file);
            }}
          />
        </div>
      </Group>

      <Group title={t.settings.startOverTitle}>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn btn-secondary text-coral-ink"
            onClick={() => setDialog("reset")}
          >
            {t.settings.reset}
          </button>
          <button type="button" className="btn btn-quiet" onClick={() => resetSettings()}>
            {t.settings.resetSettings}
          </button>
        </div>
      </Group>

      <p role="status" aria-live="polite" className="min-h-6 font-medium text-teal">
        {noticeText}
      </p>

      <ConfirmDialog
        open={dialog === "reset"}
        title={t.settings.resetDialogTitle}
        confirmLabel={t.settings.resetConfirm}
        destructive
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          void progressActions.reset().then(() => setNotice({ kind: "resetDone" }));
          setDialog(null);
        }}
      >
        {t.settings.resetBody}
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "import"}
        title={t.settings.importDialogTitle}
        confirmLabel={t.settings.importConfirm}
        onCancel={() => {
          setPendingImport(null);
          setDialog(null);
        }}
        onConfirm={() => {
          if (pendingImport) {
            void progressActions.replaceAll(pendingImport).then(() => setNotice({ kind: "imported" }));
          }
          setPendingImport(null);
          setDialog(null);
        }}
      >
        {t.settings.importBody(
          pendingImport ? Object.keys(pendingImport.lessons).length : 0,
          pendingImport ? Object.keys(pendingImport.items).length : 0,
        )}
      </ConfirmDialog>
    </div>
  );
}

function Group({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="flex scroll-mt-6 flex-col gap-3 border-t-2 border-dashed border-rule pt-6"
    >
      <div>
        <h2 id={headingId} className="font-display text-xl">
          {title}
        </h2>
        {description ? <p className="text-sm text-ink-soft">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function RadioGroup<T extends string>({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; hint?: string; lang?: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-ink/5"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="mt-1 size-5 accent-teal"
          />
          <span className="flex flex-col">
            <span lang={option.lang}>{option.label}</span>
            {option.hint ? <span className="text-sm text-ink-soft">{option.hint}</span> : null}
          </span>
        </label>
      ))}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 hover:bg-ink/5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 accent-teal"
      />
      <span>{label}</span>
    </label>
  );
}

const VOLUME_STEPS = 10;

function VolumeSlider({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1 px-2">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        min={0}
        max={VOLUME_STEPS}
        step={1}
        value={Math.round(value * VOLUME_STEPS)}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value) / VOLUME_STEPS)}
        className="h-11 w-full max-w-xs accent-teal"
      />
    </div>
  );
}
