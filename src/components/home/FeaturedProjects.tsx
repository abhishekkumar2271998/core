import { getFeaturedProjects } from "@/data/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Container, Section, SectionHeader, EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function FeaturedProjects({ limit = 4 }: { limit?: number }) {
  const projects = getFeaturedProjects(limit);

  return (
    <Section id="work">
      <Container>
        <SectionHeader
          eyebrow="Selected work"
          title="Projects I'm proud of"
          description="A few recent products and experiments — each with a story about trade-offs, constraints and measurable outcomes."
          action={
            <ButtonLink href="/projects" variant="outline" iconRight="arrow-right">
              All projects
            </ButtonLink>
          }
        />
        {projects.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project, i) => (
              <Reveal key={project.slug} delay={(i % 2) * 100}>
                <ProjectCard project={project} priority={i < 2} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState title="Projects coming soon" description="Case studies are being written up — check back shortly." />
        )}
      </Container>
    </Section>
  );
}
