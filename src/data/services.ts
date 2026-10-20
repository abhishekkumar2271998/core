import type { Service, Stat } from "@/types";

export const services: Service[] = [
  {
    id: "product-engineering",
    title: "Product engineering",
    description:
      "End-to-end delivery of web products — from data model and API to the last pixel of the interface — with a bias for shipping.",
    deliverables: ["Next.js & React apps", "Typed APIs (REST, GraphQL, tRPC)", "Auth, payments & integrations"],
    icon: "layers",
  },
  {
    id: "performance",
    title: "Performance & Core Web Vitals",
    description:
      "Audits and hands-on fixes that make slow products feel instant, backed by measurement rather than guesswork.",
    deliverables: ["Lighthouse & RUM audits", "Rendering strategy review", "Bundle and data-fetching optimisation"],
    icon: "zap",
  },
  {
    id: "design-systems",
    title: "Design systems",
    description:
      "Accessible, well-documented component libraries that let designers and engineers move faster together.",
    deliverables: ["Token & theming architecture", "Accessible React components", "Docs, Storybook & adoption plan"],
    icon: "palette",
  },
  {
    id: "technical-leadership",
    title: "Technical leadership",
    description:
      "Fractional tech-lead support: architecture, code review culture, hiring and mentoring for growing teams.",
    deliverables: ["Architecture reviews & RFCs", "Team workflow & CI/CD", "Mentoring and hiring loops"],
    icon: "cpu",
  },
];

export const stats: Stat[] = [
  { label: "Years shipping production software", value: 8, suffix: "+" },
  { label: "Projects delivered for teams & clients", value: 60, suffix: "+" },
  { label: "Users on products I've built", value: 3, suffix: "M+" },
  { label: "Lighthouse performance on recent launches", value: 98, suffix: "%" },
];
