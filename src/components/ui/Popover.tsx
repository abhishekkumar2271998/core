"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";
import { getFocusable, useControllableState, useOutsideClick } from "./internal";

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  contentId: string;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopover() {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error("Popover parts must be used within <Popover>");
  return ctx;
}

interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: ReactNode;
}

/** Non-modal floating panel anchored to a trigger. Closes on outside click and Escape. */
export function Popover({ open: openProp, defaultOpen = false, onOpenChange, className, children }: PopoverProps) {
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentId = useId();

  useOutsideClick([triggerRef, contentRef], () => setOpen(false), open);

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef, contentRef, contentId }}>
      <div className={cn("relative inline-block", className)}>{children}</div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ onClick, ...props }: ComponentPropsWithoutRef<"button">) {
  const { open, setOpen, triggerRef, contentId } = usePopover();
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? contentId : undefined}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOpen(!open);
      }}
      {...props}
    />
  );
}

const placements = {
  "bottom-start": "left-0 top-full mt-2",
  "bottom-end": "right-0 top-full mt-2",
  "top-start": "bottom-full left-0 mb-2",
  "top-end": "bottom-full right-0 mb-2",
};

interface PopoverContentProps extends ComponentPropsWithoutRef<"div"> {
  placement?: keyof typeof placements;
  /** Accessible name when the content has no visible heading. */
  label?: string;
  /** Move focus into the panel on open (default true). */
  autoFocus?: boolean;
}

export function PopoverContent({
  placement = "bottom-start",
  label,
  autoFocus = true,
  className,
  children,
  ...props
}: PopoverContentProps) {
  const { open, setOpen, triggerRef, contentRef, contentId } = usePopover();

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, [setOpen, triggerRef]);

  useEffect(() => {
    if (!open || !autoFocus || !contentRef.current) return;
    (getFocusable(contentRef.current)[0] ?? contentRef.current).focus({ preventScroll: true });
  }, [open, autoFocus, contentRef]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      id={contentId}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          close();
        }
      }}
      className={cn(
        "absolute z-40 w-72 animate-scale-in rounded-2xl border bg-surface p-4 shadow-lg shadow-black/5 focus:outline-none",
        placements[placement],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
