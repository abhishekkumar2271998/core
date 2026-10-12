"use client";

import { Icon } from "@/components/icons/Icon";
import { useCopyToClipboard } from "@/hooks";
import { cn } from "@/lib/utils";

/** Small client island: copies an email address and confirms inline. */
export function CopyEmailButton({ email, className }: { email: string; className?: string }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => void copy(email)}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border bg-surface px-3 text-xs font-medium transition",
        copied ? "border-success/40 text-success" : "text-muted hover:border-fg/20 hover:text-fg",
        className,
      )}
      aria-label={copied ? "Email copied to clipboard" : `Copy ${email} to clipboard`}
    >
      <Icon name={copied ? "check" : "copy"} className="h-3.5 w-3.5" />
      <span aria-hidden>{copied ? "Copied" : "Copy"}</span>
      <span className="sr-only" role="status">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}
