"use client";

import { Languages } from "lucide-react";
import { updateSettings, useLocale, useT } from "@/features/settings/settings-store";

export function LanguageToggle() {
  const locale = useLocale();
  const t = useT();
  return (
    <button
      type="button"
      onClick={() => updateSettings({ uiLanguage: locale === "th" ? "en" : "th" })}
      aria-label={t.language.switchLabel}
      lang={locale === "th" ? "en" : "th"}
      className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border-2 border-ink/20 bg-card px-3 text-sm font-semibold hover:border-teal"
    >
      <Languages aria-hidden="true" className="size-4" />
      {t.language.switchTo}
    </button>
  );
}
