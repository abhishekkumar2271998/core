/** Languages the snippet library ships code in. All are understood by `CodeBlock`. */
export type SnippetLanguage = "ts" | "tsx" | "css" | "bash" | "sql";

export type SnippetCategory = "typescript" | "react" | "css" | "shell" | "git" | "sql";

export interface SnippetFile {
  /** Shown in the code block header instead of the language label. */
  filename?: string;
  language: SnippetLanguage;
  code: string;
}

export interface SnippetReference {
  label: string;
  href: string;
}

export interface Snippet {
  slug: string;
  title: string;
  /** One or two sentences: what the snippet does and when to reach for it. */
  description: string;
  category: SnippetCategory;
  tags: string[];
  /** ISO date string, e.g. "2026-03-14" */
  date: string;
  updated?: string;
  /** The snippet itself. Multiple files render as tabs. */
  files: SnippetFile[];
  /** Optional example of the snippet in use. */
  usage?: SnippetFile;
  /** How it works, caveats and gotchas. Same markdown subset as blog posts. */
  notes: string;
  references?: SnippetReference[];
}

export interface SnippetCategoryMeta {
  id: SnippetCategory;
  label: string;
  description: string;
}
