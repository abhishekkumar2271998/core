"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import {
  detectDelimiter,
  parseDelimited,
  toMarkdownTable,
  toTableData,
  type Alignment,
  type Delimiter,
} from "@/lib/tools/markdownTable";
import { cn } from "@/lib/utils";
import { CopyButton, Segmented, ToolCheckbox, ToolPanel, ToolShell, ToolTextarea } from "./ToolShell";

const SAMPLE = `Tool,Category,Runs offline,Stars
JSON Formatter,Data,yes,128
"Regex Tester, live",Text,yes,96
Color Converter,Design,yes,74`;

const ALIGN_CYCLE: Alignment[] = ["none", "left", "center", "right"];
const ALIGN_LABEL: Record<Alignment, string> = { none: "default", left: "left", center: "center", right: "right" };

const alignClass: Record<Alignment, string> = {
  none: "text-left",
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function MarkdownTableGenerator() {
  const [input, setInput] = useState(SAMPLE);
  const [delimiter, setDelimiter] = useState<Delimiter>("auto");
  const [hasHeader, setHasHeader] = useState(true);
  const [pretty, setPretty] = useState(true);
  const [alignments, setAlignments] = useState<Alignment[]>([]);

  const resolved = delimiter === "auto" ? detectDelimiter(input) : delimiter;
  const data = useMemo(() => toTableData(parseDelimited(input, resolved), hasHeader), [input, resolved, hasHeader]);
  const markdown = useMemo(() => toMarkdownTable(data, alignments, pretty), [data, alignments, pretty]);

  const cycleAlignment = (col: number) =>
    setAlignments((prev) => {
      const next = [...prev];
      const current = next[col] ?? "none";
      next[col] = ALIGN_CYCLE[(ALIGN_CYCLE.indexOf(current) + 1) % ALIGN_CYCLE.length];
      return next;
    });

  return (
    <ToolShell
      toolbar={
        <>
          <Segmented
            label="Delimiter"
            value={delimiter}
            onChange={setDelimiter}
            options={[
              { value: "auto", label: "Auto" },
              { value: ",", label: "Comma" },
              { value: "\t", label: "Tab" },
              { value: ";", label: "Semicolon" },
              { value: "|", label: "Pipe" },
            ]}
          />
          <ToolCheckbox label="First row is header" checked={hasHeader} onChange={setHasHeader} />
          <ToolCheckbox label="Align columns" checked={pretty} onChange={setPretty} />
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <ToolPanel label="CSV / TSV input" htmlFor="md-input" hint={`${data.rows.length} rows × ${data.header.length} columns`}>
          <ToolTextarea id="md-input" rows={10} value={input} onChange={(e) => setInput(e.target.value)} />
        </ToolPanel>
        <ToolPanel label="Markdown" htmlFor="md-output" actions={<CopyButton value={markdown} />}>
          <ToolTextarea id="md-output" rows={10} value={markdown} readOnly className="whitespace-pre" wrap="off" />
        </ToolPanel>
      </div>

      {data.header.length ? (
        <ToolPanel label="Preview" hint="Click a column header to cycle its alignment.">
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-surface-2">
                <tr>
                  {data.header.map((h, i) => {
                    const align = alignments[i] ?? "none";
                    return (
                      <th key={i} className={cn("px-3.5 py-2 font-medium", alignClass[align])}>
                        <button
                          type="button"
                          onClick={() => cycleAlignment(i)}
                          title={`Alignment: ${ALIGN_LABEL[align]}`}
                          className="inline-flex items-center gap-1.5 hover:text-accent"
                        >
                          {h || <span className="text-muted">(empty)</span>}
                          <Icon name="list" className="h-3.5 w-3.5 text-muted" />
                          <span className="font-mono text-[10px] font-normal text-muted">{ALIGN_LABEL[align]}</span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c} className={cn("px-3.5 py-2 text-fg", alignClass[alignments[c] ?? "none"])}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ToolPanel>
      ) : null}
    </ToolShell>
  );
}
