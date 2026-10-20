import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";

type PageItem = number | "ellipsis-start" | "ellipsis-end";

/**
 * Page numbers to render, collapsing long ranges with ellipses.
 * e.g. (page 6 of 20, siblings 1) -> [1, "ellipsis-start", 5, 6, 7, "ellipsis-end", 20]
 */
export function getPageItems(page: number, total: number, siblings = 1): PageItem[] {
  const slots = siblings * 2 + 5;
  if (total <= slots) return Array.from({ length: total }, (_, i) => i + 1);

  const left = Math.max(page - siblings, 2);
  const right = Math.min(page + siblings, total - 1);
  const showLeftDots = left > 3;
  const showRightDots = right < total - 2;

  if (!showLeftDots) {
    const count = siblings * 2 + 3;
    return [...Array.from({ length: count }, (_, i) => i + 1), "ellipsis-end", total];
  }
  if (!showRightDots) {
    const count = siblings * 2 + 3;
    return [1, "ellipsis-start", ...Array.from({ length: count }, (_, i) => total - count + 1 + i)];
  }
  return [1, "ellipsis-start", ...Array.from({ length: right - left + 1 }, (_, i) => left + i), "ellipsis-end", total];
}

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Build the URL for a page (link mode, works without JS). */
  href?: (page: number) => string;
  /** Called with the new page (button mode). Ignored when `href` is given. */
  onPageChange?: (page: number) => void;
  siblings?: number;
  className?: string;
  label?: string;
}

const itemBase =
  "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full px-3 text-sm font-medium transition-colors";

export function Pagination({
  page,
  totalPages,
  href,
  onPageChange,
  siblings = 1,
  className,
  label = "Pagination",
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const items = getPageItems(page, totalPages, siblings);

  const renderLink = (target: number, content: ReactNode, opts: { current?: boolean; label?: string } = {}) => {
    const disabled = target < 1 || target > totalPages;
    const classes = cn(
      itemBase,
      opts.current ? "bg-fg text-bg" : "text-muted hover:bg-surface-2 hover:text-fg",
      disabled && "pointer-events-none opacity-40",
    );
    const common = {
      className: classes,
      "aria-label": opts.label,
      "aria-current": opts.current ? ("page" as const) : undefined,
    };
    if (disabled) {
      return (
        <span {...common} aria-disabled="true">
          {content}
        </span>
      );
    }
    if (href) {
      return (
        <Link href={href(target)} {...common} scroll={false}>
          {content}
        </Link>
      );
    }
    return (
      <button type="button" onClick={() => onPageChange?.(target)} {...common}>
        {content}
      </button>
    );
  };

  return (
    <nav aria-label={label} className={cn("flex justify-center", className)}>
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          {renderLink(
            page - 1,
            <>
              <Icon name="chevron-left" className="h-4 w-4" />
              <span className="hidden sm:inline">Prev</span>
            </>,
            { label: "Previous page" },
          )}
        </li>
        {items.map((item) =>
          typeof item === "number" ? (
            <li key={item}>{renderLink(item, item, { current: item === page, label: `Page ${item}` })}</li>
          ) : (
            <li key={item} aria-hidden className="px-1 text-muted">
              …
            </li>
          ),
        )}
        <li>
          {renderLink(
            page + 1,
            <>
              <span className="hidden sm:inline">Next</span>
              <Icon name="chevron-right" className="h-4 w-4" />
            </>,
            { label: "Next page" },
          )}
        </li>
      </ul>
    </nav>
  );
}
