"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { useMounted } from "@/hooks";
import { cn } from "@/lib/utils";
import type { IconName } from "@/types";
import { useTheme, type Theme } from "./ThemeProvider";

const options: { value: Theme; label: string; icon: IconName }[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "monitor" },
];

/** Icon button with a small dropdown to pick light / dark / system. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg"
      >
        {mounted ? (
          <Icon name={resolvedTheme === "dark" ? "moon" : "sun"} className="h-[18px] w-[18px]" />
        ) : (
          <span className="h-[18px] w-[18px]" />
        )}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-36 animate-scale-in overflow-hidden rounded-xl border bg-surface p-1 shadow-xl"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              role="menuitemradio"
              aria-checked={theme === opt.value}
              type="button"
              onClick={() => {
                setTheme(opt.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition",
                theme === opt.value ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              <Icon name={opt.icon} className="h-4 w-4" />
              {opt.label}
              {theme === opt.value ? <Icon name="check" className="ml-auto h-3.5 w-3.5 text-accent" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
