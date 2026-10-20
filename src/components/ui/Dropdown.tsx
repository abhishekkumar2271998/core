"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/Icon";
import type { IconName } from "@/types";
import { nextIndex, useOutsideClick } from "./internal";

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean, focus?: "first" | "last") => void;
  close: (restoreFocus?: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  menuRef: RefObject<HTMLDivElement | null>;
  menuId: string;
  triggerId: string;
  initialFocus: RefObject<"first" | "last">;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdown() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error("Dropdown parts must be used within <Dropdown>");
  return ctx;
}

const menuItems = (menu: HTMLElement | null) =>
  Array.from(menu?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])') ?? []);

/** Menu button following the WAI-ARIA menu pattern (arrow keys, Home/End, typeahead, Escape). */
export function Dropdown({ children, className }: { children: ReactNode; className?: string }) {
  const [open, setOpenState] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const initialFocus = useRef<"first" | "last">("first");
  const id = useId();

  const setOpen = useCallback((next: boolean, focus: "first" | "last" = "first") => {
    initialFocus.current = focus;
    setOpenState(next);
  }, []);

  const close = useCallback((restoreFocus = true) => {
    setOpenState(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useOutsideClick([triggerRef, menuRef], () => close(false), open);

  return (
    <DropdownContext.Provider
      value={{ open, setOpen, close, triggerRef, menuRef, menuId: `${id}-menu`, triggerId: `${id}-trigger`, initialFocus }}
    >
      <div className={cn("relative inline-block text-left", className)}>{children}</div>
    </DropdownContext.Provider>
  );
}

export function DropdownTrigger({ className, children, onClick, onKeyDown, ...props }: ComponentPropsWithoutRef<"button">) {
  const { open, setOpen, triggerRef, menuId, triggerId } = useDropdown();
  return (
    <button
      ref={triggerRef}
      type="button"
      id={triggerId}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? menuId : undefined}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOpen(!open);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          setOpen(true, e.key === "ArrowUp" ? "last" : "first");
        }
      }}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

interface DropdownMenuProps extends ComponentPropsWithoutRef<"div"> {
  align?: "start" | "end";
}

export function DropdownMenu({ align = "start", className, children, ...props }: DropdownMenuProps) {
  const { open, close, menuRef, menuId, triggerId, initialFocus } = useDropdown();
  const typeahead = useRef({ query: "", timer: undefined as ReturnType<typeof setTimeout> | undefined });

  useEffect(() => {
    if (!open) return;
    const items = menuItems(menuRef.current);
    (initialFocus.current === "last" ? items[items.length - 1] : items[0])?.focus();
  }, [open, menuRef, initialFocus]);

  if (!open) return null;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = menuItems(menuRef.current);
    const current = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "Tab") {
      close(false);
      return;
    }
    const next = nextIndex(e.key, current, items.length, "vertical");
    if (next !== null) {
      e.preventDefault();
      items[next].focus();
      return;
    }
    if (e.key.length === 1 && /\S/.test(e.key)) {
      const state = typeahead.current;
      clearTimeout(state.timer);
      state.query += e.key.toLowerCase();
      state.timer = setTimeout(() => (state.query = ""), 500);
      const ordered = [...items.slice(current + 1), ...items.slice(0, current + 1)];
      ordered.find((el) => el.textContent?.trim().toLowerCase().startsWith(state.query))?.focus();
    }
  };

  return (
    <div
      ref={menuRef}
      id={menuId}
      role="menu"
      aria-labelledby={triggerId}
      aria-orientation="vertical"
      onKeyDown={onKeyDown}
      className={cn(
        "absolute z-40 mt-2 min-w-48 origin-top animate-scale-in rounded-xl border bg-surface p-1 shadow-lg shadow-black/5",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface DropdownItemProps extends Omit<ComponentPropsWithoutRef<"button">, "onSelect"> {
  icon?: IconName;
  shortcut?: string;
  destructive?: boolean;
  /** Called on activation; the menu closes unless `event.preventDefault()` is called. */
  onSelect?: (event: Event) => void;
}

export function DropdownItem({
  icon,
  shortcut,
  destructive,
  onSelect,
  disabled,
  className,
  children,
  ...props
}: DropdownItemProps) {
  const { close } = useDropdown();
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      onClick={(e) => {
        if (disabled) return;
        const event = new Event("select", { cancelable: true });
        onSelect?.(event);
        if (!event.defaultPrevented) close();
        e.stopPropagation();
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm outline-none transition-colors focus:bg-surface-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
        destructive ? "text-danger" : "text-fg",
        className,
      )}
      {...props}
    >
      {icon ? <Icon name={icon} className="h-4 w-4 text-muted" /> : null}
      <span className="flex-1">{children}</span>
      {shortcut ? <span className="font-mono text-xs text-muted">{shortcut}</span> : null}
    </button>
  );
}

interface DropdownCheckboxItemProps extends Omit<DropdownItemProps, "icon" | "onSelect"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function DropdownCheckboxItem({ checked, onCheckedChange, className, children, ...props }: DropdownCheckboxItemProps) {
  return (
    <DropdownItem
      role="menuitemcheckbox"
      aria-checked={checked}
      onSelect={(e) => {
        e.preventDefault();
        onCheckedChange(!checked);
      }}
      className={cn("pl-8", className)}
      {...props}
    >
      <Icon
        name="check"
        className={cn("absolute -ml-6 mt-0.5 h-4 w-4 text-accent", !checked && "invisible")}
      />
      {children}
    </DropdownItem>
  );
}

export function DropdownLabel({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      role="presentation"
      className={cn("px-2.5 pb-1 pt-2 text-xs font-medium uppercase tracking-wider text-muted", className)}
      {...props}
    />
  );
}

export function DropdownSeparator({ className }: { className?: string }) {
  return <div role="separator" className={cn("-mx-1 my-1 h-px bg-border", className)} />;
}
