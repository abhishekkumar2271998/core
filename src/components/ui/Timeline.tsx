import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import type { IconName } from "@/types";

export interface TimelineItem {
  id: string;
  title: ReactNode;
  /** Displayed date/period, e.g. "Jun 2024 – Present". */
  time?: ReactNode;
  /** Machine-readable date for the <time> element. */
  dateTime?: string;
  description?: ReactNode;
  icon?: IconName;
  /** Highlight as the current / most recent entry. */
  current?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

/** Vertical timeline rendered as an ordered list. */
export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn("relative", className)}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <li key={item.id} className={cn("relative flex gap-4", !last && "pb-10")}>
            {!last ? <span aria-hidden className="absolute left-4 top-9 h-[calc(100%-2.25rem)] w-px -translate-x-1/2 bg-border" /> : null}
            <span
              aria-hidden
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-surface",
                item.current ? "border-accent text-accent" : "text-muted",
              )}
            >
              {item.icon ? (
                <Icon name={item.icon} className="h-4 w-4" />
              ) : (
                <span className={cn("h-2 w-2 rounded-full", item.current ? "bg-accent" : "bg-muted/60")} />
              )}
              {item.current ? <span className="absolute inset-0 animate-ping rounded-full border border-accent opacity-30" /> : null}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h3 className="font-medium text-fg">{item.title}</h3>
                {item.time ? (
                  <time dateTime={item.dateTime} className="shrink-0 font-mono text-xs text-muted">
                    {item.time}
                  </time>
                ) : null}
              </div>
              {item.description ? <div className="mt-2 text-sm leading-relaxed text-muted">{item.description}</div> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
