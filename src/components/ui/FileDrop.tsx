"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";

interface FileDropProps {
  label: string;
  /** Same syntax as the input `accept` attribute, e.g. "image/*,.pdf". */
  accept?: string;
  multiple?: boolean;
  /** Max size per file in bytes. */
  maxSize?: number;
  maxFiles?: number;
  onFilesChange: (files: File[]) => void;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let n = bytes / 1024;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 ? 1 : 0)} ${units[i]}`;
}

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  return accept.split(",").some((raw) => {
    const rule = raw.trim().toLowerCase();
    if (!rule) return false;
    if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule);
    if (rule.endsWith("/*")) return file.type.toLowerCase().startsWith(rule.slice(0, -1));
    return file.type.toLowerCase() === rule;
  });
}

/** Drag-and-drop zone backed by a real file input (keyboard and screen reader friendly). */
export function FileDrop({
  label,
  accept,
  multiple,
  maxSize,
  maxFiles,
  onFilesChange,
  hint,
  disabled,
  className,
}: FileDropProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const update = (next: File[]) => {
    setFiles(next);
    onFilesChange(next);
    if (inputRef.current) inputRef.current.value = "";
  };

  const add = (incoming: File[]) => {
    const problems: string[] = [];
    const valid = incoming.filter((f) => {
      if (!matchesAccept(f, accept)) problems.push(`${f.name}: unsupported file type`);
      else if (maxSize && f.size > maxSize) problems.push(`${f.name}: larger than ${formatBytes(maxSize)}`);
      else return true;
      return false;
    });
    let next = multiple ? [...files, ...valid] : valid.slice(0, 1);
    if (maxFiles && next.length > maxFiles) {
      problems.push(`Only ${maxFiles} file${maxFiles > 1 ? "s" : ""} allowed`);
      next = next.slice(0, maxFiles);
    }
    setErrors(problems);
    update(next);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) add(Array.from(e.dataTransfer.files));
  };

  return (
    <div className={className}>
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent",
          dragging ? "border-accent bg-accent/5" : "hover:border-fg/20",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-muted">
          <Icon name="download" className="h-5 w-5 rotate-180" />
        </span>
        <span className="text-sm font-medium text-fg">{label}</span>
        <span className="text-xs text-muted">{hint ?? "Drag and drop, or click to browse"}</span>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => add(Array.from(e.target.files ?? []))}
          className="sr-only"
        />
      </label>
      {errors.length ? (
        <ul role="alert" className="mt-3 space-y-1 text-xs font-medium text-danger">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      ) : null}
      {files.length ? (
        <ul aria-label="Selected files" className="mt-3 divide-y rounded-xl border bg-surface">
          {files.map((file, i) => (
            <li key={`${file.name}-${file.lastModified}-${i}`} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <span className="min-w-0 flex-1 truncate text-fg">{file.name}</span>
              <span className="shrink-0 font-mono text-xs text-muted">{formatBytes(file.size)}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => update(files.filter((_, j) => j !== i))}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
              >
                <Icon name="close" className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
