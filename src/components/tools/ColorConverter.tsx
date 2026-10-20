"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import {
  contrastRatio,
  parseColor,
  toHex,
  toHslString,
  toRgbString,
  wcagChecks,
  type Rgb,
} from "@/lib/tools/color";
import { cn } from "@/lib/utils";
import { OutputRow, ToolError, ToolInput, ToolPanel, ToolShell } from "./ToolShell";

function Swatch({ color }: { color: Rgb | null }) {
  return (
    <span
      aria-hidden
      className="h-8 w-8 shrink-0 rounded-lg border"
      style={{ background: color ? toRgbString(color) : "transparent" }}
    />
  );
}

/** Text input paired with a native picker; the picker only speaks opaque 6-digit hex. */
function ColorField({
  id,
  label,
  value,
  onChange,
  parsed,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  parsed: Rgb | null;
}) {
  return (
    <ToolPanel label={label} htmlFor={id}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={parsed ? toHex({ ...parsed, a: 1 }) : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border bg-bg p-1"
        />
        <ToolInput id={id} value={value} onChange={(e) => onChange(e.target.value)} invalid={!parsed} />
      </div>
    </ToolPanel>
  );
}

export function ColorConverter() {
  const [fgInput, setFgInput] = useState("#6366f1");
  const [bgInput, setBgInput] = useState("#ffffff");

  const fg = useMemo(() => parseColor(fgInput), [fgInput]);
  const bg = useMemo(() => parseColor(bgInput), [bgInput]);
  const fgColor = fg.ok ? fg.value : null;
  const bgColor = bg.ok ? bg.value : null;

  const ratio = fgColor && bgColor ? contrastRatio(fgColor, bgColor) : null;
  const checks = ratio !== null ? wcagChecks(ratio) : [];

  const swap = () => {
    setFgInput(bgInput);
    setBgInput(fgInput);
  };

  return (
    <ToolShell>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <ColorField id="color-fg" label="Color / text" value={fgInput} onChange={setFgInput} parsed={fgColor} />
          <ToolError message={fg.ok ? null : fg.error} />
          {fgColor ? (
            <div className="grid gap-2">
              <OutputRow label="Hex" value={toHex(fgColor)} leading={<Swatch color={fgColor} />} />
              <OutputRow label="RGB" value={toRgbString(fgColor)} leading={<Swatch color={fgColor} />} />
              <OutputRow label="HSL" value={toHslString(fgColor)} leading={<Swatch color={fgColor} />} />
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <ColorField id="color-bg" label="Background" value={bgInput} onChange={setBgInput} parsed={bgColor} />
          <ToolError message={bg.ok ? null : bg.error} />
          {bgColor ? (
            <div className="grid gap-2">
              <OutputRow label="Hex" value={toHex(bgColor)} leading={<Swatch color={bgColor} />} />
              <OutputRow label="RGB" value={toRgbString(bgColor)} leading={<Swatch color={bgColor} />} />
              <OutputRow label="HSL" value={toHslString(bgColor)} leading={<Swatch color={bgColor} />} />
            </div>
          ) : null}
        </div>
      </div>

      {fgColor && bgColor && ratio !== null ? (
        <section aria-labelledby="contrast-title" className="grid gap-5 border-t pt-5 lg:grid-cols-[1fr_1fr]">
          <div
            className="flex flex-col justify-center rounded-xl border p-6"
            style={{ background: toRgbString(bgColor), color: toRgbString(fgColor) }}
          >
            <p className="text-2xl font-semibold">Large heading text</p>
            <p className="mt-2 text-sm">Body copy at regular size should stay comfortable to read.</p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 id="contrast-title" className="text-sm font-medium text-fg">
                Contrast ratio
              </h3>
              <button
                type="button"
                onClick={swap}
                className="inline-flex items-center gap-1 text-xs text-muted transition hover:text-fg"
              >
                <Icon name="arrow-left" className="h-3.5 w-3.5" />
                Swap colors
              </button>
            </div>
            <p className="mt-1 font-mono text-4xl font-semibold tracking-tight text-fg">
              {ratio.toFixed(2)}
              <span className="text-xl text-muted">:1</span>
            </p>
            <ul className="mt-4 grid gap-1.5">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full",
                      c.pass ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
                    )}
                  >
                    <Icon name={c.pass ? "check" : "close"} className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  <span className="text-fg">{c.label}</span>
                  <span className="ml-auto font-mono text-xs text-muted">≥ {c.threshold}:1</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </ToolShell>
  );
}
