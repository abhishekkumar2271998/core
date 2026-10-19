"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { decodeBase64, encodeBase64 } from "@/lib/tools/base64";
import { byteLength } from "@/lib/tools/json";
import { CopyButton, Segmented, ToolCheckbox, ToolError, ToolPanel, ToolShell, ToolTextarea } from "./ToolShell";

type Direction = "encode" | "decode";

export function Base64Tool() {
  const [direction, setDirection] = useState<Direction>("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [input, setInput] = useState("Hello, world! 👋 Привет");

  const result = useMemo(() => {
    if (direction === "encode") return { ok: true as const, value: encodeBase64(input, { urlSafe }) };
    return decodeBase64(input);
  }, [direction, input, urlSafe]);
  const output = result.ok ? result.value : "";

  /** Feeds the output back in as input, flipping direction — handy for round-trip checks. */
  const swap = () => {
    if (!result.ok) return;
    setInput(output);
    setDirection((d) => (d === "encode" ? "decode" : "encode"));
  };

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
          {direction === "encode" ? (
            <ToolCheckbox
              label="URL-safe (base64url)"
              checked={urlSafe}
              onChange={setUrlSafe}
              title="Uses - and _ instead of + and / and omits padding"
            />
          ) : null}
          <Button variant="outline" size="sm" iconLeft="arrow-right" onClick={swap} disabled={!result.ok || !output}>
            Use output as input
          </Button>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <ToolPanel
          label={direction === "encode" ? "Text" : "Base64"}
          htmlFor="b64-input"
          hint={`${byteLength(input).toLocaleString()} bytes`}
        >
          <ToolTextarea
            id="b64-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            invalid={!result.ok}
            placeholder={direction === "encode" ? "Text to encode" : "Base64 to decode"}
          />
        </ToolPanel>
        <ToolPanel
          label={direction === "encode" ? "Base64" : "Text"}
          htmlFor="b64-output"
          actions={<CopyButton value={output} />}
          hint={`${byteLength(output).toLocaleString()} bytes`}
        >
          <ToolTextarea id="b64-output" value={output} readOnly />
        </ToolPanel>
      </div>
      <ToolError message={result.ok ? null : result.error} />
    </ToolShell>
  );
}
