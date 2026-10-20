"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { SkillGroup } from "@/types";
import { skillGroups as defaultGroups, skillLevelLabels } from "@/data/skills";
import { cn, pluralize } from "@/lib/utils";

interface SkillsMatrixProps {
  groups?: SkillGroup[];
  className?: string;
}

/**
 * Tabbed skills overview following the WAI-ARIA tabs pattern
 * (roving tabindex, arrow/Home/End keys, automatic activation).
 */
export function SkillsMatrix({ groups = defaultGroups, className }: SkillsMatrixProps) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  const select = (i: number) => {
    const next = (i + groups.length) % groups.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => select(active + 1),
      ArrowDown: () => select(active + 1),
      ArrowLeft: () => select(active - 1),
      ArrowUp: () => select(active - 1),
      Home: () => select(0),
      End: () => select(groups.length - 1),
    };
    const fn = keys[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  };

  const group = groups[active];
  if (!group) return null;
  const avgYears = group.skills.reduce((sum, s) => sum + s.years, 0) / Math.max(1, group.skills.length);
  const sorted = [...group.skills].sort((a, b) => b.level - a.level || b.years - a.years);

  return (
    <div className={cn("grid gap-6 lg:grid-cols-[260px_1fr]", className)}>
      <div
        role="tablist"
        aria-label="Skill categories"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
      >
        {groups.map((g, i) => {
          const selected = i === active;
          return (
            <button
              key={g.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`${baseId}-tab-${g.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${g.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                "group flex shrink-0 items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                selected
                  ? "border-accent/40 bg-accent/10 text-fg shadow-sm"
                  : "border-transparent bg-surface-2/50 text-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              <span>{g.title}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[11px] tabular-nums",
                  selected ? "bg-accent text-accent-fg" : "bg-surface text-muted",
                )}
              >
                {g.skills.length}
              </span>
            </button>
          );
        })}
      </div>

      <div
        key={group.id}
        id={`${baseId}-panel-${group.id}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${group.id}`}
        tabIndex={0}
        className="animate-fade-in rounded-2xl border bg-surface p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
          <div className="max-w-md">
            <h3 className="text-xl font-semibold tracking-tight text-fg">{group.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{group.description}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold tabular-nums text-fg">{avgYears.toFixed(1)}</p>
            <p className="text-xs text-muted">avg. years</p>
          </div>
        </div>

        <ul className="mt-6 grid gap-x-10 gap-y-5 md:grid-cols-2">
          {sorted.map((skill, i) => (
            <li key={skill.name} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-fg">{skill.name}</span>
                <span className="shrink-0 font-mono text-xs text-muted">{pluralize(skill.years, "yr")}</span>
              </div>
              <div
                role="meter"
                aria-label={`${skill.name} proficiency`}
                aria-valuemin={1}
                aria-valuemax={5}
                aria-valuenow={skill.level}
                aria-valuetext={skillLevelLabels[skill.level]}
                className="mt-2 flex gap-1"
              >
                {[1, 2, 3, 4, 5].map((step) => (
                  <span
                    key={step}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors duration-500",
                      step <= skill.level ? "bg-gradient-to-r from-accent to-fuchsia-500" : "bg-surface-2",
                    )}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-[11px] uppercase tracking-wider text-muted">{skillLevelLabels[skill.level]}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
