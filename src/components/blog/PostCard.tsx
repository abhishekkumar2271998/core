import Link from "next/link";
import type { Post } from "@/types";
import { Badge } from "@/components/ui/primitives";
import { Icon } from "@/components/icons/Icon";
import { cn, formatDate, readingTime } from "@/lib/utils";

/** Server-compatible post preview. `compact` renders a single row for dense lists. */
export function PostCard({ post, variant = "default" }: { post: Post; variant?: "default" | "compact" }) {
  const minutes = readingTime(post.content);

  if (variant === "compact") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group flex flex-col gap-1 rounded-xl px-3 py-3 transition-colors hover:bg-surface-2 sm:flex-row sm:items-baseline sm:gap-6"
      >
        <time dateTime={post.date} className="shrink-0 font-mono text-xs text-muted sm:w-28">
          {formatDate(post.date)}
        </time>
        <span className="flex-1 font-medium text-fg transition-colors group-hover:text-accent">{post.title}</span>
        <span className="hidden shrink-0 text-xs text-muted sm:inline">{minutes} min read</span>
      </Link>
    );
  }

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border bg-surface p-6 card-hover">
      <div className="flex items-center gap-3 text-xs text-muted">
        <time dateTime={post.date} className="inline-flex items-center gap-1.5">
          <Icon name="calendar" className="h-3.5 w-3.5" />
          {formatDate(post.date)}
        </time>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1.5">
          <Icon name="clock" className="h-3.5 w-3.5" />
          {minutes} min read
        </span>
      </div>
      <h3 className="mt-4 text-balance text-lg font-semibold tracking-tight text-fg transition-colors group-hover:text-accent">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:rounded-2xl">
          {post.title}
        </Link>
      </h3>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{post.excerpt}</p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {post.tags.map((tag) => (
          <Badge key={tag} variant="default">
            {tag}
          </Badge>
        ))}
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100",
          )}
          aria-hidden
        >
          Read <Icon name="arrow-right" className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
}
