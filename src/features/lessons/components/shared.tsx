"use client";

import { Check, X } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { ItemText, Transliteration } from "@/components/script/target-text";
import { itemAlt } from "@/features/curriculum/localize";
import type { CurriculumItem } from "@/features/curriculum/schema";
import { useLocale, useT } from "@/features/settings/settings-store";

export function ActivityHeading({ children }: { children: ReactNode }) {
  return (
    <h2
      tabIndex={-1}
      data-activity-heading
      className="font-display text-xl font-medium text-ink outline-none md:text-2xl"
    >
      {children}
    </h2>
  );
}

// Sticky while it only holds a button; inline once it shows feedback, so it
// never covers the marked answers on short screens.
export function ActionBar({ children, sticky = true }: { children: ReactNode; sticky?: boolean }) {
  return (
    <div
      className={`${sticky ? "sticky bottom-0 z-10 bg-paper/95 backdrop-blur" : ""} -mx-4 mt-8 border-t-2 border-ink/10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:mx-0 md:rounded-md md:border-2`}
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-3">{children}</div>
    </div>
  );
}

export function CheckButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  const t = useT();
  return (
    <button type="button" className="btn btn-primary w-full" disabled={disabled} onClick={onClick}>
      {t.lesson.check}
    </button>
  );
}

const IMAGE_SIZES = { large: 176, medium: 120, small: 88 } as const;

export function ItemImage({
  item,
  size = "medium",
  decorative = false,
}: {
  item: CurriculumItem;
  size?: keyof typeof IMAGE_SIZES;
  decorative?: boolean;
}) {
  const locale = useLocale();
  if (!item.imageSrc) return null;
  const px = IMAGE_SIZES[size];
  return (
    <Image
      src={item.imageSrc}
      alt={decorative ? "" : itemAlt(item, locale)}
      width={px}
      height={px}
      unoptimized
      loading={size === "large" ? "eager" : "lazy"}
      draggable={false}
      className="select-none"
      style={{ width: px, height: px }}
    />
  );
}

export function ItemWithReading({
  item,
  showTransliteration,
  textClassName = "text-3xl",
}: {
  item: CurriculumItem;
  showTransliteration: boolean;
  textClassName?: string;
}) {
  return (
    <span className="flex flex-col items-center gap-0.5">
      <ItemText item={item} className={textClassName} />
      {showTransliteration && item.transliteration ? (
        <Transliteration value={item.transliteration} className="text-sm" />
      ) : null}
    </span>
  );
}

export type MarkState = "correct" | "incorrect" | "dimmed" | undefined;

export function OptionMark({ state }: { state: MarkState }) {
  const t = useT();
  if (state === "correct") {
    return (
      <span className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full border-2 border-ink bg-leaf text-white">
        <Check aria-hidden="true" className="size-5" strokeWidth={3} />
        <span className="sr-only">{t.activity.markCorrect}</span>
      </span>
    );
  }
  if (state === "incorrect") {
    return (
      <span className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full border-2 border-ink bg-card text-coral-ink">
        <X aria-hidden="true" className="size-5" strokeWidth={3} />
        <span className="sr-only">{t.activity.markWrong}</span>
      </span>
    );
  }
  return null;
}
