"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/primitives";
import { decodeJwt, REGISTERED_CLAIMS, type JsonObject, type JwtTimeStatus } from "@/lib/tools/jwt";
import { relativeTime } from "@/lib/tools/timestamp";
import { CopyButton, ToolError, ToolPanel, ToolShell, ToolTextarea } from "./ToolShell";

// Expires in 2286, so the sample keeps showing as "valid".
const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.Nf1qNjDHmJdkoAYsGc_lNGMUDuE5vdqb3vZJ7XxwzSU";

const statusBadge: Record<JwtTimeStatus, { label: string; variant: "success" | "danger" | "warning" | "default" }> = {
  valid: { label: "Not expired", variant: "success" },
  expired: { label: "Expired", variant: "danger" },
  "not-yet-valid": { label: "Not yet valid", variant: "warning" },
  "no-expiry": { label: "No expiry claim", variant: "default" },
};

function ClaimsTable({ data }: { data: JsonObject }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm">
        <tbody className="divide-y">
          {Object.entries(data).map(([key, value]) => (
            <tr key={key} className="align-top">
              <th scope="row" className="w-36 px-3.5 py-2 font-mono font-medium text-accent">
                {key}
                {REGISTERED_CLAIMS[key] ? (
                  <span className="block font-sans text-[11px] font-normal text-muted">{REGISTERED_CLAIMS[key]}</span>
                ) : null}
              </th>
              <td className="break-all px-3.5 py-2 font-mono text-fg">
                {typeof value === "string" ? value : JSON.stringify(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function JwtDecoder() {
  const [token, setToken] = useState(SAMPLE);
  const result = useMemo(() => decodeJwt(token), [token]);
  const isEmpty = !token.trim();

  return (
    <ToolShell>
      <ToolPanel
        label="Encoded token"
        htmlFor="jwt-input"
        hint="A leading “Bearer ” is stripped automatically. Signatures are not verified."
      >
        <ToolTextarea
          id="jwt-input"
          rows={5}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          invalid={!result.ok && !isEmpty}
          placeholder="eyJhbGciOi..."
          className="break-all"
        />
      </ToolPanel>

      {!result.ok ? (
        <ToolError message={isEmpty ? null : result.error} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusBadge[result.value.status].variant}>{statusBadge[result.value.status].label}</Badge>
            {typeof result.value.header.alg === "string" ? (
              <Badge variant="outline">alg: {result.value.header.alg}</Badge>
            ) : null}
            {result.value.header.alg === "none" ? <Badge variant="danger">Unsigned token</Badge> : null}
          </div>

          {result.value.times.length ? (
            <ul className="grid gap-2 sm:grid-cols-3">
              {result.value.times.map((t) => (
                <li key={t.claim} className="rounded-xl border bg-bg px-3.5 py-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted">{t.label}</p>
                  <p className="mt-0.5 font-mono text-sm text-fg">{t.date.toISOString()}</p>
                  <p className="text-xs text-muted">{relativeTime(t.date)}</p>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <ToolPanel
              label="Header"
              actions={<CopyButton value={JSON.stringify(result.value.header, null, 2)} compact label="Copy header" />}
            >
              <ClaimsTable data={result.value.header} />
            </ToolPanel>
            <ToolPanel
              label="Payload"
              actions={<CopyButton value={JSON.stringify(result.value.payload, null, 2)} compact label="Copy payload" />}
            >
              <ClaimsTable data={result.value.payload} />
            </ToolPanel>
          </div>

          <ToolPanel label="Signature">
            <p className="break-all rounded-xl border bg-bg px-3.5 py-2.5 font-mono text-xs text-muted">
              {result.value.signature || "(empty)"}
            </p>
          </ToolPanel>
        </>
      )}
    </ToolShell>
  );
}
