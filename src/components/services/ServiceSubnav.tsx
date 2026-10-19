"use client";

import { useScrollSpy } from "@/hooks";
import { cn } from "@/lib/utils";

interface ServiceSubnavProps {
  sections: { id: string; label: string }[];
}

/** Sticky in-page navigation for a service detail page, highlighting the section in view. */
export function ServiceSubnav({ sections }: ServiceSubnavProps) {
  const active = useScrollSpy(
    sections.map((s) => s.id),
    180,
  );

  return (
    <nav
      aria-label="On this page"
      className="sticky top-16 z-30 border-y bg-bg/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/70"
    >
      <ul className="no-scrollbar mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
        {sections.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "inline-flex rounded-full px-3.5 py-1.5 text-sm transition",
                  isActive ? "bg-surface-2 font-medium text-fg" : "text-muted hover:text-fg",
                )}
              >
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
