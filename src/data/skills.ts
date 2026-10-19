import type { SkillGroup, SkillLevel } from "@/types";

export const skillLevelLabels: Record<SkillLevel, string> = {
  1: "Familiar",
  2: "Working knowledge",
  3: "Proficient",
  4: "Advanced",
  5: "Expert",
};

export const skillGroups: SkillGroup[] = [
  {
    id: "frontend",
    title: "Frontend",
    description: "Interfaces that load fast, feel great and work for everyone — my home turf.",
    skills: [
      { name: "TypeScript", level: 5, years: 7 },
      { name: "React", level: 5, years: 8 },
      { name: "Next.js", level: 5, years: 6 },
      { name: "Tailwind CSS", level: 5, years: 5 },
      { name: "Accessibility (WCAG)", level: 4, years: 7 },
      { name: "Web Performance", level: 4, years: 6 },
      { name: "Testing (Vitest, Playwright)", level: 4, years: 5 },
      { name: "D3.js / Data viz", level: 3, years: 4 },
    ],
  },
  {
    id: "backend",
    title: "Backend",
    description: "Pragmatic APIs and data models that stay boring in the best possible way.",
    skills: [
      { name: "Node.js", level: 5, years: 8 },
      { name: "PostgreSQL", level: 4, years: 7 },
      { name: "GraphQL", level: 4, years: 5 },
      { name: "REST & tRPC", level: 4, years: 7 },
      { name: "Redis", level: 3, years: 4 },
      { name: "Go", level: 3, years: 3 },
      { name: "Prisma / Drizzle", level: 4, years: 4 },
    ],
  },
  {
    id: "cloud",
    title: "Cloud & DevOps",
    description: "Shipping safely and often, with enough observability to sleep at night.",
    skills: [
      { name: "AWS", level: 4, years: 6 },
      { name: "Vercel", level: 5, years: 5 },
      { name: "Docker", level: 4, years: 6 },
      { name: "GitHub Actions / CI", level: 4, years: 6 },
      { name: "Kubernetes", level: 3, years: 3 },
      { name: "Terraform", level: 3, years: 3 },
      { name: "OpenTelemetry", level: 3, years: 3 },
    ],
  },
  {
    id: "design",
    title: "Design",
    description: "Enough design fluency to collaborate deeply — and to sweat the details.",
    skills: [
      { name: "Figma", level: 4, years: 6 },
      { name: "Design systems", level: 5, years: 5 },
      { name: "Interaction & motion", level: 4, years: 5 },
      { name: "Prototyping", level: 4, years: 6 },
      { name: "Typography", level: 3, years: 6 },
    ],
  },
  {
    id: "practices",
    title: "Practices",
    description: "The habits that make teams faster than any framework choice ever will.",
    skills: [
      { name: "Technical leadership", level: 4, years: 4 },
      { name: "Mentoring", level: 4, years: 5 },
      { name: "System design", level: 4, years: 5 },
      { name: "Code review culture", level: 5, years: 6 },
      { name: "Writing RFCs / ADRs", level: 4, years: 4 },
      { name: "Product discovery", level: 3, years: 4 },
    ],
  },
];

/** Flat list of every skill name — handy for marquees and search. */
export const allSkillNames: string[] = skillGroups.flatMap((g) => g.skills.map((s) => s.name));
