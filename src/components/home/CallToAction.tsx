import { siteConfig } from "@/data/site";
import { Container, Section, StatusDot } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";

interface CallToActionProps {
  title?: string;
  description?: string;
  className?: string;
}

/** Closing call-to-action band, reused on Home and About. */
export function CallToAction({
  title = "Have a project in mind? Let's build something great.",
  description = "I'm currently taking on a small number of new engagements. Tell me about your product, team and timeline — I usually reply within a day.",
  className,
}: CallToActionProps) {
  const email = siteConfig.socials.find((s) => s.platform === "email");

  return (
    <Section className={className}>
      <Container>
        <div className="relative isolate overflow-hidden rounded-3xl border bg-fg px-6 py-16 text-center text-bg sm:px-16 sm:py-20">
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/50 blur-3xl" />
            <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-fuchsia-500/40 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-40 w-96 -translate-x-1/2 rounded-full bg-amber-400/20 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
                WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
              }}
            />
          </div>

          <p className="inline-flex items-center gap-2 rounded-full border border-bg/15 bg-bg/5 px-3 py-1 text-sm text-bg/80">
            <StatusDot active={siteConfig.availability.open} />
            {siteConfig.availability.message}
          </p>
          <h2 className="mx-auto mt-6 max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-bg/70">{description}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink
              href="/contact"
              size="lg"
              variant="secondary"
              iconRight="arrow-right"
            >
              Start a conversation
            </ButtonLink>
            {email ? (
              <a
                href={email.href}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-bg/20 px-6 text-base font-medium text-bg transition-colors hover:bg-bg/10"
              >
                <Icon name="email" className="h-4 w-4" />
                {siteConfig.email}
              </a>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
