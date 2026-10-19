import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/data/site";
import { Container, StatusDot, Kbd } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { TypingRole } from "@/components/home/TypingRole";

const roles = ["fast web apps", "design systems", "accessible UIs", "typed APIs", "delightful details"];

const socialIcons = siteConfig.socials.filter((s) => s.platform !== "email");

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-24">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <div className="absolute -top-40 left-1/2 h-[480px] w-[880px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-accent/25 via-fuchsia-500/15 to-amber-400/10 blur-3xl" />
      </div>

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <Link
              href="/contact"
              className="group inline-flex animate-fade-up items-center gap-2.5 rounded-full border bg-surface/70 py-1.5 pl-3 pr-4 text-sm text-muted backdrop-blur transition-colors hover:border-accent/40 hover:text-fg"
            >
              <StatusDot active={siteConfig.availability.open} />
              <span>{siteConfig.availability.message}</span>
              <Icon
                name="arrow-right"
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>

            <h1
              className="mt-8 animate-fade-up text-balance text-4xl font-semibold tracking-tight text-fg sm:text-6xl lg:text-[4.25rem] lg:leading-[1.05]"
              style={{ animationDelay: "80ms" }}
            >
              Hi, I&apos;m {siteConfig.shortName}. <br className="hidden sm:block" />I build{" "}
              <TypingRole words={roles} className="whitespace-nowrap" />
            </h1>

            <p
              className="mt-6 max-w-xl animate-fade-up text-pretty text-lg leading-relaxed text-muted sm:text-xl"
              style={{ animationDelay: "160ms" }}
            >
              {siteConfig.description}
            </p>

            <div
              className="mt-10 flex animate-fade-up flex-wrap items-center gap-3"
              style={{ animationDelay: "240ms" }}
            >
              <ButtonLink href="/projects" size="lg" iconRight="arrow-right">
                View my work
              </ButtonLink>
              <ButtonLink href="/contact" size="lg" variant="outline" iconLeft="send">
                Get in touch
              </ButtonLink>
            </div>

            <div
              className="mt-10 flex animate-fade-up flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted"
              style={{ animationDelay: "320ms" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Icon name="map-pin" className="h-4 w-4" />
                {siteConfig.location}
              </span>
              <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
              <ul className="flex items-center gap-1" aria-label="Social profiles">
                {socialIcons.map((s) => (
                  <li key={s.platform}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-surface-2 hover:text-fg"
                    >
                      <Icon name={s.platform} label={s.label} className="h-[18px] w-[18px]" />
                    </a>
                  </li>
                ))}
              </ul>
              <span className="hidden items-center gap-1.5 md:inline-flex">
                Press <Kbd>⌘</Kbd>
                <Kbd>K</Kbd> to navigate
              </span>
            </div>
          </div>

          <HeroTerminalCard />
        </div>
      </Container>
    </section>
  );
}

/** Floating, purely decorative code card. */
function HeroTerminalCard() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md animate-fade-up lg:max-w-none" style={{ animationDelay: "200ms" }}>
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-accent/30 via-fuchsia-500/20 to-amber-400/20 opacity-70 blur-2xl" />
      <div className="animate-float overflow-hidden rounded-2xl border bg-surface/90 shadow-2xl shadow-accent/10 backdrop-blur">
        <div className="flex items-center gap-2 border-b bg-surface-2/60 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-xs text-muted">~/alex/profile.ts</span>
        </div>
        <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-6 no-scrollbar">
          <code>
            <Line n={1}>
              <K>const</K> <V>engineer</V> = {"{"}
            </Line>
            <Line n={2}>
              {"  "}name: <S>&quot;{siteConfig.name}&quot;</S>,
            </Line>
            <Line n={3}>
              {"  "}role: <S>&quot;{siteConfig.role}&quot;</S>,
            </Line>
            <Line n={4}>
              {"  "}experience: <N>8</N>, <C>// years</C>
            </Line>
            <Line n={5}>
              {"  "}stack: [<S>&quot;TypeScript&quot;</S>, <S>&quot;React&quot;</S>,
            </Line>
            <Line n={6}>
              {"          "}
              <S>&quot;Next.js&quot;</S>, <S>&quot;Node&quot;</S>],
            </Line>
            <Line n={7}>
              {"  "}
              <F>ship</F>: () =&gt; <S>&quot;fast &amp; accessible&quot;</S>,
            </Line>
            <Line n={8}>{"};"}</Line>
          </code>
        </pre>
        <div className="flex items-center gap-2 border-t bg-surface-2/40 px-5 py-3 font-mono text-xs">
          <span className="text-success">➜</span>
          <span className="text-accent">~</span>
          <span className="text-muted">npm run ship</span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-success">
            <Icon name="check" className="h-3.5 w-3.5" /> Deployed in 42s
          </span>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-4 hidden animate-float rounded-xl border bg-surface px-4 py-3 shadow-xl sm:block [animation-delay:1.5s]">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Lighthouse</p>
        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-fg">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-success text-[10px] text-success">
            100
          </span>
          Performance
        </p>
      </div>
    </div>
  );
}

function Line({ n, children }: { n: number; children: ReactNode }) {
  return (
    <span className="block">
      <span className="mr-4 inline-block w-4 select-none text-right text-muted/50">{n}</span>
      <span className="text-fg/90">{children}</span>
    </span>
  );
}

const K = ({ children }: { children: ReactNode }) => <span className="text-fuchsia-500">{children}</span>;
const V = ({ children }: { children: ReactNode }) => <span className="text-accent">{children}</span>;
const S = ({ children }: { children: ReactNode }) => <span className="text-emerald-600 dark:text-emerald-400">{children}</span>;
const N = ({ children }: { children: ReactNode }) => <span className="text-amber-600 dark:text-amber-400">{children}</span>;
const F = ({ children }: { children: ReactNode }) => <span className="text-sky-600 dark:text-sky-400">{children}</span>;
const C = ({ children }: { children: ReactNode }) => <span className="italic text-muted">{children}</span>;
