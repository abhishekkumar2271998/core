"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

export const DEFAULT_FAQS: FaqItem[] = [
  {
    question: "What kind of projects do you take on?",
    answer:
      "Mostly product work on the web: SaaS dashboards, marketing sites that need to be fast, design systems, and greenfield builds with React, Next.js and TypeScript. I also help teams untangle performance and accessibility issues in existing apps.",
  },
  {
    question: "What does a typical engagement look like?",
    answer:
      "We start with a short discovery call, then I send a written proposal with scope, milestones and price. Work happens in weekly iterations with a demo at the end of each one, so you always know where things stand.",
  },
  {
    question: "Do you work with agencies or only directly with companies?",
    answer:
      "Both. I regularly partner with design studios and agencies as their engineering lead, and I work directly with startups and product teams. White-label arrangements are fine too.",
  },
  {
    question: "How do you price your work?",
    answer:
      "Fixed price for well-defined projects, and a weekly rate for ongoing or exploratory work. The budget field in the form simply helps me suggest the right approach — it's never a commitment.",
  },
  {
    question: "Which time zones can you work with?",
    answer:
      "I'm based in Central Europe and have a comfortable overlap with the UK, Europe and the US East Coast. For West Coast teams I keep a few late afternoon slots open for calls.",
  },
  {
    question: "Are you open to full-time roles?",
    answer:
      "Yes — for the right team. I'm most interested in senior or staff positions at product-led companies where engineering and design work closely together. Remote-first is a strong preference.",
  },
];

/** Accessible accordion following the WAI-ARIA disclosure/accordion pattern. */
export function FAQ({ items = DEFAULT_FAQS, className }: { items?: FaqItem[]; className?: string }) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);
  const rootRef = useRef<HTMLDivElement>(null);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const buttons = Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>("[data-faq-trigger]") ?? []);
    let next: number | null = null;
    if (e.key === "ArrowDown") next = (index + 1) % buttons.length;
    else if (e.key === "ArrowUp") next = (index - 1 + buttons.length) % buttons.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = buttons.length - 1;
    if (next !== null) {
      e.preventDefault();
      buttons[next]?.focus();
    }
  }

  return (
    <div ref={rootRef} className={cn("divide-y rounded-2xl border bg-surface", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const triggerId = `${baseId}-trigger-${i}`;
        const panelId = `${baseId}-panel-${i}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                id={triggerId}
                type="button"
                data-faq-trigger=""
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium transition hover:text-accent sm:px-6 sm:text-base"
              >
                <span>{item.question}</span>
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                    isOpen ? "rotate-180 border-accent/40 bg-accent/10 text-accent" : "text-muted",
                  )}
                >
                  <Icon name="chevron-down" className="h-4 w-4" />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted sm:px-6">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
