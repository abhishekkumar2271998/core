"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn, fuzzyScore } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import { nextIndex, useControllableState, useOutsideClick } from "./internal";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface ComboboxProps {
  label: ReactNode;
  options: ComboboxOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  emptyMessage?: ReactNode;
  hideLabel?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/**
 * Autocomplete following the WAI-ARIA combobox (list autocomplete) pattern:
 * the input keeps focus while `aria-activedescendant` tracks the highlighted option.
 */
export function Combobox({
  label,
  options,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  placeholder = "Search…",
  emptyMessage = "No matches",
  hideLabel,
  disabled,
  name,
  className,
}: ComboboxProps) {
  const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
  const selected = options.find((o) => o.value === value) ?? null;
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const listId = `${id}-listbox`;
  const optionId = (i: number) => `${id}-option-${i}`;

  const filtered = useMemo(() => {
    if (!query) return options;
    return options
      .map((o) => ({ o, score: fuzzyScore(query, o.label) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.o);
  }, [options, query]);

  useOutsideClick(
    [rootRef],
    () => {
      setOpen(false);
      setQuery(null);
    },
    open,
  );

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    setActive(Math.max(0, filtered.findIndex((o) => o.value === value)));
  };

  const choose = (option: ComboboxOption) => {
    if (option.disabled) return;
    setValue(option.value);
    setQuery(null);
    setOpen(false);
  };

  const scrollTo = (i: number) => {
    listRef.current?.querySelector(`#${CSS.escape(optionId(i))}`)?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      openList();
      return;
    }
    if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
      } else if (query || value) {
        setQuery(null);
        setValue(null);
      }
      return;
    }
    if (e.key === "Enter" && open && filtered[active]) {
      e.preventDefault();
      choose(filtered[active]);
      return;
    }
    if (!open || (e.key !== "ArrowDown" && e.key !== "ArrowUp")) return;
    const next = nextIndex(e.key, active, filtered.length, "vertical");
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    scrollTo(next);
  };

  const inputValue = query ?? selected?.label ?? "";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <label htmlFor={`${id}-input`} className={cn("mb-1.5 block text-sm font-medium text-fg", hideLabel && "sr-only")}>
        {label}
      </label>
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          id={`${id}-input`}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && filtered[active] ? optionId(active) : undefined}
          disabled={disabled}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={openList}
          onClick={openList}
          onKeyDown={onKeyDown}
          className="h-10 w-full rounded-xl border bg-surface pl-10 pr-10 text-sm text-fg shadow-sm transition-colors placeholder:text-muted/70 hover:border-fg/20 focus-visible:border-accent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {selected && !disabled ? (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={() => {
              setValue(null);
              setQuery(null);
            }}
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
          >
            <Icon name="close" className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label={typeof label === "string" ? label : undefined}
        hidden={!open}
        className="absolute z-40 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border bg-surface p-1 shadow-lg shadow-black/5"
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-muted">{emptyMessage}</li>
        ) : (
          filtered.map((option, i) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                id={optionId(i)}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                onPointerMove={() => setActive(i)}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => choose(option)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  i === active && "bg-surface-2",
                  option.disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-fg">{option.label}</span>
                  {option.description ? <span className="block truncate text-xs text-muted">{option.description}</span> : null}
                </span>
                {isSelected ? <Icon name="check" className="h-4 w-4 shrink-0 text-accent" /> : null}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
