"use client";

import { useNow } from "@/hooks";

/** Live clock in the owner's timezone, rendered client-side only to avoid hydration mismatch. */
export function LocalTime({ timezone }: { timezone: string }) {
  const now = useNow(30_000);
  if (!now) return <span className="inline-block w-16" />;
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(now);
  return <time className="font-mono tabular-nums">{time} local</time>;
}
