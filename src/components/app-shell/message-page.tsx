"use client";

import Link from "next/link";
import { useT } from "@/features/settings/settings-store";
import type { Messages } from "@/lib/i18n/messages";
import { DoelMascot } from "./doel-mascot";

export function MessagePage({ page }: { page: "offline" | "notFound" }) {
  const t = useT();
  const text: Messages["offline"] | Messages["notFound"] = t[page];
  return (
    <main
      id="main"
      className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <DoelMascot size={140} />
      <h1 className="font-display text-2xl">{text.title}</h1>
      <p className="text-ink-soft">{text.body}</p>
      <Link href="/" className="btn btn-primary">
        {"retry" in text ? text.retry : t.common.backToMap}
      </Link>
    </main>
  );
}
