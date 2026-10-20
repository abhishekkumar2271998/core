import type { Education } from "@/types";
import { education as defaultEducation } from "@/data/experience";
import { Card } from "@/components/ui/primitives";
import { Icon } from "@/components/icons/Icon";
import { formatMonth } from "@/lib/utils";

export function EducationList({ items = defaultEducation }: { items?: Education[] }) {
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {items.map((edu) => (
        <li key={edu.id}>
          <Card className="h-full">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon name="book" className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-fg">
                  {edu.degree}, {edu.field}
                </h3>
                <p className="text-sm text-accent">{edu.institution}</p>
                <p className="mt-1 text-xs text-muted">
                  {formatMonth(edu.start)} – {formatMonth(edu.end)}
                </p>
                {edu.notes ? <p className="mt-3 text-sm leading-relaxed text-muted">{edu.notes}</p> : null}
              </div>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
