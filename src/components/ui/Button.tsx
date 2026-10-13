import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import type { IconName } from "@/types";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "link";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary: "bg-fg text-bg hover:bg-fg/90 shadow-sm",
  secondary: "bg-surface-2 text-fg hover:bg-border/70",
  ghost: "text-muted hover:bg-surface-2 hover:text-fg",
  outline: "border bg-surface text-fg hover:border-fg/30 hover:bg-surface-2",
  link: "rounded-none px-0 text-accent underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-9 w-9",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], variant !== "link" && sizes[size], className);
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  iconLeft?: IconName;
  iconRight?: IconName;
  loading?: boolean;
}

export type ButtonProps = CommonProps & ComponentPropsWithoutRef<"button">;

export function Button({
  variant,
  size,
  iconLeft,
  iconRight,
  loading,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Icon name="loader" className="h-4 w-4 animate-spin" />
      ) : iconLeft ? (
        <Icon name={iconLeft} className="h-4 w-4" />
      ) : null}
      {children}
      {iconRight && !loading ? <Icon name={iconRight} className="h-4 w-4" /> : null}
    </button>
  );
}

export type ButtonLinkProps = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & {
    href: string;
    external?: boolean;
  };

/** A link styled as a button. External links open in a new tab. */
export function ButtonLink({
  variant,
  size,
  iconLeft,
  iconRight,
  className,
  children,
  href,
  external,
  ...props
}: ButtonLinkProps) {
  const isExternal = external ?? /^(https?:|mailto:)/.test(href);
  const content = (
    <>
      {iconLeft ? <Icon name={iconLeft} className="h-4 w-4" /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} className="h-4 w-4" /> : null}
    </>
  );
  const classes = buttonClasses({ variant, size, className });

  if (isExternal) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...props}>
      {content}
    </Link>
  );
}
