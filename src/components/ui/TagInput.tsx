"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import { useControllableState } from "./internal";

interface TagInputProps {
  label: string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  /** Return an error message to reject a tag, or null to accept it. */
  validate?: (tag: string) => string | null;
  /** Suggestions shown in a native datalist. */
  suggestions?: string[];
  name?: string;
  disabled?: boolean;
  className?: string;
}

/** Free-form tag entry: Enter or comma adds, Backspace on empty input removes the last tag. */
export function TagInput({
  label,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  placeholder = "Add a tag…",
  maxTags,
  validate,
  suggestions,
  name,
  disabled,
  className,
}: TagInputProps) {
  const [tags, setTags] = useControllableState(valueProp, defaultValue, onValueChange);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const full = maxTags !== undefined && tags.length >= maxTags;

  const add = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setError(`"${tag}" is already added`);
      return;
    }
    const problem = validate?.(tag) ?? (full ? `Up to ${maxTags} tags` : null);
    if (problem) {
      setError(problem);
      return;
    }
    setTags([...tags, tag]);
    setDraft("");
    setError(null);
    setAnnouncement(`${tag} added`);
  };

  const remove = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    setAnnouncement(`${tag} removed`);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && tags.length) {
      remove(tags[tags.length - 1]);
    }
  };

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
        {label}
      </label>
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl border bg-surface px-2 py-1.5 shadow-sm transition-colors focus-within:border-accent hover:border-fg/20",
          error && "border-danger",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <ul aria-label={`${label} (${tags.length})`} className="contents">
          {tags.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-surface-2 py-0.5 pl-2.5 pr-1 text-xs font-medium text-fg"
            >
              {tag}
              <button
                type="button"
                disabled={disabled}
                aria-label={`Remove ${tag}`}
                onClick={(e) => {
                  e.stopPropagation();
                  remove(tag);
                }}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted hover:bg-border hover:text-fg"
              >
                <Icon name="close" className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={draft}
          disabled={disabled || full}
          placeholder={full ? "" : placeholder}
          list={suggestions?.length ? `${id}-suggestions` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => draft && add(draft)}
          className="min-w-24 flex-1 bg-transparent px-1 py-0.5 text-sm text-fg outline-none placeholder:text-muted/70 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      {suggestions?.length ? (
        <datalist id={`${id}-suggestions`}>
          {suggestions
            .filter((s) => !tags.includes(s))
            .map((s) => (
              <option key={s} value={s} />
            ))}
        </datalist>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
      {name ? tags.map((tag) => <input key={tag} type="hidden" name={name} value={tag} />) : null}
    </div>
  );
}
