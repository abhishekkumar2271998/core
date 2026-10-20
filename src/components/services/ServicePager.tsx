import Link from "next/link";
import type { ServiceWithDetail } from "@/data/service-details";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils";

interface ServicePagerProps {
  prev: ServiceWithDetail;
  next: ServiceWithDetail;
}

/** Previous / next service links shown at the foot of a detail page. */
export function ServicePager({ prev, next }: ServicePagerProps) {
  const links = [
    { service: prev, label: "Previous service", icon: "arrow-left" as const, align: "left" as const },
    { service: next, label: "Next service", icon: "arrow-right" as const, align: "right" as const },
  ];

  return (
    <nav aria-label="More services" className="grid gap-4 sm:grid-cols-2">
      {links.map(({ service, label, icon, align }) => (
        <Link
          key={label}
          href={`/services/${service.slug}`}
          rel={align === "left" ? "prev" : "next"}
          className={cn(
            "group flex flex-col gap-1 rounded-2xl border bg-surface p-5 transition hover:border-accent/40 hover:bg-surface-2",
            align === "right" && "sm:items-end sm:text-right",
          )}
        >
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            {align === "left" ? <Icon name={icon} className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" /> : null}
            {label}
            {align === "right" ? <Icon name={icon} className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /> : null}
          </span>
          <span className="font-semibold text-fg">{service.title}</span>
        </Link>
      ))}
    </nav>
  );
}
