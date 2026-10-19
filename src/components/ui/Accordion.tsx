"use client";

import {
  createContext,
  useContext,
  useId,
  useRef,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import { nextIndex, useControllableState } from "./internal";

interface AccordionContextValue {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);
const ItemContext = createContext<{ value: string; triggerId: string; panelId: string; disabled?: boolean } | null>(
  null,
);

function useAccordionItem() {
  const accordion = useContext(AccordionContext);
  const item = useContext(ItemContext);
  if (!accordion || !item) throw new Error("Accordion parts must be used within <AccordionItem>");
  return { ...accordion, ...item, open: accordion.isOpen(item.value) };
}

interface AccordionProps {
  /** Allow several items open at once. */
  multiple?: boolean;
  /** Allow closing the last open item when `multiple` is false (default true). */
  collapsible?: boolean;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  className?: string;
  children: ReactNode;
}

export function Accordion({
  multiple,
  collapsible = true,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  className,
  children,
}: AccordionProps) {
  const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
  const rootRef = useRef<HTMLDivElement>(null);

  const toggle = (item: string) => {
    const open = value.includes(item);
    if (open) {
      if (!multiple && !collapsible) return;
      setValue(value.filter((v) => v !== item));
    } else {
      setValue(multiple ? [...value, item] : [item]);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const triggers = Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>("[data-accordion-trigger]:not([disabled])") ?? [],
    );
    const current = triggers.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;
    const next = nextIndex(e.key, current, triggers.length, "vertical");
    if (next === null) return;
    e.preventDefault();
    triggers[next].focus();
  };

  return (
    <AccordionContext.Provider value={{ isOpen: (v) => value.includes(v), toggle }}>
      <div ref={rootRef} onKeyDown={onKeyDown} className={cn("divide-y rounded-2xl border bg-surface", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps extends ComponentPropsWithoutRef<"div"> {
  value: string;
  disabled?: boolean;
}

export function AccordionItem({ value, disabled, className, ...props }: AccordionItemProps) {
  const id = useId();
  return (
    <ItemContext.Provider value={{ value, disabled, triggerId: `${id}-trigger`, panelId: `${id}-panel` }}>
      <div className={cn("group", className)} {...props} />
    </ItemContext.Provider>
  );
}

interface AccordionTriggerProps extends ComponentPropsWithoutRef<"button"> {
  /** Heading level wrapping the trigger, per the WAI-ARIA accordion pattern. */
  level?: 2 | 3 | 4 | 5 | 6;
}

export function AccordionTrigger({ level = 3, className, children, ...props }: AccordionTriggerProps) {
  const { open, toggle, value, triggerId, panelId, disabled } = useAccordionItem();
  const Heading = `h${level}` as const;
  return (
    <Heading className="flex">
      <button
        type="button"
        id={triggerId}
        aria-expanded={open}
        aria-controls={panelId}
        disabled={disabled}
        data-accordion-trigger=""
        onClick={() => toggle(value)}
        className={cn(
          "flex flex-1 items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-fg transition-colors hover:text-accent disabled:pointer-events-none disabled:opacity-50 sm:text-base",
          className,
        )}
        {...props}
      >
        {children}
        <Icon
          name="chevron-down"
          className={cn("h-4 w-4 shrink-0 text-muted transition-transform duration-200", open && "rotate-180")}
        />
      </button>
    </Heading>
  );
}

export function AccordionContent({ className, children, ...props }: ComponentPropsWithoutRef<"div">) {
  const { open, triggerId, panelId } = useAccordionItem();
  return (
    <div
      id={panelId}
      role="region"
      aria-labelledby={triggerId}
      hidden={!open}
      className={cn("animate-fade-in px-5 pb-5 text-sm leading-relaxed text-muted", className)}
      {...props}
    >
      {children}
    </div>
  );
}
