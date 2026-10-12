"use client";

import { useEffect, useRef, useState } from "react";
import type { Stat } from "@/types";
import { stats as defaultStats } from "@/data/services";
import { Container } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const DURATION = 1600;

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** Counts each stat up from zero the first time the block scrolls into view. */
export function StatsCounter({ stats = defaultStats, className }: { stats?: Stat[]; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setProgress(1);
      return;
    }

    let frame = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION);
        setProgress(easeOutExpo(t));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section aria-label="Highlights" className={cn("py-16 sm:py-20", className)}>
      <Container>
        <div
          ref={ref}
          className="grid grid-cols-2 overflow-hidden rounded-2xl border bg-border lg:grid-cols-4 [&>*]:bg-surface"
          style={{ gap: "1px" }}
        >
          {stats.map((stat) => {
            const current = Math.round(stat.value * progress);
            return (
              <div key={stat.label} className="relative p-6 sm:p-8">
                <dl className="flex flex-col-reverse gap-2">
                  <dt className="text-sm leading-snug text-muted">{stat.label}</dt>
                  <dd className="text-4xl font-semibold tracking-tight text-fg tabular-nums sm:text-5xl">
                    {/* Final value for assistive tech; animated value is decorative */}
                    <span className="sr-only">
                      {stat.prefix}
                      {stat.value}
                      {stat.suffix}
                    </span>
                    <span aria-hidden>
                      {stat.prefix}
                      {current}
                      <span className="text-gradient">{stat.suffix}</span>
                    </span>
                  </dd>
                </dl>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
