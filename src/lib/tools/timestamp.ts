import { fail, ok, type Result } from "./types";

export type EpochUnit = "seconds" | "milliseconds";

export interface ParsedTimestamp {
  date: Date;
  /** How the input was interpreted, for display. */
  detected: string;
}

export interface TimestampFormats {
  seconds: string;
  milliseconds: string;
  iso: string;
  utc: string;
  local: string;
  relative: string;
}

/**
 * Accepts epoch seconds, epoch milliseconds (auto-detected by magnitude)
 * or anything `Date` can parse, e.g. "2026-03-14T09:30:00Z".
 */
export function parseTimestamp(input: string, unit: EpochUnit | "auto" = "auto"): Result<ParsedTimestamp> {
  const value = input.trim();
  if (!value) return fail("Enter a timestamp or date.");

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    const n = Number(value);
    // 1e11 seconds is year 5138; anything bigger is almost certainly milliseconds.
    const resolved: EpochUnit = unit === "auto" ? (Math.abs(n) >= 1e11 ? "milliseconds" : "seconds") : unit;
    const date = new Date(resolved === "seconds" ? n * 1000 : n);
    if (Number.isNaN(date.getTime())) return fail("That number is outside the representable date range.");
    return ok({ date, detected: `Unix epoch (${resolved})` });
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fail("Could not parse that date. Try ISO 8601, e.g. 2026-03-14T09:30:00Z.");
  return ok({ date, detected: "Date string" });
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

export function relativeTime(date: Date, now: Date = new Date()): string {
  const diff = (date.getTime() - now.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, secs] of UNITS) {
    if (Math.abs(diff) >= secs || unit === "second") return rtf.format(Math.round(diff / secs), unit);
  }
  return "";
}

export function formatTimestamp(date: Date, timeZone?: string, now: Date = new Date()): TimestampFormats {
  const ms = date.getTime();
  return {
    seconds: String(Math.floor(ms / 1000)),
    milliseconds: String(ms),
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: new Intl.DateTimeFormat("en-GB", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone,
    }).format(date),
    relative: relativeTime(date, now),
  };
}

/** Builds the value for an `<input type="datetime-local">` in local time. */
export function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}:${pad(date.getSeconds())}`;
}
