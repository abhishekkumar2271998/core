"use client";

import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import type { Testimonial } from "@/types";
import { testimonials as defaultTestimonials } from "@/data/testimonials";
import { Avatar } from "@/components/ui/primitives";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils";

interface TestimonialsCarouselProps {
  testimonials?: Testimonial[];
  /** Autoplay interval in ms. */
  interval?: number;
}

/**
 * Accessible testimonial carousel:
 * - autoplays, pausing on hover, focus-within, hidden tab, or via the pause button
 * - ←/→/Home/End keys when the region is focused
 * - dot navigation buttons with aria-current
 */
export function TestimonialsCarousel({ testimonials = defaultTestimonials, interval = 6500 }: TestimonialsCarouselProps) {
  const count = testimonials.length;
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  const paused = hovered || focused || userPaused || reduced;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);
  const prev = useCallback(() => go(index - 1), [go, index]);
  const next = useCallback(() => go(index + 1), [go, index]);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (paused || count < 2) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") setIndex((i) => (i + 1) % count);
    }, interval);
    return () => clearInterval(id);
  }, [paused, count, interval]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        prev();
        break;
      case "ArrowRight":
        e.preventDefault();
        next();
        break;
      case "Home":
        e.preventDefault();
        go(0);
        break;
      case "End":
        e.preventDefault();
        go(count - 1);
        break;
    }
  };

  if (!count) return null;
  const current = testimonials[index];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Testimonials"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      className="relative mx-auto max-w-4xl rounded-3xl"
    >
      <div className="relative overflow-hidden rounded-3xl border bg-surface px-6 pb-8 pt-14 shadow-sm sm:px-14 sm:pb-12 sm:pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-4 -top-10 select-none font-serif text-[12rem] leading-none text-accent/10"
        >
          &ldquo;
        </div>

        {/* Slides: all rendered (stable height = tallest), only the active one visible */}
        <div className="grid">
          {testimonials.map((t, i) => {
            const active = i === index;
            return (
              <figure
                key={t.id}
                id={`testimonial-${t.id}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={!active}
                className={cn(
                  "col-start-1 row-start-1 transition-all duration-500 ease-out",
                  active ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-4 opacity-0",
                )}
              >
                <blockquote className="relative text-pretty text-xl font-medium leading-relaxed tracking-tight text-fg sm:text-2xl">
                  <p>{t.quote}</p>
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  <Avatar initials={t.initials} size="md" />
                  <div>
                    <p className="font-semibold text-fg">{t.author}</p>
                    <p className="text-sm text-muted">
                      {t.title}, {t.company}
                    </p>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>

        <p className="sr-only" aria-live={paused ? "polite" : "off"} aria-atomic="true">
          Testimonial {index + 1} of {count}: {current.author}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <div role="group" aria-label="Choose testimonial" className="flex items-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                aria-current={i === index ? "true" : undefined}
                aria-controls={`testimonial-${t.id}`}
                aria-label={`Show testimonial from ${t.author}`}
                onClick={() => go(i)}
                className="group flex h-6 items-center"
              >
                <span
                  className={cn(
                    "relative block h-1.5 overflow-hidden rounded-full transition-all duration-300",
                    i === index ? "w-8 bg-accent/25" : "w-1.5 bg-border group-hover:bg-muted",
                  )}
                >
                  {i === index ? (
                    <span
                      key={`${index}-${paused}`}
                      className="absolute inset-y-0 left-0 rounded-full bg-accent"
                      style={{
                        width: paused ? "100%" : undefined,
                        animation: paused ? undefined : `carousel-progress ${interval}ms linear forwards`,
                      }}
                    />
                  ) : null}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? "Resume autoplay" : "Pause autoplay"}
              className="inline-flex h-10 items-center gap-2 rounded-full px-3 font-mono text-xs text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              {userPaused ? "play" : "pause"}
            </button>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous testimonial"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-surface text-fg transition-colors hover:border-accent/40 hover:bg-surface-2"
            >
              <Icon name="arrow-left" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-surface text-fg transition-colors hover:border-accent/40 hover:bg-surface-2"
            >
              <Icon name="arrow-right" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes carousel-progress { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}
