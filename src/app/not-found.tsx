import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/data/site";
import { Icon } from "@/components/icons/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Kbd } from "@/components/ui/primitives";
import { SearchHintButton } from "@/components/command/SearchHintButton";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const suggestions = siteConfig.nav.filter((item) => ["/projects", "/blog", "/about", "/contact"].includes(item.href));

export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-24 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl"
      />
      <Container className="relative flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <div className="animate-fade-up">
          <p
            aria-hidden
            className="select-none bg-gradient-to-b from-fg to-fg/10 bg-clip-text font-mono text-[7rem] font-bold leading-none tracking-tighter text-transparent sm:text-[10rem]"
          >
            404
          </p>

          <div className="mx-auto mt-6 w-full max-w-md overflow-hidden rounded-xl border bg-surface text-left font-mono text-xs shadow-sm">
            <div className="flex items-center gap-1.5 border-b bg-surface-2 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
              <span className="ml-2 text-muted">~/portfolio</span>
            </div>
            <div className="space-y-1 p-4 text-muted">
              <p>
                <span className="text-accent">$</span> cd <span className="text-fg">this-page</span>
              </p>
              <p className="text-danger">cd: no such file or directory</p>
              <p>
                <span className="text-accent">$</span> <span className="inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-fg" />
              </p>
            </div>
          </div>

          <h1 className="mt-10 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            This page took a wrong turn
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-muted">
            The link may be broken or the page may have moved. Let&apos;s get you somewhere useful.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/" iconLeft="arrow-left">
              Back home
            </ButtonLink>
            <SearchHintButton />
          </div>
          <p className="mt-4 hidden items-center justify-center gap-1.5 text-xs text-muted sm:flex">
            Tip: press <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd> anywhere to search the site.
          </p>
        </div>

        <nav aria-label="Popular pages" className="mt-14 w-full max-w-2xl">
          <ul className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center justify-between rounded-xl border bg-surface px-4 py-3 text-left transition card-hover"
                >
                  <span>
                    <span className="block text-sm font-medium text-fg">{item.label}</span>
                    {item.description ? <span className="text-xs text-muted">{item.description}</span> : null}
                  </span>
                  <Icon name="arrow-right" className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-fg" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </div>
  );
}
