import type { Metadata } from "next";
import { getServicesWithDetails } from "@/data/service-details";
import { siteConfig } from "@/data/site";
import { stats } from "@/data/services";
import { ServiceCard } from "@/components/services/ServiceCard";
import { EngagementComparison } from "@/components/services/EngagementComparison";
import { ProcessStepper } from "@/components/home/ProcessStepper";
import { CallToAction } from "@/components/home/CallToAction";
import { FAQ, type FaqItem } from "@/components/contact/FAQ";
import { Container, Section, SectionHeader } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Services",
  description: `Product engineering, performance, design systems and technical leadership — how ${siteConfig.name} can help your team.`,
  alternates: { canonical: "/services" },
};

/** Questions that apply to every engagement, regardless of service. */
const generalFaqs: FaqItem[] = [
  {
    question: "How soon can you start?",
    answer:
      "Usually within two to four weeks. I keep a small number of concurrent engagements so each one gets real focus — if the timing doesn't work, I'll tell you when my next slot opens.",
  },
  {
    question: "Do you work on-site?",
    answer:
      "I'm remote-first and work async by default, with regular video calls. For kick-offs and workshops I'm happy to travel within Europe.",
  },
  {
    question: "How do invoicing and payment work?",
    answer:
      "Fixed-price projects are invoiced 40% upfront, 60% on delivery. Weekly and monthly engagements are invoiced at the start of each period with 14-day payment terms.",
  },
  {
    question: "Can services be combined?",
    answer:
      "Yes, and they often are — a performance audit that turns into a design-system rollout, or a product build with fractional leadership on top. We'll shape the engagement around what you need.",
  },
];

export default function ServicesPage() {
  const services = getServicesWithDetails();
  const proof = stats.slice(0, 3);

  return (
    <>
      <Section className="pb-0 sm:pb-0">
        <Container>
          <SectionHeader
            as="h1"
            eyebrow="Services"
            title="Senior engineering, without the full-time hire"
            description="I work with a handful of teams at a time on product builds, performance, design systems and technical leadership. Clear scope, weekly demos and code your team will be glad to inherit."
            action={
              <ButtonLink href="/contact" iconRight="arrow-right">
                Start a project
              </ButtonLink>
            }
          />
          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border bg-border">
            {proof.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-1 bg-surface p-5 sm:p-6">
                <dt className="text-xs text-muted sm:text-sm">{s.label}</dt>
                <dd className="text-2xl font-semibold tracking-tight text-fg sm:text-4xl">
                  {s.prefix}
                  {s.value}
                  {s.suffix}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="sr-only">All services</h2>
          <ul className="grid gap-5 sm:grid-cols-2">
            {services.map((service, i) => (
              <Reveal as="li" key={service.id} delay={(i % 2) * 100}>
                <ServiceCard service={service} index={i} />
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <Section className="pt-0 sm:pt-0">
        <Container>
          <SectionHeader
            eyebrow="Compare"
            title="Which engagement fits?"
            description="A quick side-by-side of who each service is for, how long it usually takes and where pricing starts."
          />
          <EngagementComparison services={services} />
        </Container>
      </Section>

      <ProcessStepper />

      <Section>
        <Container className="max-w-3xl">
          <SectionHeader eyebrow="FAQ" title="Before we start" align="center" />
          <FAQ items={generalFaqs} />
        </Container>
      </Section>

      <CallToAction title="Not sure which service you need? Let's figure it out together." />
    </>
  );
}
