"use client";

import { useScrollSpy } from "@/hooks";
import { cn } from "@/lib/utils";

interface UsesNavProps {
  sections: { id: string; title: string; count: number }[];
}

/** Sticky category jump navigation with scroll-spy highlighting. */
export function UsesNav({ sections }: UsesNavProps) {
  const active = useScrollSpy(
    sections.map((s) => s.id),
    160,
  );

  return (
    <nav aria-label="Categories" className="sticky top-16 z-30 -mx-4 border-b bg-bg/80 px-4 backdrop-blur-xl sm:mx-0 sm:rounded-full sm:border sm:px-1.5 lg:top-24 lg:border-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
      <ul className="no-scrollbar flex gap-1 overflow-x-auto py-2 sm:py-1.5 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:py-0">
        {sections.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "group flex items-center justify-between gap-3 rounded-full px-3.5 py-1.5 text-sm transition lg:rounded-lg lg:px-3 lg:py-2",
                  isActive ? "bg-surface-2 font-medium text-fg" : "text-muted hover:text-fg",
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className={cn(
                      "hidden h-1.5 w-1.5 rounded-full transition lg:inline-block",
                      isActive ? "bg-accent" : "bg-border group-hover:bg-muted",
                    )}
                  />
                  {s.title}
                </span>
                <span className="hidden font-mono text-xs text-muted lg:inline">{s.count}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
