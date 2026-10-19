"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { Container, Section, SectionHeader } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import type { IconName } from "@/types";

interface Step {
  title: string;
  summary: string;
  details: string[];
  duration: string;
  icon: IconName;
}

const steps: Step[] = [
  {
    title: "Discover",
    summary: "Understand the problem, the people and what success looks like before writing any code.",
    details: ["Stakeholder & user interviews", "Audit of existing product and data", "Clear goals and success metrics"],
    duration: "Week 1",
    icon: "search",
  },
  {
    title: "Design",
    summary: "Turn findings into flows, wireframes and a technical plan everyone can react to early.",
    details: ["User flows and wireframes", "Architecture & data model", "Scoped milestones and estimates"],
    duration: "Weeks 2–3",
    icon: "pen",
  },
  {
    title: "Build",
    summary: "Ship in small, reviewable increments with previews you can click through every week.",
    details: ["Weekly preview deployments", "Tests and accessibility checks", "Performance budgets in CI"],
    duration: "Weeks 3–8",
    icon: "code",
  },
  {
    title: "Launch",
    summary: "Release with confidence, measure the impact, and hand over a codebase your team can own.",
    details: ["Staged rollout & monitoring", "Analytics against goals", "Docs and handover sessions"],
    duration: "Week 9+",
    icon: "zap",
  },
];

const AUTOPLAY_MS = 6000;

/** Four-step "how I work" carousel with a clickable stepper, arrows, autoplay and keyboard support. */
export function ProcessStepper() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = steps.length;

  const go = useCallback((index: number) => setActive((index + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => go(active + 1), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [active, paused, go]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(active + 1);
    else if (e.key === "ArrowLeft") go(active - 1);
  };

  const step = steps[active];

  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow="Process"
          title="How I work"
          description="A simple, transparent process that keeps you in the loop from first call to launch."
          align="center"
        />

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Work process"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className="mx-auto max-w-4xl rounded-2xl"
        >
          {/* Stepper */}
          <ol className="relative grid grid-cols-4 gap-2">
            <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-5 h-px bg-border" />
            <div
              aria-hidden
              className="absolute left-[12.5%] top-5 h-px bg-accent transition-all duration-500"
              style={{ width: `${(active / (total - 1)) * 75}%` }}
            />
            {steps.map((s, i) => {
              const state = i < active ? "done" : i === active ? "current" : "upcoming";
              return (
                <li key={s.title} className="relative flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={state === "current" ? "step" : undefined}
                    aria-label={`Step ${i + 1}: ${s.title}`}
                    className={cn(
                      "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition",
                      state === "done" && "border-accent bg-accent text-accent-fg",
                      state === "current" && "border-accent bg-surface text-accent ring-4 ring-accent/15",
                      state === "upcoming" && "border-border bg-surface text-muted hover:border-fg/30",
                    )}
                  >
                    {state === "done" ? <Icon name="check" className="h-4 w-4" /> : i + 1}
                  </button>
                  <span
                    className={cn(
                      "mt-3 text-center text-xs font-medium sm:text-sm",
                      state === "upcoming" ? "text-muted" : "text-fg",
                    )}
                  >
                    {s.title}
                  </span>
                </li>
              );
            })}
          </ol>

          {/* Slide */}
          <div className="relative mt-10 overflow-hidden rounded-2xl border bg-surface">
            <div
              className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {steps.map((s, i) => (
                <article
                  key={s.title}
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${total}`}
                  aria-hidden={i !== active}
                  className="grid w-full shrink-0 gap-8 p-6 sm:p-10 md:grid-cols-[auto_1fr]"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <Icon name={s.icon} className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                      Step {i + 1} · {s.duration}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight">{s.title}</h3>
                    <p className="mt-3 max-w-xl leading-relaxed text-muted">{s.summary}</p>
                    <ul className="mt-6 grid gap-2 sm:grid-cols-3">
                      {s.details.map((d) => (
                        <li key={d} className="flex items-start gap-2 rounded-xl bg-surface-2 px-3 py-2.5 text-sm">
                          <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>

            {/* Autoplay progress */}
            <div aria-hidden className="h-0.5 w-full bg-surface-2">
              <div
                key={`${active}-${paused}`}
                className="h-full bg-accent"
                style={{
                  width: paused ? "0%" : undefined,
                  animation: paused ? undefined : `stepper-progress ${AUTOPLAY_MS}ms linear forwards`,
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted" aria-live="polite">
              Step {active + 1} of {total}: <span className="text-fg">{step.title}</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => go(active - 1)}
                aria-label="Previous step"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-surface text-muted transition hover:text-fg"
              >
                <Icon name="arrow-left" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => go(active + 1)}
                aria-label="Next step"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-surface text-muted transition hover:text-fg"
              >
                <Icon name="arrow-right" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Container>
      <style>{`@keyframes stepper-progress { from { width: 0% } to { width: 100% } }`}</style>
    </Section>
  );
}
