import type { Metadata } from "next";
import { AboutIntro } from "@/components/about/AboutIntro";
import { ValuesGrid } from "@/components/about/ValuesGrid";
import { SkillsMatrix } from "@/components/about/SkillsMatrix";
import { InteractiveTerminal } from "@/components/about/InteractiveTerminal";
import { CallToAction } from "@/components/home/CallToAction";
import { Container, Section, SectionHeader } from "@/components/ui/primitives";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description: `Who ${siteConfig.name} is, how they work, and the skills they bring to product teams.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <AboutIntro />
      <ValuesGrid />
      <Section>
        <Container>
          <SectionHeader
            eyebrow="Toolbox"
            title="Skills & experience"
            description="An honest snapshot of where I'm deep, where I'm solid and where I'm still learning."
          />
          <SkillsMatrix />
        </Container>
      </Section>
      <Section>
        <Container className="max-w-4xl">
          <SectionHeader
            eyebrow="Play"
            title="Or just ask the terminal"
            description="A tiny shell with a few tricks. Click inside and type help to get started."
            align="center"
          />
          <InteractiveTerminal />
        </Container>
      </Section>
      <CallToAction title="Like how I work? Let's talk." />
    </>
  );
}
