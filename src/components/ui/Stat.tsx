import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import type { IconName } from "@/types";

interface StatProps {
  label: ReactNode;
  value: ReactNode;
  /** Percentage change vs. the previous period; sign sets the direction. */
  change?: number;
  /** Treat a decrease as good (e.g. load time). */
  invertChange?: boolean;
  helper?: ReactNode;
  icon?: IconName;
  className?: string;
}

/** Key metric tile: label, large value and optional trend. */
export function Stat({ label, value, change, invertChange, helper, icon, className }: StatProps) {
  const up = change !== undefined && change > 0;
  const flat = change === undefined || change === 0;
  const good = invertChange ? !up : up;

  return (
    <div className={cn("rounded-2xl border bg-surface p-5", className)}>
      <dl>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-sm text-muted">{label}</dt>
          {icon ? (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Icon name={icon} className="h-4 w-4" />
            </span>
          ) : null}
        </div>
        <dd className="mt-2 text-3xl font-semibold tracking-tight text-fg tabular-nums">{value}</dd>
        {change !== undefined ? (
          <dd
            className={cn(
              "mt-2 inline-flex items-center gap-1 text-xs font-medium",
              flat ? "text-muted" : good ? "text-success" : "text-danger",
            )}
          >
            {!flat ? (
              <Icon name="arrow-up" className={cn("h-3.5 w-3.5", !up && "rotate-180")} />
            ) : null}
            <span className="sr-only">{flat ? "No change" : up ? "Increased by" : "Decreased by"}</span>
            {Math.abs(change).toLocaleString(undefined, { maximumFractionDigits: 1 })}%
            {helper ? <span className="ml-1 font-normal text-muted">{helper}</span> : null}
          </dd>
        ) : helper ? (
          <dd className="mt-2 text-xs text-muted">{helper}</dd>
        ) : null}
      </dl>
    </div>
  );
}

/** Responsive grid for a row of `Stat` tiles. */
export function StatGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>{children}</div>;
}
