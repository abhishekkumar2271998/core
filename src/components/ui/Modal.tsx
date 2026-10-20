"use client";

import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";
import { useLockBodyScroll } from "@/hooks";
import { Icon } from "@/components/icons/Icon";
import { Portal } from "./Portal";
import { useFocusTrap } from "./internal";

type ModalSize = "sm" | "md" | "lg" | "xl";
type ModalPlacement = "center" | "right" | "left" | "bottom";

const sizes: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const placements: Record<ModalPlacement, { wrapper: string; panel: string }> = {
  center: {
    wrapper: "items-end justify-center p-4 sm:items-center",
    panel: "w-full rounded-2xl animate-scale-in",
  },
  right: {
    wrapper: "justify-end",
    panel: "h-full w-full border-l animate-fade-in",
  },
  left: {
    wrapper: "justify-start",
    panel: "h-full w-full border-r animate-fade-in",
  },
  bottom: {
    wrapper: "items-end",
    panel: "max-h-[85vh] w-full max-w-none rounded-t-2xl border-t animate-fade-up",
  },
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  placement?: ModalPlacement;
  /** Close when clicking the backdrop (default true). */
  dismissible?: boolean;
  /** Visually hide the title while keeping it as the accessible name. */
  hideTitle?: boolean;
  initialFocus?: RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * Accessible dialog: focus is trapped while open and returned to the trigger on close,
 * Escape closes, body scroll is locked, and the panel is labelled by its title.
 * Use `placement` for drawer / bottom-sheet variants.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  placement = "center",
  dismissible = true,
  hideTitle,
  initialFocus,
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useLockBodyScroll(open);
  useFocusTrap(panelRef, open, initialFocus);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const layout = placements[placement];

  return (
    <Portal>
      <div className={cn("fixed inset-0 z-50 flex", layout.wrapper)}>
        <div
          aria-hidden
          className="absolute inset-0 animate-fade-in bg-black/50 backdrop-blur-sm"
          onClick={dismissible ? onClose : undefined}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          className={cn(
            "relative flex flex-col bg-surface shadow-2xl shadow-black/10 focus:outline-none",
            placement === "center" && "border",
            placement !== "bottom" && sizes[size],
            layout.panel,
            className,
          )}
        >
          <header className="flex items-start justify-between gap-4 p-6 pb-0">
            <div className={cn(hideTitle && "sr-only")}>
              <h2 id={titleId} className="text-lg font-semibold tracking-tight text-fg">
                {title}
              </h2>
              {description ? (
                <p id={descriptionId} className="mt-1 text-sm text-muted">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="-mr-2 -mt-1 ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
          {footer ? (
            <footer className="flex flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end">{footer}</footer>
          ) : null}
        </div>
      </div>
    </Portal>
  );
}
