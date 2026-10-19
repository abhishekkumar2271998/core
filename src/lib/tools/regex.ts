import { errorMessage, fail, ok, type Result } from "./types";

export const REGEX_FLAGS = [
  { flag: "g", label: "global", description: "Find all matches, not just the first" },
  { flag: "i", label: "ignore case", description: "Case-insensitive matching" },
  { flag: "m", label: "multiline", description: "^ and $ match at line breaks" },
  { flag: "s", label: "dotAll", description: ". also matches newlines" },
  { flag: "u", label: "unicode", description: "Full Unicode and stricter syntax" },
  { flag: "y", label: "sticky", description: "Match only from lastIndex" },
] as const;

export type RegexFlag = (typeof REGEX_FLAGS)[number]["flag"];

export interface RegexMatch {
  index: number;
  end: number;
  value: string;
  /** Positional capture groups ($1, $2, ...). Undefined when a group did not participate. */
  groups: (string | undefined)[];
  named: Record<string, string | undefined>;
}

export type HighlightSegment = { text: string; match: number | null };

export interface RegexResult {
  matches: RegexMatch[];
  segments: HighlightSegment[];
  /** True when the match cap was hit and results are partial. */
  truncated: boolean;
}

/** Guards the UI against patterns like `a*` on huge inputs. */
const MAX_MATCHES = 1000;

export function compileRegex(pattern: string, flags: string): Result<RegExp> {
  try {
    return ok(new RegExp(pattern, flags));
  } catch (err) {
    return fail(errorMessage(err, "Invalid regular expression"));
  }
}

export function runRegex(pattern: string, flags: string, text: string): Result<RegexResult> {
  if (!pattern) return ok({ matches: [], segments: [{ text, match: null }], truncated: false });
  const compiled = compileRegex(pattern, flags);
  if (!compiled.ok) return compiled;
  const re = compiled.value;

  const matches: RegexMatch[] = [];
  let truncated = false;
  const toMatch = (m: RegExpExecArray): RegexMatch => ({
    index: m.index,
    end: m.index + m[0].length,
    value: m[0],
    groups: m.slice(1),
    named: m.groups ? { ...m.groups } : {},
  });

  if (re.global || re.sticky) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push(toMatch(m));
      // Zero-length matches would loop forever without advancing manually.
      if (m[0] === "") re.lastIndex += re.unicode && (text.codePointAt(re.lastIndex) ?? 0) > 0xffff ? 2 : 1;
      if (!re.global) break;
      if (matches.length >= MAX_MATCHES) {
        truncated = true;
        break;
      }
    }
  } else {
    const m = re.exec(text);
    if (m) matches.push(toMatch(m));
  }

  return ok({ matches, segments: segmentText(text, matches), truncated });
}

/** Splits text into alternating plain / matched runs for highlighting. */
export function segmentText(text: string, matches: RegexMatch[]): HighlightSegment[] {
  const segments: HighlightSegment[] = [];
  let cursor = 0;
  matches.forEach((m, i) => {
    if (m.end === m.index) return;
    if (m.index > cursor) segments.push({ text: text.slice(cursor, m.index), match: null });
    segments.push({ text: text.slice(m.index, m.end), match: i });
    cursor = m.end;
  });
  if (cursor < text.length || segments.length === 0) segments.push({ text: text.slice(cursor), match: null });
  return segments;
}

/** Applies a replacement string (supports $1, $<name>, $&) to every match. */
export function replaceRegex(pattern: string, flags: string, text: string, replacement: string): Result<string> {
  const compiled = compileRegex(pattern, flags);
  if (!compiled.ok) return compiled;
  return ok(text.replace(compiled.value, replacement));
}

export interface RegexPreset {
  name: string;
  pattern: string;
  flags: string;
  sample: string;
}

export const REGEX_PRESETS: RegexPreset[] = [
  {
    name: "Email",
    pattern: "[\\w.+-]+@[\\w-]+\\.[\\w.-]+",
    flags: "gi",
    sample: "Contact hello@example.com or support+tools@mail.example.org today.",
  },
  {
    name: "URL",
    pattern: "https?:\\/\\/[^\\s/$.?#].[^\\s]*",
    flags: "gi",
    sample: "Docs live at https://nextjs.org/docs and http://localhost:3000/tools?x=1.",
  },
  {
    name: "ISO date",
    pattern: "(?<year>\\d{4})-(?<month>0[1-9]|1[0-2])-(?<day>0[1-9]|[12]\\d|3[01])",
    flags: "g",
    sample: "Released 2026-03-14, patched 2026-04-02, invalid 2026-13-40.",
  },
  {
    name: "Hex color",
    pattern: "#(?:[0-9a-f]{3}){1,2}\\b",
    flags: "gi",
    sample: "--accent: #6366F1; --muted: #888; --bad: #12345;",
  },
];
