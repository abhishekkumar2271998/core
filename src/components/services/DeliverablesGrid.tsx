import type { ServiceDeliverable } from "@/data/service-details";
import { Icon } from "@/components/icons/Icon";

/** Grid of concrete deliverables with an icon, title and one-line explanation. */
export function DeliverablesGrid({ items }: { items: ServiceDeliverable[] }) {
  return (
    <ul className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.title} className="group bg-surface p-6 transition-colors hover:bg-surface-2/60">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform duration-300 group-hover:-translate-y-0.5">
            <Icon name={item.icon} className="h-5 w-5" />
          </span>
          <h3 className="mt-4 font-semibold text-fg">{item.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.description}</p>
        </li>
      ))}
    </ul>
  );
}
