"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { clamp } from "@/lib/utils";
import { generateUuids, inspectUuid, type UuidOptions } from "@/lib/tools/uuid";
import { CopyButton, ToolCheckbox, ToolInput, ToolPanel, ToolShell, ToolTextarea } from "./ToolShell";

const MAX_COUNT = 500;

export function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [options, setOptions] = useState<UuidOptions>({ uppercase: false, hyphens: true, braces: false });
  // Generated after mount: crypto output must not differ between server and client renders.
  const [uuids, setUuids] = useState<string[]>([]);
  const [inspect, setInspect] = useState("");

  const regenerate = useCallback(() => setUuids(generateUuids(count, options)), [count, options]);
  useEffect(regenerate, [regenerate]);

  const setOption = (key: keyof UuidOptions) => (value: boolean) => setOptions((o) => ({ ...o, [key]: value }));
  const inspection = useMemo(() => (inspect.trim() ? inspectUuid(inspect) : null), [inspect]);
  const output = uuids.join("\n");

  return (
    <ToolShell
      toolbar={
        <>
          <label className="flex items-center gap-2 text-sm text-muted">
            Count
            <ToolInput
              type="number"
              min={1}
              max={MAX_COUNT}
              value={count}
              onChange={(e) => setCount(clamp(Number(e.target.value) || 1, 1, MAX_COUNT))}
              className="w-20"
            />
          </label>
          <ToolCheckbox label="Uppercase" checked={options.uppercase} onChange={setOption("uppercase")} />
          <ToolCheckbox label="Hyphens" checked={options.hyphens} onChange={setOption("hyphens")} />
          <ToolCheckbox label="Braces" checked={options.braces} onChange={setOption("braces")} />
          <Button size="sm" iconLeft="sparkles" onClick={regenerate} className="ml-auto">
            Generate
          </Button>
        </>
      }
    >
      <ToolPanel label={`${uuids.length} UUID${uuids.length === 1 ? "" : "s"}`} htmlFor="uuid-output" actions={<CopyButton value={output} label="Copy all" />}>
        <ToolTextarea id="uuid-output" rows={Math.min(12, Math.max(4, uuids.length))} value={output} readOnly />
      </ToolPanel>

      <div className="border-t pt-5">
        <ToolPanel label="Inspect a UUID" htmlFor="uuid-inspect">
          <ToolInput
            id="uuid-inspect"
            value={inspect}
            onChange={(e) => setInspect(e.target.value)}
            invalid={inspection ? !inspection.valid : false}
            placeholder="f47ac10b-58cc-4372-a567-0e02b2c3d479"
          />
        </ToolPanel>
        {inspection ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {inspection.valid ? (
              <>
                <Badge variant="success">Valid UUID</Badge>
                {inspection.nil ? <Badge>Nil UUID</Badge> : <Badge variant="accent">Version {inspection.version}</Badge>}
                {!inspection.nil ? <Badge variant="outline">Variant: {inspection.variant}</Badge> : null}
              </>
            ) : (
              <Badge variant="danger">Not a UUID</Badge>
            )}
          </div>
        ) : null}
      </div>
    </ToolShell>
  );
}
