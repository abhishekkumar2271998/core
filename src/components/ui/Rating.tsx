"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import { useControllableState } from "./internal";

const sizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };

/** Read-only star display, e.g. for testimonials. Supports fractional values. */
export function RatingDisplay({
  value,
  max = 5,
  size = "md",
  className,
}: {
  value: number;
  max?: number;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span role="img" aria-label={`Rated ${value} out of ${max}`} className={cn("inline-flex gap-0.5", className)}>
      {Array.from({ length: max }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className={cn("relative", sizes[size])}>
            <Icon name="star" className={cn("absolute inset-0 text-border", sizes[size])} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Icon name="star" className={cn("fill-warning text-warning", sizes[size])} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

interface RatingProps {
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  max?: number;
  size?: keyof typeof sizes;
  name?: string;
  disabled?: boolean;
  className?: string;
}

/** Interactive rating built from native radios: arrow keys move, hover previews. */
export function Rating({
  label,
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  max = 5,
  size = "md",
  name: nameProp,
  disabled,
  className,
}: RatingProps) {
  const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
  const [hover, setHover] = useState<number | null>(null);
  const generated = useId();
  const name = nameProp ?? generated;
  const shown = hover ?? value;

  return (
    <fieldset
      disabled={disabled}
      className={cn("inline-flex", disabled && "opacity-50", className)}
      onPointerLeave={() => setHover(null)}
    >
      <legend className="sr-only">{label}</legend>
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const id = `${generated}-${n}`;
        return (
          <label
            key={n}
            htmlFor={id}
            onPointerEnter={() => !disabled && setHover(n)}
            className={cn("rounded p-0.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent", !disabled && "cursor-pointer")}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => setValue(n)}
              className="sr-only"
            />
            <span className="sr-only">
              {n} star{n > 1 ? "s" : ""}
            </span>
            <Icon
              name="star"
              className={cn(
                "transition-colors",
                sizes[size],
                n <= shown ? "fill-warning text-warning" : "text-border",
              )}
            />
          </label>
        );
      })}
    </fieldset>
  );
}
