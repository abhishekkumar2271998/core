"use client";

import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks";
import { Icon } from "@/components/icons/Icon";
import { buttonClasses } from "./Button";

interface CopyButtonProps {
  value: string;
  /** Accessible label; also shown as text when `showLabel` is set. */
  label?: string;
  showLabel?: boolean;
  variant?: "ghost" | "outline" | "secondary";
  className?: string;
  onCopied?: () => void;
}

/** Copies `value` to the clipboard and confirms via icon swap + a polite live region. */
export function CopyButton({
  value,
  label = "Copy",
  showLabel,
  variant = "ghost",
  className,
  onCopied,
}: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copy(value)) onCopied?.();
      }}
      aria-label={showLabel ? undefined : label}
      className={buttonClasses({ variant, size: showLabel ? "sm" : "icon", className: cn(copied && "text-success", className) })}
    >
      <Icon name={copied ? "check" : "copy"} className="h-4 w-4" />
      {showLabel ? <span>{copied ? "Copied" : label}</span> : null}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}
