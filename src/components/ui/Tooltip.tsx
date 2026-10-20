"use client";

import { cloneElement, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Side = "top" | "bottom" | "left" | "right";

const sides: Record<Side, string> = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

interface TooltipProps {
  content: ReactNode;
  /** A single focusable element; it receives `aria-describedby`. */
  children: ReactElement<{ "aria-describedby"?: string }>;
  side?: Side;
  /** Delay in ms before showing on hover. Focus shows immediately. */
  delay?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Lightweight tooltip shown on hover and keyboard focus, dismissed with Escape.
 * Content is supplementary: it describes the trigger, it never labels it.
 */
export function Tooltip({ content, children, side = "top", delay = 300, disabled, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = (immediate = false) => {
    clearTimeout(timer.current);
    if (immediate) setOpen(true);
    else timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (disabled) return children;

  const describedBy = [children.props["aria-describedby"], open ? id : null].filter(Boolean).join(" ") || undefined;

  return (
    <span
      className="relative inline-flex"
      onPointerEnter={() => show()}
      onPointerLeave={hide}
      onFocus={() => show(true)}
      onBlur={hide}
    >
      {cloneElement(children, { "aria-describedby": describedBy })}
      {open ? (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 w-max max-w-xs animate-fade-in rounded-lg bg-fg px-2.5 py-1.5 text-xs font-medium text-bg shadow-lg",
            sides[side],
            className,
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
