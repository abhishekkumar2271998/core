import { errorMessage, fail, ok, type Result } from "./types";

/**
 * - component: `encodeURIComponent`, for a single query value or path segment.
 * - uri: `encodeURI`, keeps reserved characters like `/?&=` intact.
 * - form: application/x-www-form-urlencoded, spaces become `+`.
 */
export type UrlEncodeMode = "component" | "uri" | "form";

export function encodeUrl(text: string, mode: UrlEncodeMode): string {
  switch (mode) {
    case "uri":
      return encodeURI(text);
    case "form":
      return encodeURIComponent(text).replace(/%20/g, "+");
    default:
      return encodeURIComponent(text);
  }
}

export function decodeUrl(text: string, mode: UrlEncodeMode): Result<string> {
  try {
    const input = mode === "form" ? text.replace(/\+/g, " ") : text;
    return ok(mode === "uri" ? decodeURI(input) : decodeURIComponent(input));
  } catch (err) {
    return fail(`${errorMessage(err, "Malformed URI")} — check for a stray "%" not followed by two hex digits.`);
  }
}

export interface ParsedUrl {
  protocol: string;
  host: string;
  pathname: string;
  hash: string;
  params: [string, string][];
}

/** Breaks a full URL into parts so query params can be inspected individually. */
export function parseUrl(text: string): ParsedUrl | null {
  try {
    const url = new URL(text.trim());
    return {
      protocol: url.protocol,
      host: url.host,
      pathname: url.pathname,
      hash: url.hash,
      params: Array.from(url.searchParams.entries()),
    };
  } catch {
    return null;
  }
}
