import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  /** Emit schema.org BreadcrumbList JSON-LD; requires absolute `baseUrl`. */
  structuredData?: { baseUrl: string };
}

/** Breadcrumb trail. The last item is rendered as the current page. */
export function Breadcrumbs({ items, className, structuredData }: BreadcrumbsProps) {
  if (!items.length) return null;
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-muted">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="inline-flex min-w-0 items-center gap-1.5">
              {last || !item.href ? (
                <span aria-current={last ? "page" : undefined} className={cn("truncate", last && "font-medium text-fg")}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="truncate transition-colors hover:text-fg">
                  {item.label}
                </Link>
              )}
              {!last ? <Icon name="chevron-right" className="h-3.5 w-3.5 shrink-0 opacity-60" /> : null}
            </li>
          );
        })}
      </ol>
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: items.map((item, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: item.label,
                ...(item.href ? { item: new URL(item.href, structuredData.baseUrl).toString() } : {}),
              })),
            }).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
    </nav>
  );
}
