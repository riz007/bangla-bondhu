"use client";

import type { ElementType, ReactNode } from "react";
import type { CurriculumItem, TargetLanguage } from "@/features/curriculum/schema";
import { useT } from "@/features/settings/settings-store";
import { languageAttributes, scriptClass } from "@/lib/script";

interface TargetTextProps {
  language: TargetLanguage;
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

export function TargetText({ language, children, className = "", as: Tag = "span" }: TargetTextProps) {
  const attrs = languageAttributes(language);
  return (
    <Tag lang={attrs.lang} dir={attrs.dir} className={`${scriptClass(language)} ${className}`.trim()}>
      {children}
    </Tag>
  );
}

export function itemDisplay(item: CurriculumItem): string {
  return item.displayText ?? item.targetText;
}

export function ItemText({
  item,
  className,
  as,
}: {
  item: CurriculumItem;
  className?: string;
  as?: ElementType;
}) {
  return (
    <TargetText language={item.targetLanguage} className={className} as={as}>
      {itemDisplay(item)}
    </TargetText>
  );
}

export function Transliteration({ value, className = "" }: { value: string; className?: string }) {
  const t = useT();
  return (
    <span className={`text-ink-soft italic tracking-wide ${className}`}>
      <span className="sr-only">{t.activity.reading}</span>
      <span lang="bn-Latn">{value}</span>
    </span>
  );
}
