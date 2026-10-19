import type { IconName, Service } from "@/types";
import { services } from "@/data/services";
import { testimonials } from "@/data/testimonials";
import type { Testimonial } from "@/types";

/* -------------------------------------------------------------------- types */

export interface ServiceProcessStep {
  title: string;
  description: string;
  /** Human-readable duration, e.g. "1 week". */
  duration: string;
  outputs: string[];
}

export interface ServiceDeliverable {
  title: string;
  description: string;
  icon: IconName;
}

export interface PricingTier {
  id: string;
  name: string;
  /** Display price, e.g. "€4,800". Kept as a string so ranges and "Custom" work. */
  price: string;
  /** Unit shown next to the price, e.g. "fixed" or "/ week". */
  unit: string;
  description: string;
  features: string[];
  timeline: string;
  highlighted?: boolean;
  cta: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceOutcome {
  label: string;
  value: string;
}

export interface ServiceDetail {
  /** Matches `Service.id` in `@/data/services`. */
  id: string;
  /** URL segment for /services/[slug]. */
  slug: string;
  tagline: string;
  overview: string;
  idealFor: string[];
  notFor: string[];
  outcomes: ServiceOutcome[];
  process: ServiceProcessStep[];
  /** Rich deliverables; `Service.deliverables` stays the short summary list. */
  deliverableDetails: ServiceDeliverable[];
  pricing: PricingTier[];
  faqs: ServiceFaq[];
  stack: string[];
  /** Ids from `@/data/testimonials` that speak to this kind of work. */
  testimonialIds: string[];
}

/** A service merged with its detail record — what the pages actually render. */
export type ServiceWithDetail = Service & ServiceDetail;

/* --------------------------------------------------------------------- data */

export const serviceDetails: Record<string, ServiceDetail> = {
  "product-engineering": {
    id: "product-engineering",
    slug: "product-engineering",
    tagline: "From a blank repo to a product your customers rely on.",
    overview:
      "I partner with founders and product teams to design, build and launch web products end to end. That means owning the data model, the API, the interface and the deployment pipeline — and making the trade-offs between them explicit. You get a working slice of the product in the first two weeks and a demo every week after.",
    idealFor: [
      "Seed to Series B startups that need a senior engineer to take a product from idea to launch",
      "Product teams with a well-scoped feature that keeps slipping off the roadmap",
      "Companies replacing a no-code or legacy prototype with a maintainable codebase",
    ],
    notFor: [
      "Native mobile apps (I'll happily recommend people who are great at it)",
      "Projects where the scope is fixed but the requirements are still unknown",
    ],
    outcomes: [
      { label: "First deployable slice", value: "≤ 2 weeks" },
      { label: "Typical launch", value: "6–12 weeks" },
      { label: "Test coverage on core flows", value: "90%+" },
    ],
    process: [
      {
        title: "Discovery",
        description:
          "We map the users, the riskiest assumptions and the smallest version worth shipping. I read your existing code, docs and analytics before we talk scope.",
        duration: "1 week",
        outputs: ["Problem statement & success metrics", "Prioritised feature map", "Risk register"],
      },
      {
        title: "Architecture",
        description:
          "A short written RFC covering the data model, rendering strategy, hosting and third-party services, with the alternatives I rejected and why.",
        duration: "3–5 days",
        outputs: ["Architecture RFC", "Data model & API contract", "Infrastructure plan"],
      },
      {
        title: "Build in slices",
        description:
          "Work ships as vertical slices behind feature flags. Every Friday you get a demo on a preview URL and a short written update.",
        duration: "4–10 weeks",
        outputs: ["Weekly preview deployments", "Changelog & demo notes", "Automated test suite"],
      },
      {
        title: "Launch & handover",
        description:
          "Production hardening, monitoring and a calm launch — followed by a handover so your team can own the codebase with confidence.",
        duration: "1–2 weeks",
        outputs: ["Runbooks & dashboards", "Recorded walkthroughs", "30 days of post-launch support"],
      },
    ],
    deliverableDetails: [
      {
        title: "Production web app",
        description: "A Next.js and TypeScript application with server rendering, auth and a typed data layer.",
        icon: "layers",
      },
      {
        title: "Typed API",
        description: "REST, GraphQL or tRPC endpoints with validation, rate limiting and generated client types.",
        icon: "code",
      },
      {
        title: "CI/CD pipeline",
        description: "Preview deployments per pull request, automated checks and one-click rollbacks.",
        icon: "terminal",
      },
      {
        title: "Integrations",
        description: "Payments, email, analytics and the third-party services your product depends on.",
        icon: "globe",
      },
      {
        title: "Documentation",
        description: "Architecture decision records, setup guides and onboarding notes for future engineers.",
        icon: "book",
      },
      {
        title: "Observability",
        description: "Error tracking, structured logs and uptime alerts wired up before launch day.",
        icon: "zap",
      },
    ],
    pricing: [
      {
        id: "mvp",
        name: "MVP sprint",
        price: "€14,000",
        unit: "fixed",
        description: "A focused first version of your product, built to grow rather than be thrown away.",
        features: [
          "Discovery workshop & architecture RFC",
          "Up to 3 core user flows",
          "Auth, database and deployment",
          "Weekly demos on preview URLs",
          "30 days of post-launch fixes",
        ],
        timeline: "6 weeks",
        cta: "Plan an MVP",
      },
      {
        id: "product",
        name: "Product build",
        price: "€4,200",
        unit: "/ week",
        description: "Ongoing, roadmap-driven development for teams that need a senior engineer embedded.",
        features: [
          "Everything in the MVP sprint",
          "Joins your standups and planning",
          "Payments, integrations & admin tools",
          "Code review for your in-house team",
          "Quarterly architecture health check",
        ],
        timeline: "8 weeks minimum",
        highlighted: true,
        cta: "Book a scoping call",
      },
      {
        id: "partner",
        name: "Agency partner",
        price: "Custom",
        unit: "",
        description: "White-label engineering lead for studios delivering product work to their own clients.",
        features: [
          "Technical scoping for your pitches",
          "Engineering lead on delivery",
          "Works under your brand",
          "Flexible capacity across projects",
        ],
        timeline: "By arrangement",
        cta: "Talk partnership",
      },
    ],
    faqs: [
      {
        question: "Do I own the code?",
        answer:
          "Yes. All code lives in your repositories from day one and the intellectual property transfers to you on payment of each invoice. There's no proprietary framework or lock-in.",
      },
      {
        question: "Can you work with our existing designers?",
        answer:
          "Absolutely — that's the ideal setup. I work directly in Figma with designers, give early feedback on feasibility and keep a shared component inventory so nothing gets lost in translation.",
      },
      {
        question: "What happens after launch?",
        answer:
          "Every build includes 30 days of fixes. After that, most clients either move to a light retainer for ongoing improvements or hand over to their in-house team using the documentation and recorded walkthroughs.",
      },
      {
        question: "What if the scope changes mid-project?",
        answer:
          "It usually does, and that's fine. On fixed-price work we trade features of similar size; on weekly engagements we simply re-prioritise the backlog together at the next planning session.",
      },
    ],
    stack: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "tRPC", "Stripe", "Vercel", "AWS"],
    testimonialIds: ["tom", "jonas", "priya"],
  },

  performance: {
    id: "performance",
    slug: "performance",
    tagline: "Make it fast, prove it's fast, keep it fast.",
    overview:
      "Slow products leak revenue quietly. I measure where the time actually goes — in the field, not just in Lighthouse — then fix the biggest bottlenecks hands-on and leave guardrails in CI so regressions get caught before your users notice them.",
    idealFor: [
      "E-commerce and content sites where Core Web Vitals affect conversion and SEO",
      "React or Next.js apps that feel sluggish after years of feature growth",
      "Teams preparing for a traffic spike, launch or App Router migration",
    ],
    notFor: [
      "Pure backend or database tuning with no user-facing component",
      "Sites built on closed page builders where the rendering pipeline can't be changed",
    ],
    outcomes: [
      { label: "Median LCP improvement", value: "−55%" },
      { label: "JavaScript shipped", value: "−40%" },
      { label: "Vitals passing after 90 days", value: "100%" },
    ],
    process: [
      {
        title: "Measure",
        description:
          "I combine real-user monitoring, lab traces and bundle analysis to build a ranked list of what's actually slow, for which users, on which pages.",
        duration: "3–5 days",
        outputs: ["Field & lab baseline", "Per-template Vitals breakdown", "Bundle composition report"],
      },
      {
        title: "Diagnose",
        description:
          "Each bottleneck gets a root cause and an estimated impact, so we spend effort where it moves the numbers rather than where it's easiest.",
        duration: "2–3 days",
        outputs: ["Prioritised findings report", "Effort vs. impact matrix", "Rendering strategy review"],
      },
      {
        title: "Fix",
        description:
          "Hands-on pull requests: data-fetching changes, code splitting, image and font strategy, hydration fixes and third-party script triage.",
        duration: "1–4 weeks",
        outputs: ["Merged pull requests", "Before/after traces", "Notes for every change"],
      },
      {
        title: "Guard",
        description:
          "Performance budgets in CI and dashboards your team will actually look at, so the gains survive the next quarter's roadmap.",
        duration: "2–3 days",
        outputs: ["Budgets enforced in CI", "RUM dashboard", "Team walkthrough session"],
      },
    ],
    deliverableDetails: [
      {
        title: "Audit report",
        description: "A ranked, plain-language report of every bottleneck with estimated impact and effort.",
        icon: "search",
      },
      {
        title: "Hands-on fixes",
        description: "Reviewed and merged pull requests rather than a list of recommendations.",
        icon: "code",
      },
      {
        title: "Rendering strategy",
        description: "Clear guidance on static, streaming and client rendering per route.",
        icon: "layers",
      },
      {
        title: "Performance budgets",
        description: "Automated checks on bundle size, LCP and INP that fail the build on regressions.",
        icon: "alert",
      },
      {
        title: "RUM dashboard",
        description: "Field data broken down by template, device and connection type.",
        icon: "grid",
      },
      {
        title: "Team training",
        description: "A recorded session on the patterns used, so your team can keep things fast.",
        icon: "user",
      },
    ],
    pricing: [
      {
        id: "audit",
        name: "Audit",
        price: "€3,500",
        unit: "fixed",
        description: "A thorough diagnosis with a prioritised roadmap your team can execute.",
        features: [
          "Field and lab measurement",
          "Up to 5 page templates",
          "Prioritised findings report",
          "90-minute review call",
        ],
        timeline: "1 week",
        cta: "Book an audit",
      },
      {
        id: "audit-fix",
        name: "Audit + fix",
        price: "€11,500",
        unit: "fixed",
        description: "The audit, followed by hands-on implementation of the highest-impact fixes.",
        features: [
          "Everything in the audit",
          "Hands-on pull requests",
          "Performance budgets in CI",
          "RUM dashboard setup",
          "Re-measure after 30 days",
        ],
        timeline: "4 weeks",
        highlighted: true,
        cta: "Make it fast",
      },
      {
        id: "retainer",
        name: "Guardian retainer",
        price: "€1,600",
        unit: "/ month",
        description: "Ongoing monitoring and reviews so performance stays a feature, not a project.",
        features: [
          "Monthly Vitals review",
          "Performance review on key PRs",
          "Third-party script triage",
          "Priority support during launches",
        ],
        timeline: "3 months minimum",
        cta: "Stay fast",
      },
    ],
    faqs: [
      {
        question: "Do you guarantee specific scores?",
        answer:
          "I don't promise a Lighthouse number, because lab scores can be gamed without helping real users. I do agree concrete field targets — such as LCP under 2.5s at the 75th percentile — before we start, and we track progress against them weekly.",
      },
      {
        question: "Our stack isn't Next.js. Can you still help?",
        answer:
          "Yes. The measurement and diagnosis apply to any web stack. Hands-on fixes are fastest in React-based apps, but I've also tuned Vue, Astro, Rails and WordPress sites.",
      },
      {
        question: "How much access do you need?",
        answer:
          "Read access to the repository and your analytics or RUM tool is enough for the audit. For the fix phase I work through normal pull requests reviewed by your team.",
      },
      {
        question: "Will fixes break existing features?",
        answer:
          "Every change ships behind your existing review and test process, often behind a feature flag. I add tests around anything I touch that wasn't covered before.",
      },
    ],
    stack: ["Lighthouse CI", "WebPageTest", "Chrome DevTools", "Next.js", "React", "Vercel Analytics", "OpenTelemetry"],
    testimonialIds: ["sam", "priya"],
  },

  "design-systems": {
    id: "design-systems",
    slug: "design-systems",
    tagline: "One source of truth for how your product looks, feels and behaves.",
    overview:
      "A good design system is a product with its own users: your designers and engineers. I help teams build component libraries that are accessible by default, pleasant to use and actually adopted — with tokens, theming, documentation and a migration plan that doesn't stall the roadmap.",
    idealFor: [
      "Companies with several products or teams drifting apart visually",
      "Teams rebranding or adding dark mode and theming",
      "Organisations with accessibility targets such as WCAG 2.2 AA or EN 301 549",
    ],
    notFor: [
      "One-off marketing sites where a full system would be overhead",
      "Teams looking for a visual brand identity rather than an engineering system",
    ],
    outcomes: [
      { label: "UI build time for new features", value: "−35%" },
      { label: "Accessibility issues at release", value: "−80%" },
      { label: "Teams adopting within 6 months", value: "4 / 4" },
    ],
    process: [
      {
        title: "Inventory",
        description:
          "I audit your existing UI across products and repositories to find duplicated components, inconsistent patterns and accessibility gaps.",
        duration: "1 week",
        outputs: ["UI inventory", "Accessibility gap analysis", "Adoption stakeholder map"],
      },
      {
        title: "Foundations",
        description:
          "Design tokens for colour, type, spacing and motion, wired into Figma and code so a single change flows everywhere.",
        duration: "1–2 weeks",
        outputs: ["Token architecture", "Theming & dark mode", "Figma ↔ code sync"],
      },
      {
        title: "Components",
        description:
          "Accessible, composable React components built and documented in priority order — starting with what your teams use most.",
        duration: "3–8 weeks",
        outputs: ["Component library package", "Storybook with usage guidance", "Automated a11y & visual tests"],
      },
      {
        title: "Adoption",
        description:
          "Codemods, migration guides and office hours that help product teams switch over without pausing feature work.",
        duration: "2–4 weeks",
        outputs: ["Migration guides & codemods", "Contribution model", "Versioning & release process"],
      },
    ],
    deliverableDetails: [
      {
        title: "Design tokens",
        description: "A typed token pipeline shared between Figma, CSS and your component code.",
        icon: "palette",
      },
      {
        title: "Component library",
        description: "Accessible React components with consistent APIs, published as a versioned package.",
        icon: "layers",
      },
      {
        title: "Documentation site",
        description: "Storybook or a custom docs site with live examples, do's and don'ts.",
        icon: "book",
      },
      {
        title: "Accessibility coverage",
        description: "Keyboard, screen-reader and contrast testing baked into every component.",
        icon: "check",
      },
      {
        title: "Visual regression tests",
        description: "Snapshot testing across themes and breakpoints to catch unintended changes.",
        icon: "monitor",
      },
      {
        title: "Adoption playbook",
        description: "Codemods, migration guides and a contribution model for long-term ownership.",
        icon: "pen",
      },
    ],
    pricing: [
      {
        id: "foundations",
        name: "Foundations",
        price: "€8,000",
        unit: "fixed",
        description: "Tokens, theming and the core primitives every product needs.",
        features: [
          "UI inventory & audit",
          "Token architecture & theming",
          "10–12 core components",
          "Storybook documentation",
        ],
        timeline: "4 weeks",
        cta: "Lay the foundations",
      },
      {
        id: "system",
        name: "Full system",
        price: "€4,000",
        unit: "/ week",
        description: "A complete, adopted design system built alongside your product teams.",
        features: [
          "Everything in Foundations",
          "40+ accessible components",
          "Visual regression testing",
          "Migration guides & codemods",
          "Adoption office hours",
        ],
        timeline: "10–14 weeks",
        highlighted: true,
        cta: "Build the system",
      },
      {
        id: "a11y",
        name: "Accessibility review",
        price: "€2,800",
        unit: "fixed",
        description: "An expert review of an existing component library against WCAG 2.2 AA.",
        features: [
          "Keyboard & screen-reader testing",
          "Per-component findings",
          "Fix recommendations with code",
          "Follow-up review call",
        ],
        timeline: "1–2 weeks",
        cta: "Review my library",
      },
    ],
    faqs: [
      {
        question: "Should we build our own or use an existing library?",
        answer:
          "Often both. I usually recommend building on headless primitives (like Radix or React Aria) for behaviour and accessibility, and owning the styling and API layer. We'll decide together during the inventory phase.",
      },
      {
        question: "Do you also do the visual design?",
        answer:
          "I'm fluent in Figma and comfortable refining an existing visual language, but for a brand-new identity I'll pair with your designers or recommend a studio I trust.",
      },
      {
        question: "How do you make sure teams actually adopt it?",
        answer:
          "By treating them as users from day one: building the components they need first, providing codemods for the tedious migrations and running office hours. Adoption is tracked as a metric, not hoped for.",
      },
      {
        question: "Which frameworks do you support?",
        answer:
          "React is my primary focus, including React Server Components. Tokens are framework-agnostic, so they can also feed native apps or other web frameworks.",
      },
    ],
    stack: ["React", "TypeScript", "Tailwind CSS", "Radix UI", "Storybook", "Figma", "Playwright", "Changesets"],
    testimonialIds: ["maya", "priya"],
  },

  "technical-leadership": {
    id: "technical-leadership",
    slug: "technical-leadership",
    tagline: "Senior judgment for teams that are growing faster than their habits.",
    overview:
      "Fractional tech leadership for teams between five and thirty engineers. I help you make the big architectural calls, set up the workflows that keep quality high as you scale, and grow the people who'll lead after I'm gone. It's hands-on: I review code, write RFCs and pair with your engineers.",
    idealFor: [
      "Startups without a CTO or between engineering leaders",
      "Teams facing a major migration, re-platforming or scaling challenge",
      "Engineering managers who want an experienced sparring partner",
    ],
    notFor: [
      "Pure people management or performance reviews",
      "Organisations looking for a long-term full-time hire without a trial period",
    ],
    outcomes: [
      { label: "Deploy frequency", value: "Weekly → daily" },
      { label: "Time-to-offer in hiring", value: "−50%" },
      { label: "Engineers mentored to promotion", value: "5" },
    ],
    process: [
      {
        title: "Assess",
        description:
          "Interviews with engineers, product and leadership, plus a review of the codebase, delivery metrics and incident history.",
        duration: "1–2 weeks",
        outputs: ["Engineering health report", "Delivery metrics baseline", "Top-three priorities"],
      },
      {
        title: "Align",
        description:
          "A shared plan for architecture, workflow and team structure, agreed with leadership and written down where everyone can see it.",
        duration: "1 week",
        outputs: ["Technical strategy doc", "Architecture decision records", "Quarterly roadmap"],
      },
      {
        title: "Embed",
        description:
          "Regular involvement in reviews, planning and design discussions, introducing practices one at a time so they actually stick.",
        duration: "Ongoing",
        outputs: ["RFC & review process", "CI/CD improvements", "1:1 mentoring"],
      },
      {
        title: "Transition",
        description:
          "Handover to an internal lead — whether someone we've grown together or a hire I've helped you make.",
        duration: "2–4 weeks",
        outputs: ["Leadership handover plan", "Hiring loop & rubrics", "Documented team rituals"],
      },
    ],
    deliverableDetails: [
      {
        title: "Architecture reviews",
        description: "Written RFCs and decision records for the calls that are expensive to reverse.",
        icon: "cpu",
      },
      {
        title: "Code review culture",
        description: "Guidelines, templates and examples that make reviews faster and kinder.",
        icon: "code",
      },
      {
        title: "Delivery pipeline",
        description: "CI/CD, preview environments and release practices that support daily deploys.",
        icon: "terminal",
      },
      {
        title: "Hiring loops",
        description: "Structured interviews, take-home alternatives and scoring rubrics.",
        icon: "briefcase",
      },
      {
        title: "Mentoring",
        description: "Regular 1:1s with engineers working towards senior and lead roles.",
        icon: "user",
      },
      {
        title: "Engineering metrics",
        description: "Lightweight DORA-style metrics that start conversations, not blame.",
        icon: "grid",
      },
    ],
    pricing: [
      {
        id: "advisory",
        name: "Advisory",
        price: "€2,400",
        unit: "/ month",
        description: "A senior sounding board for your engineering leadership.",
        features: [
          "Two strategy calls per month",
          "Async RFC & architecture review",
          "Hiring loop feedback",
          "Slack access for quick questions",
        ],
        timeline: "Monthly, cancel anytime",
        cta: "Get advice",
      },
      {
        id: "fractional",
        name: "Fractional lead",
        price: "€6,500",
        unit: "/ month",
        description: "Two days a week embedded with your team as an acting tech lead.",
        features: [
          "Everything in Advisory",
          "Joins planning & standups",
          "Hands-on code review",
          "Weekly 1:1 mentoring",
          "Process & CI/CD improvements",
        ],
        timeline: "3 months minimum",
        highlighted: true,
        cta: "Bring me in",
      },
      {
        id: "assessment",
        name: "Health check",
        price: "€4,500",
        unit: "fixed",
        description: "A one-off, in-depth assessment of your codebase, delivery and team practices.",
        features: [
          "Stakeholder interviews",
          "Codebase & architecture review",
          "Delivery metrics analysis",
          "Written report & roadmap",
        ],
        timeline: "2 weeks",
        cta: "Assess my team",
      },
    ],
    faqs: [
      {
        question: "How is this different from hiring a full-time CTO?",
        answer:
          "It's a fraction of the cost and commitment, and you get someone who's seen many teams' problems. It works best as a bridge — while you hire, through a big migration, or while growing an internal lead.",
      },
      {
        question: "Will you write code too?",
        answer:
          "Yes, deliberately. Staying close to the code keeps my advice grounded. I typically take on enabling work — tooling, prototypes, tricky migrations — rather than features on the critical path.",
      },
      {
        question: "Can you help us hire?",
        answer:
          "Yes. I can design the interview loop, write job descriptions, sit on interview panels and help you evaluate candidates for senior and lead roles.",
      },
      {
        question: "What size of team is this right for?",
        answer:
          "It works best for teams of roughly five to thirty engineers. Smaller teams usually need hands-on building more than leadership; larger ones typically need a full-time leader.",
      },
    ],
    stack: ["RFCs & ADRs", "GitHub Actions", "DORA metrics", "Linear", "Notion", "Terraform", "Kubernetes"],
    testimonialIds: ["lena", "tom", "jonas"],
  },
};

/* ------------------------------------------------------------------ helpers */

/** Every service that has a detail record, in the order defined in `services.ts`. */
export function getServicesWithDetails(): ServiceWithDetail[] {
  return services.flatMap((service) => {
    const detail = serviceDetails[service.id];
    return detail ? [{ ...service, ...detail }] : [];
  });
}

export function getServiceBySlug(slug: string): ServiceWithDetail | undefined {
  return getServicesWithDetails().find((s) => s.slug === slug);
}

/** Testimonials referenced by a service, preserving the order listed in its detail record. */
export function getServiceTestimonials(service: Pick<ServiceDetail, "testimonialIds">): Testimonial[] {
  const byId = new Map(testimonials.map((t) => [t.id, t]));
  return service.testimonialIds.flatMap((id) => {
    const t = byId.get(id);
    return t ? [t] : [];
  });
}

/** The other services, for "explore more" navigation on a detail page. */
export function getOtherServices(slug: string): ServiceWithDetail[] {
  return getServicesWithDetails().filter((s) => s.slug !== slug);
}

/** Previous and next service (wrapping around) for in-page pagination. */
export function getAdjacentServices(slug: string): { prev: ServiceWithDetail; next: ServiceWithDetail } | null {
  const all = getServicesWithDetails();
  const index = all.findIndex((s) => s.slug === slug);
  if (index === -1 || all.length < 2) return null;
  return {
    prev: all[(index - 1 + all.length) % all.length],
    next: all[(index + 1) % all.length],
  };
}

/** Lowest numeric price across a service's tiers, used for "from €X" labels. */
export function getStartingPrice(service: Pick<ServiceDetail, "pricing">): string | null {
  let best: { value: number; tier: PricingTier } | null = null;
  for (const tier of service.pricing) {
    const value = Number(tier.price.replace(/[^\d.]/g, ""));
    if (!value) continue;
    if (!best || value < best.value) best = { value, tier };
  }
  return best ? `${best.tier.price}${best.tier.unit && best.tier.unit !== "fixed" ? ` ${best.tier.unit}` : ""}` : null;
}
