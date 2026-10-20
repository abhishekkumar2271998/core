import Link from "next/link";
import type { Testimonial } from "@/types";
import { Avatar } from "@/components/ui/primitives";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils";

/**
 * Testimonials relevant to a service. The first quote is shown large,
 * the rest as a compact column beside it.
 */
export function ServiceTestimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  const [lead, ...rest] = items;

  return (
    <div className={cn("grid gap-5", rest.length && "lg:grid-cols-[3fr_2fr]")}>
      <figure className="relative overflow-hidden rounded-3xl border bg-surface p-7 sm:p-10">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-2 -top-8 select-none font-serif text-[9rem] leading-none text-accent/10"
        >
          &ldquo;
        </span>
        <blockquote className="relative text-pretty text-xl font-medium leading-relaxed tracking-tight text-fg sm:text-2xl">
          <p>{lead.quote}</p>
        </blockquote>
        <figcaption className="mt-8 flex items-center gap-4">
          <Avatar initials={lead.initials} />
          <div>
            <p className="font-semibold text-fg">{lead.author}</p>
            <p className="text-sm text-muted">
              {lead.title}, {lead.company}
            </p>
          </div>
        </figcaption>
      </figure>

      {rest.length ? (
        <div className="flex flex-col gap-5">
          {rest.map((t) => (
            <figure key={t.id} className="flex flex-1 flex-col rounded-2xl border bg-surface p-6">
              <blockquote className="flex-1 text-sm leading-relaxed text-fg/85">
                <p>&ldquo;{t.quote}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <Avatar initials={t.initials} size="sm" />
                <p className="text-sm">
                  <span className="font-medium text-fg">{t.author}</span>
                  <span className="text-muted"> · {t.company}</span>
                </p>
              </figcaption>
            </figure>
          ))}
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-accent hover:underline"
          >
            Read all testimonials
            <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
