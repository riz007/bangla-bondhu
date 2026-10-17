"use client";

import { useEffect, useState } from "react";

const MINUTE_MS = 60_000;

export function useNow(resyncKey?: unknown, refreshMs: number = MINUTE_MS): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with the clock after hydration
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), refreshMs);
    return () => window.clearInterval(timer);
  }, [refreshMs, resyncKey]);
  return now;
}
