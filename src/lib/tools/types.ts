import type { IconName } from "@/types";

/** Outcome of a fallible transform. Tools never throw into the UI. */
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function fail<T = never>(error: string): Result<T> {
  return { ok: false, error };
}

/** Normalises anything thrown into a readable message. */
export function errorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return fallback;
}

export type ToolSlug =
  | "json-formatter"
  | "base64"
  | "url-encoder"
  | "jwt-decoder"
  | "regex-tester"
  | "color-converter"
  | "uuid-generator"
  | "timestamp-converter"
  | "case-converter"
  | "markdown-table";

export type ToolCategory = "data" | "encoding" | "text" | "design" | "generators";

export interface ToolMeta {
  slug: ToolSlug;
  name: string;
  /** One-liner shown on cards. */
  tagline: string;
  /** Longer copy for the tool page and metadata. */
  description: string;
  category: ToolCategory;
  icon: IconName;
  keywords: string[];
  /** Short usage tips rendered under the tool. */
  tips: string[];
}
