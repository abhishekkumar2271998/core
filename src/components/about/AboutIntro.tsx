import Link from "next/link";
import { siteConfig } from "@/data/site";
import { experience, totalExperienceYears } from "@/data/experience";
import { Avatar, Badge, Container, Section, StatusDot } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import type { IconName } from "@/types";

interface Fact {
  icon: IconName;
  label: string;
  value: string;
}

export function AboutIntro() {
  const current = experience.find((e) => e.end === null) ?? experience[0];
  const years = totalExperienceYears();

  const facts: Fact[] = [
    { icon: "briefcase", label: "Currently", value: `${current.role} at ${current.company}` },
    { icon: "map-pin", label: "Location", value: siteConfig.location },
    { icon: "clock", label: "Experience", value: `${years}+ years in production` },
    { icon: "globe", label: "Languages", value: "English, German (B2), Spanish (A2)" },
    { icon: "heart", label: "Off-screen", value: "Bouldering, film photography, sourdough" },
    { icon: "book", label: "Reading", value: "“A Philosophy of Software Design”" },
  ];

  return (
    <Section className="relative isolate pt-12 sm:pt-16">
      <div aria-hidden className="bg-grid absolute inset-x-0 top-0 -z-10 h-[520px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <Container>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-20">
          {/* Portrait */}
          <div className="mx-auto w-full max-w-[340px] lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-[4/5] rounded-[2rem] bg-gradient-to-br from-accent via-fuchsia-500 to-amber-400 p-[2px] shadow-2xl shadow-accent/20">
              <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[calc(2rem-2px)] bg-surface">
                <div aria-hidden className="bg-dots absolute inset-0 opacity-70" />
                <div aria-hidden className="absolute -bottom-20 left-1/2 h-48 w-64 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
                <div className="relative my-4 scale-[1.35]">
                  <Avatar initials={siteConfig.avatarInitials} size="xl" className="shadow-xl ring-4 ring-surface" />
                </div>
                <p className="relative mt-8 text-lg font-semibold text-fg">{siteConfig.name}</p>
                <p className="relative text-sm text-muted">{siteConfig.role}</p>
              </div>
              <div className="absolute -bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border bg-surface px-4 py-2 text-xs font-medium text-fg shadow-lg">
                <StatusDot active={siteConfig.availability.open} />
                {siteConfig.availability.open ? "Open to new work" : "Currently booked"}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">About me</p>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
              I turn ambiguous problems into <span className="text-gradient">products people love to use.</span>
            </h1>

            <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted">
              <p>
                I&apos;m {siteConfig.name}, a full-stack engineer with {years}+ years of experience building for the
                web. I started out hand-coding WordPress themes at a Manchester agency and have since shipped
                everything from interactive museum reports to payment systems moving hundreds of millions of euros.
              </p>
              <p>
                Today I lead frontend architecture at <strong className="font-semibold text-fg">{current.company}</strong>,
                where my team builds the patient platform used by over a million people. My sweet spot is the seam
                between design and engineering: turning a Figma file into an interface that is fast, accessible and
                genuinely pleasant — and backing it with APIs and infrastructure that stay boring under load.
              </p>
              <p>
                I care about the craft and the people. I write a lot (RFCs, docs, and the occasional{" "}
                <Link href="/blog" className="link-underline font-medium text-fg">
                  blog post
                </Link>
                ), mentor generously, and believe the best teams are the ones where shipping feels calm.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Design systems", "Accessibility"].map(
                (tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ),
              )}
            </div>

            <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-start gap-3 bg-surface p-5">
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon name={fact.icon} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted">{fact.label}</dt>
                    <dd className="mt-1 text-sm font-medium text-fg">{fact.value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/experience" iconRight="arrow-right">
                See my experience
              </ButtonLink>
              <ButtonLink href={siteConfig.resumeUrl} variant="outline" iconLeft="download" external>
                Download résumé
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
