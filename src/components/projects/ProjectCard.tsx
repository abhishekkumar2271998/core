import Link from "next/link";
import type { Project, ProjectStatus } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";
import { Icon } from "@/components/icons/Icon";
import { projectCategories, projectStatuses } from "@/data/projects";
import { ProjectCover } from "@/components/projects/ProjectCover";

const statusVariant: Record<ProjectStatus, "success" | "warning" | "default"> = {
  live: "success",
  "in-progress": "warning",
  archived: "default",
};

export function ProjectStatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <Badge variant={statusVariant[status]} className={className}>
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "live" ? "bg-success" : status === "in-progress" ? "bg-warning" : "bg-muted",
        )}
      />
      {projectStatuses[status]}
    </Badge>
  );
}

/** Project card with generated cover. Server-compatible. */
export function ProjectCard({ project, priority }: { project: Project; priority?: boolean }) {
  return (
    <article
      data-priority={priority ? "" : undefined}
      className="card-hover group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-surface"
    >
      <div className="relative overflow-hidden border-b">
        <ProjectCover
          project={project}
          className="aspect-[16/10] transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <ProjectStatusBadge
          status={project.status}
          className="absolute left-3 top-3 bg-surface/90 shadow-sm backdrop-blur"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-xs uppercase tracking-wider text-muted">
          {projectCategories[project.category]} · {project.year}
        </p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-fg">
          <Link
            href={`/projects/${project.slug}`}
            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none"
          >
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{project.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tags">
          {project.tags.slice(0, 3).map((tag) => (
            <li key={tag}>
              <Badge variant="outline">{tag}</Badge>
            </li>
          ))}
        </ul>
        <span className="mt-auto flex items-center gap-1 pt-5 text-sm font-medium text-accent">
          View case study
          <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
