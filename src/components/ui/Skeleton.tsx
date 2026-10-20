import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Placeholder block shown while content loads. Decorative; announce loading on a parent via `aria-busy`. */
export function Skeleton({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div aria-hidden className={cn("animate-pulse rounded-lg bg-surface-2", className)} {...props} />;
}

const lineWidths = ["w-full", "w-11/12", "w-4/5", "w-2/3"];

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 && lines > 1 ? "w-1/2" : lineWidths[i % lineWidths.length])} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className, media = true }: { className?: string; media?: boolean }) {
  return (
    <div aria-hidden className={cn("rounded-2xl border bg-surface p-6", className)}>
      {media ? <Skeleton className="mb-5 aspect-video w-full rounded-xl" /> : null}
      <Skeleton className="mb-4 h-5 w-2/3" />
      <SkeletonText lines={3} />
      <div className="mt-6 flex gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}
