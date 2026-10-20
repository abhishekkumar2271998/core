import { errorMessage, fail, ok, type Result } from "./types";

export type JsonIndent = 2 | 4 | "tab";

export interface JsonFormatOptions {
  indent: JsonIndent;
  sortKeys: boolean;
}

export interface JsonStats {
  /** Total number of object keys, at any depth. */
  keys: number;
  /** Deepest nesting level (a scalar is depth 0). */
  depth: number;
  /** Bytes of the UTF-8 encoded output. */
  bytes: number;
}

export interface JsonFormatted {
  output: string;
  stats: JsonStats;
}

export interface JsonErrorLocation {
  message: string;
  line: number;
  column: number;
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.keys(obj)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortDeep(obj[key]);
        return acc;
      }, {});
  }
  return value;
}

function measure(value: unknown, depth = 0): { keys: number; depth: number } {
  if (Array.isArray(value)) {
    return value.reduce<{ keys: number; depth: number }>(
      (acc, item) => {
        const m = measure(item, depth + 1);
        return { keys: acc.keys + m.keys, depth: Math.max(acc.depth, m.depth) };
      },
      { keys: 0, depth: depth + 1 },
    );
  }
  if (value && typeof value === "object") {
    const entries = Object.values(value as Record<string, unknown>);
    return entries.reduce<{ keys: number; depth: number }>(
      (acc, item) => {
        const m = measure(item, depth + 1);
        return { keys: acc.keys + m.keys, depth: Math.max(acc.depth, m.depth) };
      },
      { keys: entries.length, depth: depth + 1 },
    );
  }
  return { keys: 0, depth };
}

export function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

/**
 * Turns V8 / SpiderMonkey parse errors into a line + column.
 * V8: "... at position 42", Firefox: "... at line 3 column 5".
 */
export function locateJsonError(input: string, err: unknown): JsonErrorLocation {
  const message = errorMessage(err, "Invalid JSON");
  const lineCol = /line (\d+) column (\d+)/.exec(message);
  if (lineCol) return { message, line: Number(lineCol[1]), column: Number(lineCol[2]) };

  const pos = /position (\d+)/.exec(message);
  const offset = pos ? Number(pos[1]) : input.length;
  const before = input.slice(0, offset).split("\n");
  return { message, line: before.length, column: before[before.length - 1].length + 1 };
}

export function parseJson(input: string): Result<unknown> {
  if (!input.trim()) return fail("Paste some JSON to get started.");
  try {
    return ok(JSON.parse(input));
  } catch (err) {
    const loc = locateJsonError(input, err);
    return fail(`${loc.message} (line ${loc.line}, column ${loc.column})`);
  }
}

export function formatJson(input: string, options: JsonFormatOptions): Result<JsonFormatted> {
  const parsed = parseJson(input);
  if (!parsed.ok) return parsed;
  const value = options.sortKeys ? sortDeep(parsed.value) : parsed.value;
  const output = JSON.stringify(value, null, options.indent === "tab" ? "\t" : options.indent);
  const { keys, depth } = measure(value);
  return ok({ output, stats: { keys, depth, bytes: byteLength(output) } });
}

export function minifyJson(input: string): Result<JsonFormatted> {
  const parsed = parseJson(input);
  if (!parsed.ok) return parsed;
  const output = JSON.stringify(parsed.value);
  const { keys, depth } = measure(parsed.value);
  return ok({ output, stats: { keys, depth, bytes: byteLength(output) } });
}
