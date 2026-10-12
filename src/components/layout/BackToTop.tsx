"use client";

import { Icon } from "@/components/icons/Icon";
import { useScrollProgress, useScrollY } from "@/hooks";
import { cn } from "@/lib/utils";

const SIZE = 48;
const STROKE = 2.5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Floating "back to top" button with a circular reading-progress ring. */
export function BackToTop({ threshold = 600 }: { threshold?: number }) {
  const scrollY = useScrollY();
  const progress = useScrollProgress();
  const visible = scrollY > threshold;

  function scrollToTop() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    // Move focus to the top of the document for keyboard users.
    const skipTarget = document.getElementById("main");
    if (skipTarget) {
      skipTarget.setAttribute("tabindex", "-1");
      skipTarget.focus({ preventScroll: true });
    }
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={`Back to top (${Math.round(progress * 100)}% scrolled)`}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "group fixed bottom-5 right-5 z-40 flex items-center justify-center rounded-full bg-surface/90 text-muted shadow-lg shadow-black/5 backdrop-blur transition-all duration-300 hover:text-fg sm:bottom-8 sm:right-8",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
      style={{ width: SIZE, height: SIZE }}
    >
      <svg
        aria-hidden
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-border"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          className="stroke-accent transition-[stroke-dashoffset] duration-150 ease-out"
        />
      </svg>
      <Icon name="arrow-up" className="relative h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
    </button>
  );
}
