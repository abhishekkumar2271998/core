"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CASE_STYLES, convertCase, type CaseStyle } from "@/lib/tools/case";
import { cn } from "@/lib/utils";
import { CopyButton, ToolPanel, ToolShell, ToolTextarea } from "./ToolShell";

export function CaseConverter() {
  const [input, setInput] = useState("getUserProfileById\nHTTPRequestHandler\nmax_retry_count");
  const [selected, setSelected] = useState<CaseStyle>("snake");

  const outputs = useMemo(
    () => CASE_STYLES.map((s) => ({ ...s, value: convertCase(input, s.id) })),
    [input],
  );
  const current = outputs.find((o) => o.id === selected) ?? outputs[0];

  return (
    <ToolShell>
      <div className="grid gap-5 lg:grid-cols-2">
        <ToolPanel
          label="Input"
          htmlFor="case-input"
          hint="One identifier or phrase per line."
          actions={
            <Button variant="ghost" size="sm" onClick={() => setInput("")} disabled={!input}>
              Clear
            </Button>
          }
        >
          <ToolTextarea id="case-input" rows={8} value={input} onChange={(e) => setInput(e.target.value)} />
        </ToolPanel>
        <ToolPanel label={current.label} htmlFor="case-output" actions={<CopyButton value={current.value} />}>
          <ToolTextarea id="case-output" rows={8} value={current.value} readOnly />
        </ToolPanel>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5" role="radiogroup" aria-label="Case style">
        {outputs.map((o) => {
          const active = o.id === selected;
          const preview = o.value.split("\n")[0] || o.example;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(o.id)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left transition",
                active ? "border-accent/50 bg-accent/10" : "bg-bg hover:border-fg/20",
              )}
            >
              <span className={cn("block text-xs font-medium", active ? "text-accent" : "text-muted")}>{o.label}</span>
              <span className="mt-0.5 block truncate font-mono text-sm text-fg">{preview}</span>
            </button>
          );
        })}
      </div>
    </ToolShell>
  );
}
