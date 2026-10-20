"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/icons/Icon";

/** Achievement bullets that collapse to `visible` items when the list is long. */
export function AchievementList({ items, visible = 3 }: { items: string[]; visible?: number }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const collapsible = items.length > visible;
  const shown = open || !collapsible ? items : items.slice(0, visible);

  return (
    <div>
      <ul id={id} className="space-y-2.5">
        {shown.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-fg/80">
            <Icon name="chevron-right" className="mt-1 h-3.5 w-3.5 shrink-0 text-accent" />
            {item}
          </li>
        ))}
      </ul>
      {collapsible ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          {open ? "Show less" : `Show ${items.length - visible} more`}
          <Icon name="chevron-down" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      ) : null}
    </div>
  );
}
