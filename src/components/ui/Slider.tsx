"use client";

import { useId, useRef, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cn, clamp } from "@/lib/utils";
import { useControllableState } from "./internal";

interface SliderProps {
  label: ReactNode;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Human readable value for screen readers and the value display, e.g. v => `${v}%`. */
  format?: (value: number) => string;
  showValue?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/** Single-thumb slider following the WAI-ARIA slider pattern (arrows, PageUp/Down, Home/End, drag). */
export function Slider({
  label,
  value: valueProp,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  format = String,
  showValue = true,
  disabled,
  name,
  className,
}: SliderProps) {
  const [value, setValue] = useControllableState(valueProp, defaultValue ?? min, onValueChange);
  const trackRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const pct = ((value - min) / (max - min)) * 100;

  const commit = (raw: number) => {
    const snapped = Math.round((raw - min) / step) * step + min;
    const next = clamp(Number(snapped.toFixed(10)), min, max);
    if (next !== value) setValue(next);
  };

  const fromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    commit(min + ((clientX - rect.left) / rect.width) * (max - min));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    fromPointer(e.clientX);
    (e.currentTarget.querySelector('[role="slider"]') as HTMLElement | null)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const big = Math.max(step, (max - min) / 10);
    const map: Record<string, number> = {
      ArrowRight: value + step,
      ArrowUp: value + step,
      ArrowLeft: value - step,
      ArrowDown: value - step,
      PageUp: value + big,
      PageDown: value - big,
      Home: min,
      End: max,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    commit(map[e.key]);
  };

  return (
    <div className={cn(disabled && "opacity-50", className)}>
      <div className="mb-3 flex items-center justify-between text-sm">
        <span id={labelId} className="font-medium text-fg">
          {label}
        </span>
        {showValue ? <span className="font-mono text-muted">{format(value)}</span> : null}
      </div>
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && fromPointer(e.clientX)}
        className={cn("relative flex h-5 touch-none items-center", disabled ? "cursor-not-allowed" : "cursor-pointer")}
      >
        <div className="h-1.5 w-full rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-labelledby={labelId}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={format(value)}
          aria-disabled={disabled || undefined}
          onKeyDown={disabled ? undefined : onKeyDown}
          className="absolute h-5 w-5 -translate-x-1/2 rounded-full border-2 border-accent bg-surface shadow-sm transition-transform hover:scale-110"
          style={{ left: `${pct}%` }}
        />
      </div>
      {name ? <input type="hidden" name={name} value={value} /> : null}
    </div>
  );
}
