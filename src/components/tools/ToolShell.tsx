"use client";

import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui/Button";
import { useCopyToClipboard } from "@/hooks";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------- ToolShell */

interface ToolShellProps {
  /** Mode switches and options rendered above the panels. */
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Common frame for every tool: optional toolbar, then the tool's panels. */
export function ToolShell({ toolbar, children, className }: ToolShellProps) {
  return (
    <div className={cn("rounded-2xl border bg-surface", className)}>
      {toolbar ? (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b px-4 py-3 sm:px-5">{toolbar}</div>
      ) : null}
      <div className="space-y-5 p-4 sm:p-5">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------- ToolPanel */

interface ToolPanelProps {
  label: string;
  htmlFor?: string;
  /** Right-aligned controls in the panel header, e.g. a copy button. */
  actions?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ToolPanel({ label, htmlFor, actions, hint, children, className }: ToolPanelProps) {
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <div className="mb-2 flex min-h-8 items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-muted">
          {label}
        </label>
        {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
      </div>
      {children}
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------- CopyButton */

interface CopyButtonProps {
  value: string;
  label?: string;
  /** Icon-only variant for tight rows. */
  compact?: boolean;
  className?: string;
}

export function CopyButton({ value, label = "Copy", compact, className }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();
  const disabled = !value;

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => copy(value)}
        disabled={disabled}
        aria-label={copied ? "Copied" : `${label} to clipboard`}
        className={cn(
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-surface-2 hover:text-fg disabled:opacity-40",
          copied && "text-success hover:text-success",
          className,
        )}
      >
        <Icon name={copied ? "check" : "copy"} className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copy(value)}
      disabled={disabled}
      iconLeft={copied ? "check" : "copy"}
      className={cn(copied && "text-success hover:text-success", className)}
    >
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </Button>
  );
}

/* -------------------------------------------------------------- ToolError */

export function ToolError({ message, className }: { message: string | null | undefined; className?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-sm text-danger",
        className,
      )}
    >
      <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="min-w-0 break-words">{message}</p>
    </div>
  );
}

/* ---------------------------------------------------------- Text controls */

const fieldBase =
  "w-full rounded-xl border bg-bg px-3.5 py-2.5 font-mono text-sm text-fg placeholder:text-muted/60 transition focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20";

interface ToolTextareaProps extends ComponentPropsWithoutRef<"textarea"> {
  invalid?: boolean;
}

export function ToolTextarea({ className, invalid, rows = 10, ...props }: ToolTextareaProps) {
  return (
    <textarea
      rows={rows}
      spellCheck={false}
      autoCapitalize="off"
      autoComplete="off"
      aria-invalid={invalid || undefined}
      className={cn(fieldBase, "min-h-24 resize-y leading-relaxed", invalid && "border-danger/50", className)}
      {...props}
    />
  );
}

interface ToolInputProps extends ComponentPropsWithoutRef<"input"> {
  invalid?: boolean;
}

export function ToolInput({ className, invalid, ...props }: ToolInputProps) {
  return (
    <input
      spellCheck={false}
      autoCapitalize="off"
      autoComplete="off"
      aria-invalid={invalid || undefined}
      className={cn(fieldBase, "h-10 py-0", invalid && "border-danger/50", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------- Segmented */

interface SegmentedProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** Accessible radio group styled as a pill switch. */
export function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  const name = useId();
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border bg-surface-2 p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <label
            key={o.value}
            className={cn(
              "cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40",
              active ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={active}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------- Checkbox */

interface ToolCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  title?: string;
}

export function ToolCheckbox({ label, checked, onChange, title }: ToolCheckboxProps) {
  return (
    <label title={title} className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border accent-[rgb(var(--accent))]"
      />
      {label}
    </label>
  );
}

/* -------------------------------------------------------------- OutputRow */

interface OutputRowProps {
  label: string;
  value: string;
  /** Optional visual before the value, e.g. a color swatch. */
  leading?: ReactNode;
}

/** A labelled, read-only value with its own copy button. */
export function OutputRow({ label, value, leading }: OutputRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-bg px-3.5 py-2">
      {leading}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted">{label}</p>
        <p className="truncate font-mono text-sm text-fg" title={value}>
          {value || "—"}
        </p>
      </div>
      <CopyButton value={value} label={`Copy ${label}`} compact />
    </div>
  );
}
