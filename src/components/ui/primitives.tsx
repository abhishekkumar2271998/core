import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- Container */

export function Container({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

/* ------------------------------------------------------------------ Section */

interface SectionProps extends ComponentPropsWithoutRef<"section"> {
  /** Removes default vertical padding. */
  flush?: boolean;
}

export function Section({ className, flush, ...props }: SectionProps) {
  return <section className={cn(!flush && "py-16 sm:py-24", className)} {...props} />;
}

/* ----------------------------------------------------------- SectionHeader */

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
  as?: "h1" | "h2";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className,
  as: Heading = "h2",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-6 sm:mb-14",
        align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        ) : null}
        <Heading
          className={cn(
            "text-balance font-semibold tracking-tight text-fg",
            Heading === "h1" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl",
          )}
        >
          {title}
        </Heading>
        {description ? <p className="mt-4 text-pretty text-lg leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* --------------------------------------------------------------------- Card */

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  interactive?: boolean;
  padded?: boolean;
}

export function Card({ className, interactive, padded = true, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-2xl border bg-surface", padded && "p-6", interactive && "card-hover", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------- Badge */

type BadgeVariant = "default" | "accent" | "outline" | "success" | "warning" | "danger";

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-surface-2 text-muted",
  accent: "bg-accent/10 text-accent",
  outline: "border text-muted",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

/* ---------------------------------------------------------------------- Kbd */

export function Kbd({ className, ...props }: ComponentPropsWithoutRef<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border bg-surface-2 px-1 font-mono text-[10px] font-medium text-muted",
        className,
      )}
      {...props}
    />
  );
}

/* ---------------------------------------------------------------- Separator */

export function Separator({ className, vertical }: { className?: string; vertical?: boolean }) {
  return (
    <div
      role="separator"
      aria-orientation={vertical ? "vertical" : "horizontal"}
      className={cn("shrink-0 bg-border", vertical ? "h-full w-px" : "h-px w-full", className)}
    />
  );
}

/* --------------------------------------------------------------------- Dot */

export function StatusDot({ active = true, className }: { active?: boolean; className?: string }) {
  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      {active ? (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
      ) : null}
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", active ? "bg-success" : "bg-muted")} />
    </span>
  );
}

/* ------------------------------------------------------------------ Avatar */

export function Avatar({
  initials,
  size = "md",
  className,
}: {
  initials: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-16 w-16 text-lg", xl: "h-28 w-28 text-3xl" };
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-fuchsia-500 font-semibold text-white",
        sizes[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}

/* --------------------------------------------------------------- Polymorph */

type ProseProps<T extends ElementType> = { as?: T; className?: string; children?: ReactNode };

/** Wrapper that applies long-form article typography. */
export function Prose<T extends ElementType = "div">({ as, className, children }: ProseProps<T>) {
  const Comp = (as ?? "div") as ElementType;
  return <Comp className={cn("prose-content", className)}>{children}</Comp>;
}

/* ------------------------------------------------------------- EmptyState */

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center">
      <p className="text-lg font-medium text-fg">{title}</p>
      {description ? <p className="mt-2 max-w-sm text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
