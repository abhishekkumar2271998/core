export type Alignment = "left" | "center" | "right" | "none";

export type Delimiter = "auto" | "," | "\t" | ";" | "|";

export interface TableData {
  header: string[];
  rows: string[][];
}

/** Picks whichever candidate appears most consistently in the first line. */
export function detectDelimiter(input: string): Exclude<Delimiter, "auto"> {
  const first = input.split("\n").find((l) => l.trim()) ?? "";
  const candidates: Exclude<Delimiter, "auto">[] = ["\t", ",", ";", "|"];
  let best: Exclude<Delimiter, "auto"> = ",";
  let bestCount = 0;
  for (const c of candidates) {
    const count = first.split(c).length - 1;
    if (count > bestCount) {
      best = c;
      bestCount = count;
    }
  }
  return best;
}

/** RFC 4180-ish parser: handles quoted fields, escaped quotes and newlines inside quotes. */
export function parseDelimited(input: string, delimiter: Exclude<Delimiter, "auto">): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"' && field === "") {
      quoted = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && input[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  // Pipe-delimited input usually comes from an existing markdown table.
  const cleaned = delimiter === "|" ? rows.map(stripPipeEdges).filter((r) => !isSeparatorRow(r)) : rows;
  return cleaned.map((r) => r.map((c) => c.trim())).filter((r) => r.some(Boolean));
}

function stripPipeEdges(row: string[]): string[] {
  const out = [...row];
  if (out.length && out[0].trim() === "") out.shift();
  if (out.length && out[out.length - 1].trim() === "") out.pop();
  return out;
}

function isSeparatorRow(row: string[]): boolean {
  return row.length > 0 && row.every((c) => /^\s*:?-{3,}:?\s*$/.test(c));
}

export function toTableData(cells: string[][], hasHeader: boolean): TableData {
  const width = Math.max(0, ...cells.map((r) => r.length));
  const pad = (r: string[]) => [...r, ...Array<string>(width - r.length).fill("")];
  if (!cells.length) return { header: [], rows: [] };
  if (hasHeader) return { header: pad(cells[0]), rows: cells.slice(1).map(pad) };
  return { header: Array.from({ length: width }, (_, i) => `Column ${i + 1}`), rows: cells.map(pad) };
}

const escapeCell = (cell: string) => cell.replace(/\|/g, "\\|").replace(/\n/g, "<br>");

function separator(alignment: Alignment, width: number): string {
  const dashes = "-".repeat(Math.max(3, width - (alignment === "center" ? 2 : alignment === "none" ? 0 : 1)));
  switch (alignment) {
    case "left":
      return `:${dashes}`;
    case "right":
      return `${dashes}:`;
    case "center":
      return `:${dashes}:`;
    default:
      return dashes;
  }
}

function padCell(cell: string, width: number, alignment: Alignment): string {
  const gap = width - cell.length;
  if (gap <= 0) return cell;
  if (alignment === "right") return " ".repeat(gap) + cell;
  if (alignment === "center") {
    const left = Math.floor(gap / 2);
    return " ".repeat(left) + cell + " ".repeat(gap - left);
  }
  return cell + " ".repeat(gap);
}

/** Renders GitHub-flavoured markdown. `pretty` pads columns so the source lines up. */
export function toMarkdownTable(data: TableData, alignments: Alignment[], pretty = true): string {
  if (!data.header.length) return "";
  const header = data.header.map(escapeCell);
  const rows = data.rows.map((r) => r.map(escapeCell));
  const align = (i: number) => alignments[i] ?? "none";
  const widths = header.map((h, i) => (pretty ? Math.max(3, h.length, ...rows.map((r) => r[i].length)) : 0));
  const line = (cells: string[]) =>
    `| ${cells.map((c, i) => (pretty ? padCell(c, widths[i], align(i)) : c)).join(" | ")} |`;

  return [
    line(header),
    `| ${header.map((_, i) => separator(align(i), widths[i])).join(" | ")} |`,
    ...rows.map(line),
  ].join("\n");
}
