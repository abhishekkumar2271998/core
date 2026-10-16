import type { ComponentPropsWithoutRef } from "react";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  solid: "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800",
  outline: "border border-blue-600 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950",
  ghost: "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface BlueButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

/** Blue button with solid / outline / ghost variants and an optional loading spinner. */
export function BlueButton({
  variant = "solid",
  size = "md",
  loading = false,
  disabled,
  type = "button",
  className = "",
  children,
  ...props
}: BlueButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
