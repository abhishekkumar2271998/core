import type { Education, Experience } from "@/types";

/**
 * Work history, newest first. `end: null` marks the current role.
 * Dates are "YYYY-MM" strings so they format consistently on server and client.
 */
export const experience: Experience[] = [
  {
    id: "lumen",
    company: "Lumen Health",
    companyUrl: "https://example.com/lumen",
    role: "Staff Full-Stack Engineer",
    type: "full-time",
    location: "Berlin, Germany",
    remote: true,
    start: "2023-03",
    end: null,
    summary:
      "Technical lead for the patient-facing web platform used by 1.2M people across 9 countries. I own the frontend architecture, guide a team of seven engineers and partner closely with design and clinical product.",
    achievements: [
      "Led the migration of a 180k-line React SPA to the Next.js App Router with incremental, route-by-route rollout and zero downtime.",
      "Cut median Largest Contentful Paint from 3.8s to 1.4s by moving data fetching to React Server Components and streaming critical UI.",
      "Designed a typed design-system package (48 components, full WCAG 2.2 AA coverage) now shared by four product teams.",
      "Introduced contract testing between the web app and 11 backend services, reducing integration incidents by 63% quarter over quarter.",
      "Built an internal feature-flag and experimentation service on Postgres + Redis that replaced a $90k/year vendor contract.",
      "Mentored five engineers through promotion cycles and established the team's RFC and architecture decision record process.",
      "Drove an accessibility program that resolved 340+ audit findings and passed an external EN 301 549 certification.",
    ],
    stack: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Redis", "AWS", "Playwright"],
  },
  {
    id: "northwind",
    company: "Northwind Commerce",
    companyUrl: "https://example.com/northwind",
    role: "Senior Software Engineer",
    type: "full-time",
    location: "Amsterdam, Netherlands",
    remote: false,
    start: "2020-09",
    end: "2023-02",
    summary:
      "Senior engineer on the checkout and payments squad of a headless commerce platform processing ~€400M in annual GMV for 2,000+ merchants.",
    achievements: [
      "Rebuilt the checkout as a composable, embeddable widget, lifting conversion by 7.4% across the merchant base.",
      "Designed an idempotent payment orchestration layer in Go supporting Stripe, Adyen and Mollie with automatic failover.",
      "Shipped a GraphQL gateway with persisted queries and per-field caching, lowering p95 API latency from 620ms to 180ms.",
      "Created the squad's observability baseline with OpenTelemetry tracing and SLO-based alerting in Grafana.",
      "Ran the hiring loop redesign that halved time-to-offer while improving candidate satisfaction scores.",
    ],
    stack: ["React", "TypeScript", "GraphQL", "Go", "Kubernetes", "GCP", "Stripe", "OpenTelemetry"],
  },
  {
    id: "parcel",
    company: "Parcel Labs",
    companyUrl: "https://example.com/parcel",
    role: "Full-Stack Engineer",
    type: "full-time",
    location: "London, United Kingdom",
    remote: false,
    start: "2018-11",
    end: "2020-08",
    summary:
      "Early engineer (#6) at a Series A logistics startup building real-time shipment tracking and a self-serve analytics dashboard for retailers.",
    achievements: [
      "Built the real-time tracking map with WebSockets and MapLibre, handling 40k concurrent sessions at peak season.",
      "Developed the analytics dashboard from scratch in React + D3, which became the main driver of upsell revenue.",
      "Migrated background jobs from cron scripts to a queue-based worker system, eliminating a class of duplicate-email bugs.",
      "Set up CI/CD with preview environments per pull request, taking deploys from weekly to 15+ per day.",
    ],
    stack: ["React", "Node.js", "Express", "PostgreSQL", "D3.js", "Docker", "AWS"],
  },
  {
    id: "studio-fold",
    company: "Studio Fold",
    role: "Frontend Developer (Contract)",
    type: "contract",
    location: "London, United Kingdom",
    remote: true,
    start: "2017-10",
    end: "2018-10",
    summary:
      "Contract frontend developer for a boutique design studio, delivering marketing sites and interactive campaigns for cultural and fintech clients.",
    achievements: [
      "Delivered 14 client projects on time, including an award-shortlisted interactive annual report for a national museum.",
      "Built a reusable Gatsby starter with CMS integration that cut new-site setup from two weeks to two days.",
      "Introduced performance budgets and Lighthouse CI, keeping every launched site above a 95 performance score.",
    ],
    stack: ["JavaScript", "Gatsby", "React", "GSAP", "Sass", "Contentful"],
  },
  {
    id: "brightpath",
    company: "Brightpath Digital",
    role: "Junior Web Developer",
    type: "full-time",
    location: "Manchester, United Kingdom",
    remote: false,
    start: "2016-07",
    end: "2017-09",
    summary:
      "First role out of university at a digital agency, building responsive websites and WordPress themes for SMB clients.",
    achievements: [
      "Shipped 20+ responsive client sites and custom WordPress themes with a focus on semantic, accessible markup.",
      "Wrote the agency's first front-end style guide and component library, adopted across all new builds.",
      "Automated the asset pipeline with Gulp, cutting average page weight by 35%.",
    ],
    stack: ["HTML", "CSS", "JavaScript", "PHP", "WordPress", "Gulp"],
  },
];

export const education: Education[] = [
  {
    id: "manchester",
    institution: "University of Manchester",
    degree: "BSc (Hons)",
    field: "Computer Science",
    start: "2013-09",
    end: "2016-06",
    notes:
      "First-class honours. Dissertation on progressive enhancement strategies for low-bandwidth web apps. President of the Hack Society.",
  },
  {
    id: "interaction-design",
    institution: "Interaction Design Foundation",
    degree: "Professional Certificate",
    field: "UX Design & Accessibility",
    start: "2019-01",
    end: "2019-12",
    notes: "Coursework in usability testing, information architecture and inclusive design.",
  },
];

/** Total months of professional experience across all roles (overlap-safe enough for display). */
export function totalExperienceYears(now: Date = new Date()): number {
  const oldest = experience[experience.length - 1];
  const [sy, sm] = oldest.start.split("-").map(Number);
  const months = (now.getFullYear() - sy) * 12 + (now.getMonth() + 1 - sm);
  return Math.floor(months / 12);
}
