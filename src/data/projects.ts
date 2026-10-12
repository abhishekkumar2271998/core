import type { Project, ProjectCategory, ProjectStatus } from "@/types";

/** Human-readable labels for each project category. */
export const projectCategories: Record<ProjectCategory, string> = {
  web: "Web App",
  mobile: "Mobile",
  "open-source": "Open Source",
  design: "Design System",
  tooling: "Developer Tooling",
  ai: "AI & ML",
};

/** Human-readable labels for each project status. */
export const projectStatuses: Record<ProjectStatus, string> = {
  live: "Live",
  "in-progress": "In progress",
  archived: "Archived",
};

/**
 * Selected work. Ordered newest first — this order also drives the
 * previous / next navigation on case study pages.
 */
export const projects: Project[] = [
  {
    slug: "lumen-analytics",
    title: "Lumen Analytics",
    summary:
      "A real-time product analytics platform that turns billions of raw events into dashboards product teams actually open every morning.",
    description:
      "Lumen is a privacy-first product analytics suite for mid-market SaaS companies. I led the rebuild of its query engine and dashboard experience, taking p95 chart load times from 9 seconds to under 400 ms while the event volume grew fivefold.",
    year: 2026,
    role: "Lead Full-Stack Engineer",
    duration: "14 months",
    client: "Lumen Labs",
    category: "web",
    status: "live",
    featured: true,
    tags: ["Analytics", "Dashboards", "Performance", "Data Viz", "SaaS"],
    stack: ["Next.js", "TypeScript", "ClickHouse", "tRPC", "Redis", "D3", "Kafka", "AWS"],
    gradient: ["#6366f1", "#06b6d4"],
    links: {
      live: "https://lumen.example.com",
      caseStudy: "/blog/building-realtime-dashboards",
    },
    metrics: [
      { label: "p95 chart load", value: "380 ms" },
      { label: "Events / day", value: "2.4B" },
      { label: "Weekly active teams", value: "+64%" },
      { label: "Infra cost per event", value: "−41%" },
    ],
    sections: [
      {
        heading: "Overview",
        body: "Lumen started as a scrappy Postgres-backed event store bolted onto a React SPA. By the time I joined, the largest customers were sending 400 million events a day and the dashboards had become something people screenshotted rather than used. The brief was simple to say and hard to do: make analytics feel instant again without asking customers to change a single line of their tracking code.",
      },
      {
        heading: "The challenge",
        body: "Every slow chart was slow for a different reason. Some queries scanned months of raw events, some fanned out into dozens of sequential API calls, and some simply re-rendered 50,000 SVG nodes on every hover.",
        bullets: [
          "Postgres row storage could not aggregate high-cardinality properties fast enough at the 95th percentile.",
          "The dashboard fetched each widget independently, producing request waterfalls of up to 30 calls.",
          "Chart components re-computed scales and paths on every mouse move, pinning the main thread.",
          "There was no shared definition of a metric, so the same 'active user' number differed across three screens.",
        ],
      },
      {
        heading: "Approach",
        body: "We split the problem into storage, transport and rendering, and attacked each with a measurable budget. I wrote the performance budgets into CI so regressions failed the build instead of surfacing in support tickets.",
        bullets: [
          "Moved event storage to ClickHouse with materialised rollups at minute, hour and day granularity.",
          "Introduced a typed semantic layer so metrics are defined once and compiled into SQL for every surface.",
          "Batched widget queries through a single tRPC endpoint with request coalescing and a Redis result cache.",
          "Rebuilt charts on canvas for dense series, keeping SVG only for small, accessible summaries.",
          "Streamed dashboard sections with React Server Components so the first meaningful chart paints immediately.",
        ],
      },
      {
        heading: "Results",
        body: "The rebuild shipped incrementally behind feature flags over four releases, with zero downtime and no customer-facing migration. Dashboards became a daily habit again — the metric we cared about most.",
        bullets: [
          "p95 chart load dropped from 9.1 s to 380 ms; p50 now sits at 120 ms.",
          "Weekly active teams grew 64% in the two quarters following launch.",
          "Infra cost per ingested event fell 41% despite a 5× increase in volume.",
          "The semantic layer eliminated an entire class of 'numbers don't match' support tickets.",
        ],
      },
      {
        heading: "What I learned",
        body: "Performance work is product work. The biggest wins came from deleting requests rather than optimising them, and from giving the team a shared vocabulary for metrics. Budgets in CI turned 'fast' from an aspiration into a contract.",
      },
    ],
    highlights: [
      "Designed a typed semantic layer compiling metric definitions to ClickHouse SQL",
      "Canvas renderer handling 200k points at 60 fps with accessible SVG fallbacks",
      "Performance budgets enforced in CI with Lighthouse and custom query timers",
      "Streaming dashboards with React Server Components and Suspense",
      "Zero-downtime migration of 18 months of historical events",
    ],
  },
  {
    slug: "promptly",
    title: "Promptly",
    summary:
      "A retrieval-augmented support assistant that answers customer questions from a company's own docs — with citations and a human hand-off.",
    description:
      "Promptly is an AI support layer that sits in front of a help desk. It retrieves answers from product documentation, past tickets and changelogs, cites every claim, and knows when to escalate to a human. I'm building it as technical co-founder with a two-person team.",
    year: 2026,
    role: "Technical Co-founder",
    duration: "Ongoing · 8 months",
    category: "ai",
    status: "in-progress",
    featured: true,
    tags: ["AI", "RAG", "LLM", "Search", "Customer Support"],
    stack: ["Next.js", "TypeScript", "Python", "FastAPI", "pgvector", "PostgreSQL", "Vercel AI SDK", "Temporal"],
    gradient: ["#a855f7", "#f43f5e"],
    links: {
      live: "https://promptly.example.com",
    },
    metrics: [
      { label: "Tickets auto-resolved", value: "43%" },
      { label: "Answer accuracy (eval)", value: "94.2%" },
      { label: "Median response", value: "1.8 s" },
      { label: "Pilot customers", value: "11" },
    ],
    sections: [
      {
        heading: "Overview",
        body: "Support teams drown in questions that are already answered somewhere — in docs, in a changelog, in a ticket from last March. Promptly indexes all of it and answers in the customer's language, linking to sources so both the customer and the support agent can verify the response.",
      },
      {
        heading: "The challenge",
        body: "Generic chatbots erode trust quickly: one confidently wrong answer about billing and customers stop using the widget. The hard problems were not generation but retrieval quality, freshness and knowing when not to answer.",
        bullets: [
          "Documentation changes daily, so stale embeddings produced outdated answers.",
          "Ticket history is noisy, full of signatures, quoted replies and personal data.",
          "Teams needed proof the assistant was improving, not just anecdotes.",
        ],
      },
      {
        heading: "Approach",
        body: "We treat the assistant as a search product first. Hybrid retrieval, aggressive evaluation and conservative escalation rules matter more than the choice of model.",
        bullets: [
          "Hybrid retrieval combining BM25 and pgvector embeddings, re-ranked with a cross-encoder.",
          "Incremental ingestion pipelines on Temporal that re-embed only changed chunks within minutes.",
          "PII scrubbing and quote-stripping before any ticket enters the index.",
          "A 1,200-question evaluation suite that runs on every prompt or retrieval change.",
          "Confidence thresholds that route uncertain answers to humans with the retrieved context attached.",
        ],
      },
      {
        heading: "Early results",
        body: "Across eleven pilot customers, Promptly resolves 43% of incoming tickets without human involvement while keeping CSAT flat or improving it. Agents report that even escalated tickets arrive faster to resolve because the relevant docs are already attached.",
        bullets: [
          "94.2% accuracy on the held-out evaluation set, up from 78% in the first prototype.",
          "Median time-to-first-answer of 1.8 seconds with streaming responses.",
          "Average handle time for escalated tickets down 27%.",
        ],
      },
    ],
    highlights: [
      "Evaluation harness gating every prompt and retrieval change in CI",
      "Hybrid BM25 + vector search with cross-encoder re-ranking",
      "Streaming UI with inline citations and source previews",
      "Durable ingestion workflows on Temporal with per-chunk change detection",
    ],
  },
  {
    slug: "relay-checkout",
    title: "Relay Checkout",
    summary:
      "A ground-up rebuild of an outdoor retailer's checkout that cut abandonment by a fifth and made Black Friday boring — in the best way.",
    description:
      "Northwind Outfitters' checkout was a seven-step legacy flow that buckled under seasonal traffic. I led a small squad to rebuild it as a single-page, edge-rendered experience with resilient payments, saved carts and full accessibility compliance.",
    year: 2025,
    role: "Senior Frontend Engineer",
    duration: "7 months",
    client: "Northwind Outfitters",
    category: "web",
    status: "live",
    featured: true,
    tags: ["E-commerce", "Payments", "Accessibility", "Performance", "Edge"],
    stack: ["Next.js", "React", "TypeScript", "Stripe", "GraphQL", "Tailwind CSS", "Playwright", "Vercel"],
    gradient: ["#f59e0b", "#ef4444"],
    links: {
      live: "https://northwind.example.com",
    },
    metrics: [
      { label: "Checkout abandonment", value: "−21%" },
      { label: "Conversion rate", value: "+12.6%" },
      { label: "LCP on 4G", value: "1.3 s" },
      { label: "Peak orders / min", value: "3,800" },
    ],
    sections: [
      {
        heading: "Overview",
        body: "Checkout is where every inefficiency in an e-commerce stack becomes visible to the customer. Northwind's flow had accreted over a decade: seven pages, three different address forms and a payment iframe that timed out under load. We replaced it with a single adaptive page that renders at the edge and degrades gracefully.",
      },
      {
        heading: "The challenge",
        body: "The rebuild had to land before peak season, without a code freeze on the rest of the storefront, and integrate with an ERP that could not be changed.",
        bullets: [
          "Mobile users abandoned at the shipping step at nearly twice the desktop rate.",
          "The legacy flow failed WCAG 2.1 AA in 40+ places, creating legal exposure.",
          "Inventory reservations raced each other during flash sales, overselling popular items.",
        ],
      },
      {
        heading: "Approach",
        body: "We shipped behind a percentage rollout and A/B tested every major decision, letting data settle the debates that usually stall checkout projects.",
        bullets: [
          "Collapsed seven steps into one progressive page with optimistic validation and address autocomplete.",
          "Moved pricing and tax calculation to edge functions, keeping the ERP as the source of truth via a queue.",
          "Adopted Stripe Payment Element with wallet support and idempotent order submission.",
          "Built an accessible form system with consistent error summaries, focus management and live regions.",
          "Covered the critical paths with Playwright tests running against production-like data nightly.",
        ],
      },
      {
        heading: "Results",
        body: "The new checkout went to 100% of traffic six weeks before Black Friday and handled a record peak without an incident page.",
        bullets: [
          "Checkout abandonment fell 21%, with the biggest gains on mobile.",
          "Conversion rate improved 12.6% across all traffic sources.",
          "Zero oversold orders thanks to short-lived inventory reservations.",
          "Passed an external WCAG 2.1 AA audit with no critical findings.",
        ],
      },
    ],
    highlights: [
      "Single-page checkout with optimistic validation and saved carts",
      "Idempotent payment submission resilient to double clicks and retries",
      "Accessible form system reused across the storefront",
      "Edge-computed pricing with queue-based ERP sync",
      "Percentage rollout with automated rollback on error-rate spikes",
    ],
  },
  {
    slug: "atlas-design-system",
    title: "Atlas Design System",
    summary:
      "A themeable, accessible component library that unified six product teams at a digital bank under one visual language.",
    description:
      "Atlas is the design system for Meridian Bank's web and mobile products. I partnered with two designers to build its token pipeline, 60+ React components and the documentation site, and drove adoption across six product teams.",
    year: 2025,
    role: "Design Systems Engineer",
    duration: "10 months",
    client: "Meridian Bank",
    category: "design",
    status: "live",
    featured: true,
    tags: ["Design Systems", "Accessibility", "Components", "Theming", "Documentation"],
    stack: ["React", "TypeScript", "Radix UI", "Style Dictionary", "Storybook", "Figma API", "Chromatic", "Changesets"],
    gradient: ["#10b981", "#3b82f6"],
    links: {
      live: "https://atlas.example.com",
      repo: "https://github.com/alexmorgan/atlas-tokens",
    },
    metrics: [
      { label: "Components", value: "64" },
      { label: "Teams adopted", value: "6 / 6" },
      { label: "UI build time", value: "−35%" },
      { label: "A11y issues in audits", value: "−88%" },
    ],
    sections: [
      {
        heading: "Overview",
        body: "Meridian's products had drifted apart: four shades of 'brand blue', three date pickers and buttons that behaved differently depending on which team built the page. Atlas gave them a single source of truth from Figma to production.",
      },
      {
        heading: "The challenge",
        body: "A design system only succeeds if teams choose to use it. Atlas had to be faster to build with than the alternatives, flexible enough for white-label partner banks, and rigorous enough for a regulated industry.",
        bullets: [
          "Two partner brands required full theming without forking components.",
          "Existing products could not pause feature work for a big-bang migration.",
          "Compliance required documented accessibility conformance for every component.",
        ],
      },
      {
        heading: "Approach",
        body: "We built Atlas in layers so teams could adopt it gradually: tokens first, then primitives, then patterns.",
        bullets: [
          "Synced design tokens from Figma variables via the Figma API into Style Dictionary, generating CSS, iOS and Android outputs.",
          "Built components on Radix primitives for robust keyboard and screen-reader behaviour.",
          "Wrote codemods that migrated legacy buttons, inputs and modals automatically.",
          "Added visual regression testing with Chromatic and per-component accessibility reports in Storybook.",
          "Ran fortnightly office hours and embedded with each team for their first Atlas sprint.",
        ],
      },
      {
        heading: "Results",
        body: "Within ten months every product team had adopted Atlas, and new partner themes now take days instead of quarters.",
        bullets: [
          "Feature UI build time down an estimated 35% according to team retros.",
          "Accessibility issues found in external audits dropped 88% year over year.",
          "A new partner bank theme shipped in four days with zero component changes.",
        ],
      },
      {
        heading: "Reflections",
        body: "The codemods mattered more than any component. Lowering the cost of migration did more for adoption than any amount of evangelism, and treating product teams as customers kept the roadmap honest.",
      },
    ],
    highlights: [
      "Figma variables → Style Dictionary token pipeline for web, iOS and Android",
      "64 accessible components built on Radix primitives",
      "Automated codemods for incremental migration",
      "Visual regression and a11y testing on every pull request",
    ],
  },
  {
    slug: "shipyard-cli",
    title: "Shipyard CLI",
    summary:
      "A monorepo release tool that builds only what changed, spins up preview environments and writes changelogs nobody has to edit.",
    description:
      "Shipyard is an internal developer platform CLI I built at a 120-engineer scale-up. It replaced a tangle of bash scripts with a fast, typed tool for affected-package detection, preview deployments and automated releases.",
    year: 2025,
    role: "Platform Engineer",
    duration: "5 months",
    client: "Harbor Health",
    category: "tooling",
    status: "live",
    featured: false,
    tags: ["CLI", "DX", "Monorepo", "CI/CD", "Automation"],
    stack: ["Node.js", "TypeScript", "pnpm", "Turborepo", "GitHub Actions", "Docker", "Kubernetes"],
    gradient: ["#0ea5e9", "#22c55e"],
    links: {
      repo: "https://github.com/alexmorgan/shipyard",
    },
    metrics: [
      { label: "Median CI time", value: "24 → 7 min" },
      { label: "Preview envs / week", value: "310" },
      { label: "Release prep", value: "2 h → 0" },
      { label: "Weekly users", value: "118 devs" },
    ],
    sections: [
      {
        heading: "Overview",
        body: "Harbor Health's monorepo held 40 packages and 9 deployable apps. Every pull request rebuilt everything, previews were a shared staging server everyone fought over, and releases needed a volunteer to hand-assemble the changelog.",
      },
      {
        heading: "Approach",
        body: "I interviewed a dozen engineers, mapped where their time went, and designed Shipyard around the three most painful loops.",
        bullets: [
          "Affected-package detection using the dependency graph and git diff, feeding Turborepo's remote cache.",
          "Ephemeral preview environments per pull request on Kubernetes, torn down automatically on merge.",
          "Conventional-commit parsing to generate changelogs and semantic versions for every package.",
          "Typed config with helpful error messages and a `shipyard doctor` command for local setup issues.",
        ],
      },
      {
        heading: "Results",
        body: "Shipyard became the default way to work within a month of launch, and the bash scripts were deleted entirely.",
        bullets: [
          "Median CI duration fell from 24 to 7 minutes.",
          "Release preparation dropped from roughly two hours to zero manual steps.",
          "Engineers created over 300 preview environments a week, unblocking design and QA reviews.",
        ],
      },
    ],
    highlights: [
      "Dependency-graph-aware builds with remote caching",
      "Per-PR preview environments with automatic teardown",
      "Changelog and version automation from conventional commits",
      "Friendly diagnostics via `shipyard doctor`",
    ],
  },
  {
    slug: "mosaic-whiteboard",
    title: "Mosaic",
    summary:
      "An open-source, local-first collaborative whiteboard built on CRDTs — works offline, syncs when you reconnect, never loses a sticky note.",
    description:
      "Mosaic is my open-source exploration of local-first software: a multiplayer whiteboard where every client holds the full document, edits merge conflict-free via CRDTs, and the server is just a relay. It's in active development with a small community of contributors.",
    year: 2025,
    role: "Creator & Maintainer",
    duration: "Ongoing · side project",
    category: "open-source",
    status: "in-progress",
    featured: false,
    tags: ["Open Source", "Local-first", "CRDT", "Realtime", "Canvas"],
    stack: ["TypeScript", "React", "Yjs", "WebSockets", "Canvas API", "IndexedDB", "Cloudflare Workers"],
    gradient: ["#ec4899", "#8b5cf6"],
    links: {
      live: "https://mosaic.example.com",
      repo: "https://github.com/alexmorgan/mosaic",
    },
    metrics: [
      { label: "GitHub stars", value: "2.9k" },
      { label: "Contributors", value: "34" },
      { label: "Sync latency (p50)", value: "42 ms" },
      { label: "Bundle size", value: "68 kB" },
    ],
    sections: [
      {
        heading: "Overview",
        body: "Most collaborative tools treat the server as the source of truth, so a flaky connection means a frozen canvas. Mosaic flips that model: your device owns your data, and collaboration is a sync problem rather than a request/response problem.",
      },
      {
        heading: "Technical challenges",
        body: "Building a smooth canvas on top of a CRDT exposes trade-offs that most demos skip.",
        bullets: [
          "Keeping the Yjs document small as boards accumulate thousands of shapes and edit history.",
          "Rendering at 60 fps while remote updates arrive mid-gesture.",
          "Presence (cursors, selections) without bloating the persisted document.",
        ],
      },
      {
        heading: "Approach",
        body: "The renderer and the data model are deliberately decoupled. The canvas reads from an immutable snapshot updated in batches, while presence travels over a separate ephemeral channel.",
        bullets: [
          "Spatial index (R-tree) for hit testing and viewport culling.",
          "Batched CRDT updates applied once per animation frame.",
          "IndexedDB persistence with periodic document compaction.",
          "Cloudflare Durable Objects as a lightweight relay and backup store.",
        ],
      },
      {
        heading: "Roadmap",
        body: "Next up are end-to-end encrypted boards, a plugin API for custom shapes and an embeddable read-only viewer. Contributions are welcome — the issue tracker has a 'good first issue' label curated weekly.",
      },
    ],
    highlights: [
      "Fully offline-capable with conflict-free merges",
      "60 fps canvas with R-tree viewport culling",
      "Separate ephemeral channel for live presence",
      "34 contributors and a weekly-curated good-first-issue queue",
    ],
  },
  {
    slug: "typed-env",
    title: "typed-env",
    summary:
      "A tiny, zero-dependency library that validates environment variables at startup and gives you fully-typed config in return.",
    description:
      "typed-env grew out of one too many production incidents caused by a missing or malformed environment variable. It validates your env against a schema at boot, fails loudly with helpful messages, and infers precise TypeScript types — in under 2 kB.",
    year: 2024,
    role: "Author & Maintainer",
    duration: "3 months to v1 · maintained since",
    category: "open-source",
    status: "live",
    featured: false,
    tags: ["Open Source", "TypeScript", "Library", "DX", "Node.js"],
    stack: ["TypeScript", "Node.js", "Vitest", "tsup", "Changesets", "GitHub Actions"],
    gradient: ["#14b8a6", "#6366f1"],
    links: {
      repo: "https://github.com/alexmorgan/typed-env",
      live: "https://www.npmjs.com/package/typed-env",
    },
    metrics: [
      { label: "Weekly downloads", value: "48k" },
      { label: "Bundle size", value: "1.7 kB" },
      { label: "Dependencies", value: "0" },
      { label: "Test coverage", value: "100%" },
    ],
    sections: [
      {
        heading: "Overview",
        body: "Environment variables are stringly-typed global state. typed-env treats them like any other untrusted input: parse, validate and type them once at the edge of your application, then never think about `process.env` again.",
      },
      {
        heading: "Design goals",
        body: "I wanted something small enough to use in edge runtimes and opinionated enough to prevent common mistakes.",
        bullets: [
          "Zero dependencies and tree-shakeable — it runs in Node, Bun, Deno and edge workers.",
          "Type inference without code generation: the schema is the type.",
          "Error messages that list every problem at once, with hints for common typos.",
          "Clear separation of server-only and client-exposed variables for frameworks like Next.js.",
        ],
      },
      {
        heading: "Results",
        body: "typed-env is now used by several thousand projects, including a few well-known open-source starters. Maintaining it taught me a lot about API stability, semantic versioning and saying no to feature requests kindly.",
        bullets: [
          "48k weekly downloads on npm and steady organic growth.",
          "Fewer than 10 open issues at any time, with a median response under 24 hours.",
        ],
      },
    ],
    highlights: [
      "Precise type inference straight from the schema",
      "Aggregated, actionable error messages at boot",
      "Runs in Node, Bun, Deno and edge runtimes",
      "100% test coverage with property-based tests",
    ],
  },
  {
    slug: "tidepool",
    title: "Tidepool",
    summary:
      "A calm, offline-first habit and wellbeing app with delightful micro-interactions, built in React Native for iOS and Android.",
    description:
      "Tidepool helps people build small daily habits without guilt-driven streaks. I built the app end to end with a designer, from the gesture-driven UI and local-first storage to the sync backend and App Store launch.",
    year: 2024,
    role: "Mobile Engineer (Freelance)",
    duration: "6 months",
    client: "Tidepool Studio",
    category: "mobile",
    status: "live",
    featured: false,
    tags: ["Mobile", "React Native", "Animation", "Offline-first", "Health"],
    stack: ["React Native", "Expo", "TypeScript", "Reanimated", "SQLite", "Supabase", "RevenueCat"],
    gradient: ["#06b6d4", "#3b82f6"],
    links: {
      live: "https://tidepool.example.com",
    },
    metrics: [
      { label: "App Store rating", value: "4.8★" },
      { label: "Downloads", value: "120k" },
      { label: "Day-30 retention", value: "31%" },
      { label: "Crash-free sessions", value: "99.9%" },
    ],
    sections: [
      {
        heading: "Overview",
        body: "Most habit trackers punish you for missing a day. Tidepool uses 'tides' instead of streaks — progress ebbs gently rather than resetting to zero — and the interface leans on motion and haptics to feel rewarding rather than demanding.",
      },
      {
        heading: "Approach",
        body: "Fluid motion was a product requirement, not a polish item, so the architecture was designed around keeping the UI thread free.",
        bullets: [
          "All animations run on the UI thread with Reanimated worklets and gesture handlers.",
          "Local SQLite is the source of truth; Supabase sync runs in the background with conflict resolution.",
          "Subscription logic through RevenueCat with server-side receipt validation.",
          "Feature flags and staged rollouts via Expo updates for over-the-air fixes.",
        ],
      },
      {
        heading: "Results",
        body: "Tidepool was featured in the App Store's 'Apps We Love' in three regions within two months of launch.",
        bullets: [
          "120k downloads and a 4.8-star average across 6,000 ratings.",
          "Day-30 retention of 31%, well above the category benchmark.",
          "99.9% crash-free sessions since launch.",
        ],
      },
    ],
    highlights: [
      "Gesture-driven UI running at 60 fps on mid-range Android devices",
      "Local-first data with background sync and conflict resolution",
      "Featured by Apple in three regions",
      "Over-the-air updates with staged rollouts",
    ],
  },
  {
    slug: "pulse-status",
    title: "Pulse Status",
    summary:
      "A status page and uptime monitor for small teams, with multi-region checks, incident timelines and subscriber notifications.",
    description:
      "Pulse was a bootstrapped SaaS I co-founded and ran for two years. It monitored endpoints from six regions, published branded status pages and notified subscribers by email, SMS and webhook. It was acquired by a larger observability company in 2023.",
    year: 2023,
    role: "Co-founder & Engineer",
    duration: "2 years",
    category: "web",
    status: "archived",
    featured: false,
    tags: ["SaaS", "Monitoring", "Realtime", "Notifications", "Bootstrapped"],
    stack: ["Remix", "TypeScript", "PostgreSQL", "Go", "Fly.io", "Postmark", "Twilio"],
    gradient: ["#22c55e", "#84cc16"],
    links: {
      caseStudy: "/blog/lessons-from-running-a-tiny-saas",
    },
    metrics: [
      { label: "Paying customers", value: "740" },
      { label: "Checks / day", value: "18M" },
      { label: "Platform uptime", value: "99.99%" },
      { label: "Outcome", value: "Acquired" },
    ],
    sections: [
      {
        heading: "Overview",
        body: "Status pages were either expensive enterprise products or DIY static sites that went down with the service they described. Pulse aimed for the middle: affordable, independent infrastructure and a five-minute setup.",
      },
      {
        heading: "Building it",
        body: "With two founders and no funding, every architectural decision was weighed against the cost of operating it on a weekend.",
        bullets: [
          "Lightweight Go probes deployed to six Fly.io regions, reporting to a central Postgres via a write-ahead queue.",
          "Consensus-based alerting: an outage was declared only when three regions agreed, eliminating false alarms.",
          "Status pages served from the edge with stale-while-revalidate so they stayed up during our own incidents.",
          "Automated incident timelines generated from check data and editable by the customer.",
        ],
      },
      {
        heading: "Outcome",
        body: "Pulse grew to 740 paying customers through content marketing and word of mouth before being acquired. The product has since been folded into the acquirer's platform, so this project is archived.",
        bullets: [
          "18 million checks per day at peak with 99.99% platform uptime.",
          "Profitable within 11 months on less than $900/month of infrastructure.",
        ],
      },
    ],
    highlights: [
      "Multi-region consensus alerting with near-zero false positives",
      "Edge-cached status pages resilient to origin outages",
      "Profitable, bootstrapped and acquired",
    ],
  },
  {
    slug: "fieldnotes",
    title: "Fieldnotes",
    summary:
      "An offline-first data collection app for environmental researchers working weeks at a time without connectivity.",
    description:
      "Fieldnotes let a conservation NGO's researchers record species sightings, photos and GPS tracks in remote areas, syncing reliably when they returned to coverage. It ran for three field seasons before being replaced by a commercial platform.",
    year: 2022,
    role: "Full-Stack Engineer (Pro bono)",
    duration: "9 months",
    client: "Green Ridge Conservancy",
    category: "mobile",
    status: "archived",
    featured: false,
    tags: ["Mobile", "Offline-first", "Maps", "Non-profit", "PWA"],
    stack: ["React", "TypeScript", "Workbox", "IndexedDB", "Leaflet", "Node.js", "PostGIS"],
    gradient: ["#65a30d", "#0d9488"],
    links: {
      repo: "https://github.com/alexmorgan/fieldnotes",
    },
    metrics: [
      { label: "Observations logged", value: "86k" },
      { label: "Data loss incidents", value: "0" },
      { label: "Researchers", value: "45" },
      { label: "Paper forms replaced", value: "100%" },
    ],
    sections: [
      {
        heading: "Overview",
        body: "Researchers were transcribing paper field notes into spreadsheets months after collection, introducing errors and delaying analysis. Fieldnotes digitised the whole flow on the rugged Android devices the team already owned.",
      },
      {
        heading: "Constraints",
        body: "The app had to assume no connectivity, unreliable power and gloved hands.",
        bullets: [
          "Weeks offline with thousands of photos stored locally.",
          "Large touch targets, high-contrast mode and minimal typing.",
          "Battery-friendly GPS tracking with configurable sampling.",
        ],
      },
      {
        heading: "Approach & outcome",
        body: "A progressive web app with an append-only local log and resumable, chunked uploads made sync predictable. Offline map tiles were pre-packaged per expedition. Over three seasons the team logged 86,000 observations without a single data-loss incident.",
        bullets: [
          "Append-only operation log with idempotent server ingestion.",
          "Resumable chunked photo uploads that survive app restarts.",
          "Pre-packaged offline map tiles per expedition region.",
        ],
      },
    ],
    highlights: [
      "Weeks-long offline operation with zero data loss",
      "Resumable uploads and an idempotent sync protocol",
      "Accessible, glove-friendly field UI",
    ],
  },
];

/* ------------------------------------------------------------------ helpers */

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Featured projects, newest first. */
export function getFeaturedProjects(limit?: number): Project[] {
  const featured = projects.filter((p) => p.featured).sort((a, b) => b.year - a.year);
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}

/** Every tag used across projects, ordered by frequency then alphabetically. */
export function getAllProjectTags(): string[] {
  const counts = new Map<string, number>();
  for (const project of projects) {
    for (const tag of project.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
}

/** Projects similar to the given one, scored by shared tags, stack and category. */
export function getRelatedProjects(slug: string, limit = 3): Project[] {
  const current = getProject(slug);
  if (!current) return [];
  const tags = new Set(current.tags);
  const stack = new Set(current.stack);
  return projects
    .filter((p) => p.slug !== slug)
    .map((p) => {
      let score = 0;
      if (p.category === current.category) score += 3;
      for (const tag of p.tags) if (tags.has(tag)) score += 2;
      for (const tech of p.stack) if (stack.has(tech)) score += 1;
      return { project: p, score };
    })
    .sort((a, b) => b.score - a.score || b.project.year - a.project.year)
    .slice(0, limit)
    .map(({ project }) => project);
}

/** Previous (newer) and next (older) project in list order. */
export function getAdjacentProjects(slug: string): { prev?: Project; next?: Project } {
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return {};
  return {
    prev: index > 0 ? projects[index - 1] : undefined,
    next: index < projects.length - 1 ? projects[index + 1] : undefined,
  };
}

/** Number of projects per category (only categories that are in use). */
export function getProjectCategoryCounts(): Partial<Record<ProjectCategory, number>> {
  const counts: Partial<Record<ProjectCategory, number>> = {};
  for (const project of projects) counts[project.category] = (counts[project.category] ?? 0) + 1;
  return counts;
}
