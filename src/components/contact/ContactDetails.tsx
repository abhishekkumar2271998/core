import { siteConfig } from "@/data/site";
import { Icon } from "@/components/icons/Icon";
import { LocalTime } from "@/components/layout/LocalTime";
import { Card, StatusDot } from "@/components/ui/primitives";
import { CopyEmailButton } from "@/components/contact/CopyEmailButton";
import type { IconName } from "@/types";

function DetailRow({ icon, label, children }: { icon: IconName; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-surface-2 text-muted">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
        <div className="mt-1 text-sm text-fg">{children}</div>
      </div>
    </div>
  );
}

/** Sidebar with direct contact details. Server component with small client islands. */
export function ContactDetails() {
  const socials = siteConfig.socials.filter((s) => s.platform !== "email");
  const { availability } = siteConfig;

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Prefer email?</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <a
            href={`mailto:${siteConfig.email}`}
            className="link-underline break-all text-lg font-semibold tracking-tight text-fg"
          >
            {siteConfig.email}
          </a>
          <CopyEmailButton email={siteConfig.email} />
        </div>

        <div className="mt-6 flex items-center gap-2.5 rounded-xl border bg-bg/60 px-3.5 py-2.5 text-sm">
          <StatusDot active={availability.open} />
          <span className={availability.open ? "text-fg" : "text-muted"}>{availability.message}</span>
        </div>
      </Card>

      <Card className="space-y-5">
        <DetailRow icon="map-pin" label="Location">
          {siteConfig.location}
        </DetailRow>
        <DetailRow icon="clock" label="Local time">
          <span className="inline-flex items-center gap-2">
            <LocalTime timezone={siteConfig.timezone} />
            <span className="text-muted">· {siteConfig.timezone.replace("_", " ")}</span>
          </span>
        </DetailRow>
        <DetailRow icon="send" label="Response time">
          Usually within <strong className="font-medium">1–2 business days</strong>. For anything urgent, mention it in
          the subject.
        </DetailRow>
      </Card>

      <Card>
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Elsewhere</p>
        <ul className="mt-4 grid gap-2">
          {socials.map((s) => (
            <li key={s.platform}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border bg-bg/40 px-3.5 py-2.5 transition hover:border-fg/20 hover:bg-surface-2"
              >
                <span className="flex items-center gap-3">
                  <Icon name={s.platform} className="h-4 w-4 text-muted transition group-hover:text-fg" />
                  <span className="text-sm font-medium">{s.label}</span>
                  {s.handle ? <span className="hidden text-xs text-muted sm:inline">{s.handle}</span> : null}
                </span>
                <Icon
                  name="arrow-up-right"
                  className="h-4 w-4 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
