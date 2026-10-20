"use client";

import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";

type SortDirection = "asc" | "desc";

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  /** Cell renderer; defaults to `row[key]`. */
  cell?: (row: T) => ReactNode;
  /** Value used for sorting; enables sorting on this column when present. */
  sortValue?: (row: T) => string | number | Date | null | undefined;
  align?: "left" | "right" | "center";
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption: ReactNode;
  /** Visually hide the caption (kept as the table's accessible name). */
  hideCaption?: boolean;
  defaultSort?: { key: string; direction: SortDirection };
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

const alignClass = { left: "text-left", right: "text-right", center: "text-center" };

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

/** Data table with sortable column headers (`aria-sort` + buttons) and a responsive scroll container. */
export function Table<T>({
  columns,
  rows,
  rowKey,
  caption,
  hideCaption,
  defaultSort,
  empty = "No results",
  onRowClick,
  className,
}: TableProps<T>) {
  const [sort, setSort] = useState(defaultSort);

  const sorted = useMemo(() => {
    const column = sort && columns.find((c) => c.key === sort.key);
    if (!sort || !column?.sortValue) return rows;
    const get = column.sortValue;
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const result = compare(get(a), get(b));
      // Keep nulls last regardless of direction.
      return get(a) == null || get(b) == null ? result : result * factor;
    });
  }, [rows, columns, sort]);

  const toggleSort = (key: string) =>
    setSort((prev) =>
      prev?.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" },
    );

  return (
    <div className={cn("overflow-x-auto rounded-2xl border bg-surface", className)}>
      <table className="w-full border-collapse text-sm">
        <caption className={cn("px-4 py-3 text-left font-medium text-fg", hideCaption && "sr-only")}>{caption}</caption>
        <thead className="border-b bg-surface-2/50">
          <tr>
            {columns.map((col) => {
              const active = sort?.key === col.key;
              const ariaSort = active ? (sort.direction === "asc" ? "ascending" : "descending") : undefined;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={col.sortValue ? (ariaSort ?? "none") : undefined}
                  className={cn("px-4 py-3 font-medium text-muted", alignClass[col.align ?? "left"], col.className)}
                >
                  {col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded transition-colors hover:text-fg",
                        active && "text-fg",
                        col.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {col.header}
                      <Icon
                        name="chevron-down"
                        className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          !active && "opacity-30",
                          active && sort.direction === "asc" && "rotate-180",
                        )}
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-muted">
                {empty}
              </td>
            </tr>
          ) : (
            sorted.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn("transition-colors hover:bg-surface-2/50", onRowClick && "cursor-pointer")}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-4 py-3 text-fg/90", alignClass[col.align ?? "left"], col.className)}
                  >
                    {col.cell ? col.cell(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
