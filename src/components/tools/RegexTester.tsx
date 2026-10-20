"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { REGEX_FLAGS, REGEX_PRESETS, replaceRegex, runRegex } from "@/lib/tools/regex";
import { cn, pluralize } from "@/lib/utils";
import { CopyButton, ToolError, ToolInput, ToolPanel, ToolShell, ToolTextarea } from "./ToolShell";

/** Alternating highlight colours so adjacent matches stay distinguishable. */
const HIGHLIGHTS = ["bg-accent/25 text-fg", "bg-warning/30 text-fg"];

export function RegexTester() {
  const initial = REGEX_PRESETS[2];
  const [pattern, setPattern] = useState(initial.pattern);
  const [flags, setFlags] = useState(initial.flags);
  const [text, setText] = useState(initial.sample);
  const [replacement, setReplacement] = useState("$<day>/$<month>/$<year>");
  const [active, setActive] = useState<number | null>(null);

  const result = useMemo(() => runRegex(pattern, flags, text), [pattern, flags, text]);
  const replaced = useMemo(
    () => (pattern ? replaceRegex(pattern, flags, text, replacement) : null),
    [pattern, flags, text, replacement],
  );

  const toggleFlag = (flag: string) =>
    setFlags((f) => (f.includes(flag) ? f.replace(flag, "") : [...f, flag].sort().join("")));

  const loadPreset = (index: number) => {
    const preset = REGEX_PRESETS[index];
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setText(preset.sample);
    setActive(null);
  };

  return (
    <ToolShell
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">Presets:</span>
          {REGEX_PRESETS.map((p, i) => (
            <Button key={p.name} variant="outline" size="sm" onClick={() => loadPreset(i)}>
              {p.name}
            </Button>
          ))}
        </div>
      }
    >
      <ToolPanel label="Pattern" htmlFor="regex-pattern">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-muted">/</span>
            <ToolInput
              id="regex-pattern"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              invalid={!result.ok}
              className="pl-7 pr-16"
              placeholder="[a-z]+"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-muted">
              /{flags}
            </span>
          </div>
          <CopyButton value={`/${pattern}/${flags}`} compact label="Copy regex literal" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Flags">
          {REGEX_FLAGS.map(({ flag, label, description }) => {
            const on = flags.includes(flag);
            return (
              <button
                key={flag}
                type="button"
                title={description}
                aria-pressed={on}
                onClick={() => toggleFlag(flag)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 font-mono text-xs transition",
                  on ? "border-accent/50 bg-accent/10 text-accent" : "text-muted hover:text-fg",
                )}
              >
                {flag} <span className="font-sans">{label}</span>
              </button>
            );
          })}
        </div>
      </ToolPanel>

      <ToolError message={result.ok ? null : result.error} />

      <div className="grid gap-5 lg:grid-cols-2">
        <ToolPanel label="Test string" htmlFor="regex-text">
          <ToolTextarea id="regex-text" rows={8} value={text} onChange={(e) => setText(e.target.value)} />
        </ToolPanel>
        <ToolPanel
          label="Highlighted"
          actions={result.ok ? <Badge variant={result.value.matches.length ? "accent" : "default"}>
            {pluralize(result.value.matches.length, "match", "matches")}
            {result.value.truncated ? "+" : ""}
          </Badge> : null}
        >
          <div
            aria-live="polite"
            className="min-h-[13.5rem] whitespace-pre-wrap break-words rounded-xl border bg-bg px-3.5 py-2.5 font-mono text-sm leading-relaxed"
          >
            {result.ok
              ? result.value.segments.map((s, i) =>
                  s.match === null ? (
                    <span key={i}>{s.text}</span>
                  ) : (
                    <mark
                      key={i}
                      onMouseEnter={() => setActive(s.match)}
                      onMouseLeave={() => setActive(null)}
                      className={cn(
                        "rounded-sm px-px",
                        HIGHLIGHTS[s.match % HIGHLIGHTS.length],
                        active === s.match && "ring-2 ring-accent",
                      )}
                    >
                      {s.text}
                    </mark>
                  ),
                )
              : text}
          </div>
        </ToolPanel>
      </div>

      {result.ok && result.value.matches.length ? (
        <ToolPanel label="Matches">
          <ol className="max-h-72 divide-y overflow-y-auto rounded-xl border text-sm">
            {result.value.matches.map((m, i) => (
              <li
                key={`${m.index}-${i}`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                className={cn("px-3.5 py-2", active === i && "bg-surface-2")}
              >
                <div className="flex items-baseline gap-3">
                  <span className="w-8 shrink-0 font-mono text-xs text-muted">#{i + 1}</span>
                  <code className="break-all font-mono text-fg">{m.value || <em className="text-muted">empty</em>}</code>
                  <span className="ml-auto shrink-0 font-mono text-xs text-muted">
                    {m.index}–{m.end}
                  </span>
                </div>
                {m.groups.length ? (
                  <dl className="ml-11 mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
                    {m.groups.map((g, gi) => (
                      <div key={`p${gi}`} className="flex gap-1.5">
                        <dt className="text-muted">${gi + 1}</dt>
                        <dd className="text-accent">{g ?? "undefined"}</dd>
                      </div>
                    ))}
                    {Object.entries(m.named).map(([name, g]) => (
                      <div key={`n${name}`} className="flex gap-1.5">
                        <dt className="text-muted">&lt;{name}&gt;</dt>
                        <dd className="text-accent">{g ?? "undefined"}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </li>
            ))}
          </ol>
        </ToolPanel>
      ) : null}

      <div className="grid gap-5 border-t pt-5 lg:grid-cols-2">
        <ToolPanel label="Replace with" htmlFor="regex-replacement" hint="Supports $1, $<name>, $& and $$.">
          <ToolInput id="regex-replacement" value={replacement} onChange={(e) => setReplacement(e.target.value)} />
        </ToolPanel>
        <ToolPanel
          label="Replacement result"
          htmlFor="regex-replaced"
          actions={<CopyButton value={replaced?.ok ? replaced.value : ""} compact label="Copy result" />}
        >
          <ToolTextarea id="regex-replaced" rows={3} readOnly value={replaced?.ok ? replaced.value : ""} />
        </ToolPanel>
      </div>
    </ToolShell>
  );
}
