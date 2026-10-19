import type { Metadata } from "next";
import { experience, totalExperienceYears } from "@/data/experience";
import { siteConfig } from "@/data/site";
import { Timeline } from "@/components/about/Timeline";
import { EducationList } from "@/components/about/EducationList";
import { Container, Section, SectionHeader } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { unique } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Experience",
  description: `${siteConfig.name}'s career timeline: roles, achievements and the technology behind them.`,
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  const years = totalExperienceYears();
  const companies = unique(experience.map((e) => e.company)).length;
  const technologies = unique(experience.flatMap((e) => e.stack)).length;

  const summary = [
    { label: "Years of experience", value: `${years}+` },
    { label: "Companies", value: String(companies) },
    { label: "Technologies used", value: String(technologies) },
  ];

  return (
    <>
      <Section className="pb-0 sm:pb-0">
        <Container>
          <SectionHeader
            as="h1"
            eyebrow="Experience"
            title={`${years}+ years of building for the web`}
            description="From agency websites to platforms serving millions — here's where I've worked and what I shipped along the way."
            action={
              <ButtonLink href={siteConfig.resumeUrl} variant="outline" iconLeft="download" external>
                Download résumé
              </ButtonLink>
            }
          />
          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border bg-border">
            {summary.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-1 bg-surface p-5 sm:p-6">
                <dt className="text-xs text-muted sm:text-sm">{s.label}</dt>
                <dd className="text-2xl font-semibold tracking-tight text-fg sm:text-4xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section>
        <Container className="max-w-4xl">
          <h2 className="mb-10 text-2xl font-semibold tracking-tight text-fg">Work history</h2>
          <Timeline items={experience} />
        </Container>
      </Section>

      <Section className="pt-0 sm:pt-0">
        <Container className="max-w-4xl">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight text-fg">Education</h2>
          <EducationList />
        </Container>
      </Section>
    </>
  );
}
