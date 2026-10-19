import type { ReactNode } from "react";
import Link from "next/link";
import type { ServiceWithDetail } from "@/data/service-details";
import { getStartingPrice } from "@/data/service-details";
import { Icon } from "@/components/icons/Icon";

/**
 * Comparison table across all services: typical timeline, starting price and
 * engagement models. Scrolls horizontally on small screens instead of collapsing.
 */
export function EngagementComparison({ services }: { services: ServiceWithDetail[] }) {
  const rows: { label: string; render: (s: ServiceWithDetail) => ReactNode }[] = [
    { label: "Best for", render: (s) => s.idealFor[0] },
    {
      label: "Typical timeline",
      render: (s) => s.process.map((p) => p.duration).join(" → "),
    },
    { label: "Starting from", render: (s) => getStartingPrice(s) ?? "Custom" },
    {
      label: "Engagement models",
      render: (s) => (
        <ul className="space-y-1">
          {s.pricing.map((tier) => (
            <li key={tier.id} className="flex items-center gap-1.5">
              <Icon name="check" className="h-3.5 w-3.5 shrink-0 text-success" />
              {tier.name}
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border bg-surface">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <caption className="sr-only">Comparison of services by fit, timeline and price</caption>
        <thead>
          <tr className="border-b">
            <th scope="col" className="w-40 p-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
              Service
            </th>
            {services.map((s) => (
              <th key={s.id} scope="col" className="p-4 align-bottom">
                <Link
                  href={`/services/${s.slug}`}
                  className="inline-flex items-center gap-2 font-semibold text-fg transition-colors hover:text-accent"
                >
                  <Icon name={s.icon} className="h-4 w-4 text-accent" />
                  {s.title}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.label} className="align-top">
              <th scope="row" className="p-4 font-medium text-muted">
                {row.label}
              </th>
              {services.map((s) => (
                <td key={s.id} className="p-4 leading-relaxed text-fg/85">
                  {row.render(s)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
