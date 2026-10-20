"use client";

import { useEffect, useId, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";

interface CheckboxProps extends Omit<ComponentPropsWithoutRef<"input">, "type"> {
  label: ReactNode;
  description?: ReactNode;
  /** Mixed state, e.g. a "select all" box with some children checked. */
  indeterminate?: boolean;
}

/** Native checkbox (keeps form + keyboard semantics) with a custom visual. */
export function Checkbox({ label, description, indeterminate, id: idProp, className, disabled, ...props }: CheckboxProps) {
  const generated = useId();
  const id = idProp ?? generated;
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  return (
    <div className={cn("flex items-start gap-3", disabled && "opacity-50", className)}>
      <span className="relative mt-0.5 inline-flex h-4 w-4 shrink-0">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          disabled={disabled}
          aria-describedby={description ? `${id}-description` : undefined}
          className="peer h-4 w-4 cursor-pointer appearance-none rounded border bg-surface transition-colors checked:border-accent checked:bg-accent indeterminate:border-accent indeterminate:bg-accent disabled:cursor-not-allowed"
          {...props}
        />
        <Icon
          name="check"
          strokeWidth={3}
          className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-accent-fg opacity-0 peer-checked:opacity-100 peer-indeterminate:hidden"
        />
        <span className="pointer-events-none absolute inset-x-[3px] top-1/2 hidden h-0.5 -translate-y-1/2 rounded bg-accent-fg peer-indeterminate:block" />
      </span>
      <div className="grid gap-0.5">
        <label htmlFor={id} className={cn("text-sm font-medium text-fg", !disabled && "cursor-pointer")}>
          {label}
        </label>
        {description ? (
          <p id={`${id}-description`} className="text-sm text-muted">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
