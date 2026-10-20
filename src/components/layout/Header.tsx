"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/data/site";
import { Icon } from "@/components/icons/Icon";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Kbd } from "@/components/ui/primitives";
import { useLockBodyScroll, useScrollY } from "@/hooks";
import { cn } from "@/lib/utils";

/** Window event name the command palette listens for. */
export const OPEN_PALETTE_EVENT = "open-command-palette";

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const scrollY = useScrollY();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = scrollY > 8;
  const navItems = siteConfig.nav.filter((item) => item.href !== "/");

  useLockBodyScroll(menuOpen);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled || menuOpen ? "border-b bg-bg/80 backdrop-blur-xl" : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5" aria-label={`${siteConfig.name} — home`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fg font-mono text-sm font-bold text-bg transition group-hover:rotate-6">
              {siteConfig.avatarInitials}
            </span>
            <span className="hidden font-semibold tracking-tight sm:inline">{siteConfig.name}</span>
          </Link>

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1 rounded-full border bg-surface/60 px-1.5 py-1 shadow-sm backdrop-blur">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative rounded-full px-3.5 py-1.5 text-sm transition",
                        active ? "bg-surface-2 font-medium text-fg" : "text-muted hover:text-fg",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={openCommandPalette}
              className="hidden h-9 items-center gap-2 rounded-full border bg-surface/60 pl-3 pr-1.5 text-sm text-muted transition hover:text-fg lg:inline-flex"
              aria-label="Open command palette"
            >
              <Icon name="search" className="h-4 w-4" />
              <span>Search</span>
              <span className="flex gap-0.5">
                <Kbd>Ctrl</Kbd>
                <Kbd>K</Kbd>
              </span>
            </button>
            <button
              type="button"
              onClick={openCommandPalette}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg lg:hidden"
              aria-label="Open command palette"
            >
              <Icon name="search" className="h-[18px] w-[18px]" />
            </button>
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <Icon name={menuOpen ? "close" : "menu"} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div id="mobile-menu" className="h-[calc(100dvh-4rem)] overflow-y-auto border-t bg-bg md:hidden">
            <nav aria-label="Mobile" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
              <ul className="space-y-1">
                {siteConfig.nav.map((item, i) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-4 py-3.5 transition",
                          active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
                        )}
                      >
                        <span>
                          <span className="block text-lg font-medium">{item.label}</span>
                          {item.description ? <span className="text-sm text-muted">{item.description}</span> : null}
                        </span>
                        <Icon name="chevron-right" className="h-4 w-4" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-8 flex flex-wrap gap-2 border-t pt-6">
                {siteConfig.socials.map((s) => (
                  <a
                    key={s.platform}
                    href={s.href}
                    target={s.platform === "email" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm text-muted hover:text-fg"
                  >
                    <Icon name={s.platform} className="h-4 w-4" />
                    {s.label}
                  </a>
                ))}
              </div>
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
}
