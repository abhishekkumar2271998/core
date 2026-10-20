"use client";

import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useControllableState } from "./internal";

interface SwitchProps extends Omit<ComponentPropsWithoutRef<"button">, "onChange" | "value" | "defaultValue"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  hideLabel?: boolean;
  size?: "sm" | "md";
  /** Submits "on" under this name when used inside a <form>. */
  name?: string;
}

const sizes = {
  sm: { track: "h-5 w-9", thumb: "h-4 w-4", on: "translate-x-4" },
  md: { track: "h-6 w-11", thumb: "h-5 w-5", on: "translate-x-5" },
};

export function Switch({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  label,
  description,
  hideLabel,
  size = "md",
  name,
  id: idProp,
  disabled,
  className,
  ...props
}: SwitchProps) {
  const [checked, setChecked] = useControllableState(checkedProp, defaultChecked, onCheckedChange);
  const generated = useId();
  const id = idProp ?? generated;
  const s = sizes[size];

  return (
    <div className={cn("flex items-start justify-between gap-4", disabled && "opacity-50", className)}>
      <div className={cn("grid gap-0.5", hideLabel && "sr-only")}>
        <label htmlFor={id} className={cn("text-sm font-medium text-fg", !disabled && "cursor-pointer")}>
          {label}
        </label>
        {description ? (
          <p id={`${id}-description`} className="text-sm text-muted">
            {description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-describedby={description ? `${id}-description` : undefined}
        disabled={disabled}
        onClick={() => setChecked(!checked)}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 disabled:cursor-not-allowed",
          checked ? "bg-accent" : "bg-border",
          s.track,
        )}
        {...props}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none inline-block rounded-full bg-white shadow-sm transition-transform duration-200",
            s.thumb,
            checked ? s.on : "translate-x-0",
          )}
        />
      </button>
      {name && checked ? <input type="hidden" name={name} value="on" /> : null}
    </div>
  );
}
