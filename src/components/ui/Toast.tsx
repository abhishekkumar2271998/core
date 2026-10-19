"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import type { IconName } from "@/types";
import { Portal } from "./Portal";

type ToastVariant = "default" | "success" | "danger" | "warning";

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  /** Auto-dismiss after ms; `0` keeps it until closed. Default 5000. */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, { icon: IconName; className: string }> = {
  default: { icon: "info", className: "text-accent" },
  success: { icon: "check", className: "text-success" },
  danger: { icon: "alert", className: "text-danger" },
  warning: { icon: "alert", className: "text-warning" },
};

const MAX_TOASTS = 4;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const clear = useCallback(() => setToasts([]), []);
  const toast = useCallback((options: ToastOptions) => {
    const id = ++counter.current;
    setToasts((list) => [...list, { ...options, id }].slice(-MAX_TOASTS));
    return id;
  }, []);

  const value = useMemo(() => ({ toast, dismiss, clear }), [toast, dismiss, clear]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Portal>
        <ol
          aria-label="Notifications"
          className="pointer-events-none fixed bottom-0 right-0 z-[60] flex w-full flex-col gap-2 p-4 sm:max-w-sm"
        >
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} dismiss={dismiss} />
          ))}
        </ol>
      </Portal>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, dismiss }: { toast: ToastItem; dismiss: (id: number) => void }) {
  const { id, title, description, variant = "default", duration = 5000, action } = toast;
  const onDismiss = useCallback(() => dismiss(id), [dismiss, id]);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration);
  const startedAt = useRef(0);

  useEffect(() => {
    if (!duration || paused) return;
    startedAt.current = Date.now();
    const timer = setTimeout(onDismiss, remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [duration, paused, onDismiss]);

  const style = variantStyles[variant];
  const urgent = variant === "danger";

  return (
    <li
      role={urgent ? "alert" : "status"}
      aria-live={urgent ? "assertive" : "polite"}
      aria-atomic="true"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => e.key === "Escape" && onDismiss()}
      className="pointer-events-auto flex animate-fade-up items-start gap-3 rounded-2xl border bg-surface p-4 shadow-lg shadow-black/5"
    >
      <Icon name={style.icon} className={cn("mt-0.5 h-5 w-5 shrink-0", style.className)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-fg">{title}</p>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
        {action ? (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              onDismiss();
            }}
            className="mt-2 text-sm font-medium text-accent hover:underline"
          >
            {action.label}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="-mr-1 -mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
      >
        <Icon name="close" className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

/** Access the toast API. Must be rendered inside `<ToastProvider>`. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
