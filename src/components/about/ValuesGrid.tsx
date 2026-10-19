import type { IconName } from "@/types";
import { Card, Container, Section, SectionHeader } from "@/components/ui/primitives";
import { Icon } from "@/components/icons/Icon";
import { Reveal } from "@/components/ui/Reveal";

interface Value {
  icon: IconName;
  title: string;
  body: string;
}

const values: Value[] = [
  {
    icon: "user",
    title: "Users first, always",
    body: "Every decision traces back to a real person trying to get something done. I'd rather ship a smaller thing that works for everyone than a bigger one that works for a few.",
  },
  {
    icon: "zap",
    title: "Performance is a feature",
    body: "Speed is respect for people's time and data plans. I set budgets early, measure in the field and treat regressions like bugs.",
  },
  {
    icon: "heart",
    title: "Accessible by default",
    body: "Semantic HTML, keyboard paths and sensible contrast aren't a final QA pass — they're how the first commit is written.",
  },
  {
    icon: "layers",
    title: "Boring technology, bold products",
    body: "I reach for proven tools so the novelty can live in the product. Fewer moving parts means calmer on-call and faster onboarding.",
  },
  {
    icon: "pen",
    title: "Write it down",
    body: "Short RFCs, decision records and good PR descriptions scale a team's memory. Clear writing is clear thinking made shareable.",
  },
  {
    icon: "sparkles",
    title: "Sweat the last 5%",
    body: "Focus states, empty states, loading skeletons, the easing on a drawer. The details are where trust is earned.",
  },
];

export function ValuesGrid() {
  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow="How I work"
          title="Principles I bring to every team"
          description="Frameworks change every few years. These habits haven't — they're the reason projects I join tend to ship calmly and age well."
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value, i) => (
            <Reveal as="li" key={value.title} delay={(i % 3) * 90}>
              <Card interactive className="group h-full">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-fuchsia-500/15 text-accent transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    <Icon name={value.icon} className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-fg">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{value.body}</p>
              </Card>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
