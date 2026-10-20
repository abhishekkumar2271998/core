"use client";

import { Children, useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";

interface CarouselProps {
  label: string;
  children: ReactNode;
  /** Autoplay interval in ms; pauses on hover/focus and can be stopped by the user. */
  autoplay?: number;
  loop?: boolean;
  className?: string;
}

/**
 * Scroll-snap carousel (WAI-ARIA carousel pattern): native swipe/scroll, prev/next buttons,
 * slide picker dots, and a pause control when autoplaying.
 */
export function Carousel({ label, children, autoplay, loop = true, className }: CarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(Boolean(autoplay));
  const [paused, setPaused] = useState(false);
  const id = useId();

  const goTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track || count === 0) return;
      const target = loop ? (i + count) % count : Math.max(0, Math.min(count - 1, i));
      const slide = track.children[target] as HTMLElement | undefined;
      track.scrollTo({ left: slide?.offsetLeft ?? 0, behavior: "smooth" });
    },
    [count, loop],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setIndex(Math.round(track.scrollLeft / Math.max(1, track.clientWidth))));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!autoplay || !playing || paused || count < 2) return;
    const timer = setInterval(() => goTo(index + 1), autoplay);
    return () => clearInterval(timer);
  }, [autoplay, playing, paused, index, count, goTo]);

  const navButton =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border bg-surface text-fg shadow-sm transition-colors hover:bg-surface-2 disabled:opacity-40";

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("relative", className)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        id={`${id}-track`}
        aria-live={playing && !paused ? "off" : "polite"}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className="w-full shrink-0 snap-start"
          >
            {slide}
          </div>
        ))}
      </div>
      {count > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {autoplay ? (
              <button
                type="button"
                onClick={() => setPlaying(!playing)}
                aria-label={playing ? "Pause automatic slide show" : "Start automatic slide show"}
                className={navButton}
              >
                {playing ? (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                    <path d="M7 5v14l11-7z" />
                  </svg>
                )}
              </button>
            ) : null}
            <button
              type="button"
              aria-controls={`${id}-track`}
              aria-label="Previous slide"
              disabled={!loop && index === 0}
              onClick={() => goTo(index - 1)}
              className={navButton}
            >
              <Icon name="chevron-left" className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-controls={`${id}-track`}
              aria-label="Next slide"
              disabled={!loop && index === count - 1}
              onClick={() => goTo(index + 1)}
              className={navButton}
            >
              <Icon name="chevron-right" className="h-4 w-4" />
            </button>
          </div>
          <div role="group" aria-label="Choose slide" className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => goTo(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index ? "w-6 bg-fg" : "w-2 bg-border hover:bg-muted",
                )}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
