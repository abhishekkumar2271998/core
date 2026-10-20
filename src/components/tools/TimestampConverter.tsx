"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { useNow } from "@/hooks";
import { formatTimestamp, parseTimestamp, toDatetimeLocal, type EpochUnit } from "@/lib/tools/timestamp";
import { CopyButton, OutputRow, Segmented, ToolError, ToolInput, ToolPanel, ToolShell } from "./ToolShell";

const ZONES = ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney"];

export function TimestampConverter() {
  const now = useNow(1000);
  const [input, setInput] = useState("");
  const [unit, setUnit] = useState<EpochUnit | "auto">("auto");
  const [zone, setZone] = useState("UTC");

  // Seed with the current time and the viewer's zone once mounted (avoids hydration mismatch).
  useEffect(() => {
    setInput(String(Math.floor(Date.now() / 1000)));
    setZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  }, []);

  const zones = useMemo(() => (ZONES.includes(zone) ? ZONES : [zone, ...ZONES]), [zone]);
  const parsed = useMemo(() => (input ? parseTimestamp(input, unit) : null), [input, unit]);
  const formats = parsed?.ok && now ? formatTimestamp(parsed.value.date, zone, now) : null;
  const nowSeconds = now ? String(Math.floor(now.getTime() / 1000)) : "";

  return (
    <ToolShell
      toolbar={
        <>
          <div className="flex items-center gap-2 text-sm text-muted">
            Now
            <code className="font-mono text-fg tabular-nums">{nowSeconds || "…"}</code>
            <CopyButton value={nowSeconds} compact label="Copy current timestamp" />
          </div>
          <Button variant="outline" size="sm" iconLeft="clock" onClick={() => setInput(nowSeconds)} disabled={!now}>
            Use now
          </Button>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <ToolPanel
          label="Timestamp or date"
          htmlFor="ts-input"
          hint={parsed?.ok ? `Interpreted as: ${parsed.value.detected}` : "Epoch seconds, milliseconds or ISO 8601"}
        >
          <ToolInput id="ts-input" value={input} onChange={(e) => setInput(e.target.value)} invalid={parsed ? !parsed.ok : false} />
          <div className="mt-3">
            <Segmented
              label="Epoch unit"
              value={unit}
              onChange={setUnit}
              options={[
                { value: "auto", label: "Auto" },
                { value: "seconds", label: "Seconds" },
                { value: "milliseconds", label: "Millis" },
              ]}
            />
          </div>
        </ToolPanel>

        <ToolPanel label="Or pick a date (local time)" htmlFor="ts-picker">
          <ToolInput
            id="ts-picker"
            type="datetime-local"
            step={1}
            value={parsed?.ok ? toDatetimeLocal(parsed.value.date) : ""}
            onChange={(e) => {
              const date = new Date(e.target.value);
              if (!Number.isNaN(date.getTime())) setInput(date.toISOString());
            }}
          />
          <label htmlFor="ts-zone" className="mt-3 block text-xs text-muted">
            Display timezone
          </label>
          <select
            id="ts-zone"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border bg-bg px-3 text-sm text-fg focus:border-accent/60 focus:outline-none"
          >
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </ToolPanel>
      </div>

      <ToolError message={parsed && !parsed.ok ? parsed.error : null} />

      {formats ? (
        <div className="border-t pt-5">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="accent">{formats.relative}</Badge>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <OutputRow label="Unix seconds" value={formats.seconds} />
            <OutputRow label="Unix milliseconds" value={formats.milliseconds} />
            <OutputRow label="ISO 8601" value={formats.iso} />
            <OutputRow label="RFC 7231 (UTC)" value={formats.utc} />
            <div className="sm:col-span-2">
              <OutputRow label={zone} value={formats.local} />
            </div>
          </div>
        </div>
      ) : null}
    </ToolShell>
  );
}
