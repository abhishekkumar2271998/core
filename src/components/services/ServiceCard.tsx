import Link from "next/link";
import type { ServiceWithDetail } from "@/data/service-details";
import { getStartingPrice } from "@/data/service-details";
import { Card } from "@/components/ui/primitives";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: ServiceWithDetail;
  index: number;
  /** Compact variant used in "other services" rails. */
  compact?: boolean;
  className?: string;
}

/** Linked overview card for a service. The whole card is clickable via a stretched link. */
export function ServiceCard({ service, index, compact, className }: ServiceCardProps) {
  const from = getStartingPrice(service);

  return (
    <Card interactive className={cn("group relative flex h-full flex-col overflow-hidden", compact ? "p-5" : "p-7", className)}>
      <div
        aria-hidden
        className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 sm:opacity-0"
      />
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-xl border bg-surface-2 text-accent transition-colors duration-300 group-hover:border-accent/40 group-hover:bg-accent group-hover:text-accent-fg",
            compact ? "h-10 w-10" : "h-12 w-12",
          )}
        >
          <Icon name={service.icon} className="h-5 w-5" />
        </span>
        <span className="font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
      </div>

      <h3 className={cn("font-semibold tracking-tight text-fg", compact ? "mt-4 text-lg" : "mt-6 text-xl")}>
        <Link href={`/services/${service.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
          {service.title}
        </Link>
      </h3>
      <p className={cn("leading-relaxed text-muted", compact ? "mt-2 text-sm" : "mt-3")}>
        {compact ? service.tagline : service.description}
      </p>

      {!compact ? (
        <ul className="mt-6 space-y-2 border-t pt-5">
          {service.deliverables.map((d) => (
            <li key={d} className="flex items-center gap-2.5 text-sm text-fg/80">
              <Icon name="check" className="h-4 w-4 shrink-0 text-success" />
              {d}
            </li>
          ))}
        </ul>
      ) : null}

      <div className={cn("mt-auto flex items-center justify-between gap-4", compact ? "pt-5" : "pt-7")}>
        {from ? (
          <p className="text-sm text-muted">
            From <span className="font-semibold text-fg">{from}</span>
          </p>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
          Details
          <Icon name="arrow-right" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Card>
  );
}
