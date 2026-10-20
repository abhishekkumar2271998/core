"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import type { IconName } from "@/types";

type AlertVariant = "info" | "success" | "warning" | "danger";

const variants: Record<AlertVariant, { icon: IconName; className: string; iconClass: string }> = {
  info: { icon: "info", className: "border-accent/30 bg-accent/5", iconClass: "text-accent" },
  success: { icon: "check", className: "border-success/30 bg-success/5", iconClass: "text-success" },
  warning: { icon: "alert", className: "border-warning/30 bg-warning/5", iconClass: "text-warning" },
  danger: { icon: "alert", className: "border-danger/30 bg-danger/5", iconClass: "text-danger" },
};

interface AlertProps {
  variant?: AlertVariant;
  title?: ReactNode;
  children?: ReactNode;
  icon?: IconName;
  action?: ReactNode;
  /** Show a close button; the alert hides itself and calls `onDismiss`. */
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Inline callout. Danger/warning use role="alert" (announced immediately);
 * info/success use role="status" (polite).
 */
export function Alert({
  variant = "info",
  title,
  children,
  icon,
  action,
  dismissible,
  onDismiss,
  className,
}: AlertProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  const v = variants[variant];
  const urgent = variant === "danger" || variant === "warning";

  return (
    <div
      role={urgent ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-2xl border p-4", v.className, className)}
    >
      <Icon name={icon ?? v.icon} className={cn("mt-0.5 h-5 w-5 shrink-0", v.iconClass)} />
      <div className="min-w-0 flex-1 text-sm">
        {title ? <p className="font-medium text-fg">{title}</p> : null}
        {children ? <div className={cn("leading-relaxed text-muted", title ? "mt-1" : null)}>{children}</div> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
      {dismissible ? (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            setVisible(false);
            onDismiss?.();
          }}
          className="-mr-1 -mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <Icon name="close" className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
