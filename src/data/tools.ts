import type { ToolCategory, ToolMeta, ToolSlug } from "@/lib/tools/types";

/**
 * The /tools section. Every tool runs entirely in the browser — nothing
 * typed into them leaves the page. Order here is the order on the index.
 */
export const tools: ToolMeta[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    tagline: "Pretty-print, minify and validate JSON with precise error locations.",
    description:
      "Format or minify JSON, optionally sort keys alphabetically, and get the exact line and column of any syntax error.",
    category: "data",
    icon: "code",
    keywords: ["json", "prettify", "beautify", "minify", "validate", "lint"],
    tips: [
      "Sorting keys makes two payloads easy to diff.",
      "Trailing commas and single quotes are not valid JSON — the error points at them.",
    ],
  },
  {
    slug: "base64",
    name: "Base64 Encoder",
    tagline: "Encode and decode Base64 with full UTF-8 and URL-safe support.",
    description:
      "Convert text to and from Base64. Handles emoji and non-Latin scripts correctly and supports the URL-safe base64url alphabet.",
    category: "encoding",
    icon: "layers",
    keywords: ["base64", "base64url", "encode", "decode", "btoa", "atob"],
    tips: [
      "Decoding accepts standard and URL-safe input, with or without padding.",
      "Base64 is an encoding, not encryption — anyone can reverse it.",
    ],
  },
  {
    slug: "url-encoder",
    name: "URL Encoder",
    tagline: "Percent-encode strings and inspect query parameters.",
    description:
      "Encode or decode URL components, full URIs or form data, and break a URL into its parts to read each query parameter.",
    category: "encoding",
    icon: "globe",
    keywords: ["url", "uri", "percent", "encode", "decode", "query string"],
    tips: [
      "Use component mode for a single query value, URI mode for a whole link.",
      "Form mode matches how HTML forms submit data: spaces become +.",
    ],
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    tagline: "Inspect a JSON Web Token's header, claims and expiry.",
    description:
      "Decode the header and payload of a JWT, see registered claims explained and check whether the token has expired. Signatures are not verified.",
    category: "encoding",
    icon: "tag",
    keywords: ["jwt", "json web token", "oauth", "bearer", "claims", "decode"],
    tips: [
      "Decoding happens locally, but avoid pasting production tokens anywhere you don't trust.",
      "A decoded token is not a verified token — always check the signature server-side.",
    ],
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    tagline: "Test JavaScript regular expressions with live match highlighting.",
    description:
      "Write a JavaScript regular expression, toggle flags and see every match highlighted along with capture groups and replacement previews.",
    category: "text",
    icon: "search",
    keywords: ["regex", "regexp", "regular expression", "match", "replace", "capture group"],
    tips: [
      "Named groups like (?<year>\\d{4}) show up in the match list and work as $<year> in replacements.",
      "Without the g flag only the first match is found.",
    ],
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    tagline: "Convert between hex, RGB and HSL and check WCAG contrast.",
    description:
      "Convert colors between hex, RGB and HSL notations and measure the contrast ratio of a text/background pair against WCAG 2 thresholds.",
    category: "design",
    icon: "palette",
    keywords: ["color", "colour", "hex", "rgb", "hsl", "contrast", "wcag", "accessibility"],
    tips: [
      "AA requires 4.5:1 for body text and 3:1 for large text (24px, or 18.66px bold).",
      "Translucent foregrounds are composited over the background before measuring.",
    ],
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    tagline: "Generate cryptographically random v4 UUIDs in bulk.",
    description:
      "Generate one or many version 4 UUIDs using the Web Crypto API, with formatting options, and inspect the version of any existing UUID.",
    category: "generators",
    icon: "hash",
    keywords: ["uuid", "guid", "v4", "random", "identifier"],
    tips: ["v4 UUIDs carry 122 random bits — collisions are not a practical concern."],
  },
  {
    slug: "timestamp-converter",
    name: "Timestamp Converter",
    tagline: "Convert Unix epochs to readable dates and back.",
    description:
      "Convert Unix timestamps in seconds or milliseconds to ISO 8601, UTC and local time in any timezone, or turn a date into an epoch.",
    category: "data",
    icon: "clock",
    keywords: ["timestamp", "unix", "epoch", "date", "iso 8601", "timezone"],
    tips: [
      "Numbers of 12+ digits are treated as milliseconds automatically.",
      "JavaScript's Date.now() returns milliseconds; most Unix tools use seconds.",
    ],
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    tagline: "Switch identifiers between camelCase, snake_case, kebab-case and more.",
    description:
      "Convert text or lists of identifiers between camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, Title Case and more.",
    category: "text",
    icon: "pen",
    keywords: ["case", "camelcase", "snake_case", "kebab-case", "pascalcase", "title case"],
    tips: ["Each line is converted separately, so you can paste a whole list of names."],
  },
  {
    slug: "markdown-table",
    name: "Markdown Table Generator",
    tagline: "Turn CSV, TSV or spreadsheet cells into a Markdown table.",
    description:
      "Paste CSV, TSV or cells copied from a spreadsheet and get a neatly aligned GitHub-flavoured Markdown table with per-column alignment.",
    category: "text",
    icon: "grid",
    keywords: ["markdown", "table", "csv", "tsv", "gfm", "spreadsheet"],
    tips: [
      "Copying cells from Excel or Google Sheets gives tab-separated text — paste it straight in.",
      "Pipes inside cells are escaped automatically.",
    ],
  },
];

export const toolCategories: Record<ToolCategory, string> = {
  data: "Data",
  encoding: "Encoding",
  text: "Text",
  design: "Design",
  generators: "Generators",
};

export function getTool(slug: string): ToolMeta | undefined {
  return tools.find((t) => t.slug === slug);
}

export function isToolSlug(slug: string): slug is ToolSlug {
  return tools.some((t) => t.slug === slug);
}

/** Other tools in the same category first, then the rest, in index order. */
export function getRelatedTools(slug: ToolSlug, limit = 3): ToolMeta[] {
  const current = getTool(slug);
  if (!current) return [];
  const others = tools.filter((t) => t.slug !== slug);
  return [
    ...others.filter((t) => t.category === current.category),
    ...others.filter((t) => t.category !== current.category),
  ].slice(0, limit);
}
