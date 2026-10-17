"use client";

import { findItem } from "@/features/curriculum/loader";
import { itemMeaning } from "@/features/curriculum/localize";
import type { CurriculumItem } from "@/features/curriculum/schema";
import { useLocale } from "@/features/settings/settings-store";
import { ItemText } from "./target-text";

const TONES = {
  leaf: "border-leaf bg-leaf-soft",
  mango: "border-mango-ink bg-mango-soft",
  plain: "border-ink/15 bg-card",
} as const;

export function itemsById(ids: readonly string[]): CurriculumItem[] {
  return ids.map(findItem).filter((item): item is CurriculumItem => item !== undefined);
}

export function ItemChips({ items, tone = "plain" }: { items: CurriculumItem[]; tone?: keyof typeof TONES }) {
  const locale = useLocale();
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item.id}
          className={`flex items-baseline gap-2 rounded-md border-2 px-3 py-1 ${TONES[tone]}`}
        >
          <ItemText item={item} className="text-2xl" />
          <span className="text-sm text-ink-soft">{itemMeaning(item, locale)}</span>
        </li>
      ))}
    </ul>
  );
}
