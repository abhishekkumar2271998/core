"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import { OPEN_PALETTE_EVENT } from "@/components/layout/Header";
import { Icon } from "@/components/icons/Icon";
import { Kbd } from "@/components/ui/primitives";
import { useHotkey, useLockBodyScroll } from "@/hooks";
import { cn } from "@/lib/utils";
import { CommandList, optionId } from "./CommandList";
import { filterCommands } from "./search";
import { useCommands } from "./useCommands";
import type { CommandItem } from "./types";

type Toast = { message: string; tone: "success" | "danger" } | null;

function useIsMac(): boolean {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent));
  }, []);
  return isMac;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const listId = useId();
  const pathname = usePathname();
  const isMac = useIsMac();

  const showToast = useCallback((ok: boolean) => {
    setToast(ok ? { message: "Email copied to clipboard", tone: "success" } : { message: "Couldn't copy email", tone: "danger" });
  }, []);

  const commands = useCommands({ onCopy: showToast });
  const groups = useMemo(() => filterCommands(commands, query), [commands, query]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const activeIndex = flat.findIndex((item) => item.id === activeId);

  /* ------------------------------------------------------- open / close */

  const openPalette = useCallback(() => {
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveId(null);
    const el = restoreFocusRef.current;
    if (el && document.contains(el)) requestAnimationFrame(() => el.focus());
  }, []);

  useHotkey("mod+k", (e) => {
    e.preventDefault();
    if (open) close();
    else openPalette();
  });

  useHotkey("Escape", close, open);

  useEffect(() => {
    window.addEventListener(OPEN_PALETTE_EVENT, openPalette);
    return () => window.removeEventListener(OPEN_PALETTE_EVENT, openPalette);
  }, [openPalette]);

  // Close when the route changes (e.g. after navigating via a command).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useLockBodyScroll(open);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  /* --------------------------------------------------- active item sync */

  // Keep a valid active item whenever results change.
  useEffect(() => {
    if (!flat.length) {
      if (activeId !== null) setActiveId(null);
      return;
    }
    if (activeIndex === -1) setActiveId(flat[0].id);
  }, [flat, activeId, activeIndex]);

  // Reset to the top result whenever the query changes.
  useEffect(() => {
    setActiveId(flat[0]?.id ?? null);
    listRef.current?.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Scroll the active option into view.
  useEffect(() => {
    if (!open || !activeId) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-command-id="${CSS.escape(activeId)}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeId, open]);

  /* ------------------------------------------------------------ actions */

  const run = useCallback(
    (item: CommandItem) => {
      const result = item.perform();
      if (result !== "keep-open") close();
    },
    [close],
  );

  function move(delta: number) {
    if (!flat.length) return;
    const start = activeIndex === -1 ? (delta > 0 ? -1 : 0) : activeIndex;
    const next = (start + delta + flat.length) % flat.length;
    setActiveId(flat[next].id);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        move(-1);
        break;
      case "Home":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (flat[0]) setActiveId(flat[0].id);
        }
        break;
      case "End":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const last = flat[flat.length - 1];
          if (last) setActiveId(last.id);
        }
        break;
      case "PageDown":
        e.preventDefault();
        move(5);
        break;
      case "PageUp":
        e.preventDefault();
        move(-5);
        break;
      case "Enter": {
        e.preventDefault();
        const item = flat[activeIndex];
        if (item) run(item);
        break;
      }
      case "Tab":
        // Focus stays on the input — the only tabbable element in the dialog.
        e.preventDefault();
        break;
    }
  }

  /* ------------------------------------------------------------- render */

  const toastEl = toast ? (
    <div
      role="status"
      className={cn(
        "fixed bottom-6 left-1/2 z-[110] flex -translate-x-1/2 items-center gap-2 rounded-full border bg-surface px-4 py-2 text-sm shadow-lg animate-fade-up",
        toast.tone === "success" ? "text-success" : "text-danger",
      )}
    >
      <Icon name={toast.tone === "success" ? "check" : "alert"} className="h-4 w-4" />
      <span className="text-fg">{toast.message}</span>
    </div>
  ) : null;

  if (!open) return toastEl;

  const activeItem = flat[activeIndex];
  const resultCount = flat.length;

  return (
    <>
      {toastEl}
      <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] sm:pt-[15vh]">
        <div
          aria-hidden
          onClick={close}
          className="absolute inset-0 bg-bg/60 backdrop-blur-sm animate-fade-in"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          onKeyDown={onKeyDown}
          className="relative flex max-h-[min(36rem,75vh)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border bg-surface shadow-2xl shadow-black/20 animate-scale-in"
        >
          <div className="flex items-center gap-3 border-b px-4">
            <Icon name="search" className="h-5 w-5 shrink-0 text-muted" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={resultCount > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeItem ? optionId(listId, activeItem) : undefined}
              aria-label="Search pages, projects, posts and actions"
              placeholder="Type a command or search…"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-14 w-full bg-transparent text-base text-fg placeholder:text-muted focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="shrink-0 rounded-md p-1 text-muted transition hover:bg-surface-2 hover:text-fg"
                aria-label="Clear search"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            ) : null}
            <Kbd className="hidden shrink-0 sm:inline-flex">Esc</Kbd>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain">
            {resultCount > 0 ? (
              <CommandList
                listId={listId}
                groups={groups}
                activeId={activeItem?.id ?? null}
                query={query}
                onHover={setActiveId}
                onSelect={run}
              />
            ) : (
              <div id={listId} role="listbox" aria-label="Commands" className="px-6 py-14 text-center">
                <Icon name="search" className="mx-auto h-8 w-8 text-muted/60" />
                <p className="mt-4 text-sm font-medium text-fg">No results for “{query}”</p>
                <p className="mt-1 text-xs text-muted">Try a page name, a technology, or “theme”.</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 border-t bg-surface-2/50 px-4 py-2.5 text-xs text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Kbd aria-label="Up arrow">↑</Kbd>
                <Kbd aria-label="Down arrow">↓</Kbd>
                <span>navigate</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd aria-label="Enter">↵</Kbd>
                <span>select</span>
              </span>
              <span className="hidden items-center gap-1.5 sm:flex">
                <Kbd>Esc</Kbd>
                <span>close</span>
              </span>
            </div>
            <span className="flex items-center gap-1.5">
              <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
              <Kbd>K</Kbd>
              <span className="hidden sm:inline">toggle</span>
            </span>
          </div>
          <p className="sr-only" aria-live="polite">
            {resultCount === 0 ? "No results" : `${resultCount} result${resultCount === 1 ? "" : "s"} available`}
          </p>
        </div>
      </div>
    </>
  );
}
