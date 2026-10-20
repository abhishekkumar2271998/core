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
import { nextIndex, useControllableState } from "./internal";

type TabsVariant = "pills" | "underline";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
  variant: TabsVariant;
  orientation: "horizontal" | "vertical";
  /** Activate tabs on focus (automatic) or only on Enter/Space (manual). */
  activation: "automatic" | "manual";
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>");
  return ctx;
}

const tabId = (base: string, value: string) => `${base}-tab-${value}`;
const panelId = (base: string, value: string) => `${base}-panel-${value}`;

interface TabsProps {
  value?: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  orientation?: "horizontal" | "vertical";
  activation?: "automatic" | "manual";
  className?: string;
  children: ReactNode;
}

export function Tabs({
  value: valueProp,
  defaultValue,
  onValueChange,
  variant = "pills",
  orientation = "horizontal",
  activation = "automatic",
  className,
  children,
}: TabsProps) {
  const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
  const baseId = useId();
  return (
    <TabsContext.Provider value={{ value, setValue, baseId, variant, orientation, activation }}>
      <div className={cn(orientation === "vertical" && "flex gap-6", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children, ...props }: ComponentPropsWithoutRef<"div">) {
  const { variant, orientation, activation, setValue } = useTabs();
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])') ?? [],
    );
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;
    const next = nextIndex(e.key, current, tabs.length, orientation);
    if (next === null) return;
    e.preventDefault();
    tabs[next].focus();
    if (activation === "automatic") {
      const v = tabs[next].dataset.value;
      if (v) setValue(v);
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      onKeyDown={onKeyDown}
      className={cn(
        "flex",
        orientation === "vertical" ? "shrink-0 flex-col" : "overflow-x-auto",
        variant === "pills" ? "gap-1 rounded-full border bg-surface p-1" : "gap-4 border-b",
        variant === "pills" && orientation === "vertical" && "rounded-2xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface TabProps extends Omit<ComponentPropsWithoutRef<"button">, "value"> {
  value: string;
}

export function Tab({ value, className, children, disabled, onClick, ...props }: TabProps) {
  const ctx = useTabs();
  const selected = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      id={tabId(ctx.baseId, value)}
      aria-selected={selected}
      aria-controls={panelId(ctx.baseId, value)}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      data-value={value}
      data-state={selected ? "active" : "inactive"}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx.setValue(value);
      }}
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        ctx.variant === "pills"
          ? cn("rounded-full px-4 py-1.5", selected ? "bg-fg text-bg shadow-sm" : "text-muted hover:text-fg")
          : cn(
              "-mb-px border-b-2 px-1 pb-3 pt-1",
              selected ? "border-accent text-fg" : "border-transparent text-muted hover:border-border hover:text-fg",
            ),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabPanelProps extends ComponentPropsWithoutRef<"div"> {
  value: string;
  /** Keep the panel mounted (hidden) when inactive. */
  keepMounted?: boolean;
}

export function TabPanel({ value, keepMounted, className, children, ...props }: TabPanelProps) {
  const ctx = useTabs();
  const selected = ctx.value === value;
  if (!selected && !keepMounted) return null;
  return (
    <div
      role="tabpanel"
      id={panelId(ctx.baseId, value)}
      aria-labelledby={tabId(ctx.baseId, value)}
      hidden={!selected}
      tabIndex={0}
      className={cn("mt-6 animate-fade-in focus-visible:rounded-xl", ctx.orientation === "vertical" && "mt-0 flex-1", className)}
      {...props}
    >
      {children}
    </div>
  );
}
