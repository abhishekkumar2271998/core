import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card, Container, Section } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { ProjectCard, ProjectStatusBadge } from "@/components/projects/ProjectCard";
import { ProjectCover } from "@/components/projects/ProjectCover";
import {
  getAdjacentProjects,
  getProject,
  getRelatedProjects,
  projectCategories,
  projects,
} from "@/data/projects";
import { slugify } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.summary,
    keywords: [...project.tags, ...project.stack],
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { type: "article", title: project.title, description: project.summary },
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const related = getRelatedProjects(slug, 3);
  const { prev, next } = getAdjacentProjects(slug);

  const facts: { label: string; value: string }[] = [
    { label: "Role", value: project.role },
    { label: "Duration", value: project.duration },
    ...(project.client ? [{ label: "Client", value: project.client }] : []),
    { label: "Year", value: String(project.year) },
    { label: "Category", value: projectCategories[project.category] },
  ];

  return (
    <article>
      {/* Hero */}
      <Section className="pb-0 sm:pb-0">
        <Container>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
            All projects
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ProjectStatusBadge status={project.status} />
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              {projectCategories[project.category]} · {project.year}
            </span>
          </div>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-muted">{project.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {project.links.live ? (
              <ButtonLink href={project.links.live} iconRight="arrow-up-right">
                Visit live site
              </ButtonLink>
            ) : null}
            {project.links.repo ? (
              <ButtonLink href={project.links.repo} variant="outline" iconLeft="github">
                Source code
              </ButtonLink>
            ) : null}
            {project.links.caseStudy ? (
              <ButtonLink href={project.links.caseStudy} variant="ghost" iconLeft="book">
                Read the write-up
              </ButtonLink>
            ) : null}
          </div>
          <ProjectCover
            project={project}
            alt={`Illustration of ${project.title}`}
            className="mt-12 aspect-[16/9] rounded-3xl border shadow-2xl shadow-black/10"
          />
        </Container>
      </Section>

      {/* Metrics */}
      <Section className="py-12 sm:py-16">
        <Container>
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {project.metrics.map((m) => (
              <Card key={m.label} className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-muted">{m.label}</dt>
                <dd className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{m.value}</dd>
              </Card>
            ))}
          </dl>
        </Container>
      </Section>

      {/* Body */}
      <Section className="pt-0 sm:pt-0">
        <Container className="grid gap-12 lg:grid-cols-[1fr_280px]">
          <div className="prose-content min-w-0 [&>section:first-child>h2]:mt-0">
            {project.sections.map((section) => (
              <section key={section.heading}>
                <h2 id={slugify(section.heading)}>{section.heading}</h2>
                <p>{section.body}</p>
                {section.bullets?.length ? (
                  <ul>
                    {section.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <section>
              <h2 id="highlights">Highlights</h2>
              <ul className="!list-none !pl-0">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-3">
                    <Icon name="check" className="mt-1.5 h-5 w-5 shrink-0 text-success" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <dl className="space-y-4 text-sm">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt className="font-mono text-xs uppercase tracking-wider text-muted">{f.label}</dt>
                    <dd className="mt-1 font-medium text-fg">{f.value}</dd>
                  </div>
                ))}
                <div>
                  <dt className="font-mono text-xs uppercase tracking-wider text-muted">Stack</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {project.stack.map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </dd>
                </div>
              </dl>
            </Card>
            <nav aria-label="On this page" className="hidden text-sm lg:block">
              <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted">On this page</p>
              <ul className="space-y-2 border-l">
                {[...project.sections.map((s) => s.heading), "Highlights"].map((h) => (
                  <li key={h}>
                    <a href={`#${slugify(h)}`} className="-ml-px block border-l border-transparent pl-4 text-muted hover:border-accent hover:text-fg">
                      {h}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </Container>
      </Section>

      {/* Prev / next */}
      <Container>
        <nav aria-label="More projects" className="grid gap-4 border-t pt-10 sm:grid-cols-2">
          {prev ? (
            <Link href={`/projects/${prev.slug}`} className="card-hover rounded-2xl border bg-surface p-5">
              <span className="flex items-center gap-1 text-xs text-muted">
                <Icon name="arrow-left" className="h-3.5 w-3.5" /> Previous
              </span>
              <span className="mt-1 block font-semibold text-fg">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/projects/${next.slug}`} className="card-hover rounded-2xl border bg-surface p-5 text-right">
              <span className="flex items-center justify-end gap-1 text-xs text-muted">
                Next <Icon name="arrow-right" className="h-3.5 w-3.5" />
              </span>
              <span className="mt-1 block font-semibold text-fg">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      </Container>

      {/* Related */}
      {related.length ? (
        <Section>
          <Container>
            <h2 className="mb-8 text-2xl font-semibold tracking-tight text-fg">Related projects</h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}
    </article>
  );
}
