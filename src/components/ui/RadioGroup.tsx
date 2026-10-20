"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useControllableState } from "./internal";

export interface RadioOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

interface RadioGroupProps {
  label: ReactNode;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  orientation?: "horizontal" | "vertical";
  /** Render options as selectable cards instead of plain radios. */
  variant?: "default" | "card";
  hideLabel?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * Native radio inputs in a fieldset: the browser provides arrow-key navigation,
 * a single tab stop and form submission.
 */
export function RadioGroup({
  label,
  options,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  name: nameProp,
  orientation = "vertical",
  variant = "default",
  hideLabel,
  required,
  className,
}: RadioGroupProps) {
  const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
  const generated = useId();
  const name = nameProp ?? generated;

  return (
    <fieldset className={className}>
      <legend className={cn("mb-3 text-sm font-medium text-fg", hideLabel && "sr-only")}>{label}</legend>
      <div className={cn("flex gap-3", orientation === "vertical" ? "flex-col" : "flex-wrap")}>
        {options.map((option) => {
          const id = `${generated}-${option.value}`;
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={cn(
                "flex items-start gap-3",
                option.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                variant === "card" &&
                  cn(
                    "rounded-xl border bg-surface p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent",
                    checked ? "border-accent bg-accent/5" : "hover:border-fg/20",
                  ),
              )}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                disabled={option.disabled}
                required={required}
                onChange={() => setValue(option.value)}
                aria-describedby={option.description ? `${id}-description` : undefined}
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border bg-surface transition-all checked:border-[5px] checked:border-accent disabled:cursor-not-allowed",
                  variant === "card" && "focus-visible:ring-0",
                )}
              />
              <span className="grid gap-0.5">
                <span className="text-sm font-medium text-fg">{option.label}</span>
                {option.description ? (
                  <span id={`${id}-description`} className="text-sm text-muted">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
