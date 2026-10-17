"use client";

import { TriangleAlert } from "lucide-react";
import type { ProgressSnapshot } from "@/features/progress/progress-store";
import { useT } from "@/features/settings/settings-store";

export function StorageWarning({ snapshot }: { snapshot: ProgressSnapshot }) {
  const t = useT();
  const warnings: string[] = [];
  if (snapshot.storage === "memory") warnings.push(t.journal.memoryWarning);
  if (snapshot.recovered) warnings.push(t.journal.recoveredWarning);
  if (snapshot.writeError) warnings.push(t.journal.writeWarning);
  if (warnings.length === 0) return null;
  return (
    <div
      role="alert"
      className="flex gap-2 rounded-md border-2 border-dashed border-coral-ink bg-coral-soft p-3"
    >
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-coral-ink" />
      <ul className="flex flex-col gap-1">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </div>
  );
}
