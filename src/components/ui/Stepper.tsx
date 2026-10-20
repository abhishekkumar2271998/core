import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";

export interface Step {
  title: ReactNode;
  description?: ReactNode;
}

interface StepperProps {
  steps: Step[];
  /** Zero-based index of the current step. Steps before it are complete. */
  current: number;
  orientation?: "horizontal" | "vertical";
  /** Make completed steps clickable to navigate back. */
  onStepClick?: (index: number) => void;
  className?: string;
  label?: string;
}

export function Stepper({
  steps,
  current,
  orientation = "horizontal",
  onStepClick,
  className,
  label = "Progress",
}: StepperProps) {
  const vertical = orientation === "vertical";
  return (
    <nav aria-label={label} className={className}>
      <ol className={cn("flex", vertical ? "flex-col gap-0" : "items-start gap-2")}>
        {steps.map((step, i) => {
          const status = i < current ? "complete" : i === current ? "current" : "upcoming";
          const last = i === steps.length - 1;
          const clickable = Boolean(onStepClick) && status === "complete";
          const marker = (
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                status === "complete" && "border-accent bg-accent text-accent-fg",
                status === "current" && "border-accent bg-surface text-accent",
                status === "upcoming" && "border-border bg-surface text-muted",
              )}
            >
              {status === "complete" ? <Icon name="check" className="h-4 w-4" strokeWidth={2.5} /> : i + 1}
            </span>
          );
          const text = (
            <span className="min-w-0">
              <span className={cn("block text-sm font-medium", status === "upcoming" ? "text-muted" : "text-fg")}>
                {step.title}
              </span>
              {step.description ? <span className="mt-0.5 block text-xs text-muted">{step.description}</span> : null}
            </span>
          );
          const content = (
            <span className={cn("flex gap-3", vertical ? "items-start" : "flex-col items-center text-center sm:flex-row sm:text-left")}>
              {marker}
              {text}
            </span>
          );

          return (
            <li
              key={i}
              aria-current={status === "current" ? "step" : undefined}
              className={cn("relative", vertical ? "pb-8 last:pb-0" : "flex flex-1 items-center gap-2")}
            >
              {clickable ? (
                <button type="button" onClick={() => onStepClick?.(i)} className="rounded-lg text-left hover:opacity-80">
                  {content}
                  <span className="sr-only"> (completed, go back)</span>
                </button>
              ) : (
                <>
                  {content}
                  {status === "complete" ? <span className="sr-only"> (completed)</span> : null}
                </>
              )}
              {!last ? (
                <span
                  aria-hidden
                  className={cn(
                    i < current ? "bg-accent" : "bg-border",
                    vertical ? "absolute left-4 top-9 h-[calc(100%-2.5rem)] w-0.5 -translate-x-1/2" : "hidden h-0.5 flex-1 sm:block",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
