import type { Experience } from "@/types";
import { Badge } from "@/components/ui/primitives";
import { Icon } from "@/components/icons/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { AchievementList } from "@/components/about/AchievementList";
import { durationBetween, formatMonth } from "@/lib/utils";

/** Reusable vertical career timeline. */
export function Timeline({ items }: { items: Experience[] }) {
  return (
    <ol className="relative space-y-10 border-l pl-8 sm:pl-10">
      {items.map((job, i) => {
        const current = job.end === null;
        return (
          <Reveal as="li" key={job.id} delay={i * 60} className="relative">
            <span
              aria-hidden
              className={`absolute -left-[41px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-bg sm:-left-[49px] ${current ? "border-accent" : "border-border"}`}
            >
              {current ? <span className="h-1.5 w-1.5 rounded-full bg-accent" /> : null}
            </span>
            <div className="rounded-2xl border bg-surface p-6 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-fg">{job.role}</h3>
                  <p className="mt-0.5 text-sm font-medium text-accent">
                    {job.companyUrl ? (
                      <a href={job.companyUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {job.company}
                      </a>
                    ) : (
                      job.company
                    )}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium text-fg">
                    <time dateTime={job.start}>{formatMonth(job.start)}</time> –{" "}
                    {job.end ? <time dateTime={job.end}>{formatMonth(job.end)}</time> : "Present"}
                  </p>
                  <p className="text-muted">{durationBetween(job.start, job.end)}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  <Icon name="map-pin" className="h-3.5 w-3.5" />
                  {job.location}
                  {job.remote ? " · Remote" : ""}
                </span>
                <span className="inline-flex items-center gap-1 capitalize">
                  <Icon name="briefcase" className="h-3.5 w-3.5" />
                  {job.type.replace("-", " ")}
                </span>
                {current ? <Badge variant="success">Current</Badge> : null}
              </div>
              <p className="mt-4 leading-relaxed text-muted">{job.summary}</p>
              <div className="mt-5">
                <AchievementList items={job.achievements} />
              </div>
              <ul className="mt-5 flex flex-wrap gap-1.5 border-t pt-5" aria-label="Tech stack">
                {job.stack.map((s) => (
                  <li key={s}>
                    <Badge variant="outline">{s}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        );
      })}
    </ol>
  );
}
