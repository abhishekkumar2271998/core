import type { ServiceProcessStep } from "@/data/service-details";
import { Badge } from "@/components/ui/primitives";
import { Icon } from "@/components/icons/Icon";

/** Numbered, vertically connected list of engagement phases. */
export function ProcessTimeline({ steps }: { steps: ServiceProcessStep[] }) {
  return (
    <ol className="relative space-y-6">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={step.title} className="relative grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-8">
            {/* Rail: number bubble plus a connector line down to the next step */}
            <div className="relative flex flex-col items-center">
              <span className="z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-surface font-mono text-sm font-semibold text-accent">
                {i + 1}
              </span>
              {!last ? <span aria-hidden className="absolute top-10 h-[calc(100%+1.5rem)] w-px bg-border" /> : null}
            </div>

            <div className="rounded-2xl border bg-surface p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold tracking-tight text-fg">{step.title}</h3>
                <Badge variant="outline">
                  <Icon name="clock" className="h-3 w-3" />
                  {step.duration}
                </Badge>
              </div>
              <p className="mt-2 leading-relaxed text-muted">{step.description}</p>
              <div className="mt-5 border-t pt-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">You get</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {step.outputs.map((output) => (
                    <li
                      key={output}
                      className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-sm text-fg/80"
                    >
                      <Icon name="check" className="h-3.5 w-3.5 text-success" />
                      {output}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
