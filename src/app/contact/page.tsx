import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactDetails } from "@/components/contact/ContactDetails";
import { FAQ } from "@/components/contact/FAQ";
import { Icon } from "@/components/icons/Icon";
import { Badge, Card, Container, Section, SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import type { IconName } from "@/types";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.name} about freelance projects, full-time roles, consulting or speaking.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact · ${siteConfig.name}`,
    description: `Start a conversation with ${siteConfig.name}, ${siteConfig.role}.`,
    url: "/contact",
  },
};

const steps: { icon: IconName; title: string; body: string }[] = [
  { icon: "send", title: "You reach out", body: "Share a few details about what you're building and your timeline." },
  { icon: "calendar", title: "We talk", body: "A free 30-minute call to understand goals, constraints and fit." },
  { icon: "zap", title: "We ship", body: "A clear proposal, weekly demos and a smooth hand-off at the end." },
];

export default function ContactPage() {
  return (
    <>
      <div className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-60" />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl"
        />
        <Container className="relative pb-8 pt-16 sm:pt-24">
          <div className="max-w-2xl animate-fade-up">
            <Badge variant={siteConfig.availability.open ? "success" : "default"} className="mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {siteConfig.availability.message}
            </Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              Let&apos;s build something <span className="text-gradient">worth shipping</span>.
            </h1>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-muted">
              Have a project in mind, a role to fill, or just want to say hi? Drop me a message — I read every one and
              reply personally.
            </p>
          </div>
        </Container>
      </div>

      <Section className="pt-8 sm:pt-12">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <Reveal>
              <Card className="p-6 sm:p-8">
                <div className="mb-8 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon name="email" className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">Send a message</h2>
                    <p className="text-sm text-muted">Name, email and message are required.</p>
                  </div>
                </div>
                <ContactForm />
              </Card>
            </Reveal>
            <Reveal delay={120} as="aside" className="lg:sticky lg:top-24 lg:self-start">
              <ContactDetails />
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="border-t bg-surface/40" aria-labelledby="process-heading">
        <Container>
          <SectionHeader
            eyebrow="How it works"
            title={<span id="process-heading">From first message to launch</span>}
            align="center"
          />
          <ol className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 100}>
                <Card className="h-full">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border bg-surface-2 text-fg">
                      <Icon name={step.icon} className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
                </Card>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      <Section aria-labelledby="faq-heading">
        <Container className="max-w-3xl">
          <SectionHeader
            eyebrow="FAQ"
            title={<span id="faq-heading">Questions people often ask</span>}
            description="Can't find what you're looking for? Ask away in the form above."
            align="center"
          />
          <Reveal>
            <FAQ />
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
