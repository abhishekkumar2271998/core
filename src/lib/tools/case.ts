export type CaseStyle =
  | "camel"
  | "pascal"
  | "snake"
  | "constant"
  | "kebab"
  | "title"
  | "sentence"
  | "dot"
  | "lower"
  | "upper";

export const CASE_STYLES: { id: CaseStyle; label: string; example: string }[] = [
  { id: "camel", label: "camelCase", example: "userProfileId" },
  { id: "pascal", label: "PascalCase", example: "UserProfileId" },
  { id: "snake", label: "snake_case", example: "user_profile_id" },
  { id: "constant", label: "CONSTANT_CASE", example: "USER_PROFILE_ID" },
  { id: "kebab", label: "kebab-case", example: "user-profile-id" },
  { id: "dot", label: "dot.case", example: "user.profile.id" },
  { id: "title", label: "Title Case", example: "User Profile Id" },
  { id: "sentence", label: "Sentence case", example: "User profile id" },
  { id: "lower", label: "lower case", example: "user profile id" },
  { id: "upper", label: "UPPER CASE", example: "USER PROFILE ID" },
];

/** Small words kept lowercase in Title Case unless first or last. */
const MINOR_WORDS = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "in", "of", "on", "or", "the", "to", "vs"]);

/**
 * Splits any identifier or phrase into lowercase words:
 * "parseHTTPResponse_v2" -> ["parse", "http", "response", "v2"].
 */
export function splitWords(input: string): string[] {
  return input
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[^A-Za-z\d]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

export function convertWords(words: string[], style: CaseStyle): string {
  switch (style) {
    case "camel":
      return words.map((w, i) => (i === 0 ? w : cap(w))).join("");
    case "pascal":
      return words.map(cap).join("");
    case "snake":
      return words.join("_");
    case "constant":
      return words.join("_").toUpperCase();
    case "kebab":
      return words.join("-");
    case "dot":
      return words.join(".");
    case "title":
      return words
        .map((w, i) => (i > 0 && i < words.length - 1 && MINOR_WORDS.has(w) ? w : cap(w)))
        .join(" ");
    case "sentence":
      return cap(words.join(" "));
    case "lower":
      return words.join(" ");
    case "upper":
      return words.join(" ").toUpperCase();
  }
}

/** Converts each non-empty line independently so lists of identifiers work. */
export function convertCase(input: string, style: CaseStyle): string {
  return input
    .split("\n")
    .map((line) => (line.trim() ? convertWords(splitWords(line), style) : ""))
    .join("\n");
}
