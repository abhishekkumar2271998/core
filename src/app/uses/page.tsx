import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { usesCategories } from "@/data/uses";
import { UsesNav } from "@/components/uses/UsesNav";
import { Icon } from "@/components/icons/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { pluralize } from "@/lib/utils";
import type { IconName, UsesItem } from "@/types";

export const metadata: Metadata = {
  title: "Uses",
  description: `The hardware, software and tools ${siteConfig.name} uses every day to design, build and ship.`,
  alternates: { canonical: "/uses" },
  openGraph: {
    title: `Uses · ${siteConfig.name}`,
    description: "Hardware, editor setup, dev tools, design apps and the tech stack I rely on.",
    url: "/uses",
  },
};

const categoryIcons: Record<string, IconName> = {
  hardware: "cpu",
  "editor-terminal": "terminal",
  "dev-tools": "code",
  design: "palette",
  apps: "grid",
  stack: "layers",
};

function hostname(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

function UsesCard({ item }: { item: UsesItem }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium tracking-tight text-fg">{item.name}</h3>
        {item.href ? (
          <Icon
            name="arrow-up-right"
            className="mt-0.5 h-4 w-4 shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          />
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
      {item.href ? <p className="mt-4 font-mono text-xs text-muted/80">{hostname(item.href)}</p> : null}
    </>
  );

  const classes = "group flex h-full flex-col rounded-2xl border bg-surface p-5 transition";

  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${classes} card-hover hover:border-accent/40`}
      >
        {body}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  return <div className={classes}>{body}</div>;
}

export default function UsesPage() {
  const totalItems = usesCategories.reduce((sum, c) => sum + c.items.length, 0);
  const sections = usesCategories.map((c) => ({ id: c.id, title: c.title, count: c.items.length }));

  return (
    <>
      <div className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-dots mask-fade-b opacity-70" />
        <Container className="relative pb-10 pt-16 sm:pt-24">
          <div className="max-w-2xl animate-fade-up">
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">/uses</p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Tools, gear &amp; <span className="text-gradient">software</span> I use every day
            </h1>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-muted">
              People ask about my setup fairly often, so here it is — {pluralize(totalItems, "thing")} across{" "}
              {pluralize(usesCategories.length, "category", "categories")}. Nothing here is sponsored; it&apos;s simply
              what works for me right now.
            </p>
          </div>
        </Container>
      </div>

      <Section className="pt-4 sm:pt-8">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
            <aside className="lg:self-start">
              <UsesNav sections={sections} />
            </aside>

            <div className="space-y-16">
              {usesCategories.map((category) => (
                <section key={category.id} id={category.id} aria-labelledby={`${category.id}-title`} className="scroll-mt-32">
                  <Reveal>
                    <div className="mb-6 flex items-center gap-3 border-b pb-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border bg-surface-2 text-accent">
                        <Icon name={categoryIcons[category.id] ?? "star"} className="h-5 w-5" />
                      </span>
                      <h2 id={`${category.id}-title`} className="text-2xl font-semibold tracking-tight">
                        {category.title}
                      </h2>
                      <span className="ml-auto font-mono text-xs text-muted">
                        {String(category.items.length).padStart(2, "0")}
                      </span>
                    </div>
                  </Reveal>
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {category.items.map((item, i) => (
                      <Reveal as="li" key={item.name} delay={(i % 2) * 80}>
                        <UsesCard item={item} />
                      </Reveal>
                    ))}
                  </ul>
                </section>
              ))}

              <Reveal>
                <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">Curious about something not listed?</p>
                    <p className="mt-1 text-sm text-muted">Happy to share configs, dotfiles or recommendations.</p>
                  </div>
                  <ButtonLink href="/contact" variant="outline" iconRight="arrow-right">
                    Ask me
                  </ButtonLink>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
