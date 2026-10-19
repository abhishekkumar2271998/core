import { Container } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const defaultItems = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "PostgreSQL",
  "GraphQL",
  "Tailwind CSS",
  "Go",
  "AWS",
  "Docker",
  "Redis",
  "Playwright",
  "Vercel",
  "Figma",
  "Terraform",
  "OpenTelemetry",
];

interface TechMarqueeProps {
  items?: string[];
  label?: string;
  className?: string;
}

/**
 * Infinite, CSS-only marquee. The list is rendered twice and translated by -50%
 * for a seamless loop; the duplicate is hidden from assistive tech. Hovering pauses it.
 */
export function TechMarquee({ items = defaultItems, label = "Tools I ship with daily", className }: TechMarqueeProps) {
  const half = Math.ceil(items.length / 2);
  const rows = [items.slice(0, half), items.slice(half)];

  return (
    <section aria-label={label} className={cn("border-y bg-surface/50 py-10", className)}>
      <Container>
        <p className="mb-6 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      </Container>
      <div className="mask-fade-x space-y-4 overflow-hidden">
        {rows.map((row, i) => (
          <MarqueeRow key={i} items={row} reverse={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}

function MarqueeRow({ items, reverse }: { items: string[]; reverse?: boolean }) {
  return (
    <div className="group flex w-max">
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          aria-hidden={copy === 1 || undefined}
          className={cn(
            "flex shrink-0 animate-marquee items-center gap-4 pr-4 group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
          )}
        >
          {items.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 whitespace-nowrap rounded-full border bg-surface px-5 py-2.5 text-sm font-medium text-fg/80 shadow-sm"
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-accent to-fuchsia-500" />
              {item}
            </li>
          ))}
          {/* repeat items so each half is wide enough on large screens */}
          {items.map((item) => (
            <li
              key={`${item}-r`}
              aria-hidden
              className="flex items-center gap-2.5 whitespace-nowrap rounded-full border bg-surface px-5 py-2.5 text-sm font-medium text-fg/80 shadow-sm"
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-accent to-fuchsia-500" />
              {item}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
