"use client";

import { useMemo } from "react";
import { Icon } from "@/components/icons/Icon";
import { useCopyToClipboard } from "@/hooks";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ types */

type TokenType =
  | "plain"
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "function"
  | "type"
  | "tag"
  | "property"
  | "operator";

interface Token {
  type: TokenType;
  value: string;
}

type LangFamily = "js" | "jsx" | "css" | "sql" | "bash" | "plain";

/* -------------------------------------------------------------- languages */

const LANGUAGE_LABELS: Record<string, string> = {
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JSX",
  json: "JSON",
  css: "CSS",
  sql: "SQL",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  zsh: "Shell",
  markdown: "Markdown",
  md: "Markdown",
  text: "Text",
  txt: "Text",
};

function familyOf(lang: string): LangFamily {
  switch (lang) {
    case "ts":
    case "typescript":
    case "js":
    case "javascript":
    case "json":
      return "js";
    case "tsx":
    case "jsx":
      return "jsx";
    case "css":
      return "css";
    case "sql":
      return "sql";
    case "bash":
    case "sh":
    case "shell":
    case "zsh":
      return "bash";
    default:
      return "plain";
  }
}

const JS_KEYWORDS = new Set(
  (
    "abstract as async await break case catch class const continue debugger declare default delete do else enum " +
    "export extends false finally for from function get if implements import in infer instanceof interface is keyof " +
    "let namespace never new null of private protected public readonly return satisfies set static super switch " +
    "this throw true try type typeof undefined unique unknown var void while with yield any boolean number string " +
    "symbol bigint object"
  ).split(" "),
);

const SQL_KEYWORDS = new Set(
  (
    "select from where and or not in is null as on join left right inner outer full cross group by order having " +
    "limit offset insert into values update set delete create drop alter table index unique primary key foreign " +
    "references concurrently include using desc asc distinct case when then else end exists between like ilike " +
    "explain analyze buffers with returning default constraint if begin commit rollback true false"
  ).split(" "),
);

const BASH_KEYWORDS = new Set(
  (
    "if then else elif fi for while do done case esac in function return export local readonly echo cd exit set " +
    "source alias unset npm npx pnpm yarn git node docker sudo curl"
  ).split(" "),
);

const CSS_KEYWORDS = new Set("important inherit initial unset revert auto none".split(" "));

/* -------------------------------------------------------------- tokenizer */

interface Rule {
  type: TokenType | ((match: string, src: string, end: number, state: ScanState) => TokenType);
  re: RegExp;
}

interface ScanState {
  depth: number;
}

const nextNonSpace = (src: string, from: number): string => {
  for (let i = from; i < src.length; i++) {
    const c = src[i];
    if (c !== " " && c !== "\t") return c;
  }
  return "";
};

function jsWordType(keywords: Set<string>) {
  return (word: string, src: string, end: number): TokenType => {
    if (keywords.has(word)) return "keyword";
    if (nextNonSpace(src, end) === "(") return "function";
    if (/^[A-Z]/.test(word)) return "type";
    return "plain";
  };
}

const sticky = (source: string, flags = "") => new RegExp(source, "y" + flags);

const STRING_DQ = '"(?:\\\\.|[^"\\\\\\n])*"';
const STRING_SQ = "'(?:\\\\.|[^'\\\\\\n])*'";
const STRING_BT = "`(?:\\\\.|[^`\\\\])*`";
const NUMBER = "\\b(?:0x[\\da-fA-F]+|\\d[\\d_]*(?:\\.\\d+)?(?:e[+-]?\\d+)?n?)\\b";

const RULES: Record<Exclude<LangFamily, "plain">, Rule[]> = {
  js: [
    { type: "comment", re: sticky("\\/\\/[^\\n]*") },
    { type: "comment", re: sticky("\\/\\*[\\s\\S]*?(?:\\*\\/|$)") },
    { type: "string", re: sticky(`${STRING_DQ}|${STRING_SQ}|${STRING_BT}`) },
    { type: "number", re: sticky(NUMBER) },
    { type: jsWordType(JS_KEYWORDS), re: sticky("[A-Za-z_$][\\w$]*") },
    { type: "operator", re: sticky("=>|[=!<>]=?=?|&&|\\|\\||\\?\\?|[+\\-*/%?:|&]") },
  ],
  jsx: [
    { type: "comment", re: sticky("\\/\\/[^\\n]*") },
    { type: "comment", re: sticky("\\/\\*[\\s\\S]*?(?:\\*\\/|$)") },
    { type: "string", re: sticky(`${STRING_DQ}|${STRING_SQ}|${STRING_BT}`) },
    { type: "tag", re: sticky("<\\/?[A-Za-z][\\w.]*") },
    { type: "tag", re: sticky("\\/?>") },
    { type: "number", re: sticky(NUMBER) },
    { type: jsWordType(JS_KEYWORDS), re: sticky("[A-Za-z_$][\\w$]*") },
    { type: "operator", re: sticky("=>|[=!<>]=?=?|&&|\\|\\||\\?\\?|[+\\-*/%?:|&]") },
  ],
  css: [
    { type: "comment", re: sticky("\\/\\*[\\s\\S]*?(?:\\*\\/|$)") },
    { type: "string", re: sticky(`${STRING_DQ}|${STRING_SQ}`) },
    { type: "keyword", re: sticky("@[\\w-]+|![\\w]+") },
    { type: "number", re: sticky("#[\\da-fA-F]{3,8}\\b|-?\\b\\d+(?:\\.\\d+)?(?:px|rem|em|ms|s|%|vh|vw|fr|deg|ch)?") },
    { type: "property", re: sticky("--[\\w-]+") },
    {
      type: (word, src, end, state) => {
        if (CSS_KEYWORDS.has(word)) return "keyword";
        if (nextNonSpace(src, end) === "(") return "function";
        if (state.depth > 0 && nextNonSpace(src, end) === ":") return "property";
        if (state.depth === 0) return "type";
        return "plain";
      },
      re: sticky("[A-Za-z_][\\w-]*"),
    },
  ],
  sql: [
    { type: "comment", re: sticky("--[^\\n]*") },
    { type: "comment", re: sticky("\\/\\*[\\s\\S]*?(?:\\*\\/|$)") },
    { type: "string", re: sticky("'(?:''|[^'])*'") },
    { type: "number", re: sticky(NUMBER) },
    {
      type: (word, src, end) => {
        if (SQL_KEYWORDS.has(word.toLowerCase())) return "keyword";
        if (nextNonSpace(src, end) === "(") return "function";
        return "plain";
      },
      re: sticky("[A-Za-z_][\\w]*"),
    },
    { type: "operator", re: sticky("[=<>!]=?|@>|::|[+\\-*/%]") },
  ],
  bash: [
    { type: "comment", re: sticky("#[^\\n]*") },
    { type: "string", re: sticky(`${STRING_DQ}|${STRING_SQ}`) },
    { type: "property", re: sticky("\\$\\{?[\\w]+\\}?|--?[A-Za-z][\\w-]*") },
    { type: "number", re: sticky("\\b\\d+\\b") },
    {
      type: (word) => (BASH_KEYWORDS.has(word) ? "keyword" : "plain"),
      re: sticky("[A-Za-z_][\\w.-]*"),
    },
    { type: "operator", re: sticky("&&|\\|\\||[|>&;]") },
  ],
};

export function tokenize(code: string, lang: string): Token[] {
  const family = familyOf(lang);
  if (family === "plain") return [{ type: "plain", value: code }];

  const rules = RULES[family];
  const tokens: Token[] = [];
  const state: ScanState = { depth: 0 };
  let pos = 0;

  const push = (type: TokenType, value: string) => {
    const last = tokens[tokens.length - 1];
    if (last && last.type === type) last.value += value;
    else tokens.push({ type, value });
  };

  while (pos < code.length) {
    let matched = false;
    for (const rule of rules) {
      rule.re.lastIndex = pos;
      const m = rule.re.exec(code);
      if (!m || m[0].length === 0) continue;
      const value = m[0];
      const end = pos + value.length;
      const type = typeof rule.type === "function" ? rule.type(value, code, end, state) : rule.type;
      push(type, value);
      pos = end;
      matched = true;
      break;
    }
    if (!matched) {
      const ch = code[pos];
      if (ch === "{") state.depth++;
      else if (ch === "}") state.depth = Math.max(0, state.depth - 1);
      push("plain", ch);
      pos++;
    }
  }
  return tokens;
}

const TOKEN_CLASSES: Record<TokenType, string> = {
  plain: "",
  comment: "text-muted italic",
  string: "text-emerald-700 dark:text-emerald-300",
  keyword: "text-fuchsia-700 dark:text-fuchsia-300",
  number: "text-amber-700 dark:text-amber-300",
  function: "text-sky-700 dark:text-sky-300",
  type: "text-indigo-700 dark:text-indigo-300",
  tag: "text-rose-700 dark:text-rose-300",
  property: "text-cyan-700 dark:text-cyan-300",
  operator: "text-muted",
};

/* -------------------------------------------------------------- component */

interface CodeBlockProps {
  code: string;
  language?: string;
  /** Optional filename shown instead of the language label. */
  filename?: string;
  className?: string;
}

export function CodeBlock({ code, language = "", filename, className }: CodeBlockProps) {
  const lang = language.toLowerCase();
  const { copied, copy } = useCopyToClipboard();
  const tokens = useMemo(() => tokenize(code, lang), [code, lang]);
  const label = filename ?? LANGUAGE_LABELS[lang] ?? (lang ? lang.toUpperCase() : "Code");

  return (
    <figure className={cn("relative mt-6 overflow-hidden rounded-xl border bg-surface-2", className)}>
      <figcaption className="flex items-center justify-between gap-4 border-b bg-surface px-4 py-2">
        <span className="flex items-center gap-2 font-mono text-xs font-medium text-muted">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
          </span>
          <span className="ml-1">{label}</span>
        </span>
        <button
          type="button"
          onClick={() => void copy(code)}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors",
            copied ? "text-success" : "text-muted hover:bg-surface-2 hover:text-fg",
          )}
          aria-label={copied ? "Code copied to clipboard" : "Copy code to clipboard"}
        >
          <Icon name={copied ? "check" : "copy"} className="h-3.5 w-3.5" />
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </figcaption>
      <pre
        className="!mt-0 overflow-x-auto !rounded-none !border-0 !bg-transparent !p-4 font-mono !text-[0.8125rem] !leading-6 text-fg"
        tabIndex={0}
        aria-label={`${label} code example`}
      >
        <code>
          {tokens.map((token, i) =>
            token.type === "plain" ? (
              token.value
            ) : (
              <span key={i} className={TOKEN_CLASSES[token.type]}>
                {token.value}
              </span>
            ),
          )}
        </code>
      </pre>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </figure>
  );
}
