"use client";

import { useMemo, useState } from "react";
import { decodeUrl, encodeUrl, parseUrl, type UrlEncodeMode } from "@/lib/tools/url";
import { CopyButton, OutputRow, Segmented, ToolError, ToolPanel, ToolShell, ToolTextarea } from "./ToolShell";

type Direction = "encode" | "decode";

export function UrlEncoder() {
  const [direction, setDirection] = useState<Direction>("encode");
  const [mode, setMode] = useState<UrlEncodeMode>("component");
  const [input, setInput] = useState("https://example.com/search?q=next.js & react&lang=en#results");

  const result = useMemo(
    () => (direction === "encode" ? { ok: true as const, value: encodeUrl(input, mode) } : decodeUrl(input, mode)),
    [direction, mode, input],
  );
  const output = result.ok ? result.value : "";

  // Inspect whichever side holds the human-readable URL.
  const parsed = useMemo(() => parseUrl(direction === "encode" ? input : output), [direction, input, output]);

  return (
    <ToolShell
      toolbar={
        <>
          <Segmented
            label="Direction"
            value={direction}
            onChange={setDirection}
            options={[
              { value: "encode", label: "Encode" },
              { value: "decode", label: "Decode" },
            ]}
          />
          <Segmented
            label="Encoding mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "component", label: "Component" },
              { value: "uri", label: "Full URI" },
              { value: "form", label: "Form data" },
            ]}
          />
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <ToolPanel label="Input" htmlFor="url-input">
          <ToolTextarea
            id="url-input"
            rows={6}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            invalid={!result.ok}
          />
        </ToolPanel>
        <ToolPanel label="Output" htmlFor="url-output" actions={<CopyButton value={output} />}>
          <ToolTextarea id="url-output" rows={6} value={output} readOnly />
        </ToolPanel>
      </div>
      <ToolError message={result.ok ? null : result.error} />

      {parsed ? (
        <section aria-labelledby="url-parts" className="border-t pt-5">
          <h3 id="url-parts" className="mb-3 text-sm font-medium text-fg">
            URL breakdown
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <OutputRow label="Protocol" value={parsed.protocol} />
            <OutputRow label="Host" value={parsed.host} />
            <OutputRow label="Path" value={parsed.pathname} />
            <OutputRow label="Hash" value={parsed.hash} />
          </div>
          {parsed.params.length ? (
            <div className="mt-4 overflow-x-auto rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-2 text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-3.5 py-2 font-medium">Parameter</th>
                    <th className="px-3.5 py-2 font-medium">Decoded value</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono">
                  {parsed.params.map(([key, value], i) => (
                    <tr key={`${key}-${i}`}>
                      <td className="px-3.5 py-2 text-accent">{key}</td>
                      <td className="break-all px-3.5 py-2">{value || <span className="text-muted">(empty)</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ) : null}
    </ToolShell>
  );
}
