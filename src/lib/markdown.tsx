import Link from "next/link";
import type { ReactNode } from "react";
import { CodeBlock } from "@/components/blog/CodeBlock";
import { slugify } from "@/lib/utils";

/**
 * A small, safe markdown renderer. It never produces raw HTML: every node is a
 * React element, so content is escaped by React. Supported subset:
 *
 *   # / ## / ### headings      (# and ## both render as <h2>)
 *   paragraphs                 (consecutive lines are joined)
 *   - / * / + unordered lists  1. ordered lists
 *   > blockquotes              --- horizontal rules
 *   ```lang code fences
 *   **bold**  *italic*  `code`  [link](url)
 */

/* -------------------------------------------------------------------- AST */

export interface MarkdownHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

type Block =
  | { type: "heading"; level: 2 | 3; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; start: number; items: string[] }
  | { type: "quote"; paragraphs: string[] }
  | { type: "code"; lang: string; code: string }
  | { type: "hr" };

const FENCE_RE = /^\s*```\s*([\w+#.-]*)\s*$/;
const HEADING_RE = /^(#{1,3})\s+(.+?)\s*#*\s*$/;
const HR_RE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
const QUOTE_RE = /^\s*>\s?(.*)$/;
const UL_RE = /^\s*[-*+]\s+(.*)$/;
const OL_RE = /^\s*(\d+)[.)]\s+(.*)$/;

function startsBlock(line: string): boolean {
  return (
    FENCE_RE.test(line) || HEADING_RE.test(line) || HR_RE.test(line) || QUOTE_RE.test(line) || UL_RE.test(line) || OL_RE.test(line)
  );
}

/** Removes inline markdown syntax, leaving plain text (used for heading ids and TOC labels). */
export function stripInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
}

/** Parses markdown into a flat list of blocks. Heading ids are slugified and de-duplicated. */
function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  const seenIds = new Map<string, number>();
  let i = 0;

  const uniqueId = (text: string) => {
    const base = slugify(stripInline(text)) || "section";
    const count = seenIds.get(base) ?? 0;
    seenIds.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Code fence
    const fence = FENCE_RE.exec(line);
    if (fence) {
      const lang = fence[1].toLowerCase();
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      i++; // skip closing fence (or run off the end safely)
      blocks.push({ type: "code", lang, code: body.join("\n") });
      continue;
    }

    // Heading
    const heading = HEADING_RE.exec(line);
    if (heading) {
      const level: 2 | 3 = heading[1].length === 3 ? 3 : 2;
      const text = heading[2];
      blocks.push({ type: "heading", level, text, id: uniqueId(text) });
      i++;
      continue;
    }

    // Horizontal rule
    if (HR_RE.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Blockquote: consecutive ">" lines; empty ">" lines split paragraphs
    if (QUOTE_RE.test(line)) {
      const paragraphs: string[] = [];
      let current: string[] = [];
      while (i < lines.length) {
        const m = QUOTE_RE.exec(lines[i]);
        if (!m) break;
        if (!m[1].trim()) {
          if (current.length) paragraphs.push(current.join(" "));
          current = [];
        } else {
          current.push(m[1].trim());
        }
        i++;
      }
      if (current.length) paragraphs.push(current.join(" "));
      blocks.push({ type: "quote", paragraphs });
      continue;
    }

    // Lists
    const ul = UL_RE.exec(line);
    const ol = ul ? null : OL_RE.exec(line);
    if (ul || ol) {
      const ordered = Boolean(ol);
      const itemRe = ordered ? OL_RE : UL_RE;
      const items: string[] = [];
      const start = ol ? Number(ol[1]) : 1;
      while (i < lines.length) {
        const current = lines[i];
        const m = itemRe.exec(current);
        if (m) {
          items.push((ordered ? m[2] : m[1]).trim());
          i++;
          continue;
        }
        // Indented continuation line belongs to the previous item
        if (items.length && /^\s{2,}\S/.test(current) && !startsBlock(current)) {
          items[items.length - 1] += " " + current.trim();
          i++;
          continue;
        }
        break;
      }
      blocks.push({ type: "list", ordered, start, items });
      continue;
    }

    // Paragraph: gather lines until a blank line or another block starts
    const para: string[] = [line.trim()];
    i++;
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i])) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: "paragraph", text: para.join(" ") });
  }

  return blocks;
}

/* ----------------------------------------------------------------- inline */

// `code` | **bold** | *italic* | [text](url)
const INLINE_RE = /`([^`]+)`|\*\*(.+?)\*\*|\*([^*\s](?:[^*]*[^*\s])?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

const SAFE_URL_RE = /^(?:https?:\/\/|mailto:|\/|#)/i;

function renderInline(text: string, keyPrefix = "i"): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = new RegExp(INLINE_RE.source, "g");
  let last = 0;
  let match: RegExpExecArray | null;
  let n = 0;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${n++}`;
    const [, code, bold, italic, linkText, href] = match;

    if (code !== undefined) {
      nodes.push(<code key={key}>{code}</code>);
    } else if (bold !== undefined) {
      nodes.push(<strong key={key}>{renderInline(bold, key)}</strong>);
    } else if (italic !== undefined) {
      nodes.push(<em key={key}>{renderInline(italic, key)}</em>);
    } else if (linkText !== undefined && href !== undefined) {
      nodes.push(renderLink(href, renderInline(linkText, key), key));
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderLink(href: string, children: ReactNode, key: string): ReactNode {
  if (!SAFE_URL_RE.test(href)) {
    // Unsafe or unknown scheme (e.g. javascript:) — render as plain text.
    return <span key={key}>{children}</span>;
  }
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link key={key} href={href}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a key={key} href={href}>
        {children}
      </a>
    );
  }
  return (
    <a key={key} href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/* ----------------------------------------------------------------- blocks */

function renderBlock(block: Block, index: number): ReactNode {
  const key = `b-${index}`;
  switch (block.type) {
    case "heading": {
      const Tag = block.level === 2 ? "h2" : "h3";
      return (
        <Tag key={key} id={block.id} className="group relative">
          {renderInline(block.text, key)}
          <a
            href={`#${block.id}`}
            className="ml-2 inline-block !text-muted !no-underline opacity-0 transition-opacity hover:!text-accent focus-visible:opacity-100 group-hover:opacity-100"
            aria-label={`Link to section: ${stripInline(block.text)}`}
          >
            #
          </a>
        </Tag>
      );
    }
    case "paragraph":
      return <p key={key}>{renderInline(block.text, key)}</p>;
    case "list": {
      const items = block.items.map((item, j) => <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>);
      return block.ordered ? (
        <ol key={key} start={block.start !== 1 ? block.start : undefined}>
          {items}
        </ol>
      ) : (
        <ul key={key}>{items}</ul>
      );
    }
    case "quote":
      return (
        <blockquote key={key}>
          {block.paragraphs.map((p, j) => (
            <p key={`${key}-${j}`} className={j === 0 ? "!mt-0" : undefined}>
              {renderInline(p, `${key}-${j}`)}
            </p>
          ))}
        </blockquote>
      );
    case "code":
      return <CodeBlock key={key} code={block.code} language={block.lang} />;
    case "hr":
      return <hr key={key} />;
  }
}

/* ------------------------------------------------------------------- API */

/** Renders the supported markdown subset to React nodes. Wrap the result in `.prose-content`. */
export function renderMarkdown(content: string): ReactNode {
  return parseBlocks(content).map(renderBlock);
}

/** Returns the h2/h3 headings (with the same ids `renderMarkdown` assigns) for a table of contents. */
export function extractHeadings(content: string): MarkdownHeading[] {
  return parseBlocks(content)
    .filter((b): b is Extract<Block, { type: "heading" }> => b.type === "heading")
    .map((b) => ({ id: b.id, text: stripInline(b.text), level: b.level }));
}

/** Plain-text version of the content (no code blocks), useful for search and feeds. */
export function markdownToPlainText(content: string): string {
  return parseBlocks(content)
    .map((b) => {
      switch (b.type) {
        case "heading":
        case "paragraph":
          return stripInline(b.text);
        case "list":
          return b.items.map(stripInline).join(" ");
        case "quote":
          return b.paragraphs.map(stripInline).join(" ");
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}
