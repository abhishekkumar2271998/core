"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { formatJson, minifyJson, type JsonIndent } from "@/lib/tools/json";
import { CopyButton, Segmented, ToolCheckbox, ToolError, ToolPanel, ToolShell, ToolTextarea } from "./ToolShell";

const SAMPLE = `{"name":"portfolio","version":"1.0.0","private":true,"tags":["next","react","tailwind"],"author":{"name":"Ada","links":{"github":"https://github.com/ada"}},"stars":42}`;

type Mode = "format" | "minify";

export function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE);
  const [mode, setMode] = useState<Mode>("format");
  const [indent, setIndent] = useState<JsonIndent>(2);
  const [sortKeys, setSortKeys] = useState(false);

  const result = useMemo(
    () => (mode === "minify" ? minifyJson(input) : formatJson(input, { indent, sortKeys })),
    [input, mode, indent, sortKeys],
  );
  const output = result.ok ? result.value.output : "";
  const isEmpty = !input.trim();

  return (
    <ToolShell
      toolbar={
        <>
          <Segmented
            label="Mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "format", label: "Format" },
              { value: "minify", label: "Minify" },
            ]}
          />
          {mode === "format" ? (
            <>
              <Segmented
                label="Indentation"
                value={String(indent) as "2" | "4" | "tab"}
                onChange={(v) => setIndent(v === "tab" ? "tab" : (Number(v) as 2 | 4))}
                options={[
                  { value: "2", label: "2 spaces" },
                  { value: "4", label: "4 spaces" },
                  { value: "tab", label: "Tabs" },
                ]}
              />
              <ToolCheckbox label="Sort keys" checked={sortKeys} onChange={setSortKeys} />
            </>
          ) : null}
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <ToolPanel
          label="Input"
          htmlFor="json-input"
          actions={
            <Button variant="ghost" size="sm" onClick={() => setInput("")} disabled={isEmpty}>
              Clear
            </Button>
          }
        >
          <ToolTextarea
            id="json-input"
            rows={16}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            invalid={!result.ok && !isEmpty}
            placeholder='{"paste": "JSON here"}'
          />
        </ToolPanel>

        <ToolPanel label="Output" htmlFor="json-output" actions={<CopyButton value={output} />}>
          <ToolTextarea id="json-output" rows={16} value={output} readOnly placeholder="Formatted JSON appears here" />
        </ToolPanel>
      </div>

      {result.ok ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">Valid JSON</Badge>
          <Badge>{result.value.stats.keys} keys</Badge>
          <Badge>depth {result.value.stats.depth}</Badge>
          <Badge>{result.value.stats.bytes.toLocaleString()} bytes</Badge>
        </div>
      ) : (
        <ToolError message={isEmpty ? null : result.error} />
      )}
    </ToolShell>
  );
}
