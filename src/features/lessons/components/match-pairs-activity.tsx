"use client";

import { Check } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { ItemText } from "@/components/script/target-text";
import { getItem } from "@/features/curriculum/loader";
import { itemAlt, itemMeaning } from "@/features/curriculum/localize";
import type { ActivityOf, CurriculumItem } from "@/features/curriculum/schema";
import { useLocale, useT } from "@/features/settings/settings-store";
import { seededShuffle } from "@/lib/seeded-shuffle";
import { instructionFor } from "../activity-registry";
import { matchPairsResult } from "../answers";
import { ActivityHeading, ItemImage, ItemWithReading } from "./shared";
import type { ActivityViewProps } from "./types";

type Side = "left" | "right";

export function MatchPairsActivityView({
  activity,
  answered,
  onAnswer,
  showTransliteration,
}: ActivityViewProps<ActivityOf<"match-pairs">>) {
  const locale = useLocale();
  const t = useT();
  const items = activity.itemIds.map(getItem);
  const right = useMemo(
    () => seededShuffle(activity.itemIds, activity.id).map(getItem),
    [activity.id, activity.itemIds],
  );
  const [selection, setSelection] = useState<{ side: Side; id: string } | null>(null);
  const [matched, setMatched] = useState<string[]>(() => (answered ? [...activity.itemIds] : []));
  const [mismatched, setMismatched] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<ReactNode>(null);

  const label = (item: CurriculumItem) =>
    activity.matchBy === "image" ? itemAlt(item, locale) : itemMeaning(item, locale);

  const choose = (side: Side, id: string) => {
    if (answered || matched.includes(id)) return;
    if (!selection || selection.side === side) {
      setSelection({ side, id });
      setMessage(null);
      return;
    }
    const leftId = side === "left" ? id : selection.id;
    const rightId = side === "right" ? id : selection.id;
    setSelection(null);
    if (leftId === rightId) {
      const next = [...matched, leftId];
      setMatched(next);
      const item = getItem(leftId);
      setMessage(
        <>
          {t.activity.pairYes} <ItemText item={item} /> {t.activity.pairsWith} {label(item)}
        </>,
      );
      if (next.length === activity.itemIds.length) {
        onAnswer(matchPairsResult(activity, mismatched), {
          headline: mismatched.size === 0 ? t.activity.allPairsFirstTry : t.activity.allPairs,
        });
      }
    } else {
      const leftItem = getItem(leftId);
      const rightItem = getItem(rightId);
      setMismatched((previous) => new Set([...previous, leftId, rightId]));
      setMessage(
        <>
          {t.activity.pairNo} <ItemText item={leftItem} /> {t.activity.means} {itemMeaning(leftItem, locale)},{" "}
          {t.activity.youChose} {label(rightItem)}. {t.activity.tryAgain}
        </>,
      );
    }
  };

  const pairNumber = (id: string) => matched.indexOf(id) + 1;

  const buttonClass = (side: Side, id: string) => {
    const isMatched = matched.includes(id);
    const isSelected = selection?.side === side && selection.id === id;
    return `option-card w-full ${isSelected ? "!border-teal !border-[3px] !bg-teal-soft" : ""} ${
      isMatched ? "!border-leaf !bg-leaf-soft cursor-default" : ""
    }`;
  };

  return (
    <div className="flex flex-col gap-6">
      <ActivityHeading>{instructionFor(activity, locale)}</ActivityHeading>
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <ul className="flex flex-col gap-3" aria-label={t.activity.words}>
          {items.map((item) => (
            <li key={item.id} className="relative">
              <button
                type="button"
                className={buttonClass("left", item.id)}
                data-item-id={item.id}
                aria-pressed={selection?.side === "left" && selection.id === item.id}
                aria-disabled={matched.includes(item.id) || Boolean(answered)}
                onClick={() => choose("left", item.id)}
              >
                <ItemWithReading
                  item={item}
                  showTransliteration={showTransliteration(item)}
                  textClassName="text-2xl"
                />
                {matched.includes(item.id) ? <span className="sr-only">{t.activity.matched}</span> : null}
              </button>
              <PairBadge number={pairNumber(item.id)} />
            </li>
          ))}
        </ul>
        <ul
          className="flex flex-col gap-3"
          aria-label={activity.matchBy === "image" ? t.activity.pictures : t.activity.meanings}
        >
          {right.map((item) => (
            <li key={item.id} className="relative">
              <button
                type="button"
                className={buttonClass("right", item.id)}
                data-item-id={item.id}
                aria-pressed={selection?.side === "right" && selection.id === item.id}
                aria-disabled={matched.includes(item.id) || Boolean(answered)}
                onClick={() => choose("right", item.id)}
              >
                {activity.matchBy === "image" ? (
                  <>
                    <ItemImage item={item} size="small" decorative />
                    <span className="sr-only">{itemAlt(item, locale)}</span>
                  </>
                ) : (
                  <span className="text-lg font-medium">{itemMeaning(item, locale)}</span>
                )}
                {matched.includes(item.id) ? <span className="sr-only">{t.activity.matched}</span> : null}
              </button>
              <PairBadge number={pairNumber(item.id)} />
            </li>
          ))}
        </ul>
      </div>
      <p role="status" aria-live="polite" className="min-h-6 text-center text-base">
        {message}
      </p>
    </div>
  );
}

function PairBadge({ number }: { number: number }) {
  if (number <= 0) return null;
  return (
    <span
      aria-hidden="true"
      className="absolute -left-2 -top-2 flex h-7 min-w-7 items-center justify-center gap-0.5 rounded-full border-2 border-ink bg-leaf px-1 text-sm font-semibold text-white"
    >
      <Check className="size-3.5" strokeWidth={3} />
      {number}
    </span>
  );
}
