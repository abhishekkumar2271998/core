import Link from "next/link";
import type { Post } from "@/types";
import { Icon } from "@/components/icons/Icon";

/** Previous (older) / next (newer) article links. */
export function PostNavigation({ prev, next }: { prev?: Post; next?: Post }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="More articles" className="grid gap-4 sm:grid-cols-2">
      {prev ? (
        <Link href={`/blog/${prev.slug}`} className="group rounded-2xl border bg-surface p-5 card-hover">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Icon name="arrow-left" className="h-3.5 w-3.5" /> Older
          </span>
          <span className="mt-2 block font-medium text-fg group-hover:text-accent">{prev.title}</span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next ? (
        <Link href={`/blog/${next.slug}`} className="group rounded-2xl border bg-surface p-5 text-right card-hover">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            Newer <Icon name="arrow-right" className="h-3.5 w-3.5" />
          </span>
          <span className="mt-2 block font-medium text-fg group-hover:text-accent">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
