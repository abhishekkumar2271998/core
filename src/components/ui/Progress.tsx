import { cn, clamp } from "@/lib/utils";

type Tone = "accent" | "success" | "warning" | "danger";

const tones: Record<Tone, { bar: string; stroke: string }> = {
  accent: { bar: "bg-accent", stroke: "stroke-accent" },
  success: { bar: "bg-success", stroke: "stroke-success" },
  warning: { bar: "bg-warning", stroke: "stroke-warning" },
  danger: { bar: "bg-danger", stroke: "stroke-danger" },
};

interface ProgressProps {
  /** Current value; omit for an indeterminate bar. */
  value?: number;
  max?: number;
  label: string;
  showValue?: boolean;
  tone?: Tone;
  size?: "sm" | "md";
  className?: string;
}

export function Progress({ value, max = 100, label, showValue, tone = "accent", size = "md", className }: ProgressProps) {
  const indeterminate = value === undefined;
  const pct = indeterminate ? 0 : (clamp(value, 0, max) / max) * 100;
  return (
    <div className={className}>
      {showValue ? (
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-fg">{label}</span>
          {!indeterminate ? <span className="font-mono text-muted">{Math.round(pct)}%</span> : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        className={cn("relative overflow-hidden rounded-full bg-surface-2", size === "sm" ? "h-1.5" : "h-2.5")}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            tones[tone].bar,
            indeterminate && "absolute w-1/3 animate-pulse",
          )}
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface ProgressRingProps {
  value: number;
  max?: number;
  label: string;
  size?: number;
  strokeWidth?: number;
  tone?: Tone;
  showValue?: boolean;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  label,
  size = 48,
  strokeWidth = 4,
  tone = "accent",
  showValue = true,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = clamp(value, 0, max) / max;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-surface-2" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          className={cn("transition-[stroke-dashoffset] duration-500 ease-out", tones[tone].stroke)}
        />
      </svg>
      {showValue ? (
        <span className="absolute font-mono text-[0.65rem] font-medium text-fg">{Math.round(pct * 100)}%</span>
      ) : null}
    </div>
  );
}

/** Small animated spinner with an accessible status label. */
export function Spinner({ label = "Loading", className }: { label?: string; className?: string }) {
  return (
    <span role="status" className={cn("inline-flex items-center", className)}>
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 animate-spin" aria-hidden>
        <circle cx="12" cy="12" r="9" strokeWidth="2.5" className="stroke-current opacity-20" />
        <path d="M21 12a9 9 0 0 0-9-9" strokeWidth="2.5" strokeLinecap="round" className="stroke-current" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
