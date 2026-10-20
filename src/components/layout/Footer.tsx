import Link from "next/link";
import { siteConfig } from "@/data/site";
import { Icon } from "@/components/icons/Icon";
import { StatusDot } from "@/components/ui/primitives";
import { LocalTime } from "./LocalTime";

const footerGroups = [
  {
    title: "Pages",
    links: siteConfig.nav.filter((n) => ["/", "/about", "/projects", "/experience"].includes(n.href)),
  },
  {
    title: "More",
    links: siteConfig.nav.filter((n) => ["/blog", "/uses", "/contact"].includes(n.href)),
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t bg-surface/50">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fg font-mono text-sm font-bold text-bg">
                {siteConfig.avatarInitials}
              </span>
              <span className="font-semibold tracking-tight">{siteConfig.name}</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted">{siteConfig.description}</p>
            <div className="mt-5 flex items-center gap-2 text-sm text-muted">
              <StatusDot active={siteConfig.availability.open} />
              {siteConfig.availability.message}
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted">
              <Icon name="map-pin" className="h-4 w-4" />
              {siteConfig.location} · <LocalTime timezone={siteConfig.timezone} />
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted">{group.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-fg/80 transition hover:text-accent">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-6 border-t pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-muted">
            © {year} {siteConfig.name}. Built with Next.js & Tailwind CSS.
          </p>
          <ul className="flex items-center gap-1">
            {siteConfig.socials.map((s) => (
              <li key={s.platform}>
                <a
                  href={s.href}
                  target={s.platform === "email" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg"
                  aria-label={s.label}
                >
                  <Icon name={s.platform} className="h-[18px] w-[18px]" />
                </a>
              </li>
            ))}
            <li>
              <a
                href="/rss.xml"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg"
                aria-label="RSS feed"
              >
                <Icon name="rss" className="h-[18px] w-[18px]" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
