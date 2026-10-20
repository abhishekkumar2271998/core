"use client";

import {
  createContext,
  useContext,
  useId,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import type { IconName } from "@/types";

interface FieldContextValue {
  id: string;
  hintId?: string;
  errorId?: string;
  invalid: boolean;
  required?: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/** ARIA wiring for a control rendered inside `<Field>`; explicit props win. */
export function useFieldControl(props: { id?: string; "aria-describedby"?: string; "aria-invalid"?: unknown; required?: boolean }) {
  const field = useContext(FieldContext);
  const describedBy = [props["aria-describedby"], field?.hintId, field?.errorId].filter(Boolean).join(" ") || undefined;
  const invalid = props["aria-invalid"] ?? (field?.invalid || undefined);
  return {
    id: props.id ?? field?.id,
    "aria-describedby": describedBy,
    "aria-invalid": invalid as boolean | undefined,
    required: props.required ?? field?.required,
  };
}

interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** Visually hide the label (it stays available to assistive tech). */
  hideLabel?: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
}

/** Label + hint + error wrapper that wires `id`, `aria-describedby` and `aria-invalid` into its control. */
export function Field({ label, hint, error, required, hideLabel, id: idProp, className, children }: FieldProps) {
  const generated = useId();
  const id = idProp ?? generated;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <FieldContext.Provider value={{ id, hintId, errorId, invalid: Boolean(error), required }}>
      <div className={cn("flex flex-col gap-1.5", className)}>
        <label htmlFor={id} className={cn("text-sm font-medium text-fg", hideLabel && "sr-only")}>
          {label}
          {required ? (
            <span aria-hidden className="ml-0.5 text-danger">
              *
            </span>
          ) : null}
        </label>
        {children}
        {hint && !error ? (
          <p id={hintId} className="text-xs text-muted">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="flex items-center gap-1 text-xs font-medium text-danger">
            <Icon name="alert" className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

const controlBase =
  "w-full rounded-xl border bg-surface text-sm text-fg shadow-sm transition-colors placeholder:text-muted/70 hover:border-fg/20 focus-visible:border-accent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger";

interface InputProps extends ComponentPropsWithoutRef<"input"> {
  icon?: IconName;
  /** Content rendered at the trailing edge, e.g. a clear button or unit. */
  trailing?: ReactNode;
}

export function Input({ icon, trailing, className, ...props }: InputProps) {
  const a11y = useFieldControl(props);
  return (
    <div className="relative">
      {icon ? (
        <Icon name={icon} className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      ) : null}
      <input
        {...props}
        {...a11y}
        className={cn(controlBase, "h-10 px-3.5", icon && "pl-10", trailing ? "pr-10" : null, className)}
      />
      {trailing ? <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div> : null}
    </div>
  );
}

interface TextareaProps extends ComponentPropsWithoutRef<"textarea"> {
  /** Show a live character counter when `maxLength` is set. */
  showCount?: boolean;
}

export function Textarea({ className, showCount, maxLength, value, defaultValue, ...props }: TextareaProps) {
  const a11y = useFieldControl(props);
  const length = String(value ?? defaultValue ?? "").length;
  return (
    <div className="relative">
      <textarea
        {...props}
        {...a11y}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        className={cn(controlBase, "min-h-28 resize-y px-3.5 py-2.5 leading-relaxed", className)}
      />
      {showCount && maxLength && value !== undefined ? (
        <span aria-live="polite" className="pointer-events-none absolute bottom-2 right-3 font-mono text-[0.7rem] text-muted">
          {length}/{maxLength}
        </span>
      ) : null}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends ComponentPropsWithoutRef<"select"> {
  options?: SelectOption[];
  placeholder?: string;
}

/** Native select (best mobile + a11y support) styled to match the inputs. */
export function Select({ options, placeholder, className, children, ...props }: SelectProps) {
  const a11y = useFieldControl(props);
  return (
    <div className="relative">
      <select {...props} {...a11y} className={cn(controlBase, "h-10 appearance-none pl-3.5 pr-10", className)}>
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options?.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
        {children}
      </select>
      <Icon
        name="chevron-down"
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
}
