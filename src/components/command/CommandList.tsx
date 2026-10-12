"use client";

import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils";
import type { CommandItem, ScoredGroup } from "./types";

export const optionId = (listId: string, item: CommandItem) => `${listId}-${item.id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

interface CommandListProps {
  listId: string;
  groups: ScoredGroup[];
  activeId: string | null;
  query: string;
  onHover: (id: string) => void;
  onSelect: (item: CommandItem) => void;
}

/** Highlights the first case-insensitive substring match of `query` in `text`. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const index = text.toLowerCase().indexOf(q.toLowerCase());
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-accent/15 text-fg">{text.slice(index, index + q.length)}</mark>
      {text.slice(index + q.length)}
    </>
  );
}

export function CommandList({ listId, groups, activeId, query, onHover, onSelect }: CommandListProps) {
  return (
    <div id={listId} role="listbox" aria-label="Commands" className="space-y-2 p-2">
      {groups.map((group) => {
        const headingId = `${listId}-group-${group.id}`;
        return (
          <div key={group.id} role="group" aria-labelledby={headingId}>
            <div
              id={headingId}
              role="presentation"
              className="px-3 pb-1.5 pt-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted"
            >
              {group.label}
            </div>
            {group.items.map((item) => {
              const selected = item.id === activeId;
              return (
                <div
                  key={item.id}
                  id={optionId(listId, item)}
                  role="option"
                  aria-selected={selected}
                  data-command-id={item.id}
                  onMouseMove={() => {
                    if (!selected) onHover(item.id);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelect(item)}
                  className={cn(
                    "group flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    selected ? "bg-surface-2 text-fg" : "text-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                      selected ? "border-accent/30 bg-accent/10 text-accent" : "bg-surface",
                    )}
                  >
                    <Icon name={item.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate font-medium", selected ? "text-fg" : "text-fg/90")}>
                      <Highlight text={item.label} query={query} />
                    </span>
                    {item.description ? (
                      <span className="block truncate text-xs text-muted">{item.description}</span>
                    ) : null}
                  </span>
                  {item.active ? <Icon name="check" className="h-4 w-4 shrink-0 text-accent" label="Active" /> : null}
                  {item.hint ? (
                    <span aria-hidden className="shrink-0 text-xs text-muted">
                      {item.hint}
                    </span>
                  ) : null}
                  <Icon
                    name="arrow-right"
                    className={cn(
                      "h-4 w-4 shrink-0 transition",
                      selected ? "translate-x-0 text-fg opacity-100" : "-translate-x-1 opacity-0",
                    )}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
