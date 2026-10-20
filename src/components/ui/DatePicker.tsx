"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import { useControllableState, useOutsideClick } from "./internal";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/** Local-date ISO string ("YYYY-MM-DD") without timezone drift. */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fromISODate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
}

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

function addMonths(d: Date, n: number) {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), lastDay));
}

const sameDay = (a: Date | null, b: Date | null) => !!a && !!b && toISODate(a) === toISODate(b);

/** 6x7 grid of dates for the month containing `month`, weeks starting Monday. */
function monthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = addDays(first, -offset);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

interface CalendarProps {
  value: string | null;
  onSelect: (iso: string) => void;
  min?: string;
  max?: string;
  /** Focus the selected (or today's) day on mount. */
  autoFocus?: boolean;
  className?: string;
}

/** Month grid following the WAI-ARIA date picker dialog grid pattern. */
export function Calendar({ value, onSelect, min, max, autoFocus, className }: CalendarProps) {
  const selected = fromISODate(value);
  const [focused, setFocused] = useState<Date>(() => selected ?? new Date());
  const gridRef = useRef<HTMLTableElement>(null);
  const shouldFocus = useRef(Boolean(autoFocus));
  const headingId = useId();
  const minDate = fromISODate(min);
  const maxDate = fromISODate(max);
  const today = new Date();

  const isDisabled = (d: Date) => (minDate && d < minDate) || (maxDate && d > maxDate) || false;

  useEffect(() => {
    if (!shouldFocus.current) return;
    gridRef.current?.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus();
  }, [focused]);

  const move = (next: Date) => {
    shouldFocus.current = true;
    setFocused(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTableElement>) => {
    const dow = (focused.getDay() + 6) % 7;
    const map: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -dow),
      End: () => addDays(focused, 6 - dow),
      PageUp: () => (e.shiftKey ? addMonths(focused, -12) : addMonths(focused, -1)),
      PageDown: () => (e.shiftKey ? addMonths(focused, 12) : addMonths(focused, 1)),
    };
    const fn = map[e.key];
    if (!fn) return;
    e.preventDefault();
    move(fn());
  };

  const monthLabel = focused.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const days = monthGrid(focused);

  return (
    <div className={cn("w-72", className)}>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => {
            shouldFocus.current = false;
            setFocused(addMonths(focused, -1));
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
        >
          <Icon name="chevron-left" className="h-4 w-4" />
        </button>
        <h2 id={headingId} aria-live="polite" className="text-sm font-semibold text-fg">
          {monthLabel}
        </h2>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => {
            shouldFocus.current = false;
            setFocused(addMonths(focused, 1));
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
        >
          <Icon name="chevron-right" className="h-4 w-4" />
        </button>
      </div>
      <table ref={gridRef} role="grid" aria-labelledby={headingId} onKeyDown={onKeyDown} className="w-full text-center text-sm">
        <thead>
          <tr>
            {WEEKDAYS.map((d) => (
              <th key={d} scope="col" className="pb-2 text-xs font-medium text-muted">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, week) => (
            <tr key={week}>
              {days.slice(week * 7, week * 7 + 7).map((day) => {
                const outside = day.getMonth() !== focused.getMonth();
                const isSelected = sameDay(day, selected);
                const disabled = isDisabled(day);
                return (
                  <td key={toISODate(day)} className="p-0.5">
                    <button
                      type="button"
                      tabIndex={sameDay(day, focused) ? 0 : -1}
                      aria-selected={isSelected}
                      aria-current={sameDay(day, today) ? "date" : undefined}
                      aria-label={day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                      disabled={disabled}
                      onClick={() => onSelect(toISODate(day))}
                      className={cn(
                        "h-9 w-9 rounded-full text-sm transition-colors disabled:pointer-events-none disabled:opacity-30",
                        isSelected ? "bg-fg font-medium text-bg" : "hover:bg-surface-2",
                        !isSelected && outside && "text-muted/60",
                        !isSelected && sameDay(day, today) && "font-semibold text-accent",
                      )}
                    >
                      {day.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface DatePickerProps {
  label: string;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
}

/** Button + popup calendar. Value is an ISO "YYYY-MM-DD" string. */
export function DatePicker({
  label,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  min,
  max,
  placeholder = "Pick a date",
  name,
  disabled,
  className,
}: DatePickerProps) {
  const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useOutsideClick([triggerRef, panelRef], () => setOpen(false), open);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const date = fromISODate(value);
  const display = date?.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
        {label}
      </label>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center gap-2 rounded-xl border bg-surface px-3.5 text-left text-sm shadow-sm transition-colors hover:border-fg/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon name="calendar" className="h-4 w-4 text-muted" />
        <span className={cn("flex-1", !display && "text-muted/70")}>{display ?? placeholder}</span>
      </button>
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label={`Choose ${label.toLowerCase()}`}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              close();
            }
          }}
          className="absolute z-40 mt-2 animate-scale-in rounded-2xl border bg-surface p-4 shadow-lg shadow-black/5"
        >
          <Calendar
            value={value}
            min={min}
            max={max}
            autoFocus
            onSelect={(iso) => {
              setValue(iso);
              close();
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
