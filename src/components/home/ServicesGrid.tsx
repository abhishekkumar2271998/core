import { services } from "@/data/services";
import { Container, Section, SectionHeader, Card } from "@/components/ui/primitives";
import { Icon } from "@/components/icons/Icon";
import { Reveal } from "@/components/ui/Reveal";

export function ServicesGrid() {
  return (
    <Section className="relative isolate">
      <div aria-hidden className="bg-dots absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <Container>
        <SectionHeader
          eyebrow="What I do"
          title="Ways I can help your team"
          description="Whether you need a product built from zero, a slow app made fast, or a steady hand on architecture — here's where I add the most value."
        />
        <ul className="grid gap-5 sm:grid-cols-2">
          {services.map((service, i) => (
            <Reveal as="li" key={service.id} delay={(i % 2) * 100}>
              <Card interactive className="group relative h-full overflow-hidden p-7">
                <div
                  aria-hidden
                  className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 sm:opacity-0"
                />
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border bg-surface-2 text-accent transition-colors duration-300 group-hover:border-accent/40 group-hover:bg-accent group-hover:text-accent-fg">
                    <Icon name={service.icon} className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-muted">0{i + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-fg">{service.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{service.description}</p>
                <ul className="mt-6 space-y-2 border-t pt-5">
                  {service.deliverables.map((d) => (
                    <li key={d} className="flex items-center gap-2.5 text-sm text-fg/80">
                      <Icon name="check" className="h-4 w-4 shrink-0 text-success" />
                      {d}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
