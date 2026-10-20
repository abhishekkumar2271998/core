import type { PricingTier } from "@/data/service-details";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/primitives";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils";

interface PricingTiersProps {
  tiers: PricingTier[];
  /** Service slug, forwarded to the contact form so enquiries arrive with context. */
  serviceSlug: string;
}

function contactHref(serviceSlug: string, tierId: string): string {
  const params = new URLSearchParams({ service: serviceSlug, tier: tierId });
  return `/contact?${params.toString()}`;
}

/** Side-by-side pricing cards. The highlighted tier is visually raised and gets the primary CTA. */
export function PricingTiers({ tiers, serviceSlug }: PricingTiersProps) {
  return (
    <div className={cn("grid gap-5", tiers.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2")}>
      {tiers.map((tier) => {
        const featured = Boolean(tier.highlighted);
        return (
          <article
            key={tier.id}
            aria-labelledby={`tier-${tier.id}`}
            className={cn(
              "relative flex flex-col rounded-2xl border p-6 sm:p-7",
              featured ? "border-accent/50 bg-surface shadow-lg shadow-accent/10 ring-1 ring-accent/30 lg:-my-3 lg:py-10" : "bg-surface",
            )}
          >
            {featured ? (
              <Badge variant="accent" className="absolute -top-3 left-6 border border-accent/30 bg-surface">
                <Icon name="star" className="h-3 w-3" />
                Most popular
              </Badge>
            ) : null}

            <h3 id={`tier-${tier.id}`} className="text-lg font-semibold tracking-tight text-fg">
              {tier.name}
            </h3>
            <p className="mt-2 min-h-[3rem] text-sm leading-relaxed text-muted">{tier.description}</p>

            <p className="mt-6 flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold tracking-tight text-fg">{tier.price}</span>
              {tier.unit ? <span className="text-sm text-muted">{tier.unit}</span> : null}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted">
              <Icon name="calendar" className="h-3.5 w-3.5" />
              {tier.timeline}
            </p>

            <ul className="mt-6 space-y-3 border-t pt-6">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-fg/85">
                  <Icon name="check" className={cn("mt-0.5 h-4 w-4 shrink-0", featured ? "text-accent" : "text-success")} />
                  {feature}
                </li>
              ))}
            </ul>

            <ButtonLink
              href={contactHref(serviceSlug, tier.id)}
              variant={featured ? "primary" : "outline"}
              iconRight="arrow-right"
              className="mt-8 w-full"
            >
              {tier.cta}
            </ButtonLink>
          </article>
        );
      })}
    </div>
  );
}
