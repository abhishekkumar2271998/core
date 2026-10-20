import { Icon } from "@/components/icons/Icon";

interface ServiceFitProps {
  idealFor: string[];
  notFor: string[];
}

/** Two-column "a great fit / probably not a fit" list to help visitors self-qualify. */
export function ServiceFit({ idealFor, notFor }: ServiceFitProps) {
  return (
    <div className="grid gap-5 md:grid-cols-[3fr_2fr]">
      <div className="rounded-2xl border bg-surface p-6">
        <h3 className="flex items-center gap-2 font-semibold text-fg">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-success/10 text-success">
            <Icon name="check" className="h-4 w-4" />
          </span>
          A great fit for
        </h3>
        <ul className="mt-4 space-y-3">
          {idealFor.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed text-fg/85">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-dashed p-6">
        <h3 className="flex items-center gap-2 font-semibold text-fg">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-muted">
            <Icon name="close" className="h-4 w-4" />
          </span>
          Probably not a fit
        </h3>
        <ul className="mt-4 space-y-3">
          {notFor.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
