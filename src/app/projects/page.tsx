import type { Metadata } from "next";
import { Container, Section, SectionHeader } from "@/components/ui/primitives";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected work and case studies by Alex Morgan — web apps, design systems, developer tooling, mobile and AI products.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <Section>
      <Container>
        <SectionHeader
          as="h1"
          eyebrow="Selected work"
          title="Projects & case studies"
          description={`${projects.length} projects spanning product analytics, e-commerce, design systems, developer tooling and AI — each with the problem, the approach and the measurable outcome.`}
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <li key={project.slug}>
              <ProjectCard project={project} priority={i < 3} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
