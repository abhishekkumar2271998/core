import type { ComponentPropsWithoutRef } from "react";

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

/* --------------------------------------------------------------------- Card */

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  /** Adds hover lift + border emphasis. */
  interactive?: boolean;
  /** Applies default inner padding. */
  padded?: boolean;
}

export function Card({ className, interactive, padded = false, ...props }: CardProps) {
  return (
    <div
      className={cx(
        "rounded-2xl border bg-surface text-fg",
        padded && "p-6",
        interactive && "transition-all duration-200 hover:-translate-y-0.5 hover:border-fg/20 hover:shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ Sections */

export function CardHeader({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cx("flex flex-col gap-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentPropsWithoutRef<"h3">) {
  return <h3 className={cx("text-lg font-semibold tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return <p className={cx("text-sm leading-relaxed text-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cx("px-6 pb-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cx("flex items-center gap-3 border-t px-6 py-4", className)} {...props} />;
}
