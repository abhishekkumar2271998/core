import type { Post } from "@/types";
import { slugify, unique } from "@/lib/utils";

/**
 * Blog posts. Content uses the lightweight markdown subset rendered by
 * `renderMarkdown` in `@/lib/markdown` (headings, paragraphs, lists, quotes,
 * code fences, **bold**, *italic*, `code` and [links](url)).
 *
 * Backticks inside template literals are escaped as \` .
 */
const rawPosts: Post[] = [
  /* ------------------------------------------------------------------ 1 */
  {
    slug: "react-server-components-mental-model",
    title: "A Practical Mental Model for React Server Components",
    excerpt:
      "Server Components aren't SSR with extra steps. Think of your tree as two programs stitched together at the 'use client' boundary, and most of the confusion disappears.",
    date: "2026-09-18",
    tags: ["React", "Next.js", "Architecture"],
    featured: true,
    content: `
Every team I've helped adopt the App Router hits the same wall around week two. Someone adds \`useState\` to a component deep in the tree, the build explodes with an error about hooks in Server Components, and a \`"use client"\` directive gets sprinkled at the top of the page "just to make it work." A month later the whole app is a client bundle again and nobody is quite sure why the migration happened.

The fix isn't a new rule. It's a better mental model.

## Two programs, one tree

Stop thinking of Server Components as "server-side rendering, but different." Instead, picture **two separate programs** that happen to share a component tree:

- The **server program** runs once per request (or once at build time). It can read files, query databases and hold secrets. Its output is not HTML — it's a serialized description of UI.
- The **client program** runs in the browser. It can hold state, attach event listeners and respond to the user. It ships as JavaScript.

The \`"use client"\` directive is not a label on a component. It is a **door** between the two programs. Everything imported below that door gets bundled for the browser.

> A useful question for every file: "Which program does this belong to, and why?" If you can't answer, it probably belongs on the server.

## What crosses the door

Because the two programs only communicate through serialized data, the props you pass from a Server Component into a Client Component must be serializable. Strings, numbers, plain objects, arrays, Dates and even Promises are fine. Functions and class instances are not — with one exception: Server Actions, which are references the client can call back into.

\`\`\`tsx
// app/projects/page.tsx — server program
import { getProjects } from "@/lib/db";
import { ProjectFilter } from "./project-filter";

export default async function Page() {
  const projects = await getProjects(); // runs on the server only
  return <ProjectFilter projects={projects} />; // serialized across the door
}
\`\`\`

\`\`\`tsx
// app/projects/project-filter.tsx — client program
"use client";

import { useState } from "react";

export function ProjectFilter({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const visible = projects.filter((p) => p.title.includes(query));
  return (/* input + list */);
}
\`\`\`

The page fetched data with zero client JavaScript. The filter shipped only the code it needs to be interactive. That's the whole trick.

## Push the door down, not up

The most common mistake is putting the door too high. When a layout or page becomes a Client Component, *everything it imports* comes along for the ride — markdown parsers, date libraries, icon sets.

Instead, push interactivity to the leaves:

1. Keep pages and layouts as Server Components by default.
2. When you need state, extract the smallest interactive piece into its own file.
3. Pass server-rendered content into it as \`children\` rather than importing it.

That third point is the one people miss. A Client Component can *render* Server Components if they arrive as props:

\`\`\`tsx
// A client-side accordion wrapping server-rendered content
<Accordion title="Changelog">
  <Changelog /> {/* still a Server Component */}
</Accordion>
\`\`\`

The accordion owns the open/closed state; the changelog never ships its parsing code to the browser.

## Data fetching gets boring (in a good way)

With the server program in charge of data, most of the client-side fetching machinery goes away. No effect waterfalls, no loading flags for the initial render, no API route that exists purely to be called by your own frontend.

A few habits that keep this clean:

- **Fetch where you render.** Co-locate the query with the component that needs it. Request deduplication means two components asking for the same thing don't cost two round trips.
- **Start fetches in parallel.** Create promises first and \`await\` them together, or wrap slow sections in \`<Suspense>\` so they stream in later.
- **Keep secrets in server-only modules.** Importing \`server-only\` at the top of a file makes the build fail loudly if it ever crosses the door.

## When the client program should win

None of this means "avoid Client Components." Rich text editors, drag-and-drop, real-time dashboards and anything that responds to every keystroke belong on the client. The goal isn't to minimize client code at all costs — it's to make every byte you ship *earn its place*.

A rough heuristic I use in reviews:

- Does it need state, effects or browser APIs? **Client.**
- Does it only turn data into markup? **Server.**
- Does it do both? **Split it** — the server part fetches and formats, the client part handles interaction.

## The payoff

On the last migration I led, applying this model moved roughly 60% of our components back to the server. The JavaScript shipped for our marketing pages dropped by more than half, and — more importantly — the team stopped arguing about where code should live. The door gave everyone the same vocabulary.

If you remember one thing: **the server program describes, the client program responds.** Draw the door accordingly.
`,
  },

  /* ------------------------------------------------------------------ 2 */
  {
    slug: "performance-budgets-that-stick",
    title: "Performance Budgets That Actually Stick",
    excerpt:
      "Most performance budgets die in a Notion doc. Here's how to pick numbers that matter, enforce them in CI, and keep the team on your side.",
    date: "2026-06-02",
    updated: "2026-08-14",
    tags: ["Performance", "Web Vitals", "Tooling"],
    featured: true,
    content: `
Every web team I've worked with agrees performance matters. Far fewer can tell you, today, whether their app is getting faster or slower. The difference between those two groups is almost always a **budget that is enforced by a machine** rather than remembered by a person.

## Why budgets fail

Budgets usually fail for one of three reasons:

- **The numbers are arbitrary.** "Keep JS under 200 KB" means nothing if nobody knows where 200 came from.
- **They're checked manually.** A quarterly Lighthouse run finds regressions months after the commit that caused them.
- **They block without explaining.** A red CI check that says "budget exceeded" with no diff gets overridden by the third frustrated engineer.

A budget that sticks fixes all three: it's grounded in user experience, it runs on every pull request, and it tells you exactly what changed.

## Start from user-facing metrics

Begin with the metrics users actually feel. Google's Core Web Vitals are a reasonable default:

- **LCP** (Largest Contentful Paint) — when the main content appears. Target: under 2.5s at the 75th percentile.
- **INP** (Interaction to Next Paint) — how quickly the page responds to input. Target: under 200ms.
- **CLS** (Cumulative Layout Shift) — how much the page jumps around. Target: under 0.1.

These are **outcome metrics**. They're what you report to stakeholders, but they're noisy in CI and hard to attribute to a single commit. So you pair them with **input metrics** you can measure deterministically.

## Pick input metrics you control

Input metrics are the levers that drive the outcomes. The useful ones are boring and countable:

1. JavaScript transferred per route (compressed)
2. CSS transferred per route
3. Number of render-blocking requests
4. Largest image bytes above the fold
5. Third-party script count

To set the numbers, measure your current state, then work backwards from the outcome you want. If your LCP on a mid-range Android device is 3.4s and profiling shows 1.1s of it is parsing and executing JavaScript, you have a concrete argument for a JS budget — and a way to explain it to the next person who asks.

> A budget is a decision you make once so that you don't have to re-argue it in every code review.

## Enforce it in CI

The budget has to run on every pull request, and it has to be fast. A minimal setup measures build output and fails if a route grows past its limit:

\`\`\`ts
// scripts/check-budgets.ts
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const budgets: Record<string, number> = {
  "/": 120_000,
  "/blog/[slug]": 90_000,
  "/dashboard": 220_000,
};

const manifest = JSON.parse(readFileSync(".next/route-sizes.json", "utf8"));
let failed = false;

for (const [route, limit] of Object.entries(budgets)) {
  const files: string[] = manifest[route] ?? [];
  const bytes = files.reduce((sum, f) => sum + gzipSync(readFileSync(f)).length, 0);
  const status = bytes > limit ? "FAIL" : "ok";
  if (bytes > limit) failed = true;
  console.log(status, route, (bytes / 1000).toFixed(1) + " kB /", limit / 1000 + " kB");
}

process.exit(failed ? 1 : 0);
\`\`\`

Pair this with a synthetic Lighthouse run against a preview deployment for the outcome metrics, but treat that check as a **warning**, not a gate. Lab LCP fluctuates enough that blocking on it trains people to hit "re-run" until it passes.

## Make the failure useful

The single biggest improvement you can make is a good failure message. When the check fails, post a comment on the pull request with:

- which route grew, and by how much
- which modules were added to that route's bundle
- a link to the bundle analyzer output

Suddenly the conversation changes from "the perf check is flaky" to "oh, importing that date library pulled in every locale." Most regressions are accidental, and engineers fix accidents quickly when they can see them.

## Leave room for intentional growth

Budgets that never move become obstacles. Build a lightweight escape hatch:

- Allow the budget file to be changed in the same PR, but require a short justification in the description.
- Review budget increases monthly — if three features each added 10 KB, maybe it's time for a refactor rather than a fourth increase.
- Celebrate decreases. When someone shaves 30 KB off a route, lower the budget to lock in the win.

## Watch real users too

Synthetic checks catch regressions before they ship; field data tells you whether users noticed. Send Web Vitals from real sessions to your analytics, segment by device class and connection type, and review the 75th percentile weekly. The two views together close the loop: CI prevents the obvious regressions, and field data tells you where the next budget should go.

## The short version

Pick a few input metrics that drive the outcomes you care about, enforce them automatically on every pull request, explain every failure in plain language, and revisit the numbers on purpose. Do that, and performance stops being a project — it becomes a property of how your team ships.
`,
  },

  /* ------------------------------------------------------------------ 3 */
  {
    slug: "accessible-modal-dialogs",
    title: "Building Modal Dialogs That Everyone Can Use",
    excerpt:
      "Focus management, inert backgrounds, escape hatches and announcements: a checklist for modals that work with a keyboard, a screen reader, and a thumb.",
    date: "2026-02-11",
    tags: ["Accessibility", "React", "UI"],
    content: `
Modals are deceptively simple. A box appears, the background dims, and a close button sits in the corner. Then a keyboard user presses Tab and focus wanders off behind the overlay into a page they can't see. A screen reader user hears nothing at all. Someone on a phone tries to scroll the dialog and scrolls the page beneath it instead.

Here's the checklist I use for every dialog I ship.

## Start with the native element

The \`<dialog>\` element now has solid support in every modern browser, and \`showModal()\` gives you a lot for free:

- the rest of the page becomes **inert** (not focusable, not clickable, hidden from assistive tech)
- **Escape** closes the dialog and fires a \`cancel\` event
- the dialog renders in the **top layer**, so no z-index battles

\`\`\`tsx
function Dialog({ open, onClose, title, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="dialog-title">
      <h2 id="dialog-title">{title}</h2>
      {children}
    </dialog>
  );
}
\`\`\`

If you can use the native element, use it. The rest of this checklist still applies, but you'll be fixing edge cases rather than rebuilding fundamentals.

## Focus: where it goes in, where it comes out

Focus management is the part most custom modals get wrong.

1. **On open**, move focus into the dialog. Usually the first interactive element; for destructive confirmations, prefer the *least* destructive action ("Cancel", not "Delete").
2. **While open**, keep focus inside. Native \`showModal()\` handles this; a custom implementation needs a focus trap that wraps Tab and Shift+Tab.
3. **On close**, return focus to the element that opened the dialog. Without this, keyboard users get dumped at the top of the document and have to tab all the way back.

\`\`\`ts
const trigger = document.activeElement as HTMLElement | null;
openDialog();
// ...later, when it closes
trigger?.focus();
\`\`\`

> If you test only one thing, test this: open the dialog with the keyboard, close it with Escape, and check that focus lands exactly where you started.

## Name it and describe it

Screen readers announce a dialog using its accessible name. Give every dialog one, either via \`aria-labelledby\` pointing at the visible heading or \`aria-label\` when there's no heading. If there's an important explanatory sentence — "This will permanently delete 14 files" — link it with \`aria-describedby\` so it's read on open.

Avoid stuffing an entire form into \`aria-describedby\`. It's read as one long uninterrupted string, which is exhausting to listen to.

## Every dialog needs an obvious exit

Users should be able to dismiss a dialog in at least three ways:

- a visible close button with an accessible label (an icon alone is not enough — add \`aria-label="Close"\`)
- the **Escape** key
- clicking the backdrop, for non-critical dialogs

For dialogs where data could be lost, intercept these and confirm, but never remove them entirely. A dialog you can't escape is a trap, and WCAG treats it as one.

## Scrolling and small screens

On mobile, dialogs fight with the page for scroll. Lock the body while a dialog is open, and let the dialog itself scroll when its content is tall:

\`\`\`css
dialog {
  max-height: min(85vh, 720px);
  overflow-y: auto;
  overscroll-behavior: contain;
}

body:has(dialog[open]) {
  overflow: hidden;
}
\`\`\`

\`overscroll-behavior: contain\` stops the scroll from chaining to the page once the dialog hits its end — a small detail that makes the interaction feel solid. Also make sure the close button stays reachable: a sticky header inside long dialogs is worth the extra few lines.

## Motion, with an off switch

Fade-and-scale animations help users understand where the dialog came from. Keep them short (150–250ms) and respect \`prefers-reduced-motion\` by dropping the transform and keeping only a quick opacity change.

## Test with real tools

Automated checkers catch missing labels but not broken focus order. Before shipping, I run through:

- **Keyboard only**: open, tab through every control, close with Escape, confirm focus returns.
- **Screen reader**: VoiceOver on macOS or NVDA on Windows. Does it announce the dialog's role and name on open?
- **Zoom to 200%**: is the close button still visible without horizontal scrolling?
- **Phone**: can you scroll long content and dismiss with one thumb?

## The takeaway

An accessible modal is mostly about respect: respect for where the user's focus was, for how they navigate, and for their ability to leave. Start from the native \`<dialog>\`, manage focus deliberately on the way in and out, and always leave the door open.
`,
  },

  /* ------------------------------------------------------------------ 4 */
  {
    slug: "typescript-discriminated-unions",
    title: "Make Impossible States Impossible with Discriminated Unions",
    excerpt:
      "Boolean flags multiply into states that should never exist. Discriminated unions let the compiler rule them out — and make your components simpler in the process.",
    date: "2025-10-21",
    tags: ["TypeScript", "Patterns", "React"],
    featured: true,
    content: `
Here's a type I've seen in almost every codebase I've joined:

\`\`\`ts
interface RequestState {
  isLoading: boolean;
  isError: boolean;
  data?: User[];
  error?: string;
}
\`\`\`

It looks reasonable. But count the states it allows: two booleans and two optional fields give **sixteen combinations**, and only four of them make sense. What does it mean when \`isLoading\` and \`isError\` are both true? When \`data\` exists but so does \`error\`? Every component that reads this type has to defend against states that should never happen.

## Model the states, not the fields

A **discriminated union** describes each valid state explicitly and tags it with a literal field — the discriminant:

\`\`\`ts
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error"; error: string };
\`\`\`

Now there are exactly four states. \`data\` only exists when the request succeeded; \`error\` only exists when it failed. The compiler enforces it, and you can't construct nonsense by accident.

## Narrowing does the work

When you check the discriminant, TypeScript **narrows** the type in that branch:

\`\`\`tsx
function UserList({ state }: { state: RequestState }) {
  switch (state.status) {
    case "idle":
      return null;
    case "loading":
      return <Spinner />;
    case "error":
      return <ErrorMessage message={state.error} />;
    case "success":
      return <List users={state.data} />;
  }
}
\`\`\`

Inside the \`"success"\` case, \`state.data\` is \`User[]\` — not \`User[] | undefined\`. No optional chaining, no non-null assertions, no "this should never happen" comments.

## Exhaustiveness checking

The real payoff comes when requirements change. Say product asks for a "refreshing" state that shows stale data with a subtle indicator. Add it to the union:

\`\`\`ts
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "refreshing"; data: User[] }
  | { status: "success"; data: User[] }
  | { status: "error"; error: string };
\`\`\`

To make the compiler find every place that needs updating, add an exhaustiveness helper:

\`\`\`ts
export function assertNever(value: never): never {
  throw new Error("Unhandled case: " + JSON.stringify(value));
}

// at the end of each switch
default:
  return assertNever(state);
\`\`\`

If any switch doesn't handle \`"refreshing"\`, the value reaching \`default\` isn't \`never\`, and the build fails with a pointer to the exact line. Refactors that used to require a careful grep become a to-do list generated by the compiler.

> Types are most valuable not when you write code, but when you *change* it.

## Beyond request state

Once you start seeing this pattern, it shows up everywhere:

- **Form steps**: \`{ step: "details" } | { step: "payment"; details: Details } | { step: "done"; orderId: string }\`
- **Events and reducers**: each action type carries exactly the payload it needs.
- **API responses**: \`{ ok: true; value: T } | { ok: false; error: ApiError }\` instead of throwing.
- **Component props**: a \`Button\` that is *either* a link with \`href\` *or* a button with \`onClick\`, never both.

That last one is especially nice for design-system components:

\`\`\`ts
type ButtonProps =
  | { as: "button"; onClick: () => void }
  | { as: "link"; href: string; external?: boolean };
\`\`\`

Consumers get autocompletion that only offers valid props for the variant they chose.

## Practical tips

A few things I've learned applying this at scale:

1. **Use a string literal discriminant** named consistently — \`status\`, \`type\` or \`kind\`. Pick one per codebase.
2. **Don't destructure too early.** \`const { status, data } = state\` breaks narrowing in older TypeScript versions; keep the object intact until you've checked the tag.
3. **Validate at the boundary.** Data from the network is \`unknown\` until proven otherwise. Parse it into your union once, at the edge, with a schema library or a hand-written guard.
4. **Keep shared fields on every member** if they're truly shared, like an \`id\` or \`timestamp\`. Unions don't mean duplication everywhere — you can intersect a base type: \`Base & ({ ... } | { ... })\`.

## The mindset shift

Booleans answer yes-or-no questions. Most UI state isn't yes-or-no; it's "which of these situations are we in?" When you model it that way, your types start describing your product instead of your implementation — and a whole category of bugs simply can't be written.
`,
  },

  /* ------------------------------------------------------------------ 5 */
  {
    slug: "design-tokens-that-scale",
    title: "Design Tokens That Scale Beyond the First Theme",
    excerpt:
      "Raw hex values in components work until the day you need dark mode, a second brand, or a high-contrast theme. A three-tier token system keeps that day boring.",
    date: "2025-06-15",
    tags: ["Design Systems", "CSS", "UI"],
    content: `
The first version of most design systems is a list of colors with friendly names: \`blue-500\`, \`gray-100\`, \`brand-primary\`. Components reference them directly, everything looks consistent, and the team moves on.

Then someone asks for dark mode.

Suddenly \`gray-100\` is wrong in half the places it's used — it was a background in some components and a border in others. You can't just swap the value, because the *name* never described what it was *for*. That's the moment a token architecture starts paying for itself.

## Three tiers

The structure I keep coming back to has three layers:

1. **Primitive tokens** — the raw palette. \`indigo-600\`, \`zinc-950\`, \`space-4\`. They describe *what a value is*.
2. **Semantic tokens** — the decisions. \`color-bg\`, \`color-fg-muted\`, \`color-border\`, \`color-accent\`. They describe *what a value is for*.
3. **Component tokens** (optional) — local overrides like \`button-primary-bg\`. Use sparingly, only when a component truly needs to diverge.

Components should only ever reference semantic (or component) tokens. Primitives exist to feed the semantic layer.

\`\`\`css
:root {
  /* primitives */
  --indigo-600: 79 70 229;
  --zinc-50: 250 250 250;
  --zinc-900: 24 24 27;

  /* semantic: light theme */
  --bg: var(--zinc-50);
  --fg: var(--zinc-900);
  --accent: var(--indigo-600);
}

.dark {
  --bg: var(--zinc-900);
  --fg: var(--zinc-50);
  --accent: 129 140 248;
}
\`\`\`

Dark mode is now a remapping of semantic tokens. No component changes. A high-contrast theme or a second brand is another remapping.

## Name by role, not by appearance

The hardest part of semantic tokens is naming. A few rules that have held up:

- **Name the role**: \`surface\`, \`surface-raised\`, \`border-subtle\`, \`fg-muted\`. Never \`light-gray\`.
- **Pair foregrounds with backgrounds**: if there's an \`accent\` background, there should be an \`accent-fg\` that's guaranteed readable on it.
- **Keep the list short**. Twenty well-chosen semantic colors beat eighty. Every token is a decision someone has to make when building a component.

> If a designer and an engineer can't agree on which token to use, the problem is usually the token list, not the people.

## Store channels, not colors

A small trick with outsized benefits: store colors as space-separated RGB channels rather than full color strings. That lets you apply opacity at the point of use without defining a new token for every transparency level.

\`\`\`css
.badge {
  background: rgb(var(--accent) / 0.1);
  color: rgb(var(--accent));
}
\`\`\`

Utility frameworks like Tailwind support this directly with the \`<alpha-value>\` placeholder, so \`bg-accent/10\` just works in every theme.

## Beyond color

Color gets the attention, but the same principles apply to everything else:

- **Spacing**: a scale (\`4, 8, 12, 16, 24, 32, 48\`) plus a couple of semantic aliases like \`gutter\` and \`section-gap\`.
- **Typography**: semantic roles such as \`text-body\`, \`text-caption\`, \`text-display\` that bundle size, line height and weight.
- **Radius and elevation**: a few named steps rather than arbitrary values per component.
- **Motion**: duration and easing tokens (\`duration-fast\`, \`ease-emphasized\`) so animations feel like one product.

## One source of truth

Tokens that live in three places — a Figma library, a CSS file, and a mobile theme — drift within weeks. Pick a single source, usually a JSON file in the repo, and generate the platform outputs from it. Even a small build script that turns JSON into CSS custom properties and a TypeScript type is enough to start.

\`\`\`ts
type ColorToken = "bg" | "surface" | "fg" | "fg-muted" | "border" | "accent" | "accent-fg";

export function token(name: ColorToken, alpha = 1): string {
  return "rgb(var(--" + name + ") / " + alpha + ")";
}
\`\`\`

Typed token names catch typos at compile time and make the semantic list discoverable through autocomplete.

## Migrating an existing codebase

You rarely get to start fresh. A migration that has worked for me:

1. Introduce semantic tokens that map to today's values exactly — no visual changes.
2. Add a lint rule that flags raw hex values and primitive tokens in component code.
3. Migrate components file by file, fixing the lint warnings.
4. Only once usage is clean, introduce the second theme.

The visual diff for steps one through three should be zero. That's the point: the architecture changes first, the appearance changes later.

## The payoff

A good token system makes theming boring. Dark mode becomes a dozen lines of CSS. A rebrand becomes a palette swap. And new components look right by default, because the right decision is the easiest one to type.
`,
  },

  /* ------------------------------------------------------------------ 6 */
  {
    slug: "postgres-indexing-for-app-developers",
    title: "Postgres Indexing for Application Developers",
    excerpt:
      "You don't need to be a DBA to fix slow queries. Learn to read EXPLAIN, choose the right index type, and avoid the mistakes that make indexes useless.",
    date: "2025-02-27",
    tags: ["Postgres", "Databases", "Performance"],
    content: `
Most slow endpoints I've debugged weren't slow because of the framework, the ORM or the network. They were slow because a query scanned two million rows to return twenty. The fix was usually one well-chosen index — and knowing how to confirm it worked.

This is the guide I wish I'd had as an application developer.

## Read the plan first

Never add an index on a hunch. Ask Postgres what it's actually doing:

\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, title, created_at
FROM posts
WHERE author_id = 42
ORDER BY created_at DESC
LIMIT 20;
\`\`\`

Look for three things in the output:

- **Seq Scan** on a large table: Postgres read every row. Often (not always) a sign of a missing index.
- **Rows Removed by Filter**: a large number means you read many rows only to discard them.
- **Sort** with a big memory or disk figure: the database had to sort results that an index could have delivered pre-ordered.

\`ANALYZE\` actually runs the query, so the timings are real. \`BUFFERS\` shows how much data came from memory versus disk — invaluable when a query is fast locally but slow in production.

## The workhorse: B-tree indexes

The default index type, B-tree, handles equality and range comparisons: \`=\`, \`<\`, \`>\`, \`BETWEEN\`, \`IN\`, and sorting. For the query above:

\`\`\`sql
CREATE INDEX CONCURRENTLY posts_author_created_idx
  ON posts (author_id, created_at DESC);
\`\`\`

This one index does two jobs: it finds the author's posts *and* returns them already sorted, so the \`LIMIT 20\` can stop after reading twenty entries. The \`Sort\` node disappears from the plan entirely.

Always use \`CONCURRENTLY\` on production tables — without it, index creation blocks writes for the duration.

## Column order matters

A multi-column index is sorted by the first column, then by the second within each value of the first, and so on. That means:

- An index on \`(author_id, created_at)\` helps queries filtering by \`author_id\` alone, and by \`author_id\` plus \`created_at\`.
- It does **not** help a query that filters only by \`created_at\`.

The rule of thumb: put **equality** columns first, then the **range or sort** column last.

> An index is a sorted copy of some of your data. Ask yourself: "If I had this list printed out, could I find my answer by reading only a small part of it?"

## Indexes that quietly don't work

Some query shapes prevent Postgres from using an index you'd expect it to use:

1. **Functions on the column.** \`WHERE lower(email) = 'a@b.com'\` can't use an index on \`email\`. Create an expression index on \`lower(email)\` instead.
2. **Leading wildcards.** \`LIKE '%smith'\` can't use a B-tree. Consider the \`pg_trgm\` extension with a GIN index for substring search.
3. **Type mismatches.** Comparing a \`bigint\` column to a text parameter can force a cast on every row. ORMs occasionally do this silently.
4. **Low selectivity.** An index on a boolean \`is_active\` column where 95% of rows are active is rarely used — and Postgres is right to ignore it.

## Partial and covering indexes

Two features that punch well above their weight:

**Partial indexes** only include rows matching a condition. If you constantly query unprocessed jobs, index just those:

\`\`\`sql
CREATE INDEX jobs_pending_idx
  ON jobs (run_at)
  WHERE status = 'pending';
\`\`\`

The index stays tiny even as the jobs table grows to millions of completed rows.

**Covering indexes** store extra columns so a query can be answered from the index alone, without visiting the table — an *Index Only Scan*:

\`\`\`sql
CREATE INDEX orders_customer_idx
  ON orders (customer_id) INCLUDE (total, status);
\`\`\`

## Beyond B-tree

Reach for other types when the data calls for it:

- **GIN** for JSONB containment (\`@>\`), arrays, and full-text search.
- **GiST** for geometric data, ranges and nearest-neighbor queries.
- **BRIN** for huge, naturally ordered tables like append-only event logs — tiny and surprisingly effective.

## Indexes aren't free

Every index slows down writes and takes disk space and memory. Periodically check for indexes that are never used:

\`\`\`sql
SELECT relname AS table, indexrelname AS index, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
\`\`\`

Drop the ones that have stayed at zero for a few weeks (after checking that they don't back a unique constraint).

## A workflow that works

When an endpoint is slow: log the query, run \`EXPLAIN (ANALYZE, BUFFERS)\` against production-like data, form a hypothesis, add one index, and run the plan again. If the plan didn't change, the index isn't helping — drop it. Small, measured steps beat a schema full of speculative indexes every time.
`,
  },

  /* ------------------------------------------------------------------ 7 */
  {
    slug: "testing-strategy-for-confidence",
    title: "A Testing Strategy Optimized for Confidence, Not Coverage",
    excerpt:
      "Coverage percentages measure lines executed, not bugs prevented. Here's how I decide what to test, at which level, and what to skip entirely.",
    date: "2024-09-09",
    tags: ["Testing", "Architecture", "TypeScript"],
    content: `
Early in my career, I worked on a codebase with 94% test coverage that broke in production every other week. The tests were thorough — they just tested the wrong things. They asserted that functions called other functions, that components rendered specific class names, that mocks returned what we told them to return. They gave us coverage. They didn't give us confidence.

Since then, I've judged every test by one question: **if this test passes, how much more confident am I that users won't hit a bug?**

## The testing trophy

The classic testing pyramid says to write lots of unit tests, fewer integration tests and very few end-to-end tests. For modern web apps, I find a different shape more useful — often called the *testing trophy*:

- **Static analysis** at the base: TypeScript and linting catch typos, wrong argument types and unreachable code for nearly free.
- **Integration tests** as the widest layer: render real components with real children, interact like a user, and assert on what the user sees.
- **Unit tests** for pure logic with lots of edge cases: parsers, formatters, pricing rules.
- **End-to-end tests** for a handful of critical journeys: sign up, checkout, the one flow that pays the bills.

The shape matters less than the principle: **the more your tests resemble how the software is used, the more confidence they give you.**

## Test behavior, not implementation

A test coupled to implementation details breaks when you refactor, even if nothing visible changed. That trains people to update tests mechanically — which means the tests stop catching anything.

Compare these two tests for the same component:

\`\`\`tsx
// Brittle: knows about internal state and class names
expect(wrapper.state("isOpen")).toBe(true);
expect(wrapper.find(".dropdown-menu--visible")).toHaveLength(1);

// Resilient: describes what the user experiences
await user.click(screen.getByRole("button", { name: /sort by/i }));
expect(screen.getByRole("menu")).toBeVisible();
expect(screen.getByRole("menuitem", { name: /newest/i })).toBeInTheDocument();
\`\`\`

The second test survives a rewrite from class components to hooks, a CSS migration and a state-management swap. As a bonus, querying by role means the test fails if the component stops being accessible.

## What deserves a unit test

Pure functions with branching logic are where unit tests shine. Table-driven tests keep them compact:

\`\`\`ts
import { describe, expect, it } from "vitest";
import { formatPrice } from "./price";

describe("formatPrice", () => {
  it.each([
    [0, "USD", "$0.00"],
    [1999, "USD", "$19.99"],
    [100000, "EUR", "€1,000.00"],
    [-500, "USD", "-$5.00"],
  ])("formats %i %s as %s", (cents, currency, expected) => {
    expect(formatPrice(cents, currency)).toBe(expected);
  });
});
\`\`\`

Adding a new edge case is one line. When a bug report comes in, the first step is adding the failing row.

## Mock at the boundaries

Mocks are where confidence quietly leaks away. Every mock is an assumption about how something else behaves, and assumptions go stale.

My rules:

1. **Don't mock your own modules.** If component A uses hook B, test them together.
2. **Mock the network, not the client.** Intercept HTTP requests (with a tool like MSW) instead of stubbing your API wrapper. Your fetch logic, error handling and parsing all stay under test.
3. **Use real databases in integration tests** where practical. A containerized Postgres is fast enough for most suites and catches query bugs mocks never will.
4. **Fake time and randomness explicitly.** Freeze the clock in tests that depend on dates rather than hoping they run before midnight.

> A mock is a promise that two things will keep agreeing. Make as few promises as you can.

## Keep end-to-end tests few and stable

End-to-end tests give the most confidence per test and cost the most to maintain. Keep them for journeys where failure is catastrophic, and make them robust:

- Seed data through an API or fixtures, not by clicking through setup screens.
- Wait for conditions (an element appears, a request settles), never for fixed timeouts.
- Run them against preview deployments on every pull request, not just nightly.

A flaky end-to-end test is worse than none — it teaches the team to ignore red builds.

## What I deliberately don't test

- Static markup with no logic. TypeScript and a visual review cover it.
- Third-party libraries. Trust them, or replace them.
- Trivial getters, setters and pass-through functions.
- Exact snapshots of large component trees, which get rubber-stamped on every change.

## Measuring what matters

Instead of coverage, I track two signals: **escaped bugs** (how many production incidents a test should have caught) and **test maintenance cost** (how often tests change without a behavior change). When escaped bugs go down and maintenance stays flat, the strategy is working — whatever the coverage number says.
`,
  },

  /* ------------------------------------------------------------------ 8 */
  {
    slug: "writing-as-an-engineering-skill",
    title: "Writing Is the Most Underrated Engineering Skill",
    excerpt:
      "Design docs, pull request descriptions, incident reports: the engineers with the most influence aren't always the best coders. They're the clearest writers.",
    date: "2024-04-03",
    tags: ["Career", "Writing"],
    content: `
A few years ago I wrote a two-page document proposing we replace our homegrown deploy scripts with a managed platform. I'd made the same argument in meetings for months, with no progress. The document was approved in a week.

Nothing about the idea had changed. What changed was that people could read it on their own time, share it with their managers, and point at the specific paragraph they disagreed with. **Writing scales your thinking beyond the rooms you're in.**

## Why it matters more as you grow

As a junior engineer, your output is mostly code. As you become more senior, your output is increasingly *decisions* — and decisions spread through writing:

- **Design docs** align a team before anyone writes code.
- **Pull request descriptions** let reviewers understand intent, not just diffs.
- **Incident reports** turn a bad day into institutional knowledge.
- **Async updates** keep distributed teams moving without another meeting.

In remote and hybrid teams, the effect is even stronger. If your work isn't written down, it effectively didn't happen for anyone in a different time zone.

## Start with the conclusion

Engineers are trained to build up to an answer: context, then analysis, then findings. Readers want the opposite. Lead with what you want them to know or decide, then support it.

> **Bottom line up front.** If someone reads only your first paragraph, they should still know what you're asking for.

A pull request description I'd happily review looks like this:

\`\`\`markdown
# Title: Cache exchange rates for 10 minutes to cut checkout latency

## Why
Checkout calls the rates API on every page load (p95: 640ms).
Rates change at most hourly.

## What
- Adds an in-memory cache with a 10 minute TTL
- Falls back to the last known rate if the API is down

## Risk
Prices may lag real rates by up to 10 minutes. Finance approved this.
\`\`\`

A reviewer knows in fifteen seconds what changed, why, and what to look out for.

## Write for a specific reader

"The team" is not a reader. Pick a real person — the new hire who joins next quarter, the product manager who has to approve this, the on-call engineer at 3am — and write for them.

That choice answers most style questions for you:

- How much background to include
- Which jargon needs a definition
- Whether a diagram or a table would help more than prose

## Make it skimmable

Most of your readers will skim. Help them:

1. Use descriptive headings that work as a table of contents.
2. Keep paragraphs short — three or four sentences.
3. Put lists where there are lists, and tables where there's comparison.
4. **Bold** the one sentence per section that matters most.

## Cut ruthlessly

First drafts are for figuring out what you think. Second drafts are for the reader. On every revision, I look for:

- **Hedge words** — "just", "basically", "I think", "sort of". Delete them, unless the uncertainty is real.
- **Throat-clearing** — opening paragraphs that restate the title. Start where the substance starts.
- **Passive voice that hides ownership** — "mistakes were made" versus "the migration dropped a column."

A useful test: read it aloud. If you run out of breath mid-sentence, split the sentence.

## Build the habit

You don't get better at writing by reading advice about writing. You get better by shipping words regularly and paying attention to what lands. Some low-stakes ways to practice:

- Write a short weekly summary of what you learned, even if nobody asks for it.
- Turn every non-obvious bug fix into a few paragraphs in the PR description.
- Volunteer to write the incident report next time something breaks.
- Start a blog. Even if nobody reads it, *you* will — and your future self is a demanding audience.

## The compound interest of clarity

Clear writing compounds. Every well-written design doc saves hours of meetings. Every good PR description speeds up review. Every incident report prevents the next incident. Over a career, that adds up to more impact than almost any technical skill — and it's one you can start improving today, in the next message you send.

If you want a place to start, [Paul Graham's essay on writing simply](https://paulgraham.com/simply.html) is a short, excellent read.
`,
  },
];

/* ------------------------------------------------------------------ helpers */

/** All posts (content trimmed), in authoring order. Use `getSortedPosts()` for newest-first. */
export const posts: Post[] = rawPosts.map((p) => ({ ...p, content: p.content.trim() }));

const normalized = posts;

/** Find a single post by slug. */
export function getPost(slug: string): Post | undefined {
  return normalized.find((p) => p.slug === slug);
}

/** All posts, newest first. */
export function getSortedPosts(): Post[] {
  return [...normalized].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Featured posts (newest first); falls back to the latest posts if too few are flagged. */
export function getFeaturedPosts(limit = 3): Post[] {
  const sorted = getSortedPosts();
  const featured = sorted.filter((p) => p.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  const rest = sorted.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, limit);
}

/** Every distinct tag, sorted by frequency then alphabetically. */
export function getAllPostTags(): string[] {
  const counts = new Map<string, number>();
  for (const post of normalized) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return unique(normalized.flatMap((p) => p.tags)).sort(
    (a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b),
  );
}

/**
 * Neighbours in chronological order:
 * `prev` is the next-older post, `next` is the next-newer post.
 */
export function getAdjacentPosts(slug: string): { prev?: Post; next?: Post } {
  const sorted = getSortedPosts();
  const index = sorted.findIndex((p) => p.slug === slug);
  if (index === -1) return {};
  return {
    prev: sorted[index + 1],
    next: index > 0 ? sorted[index - 1] : undefined,
  };
}

/* Extra helpers (not part of the cross-agent contract). */

/** Posts carrying a tag, matched by its slug (e.g. "design-systems"). */
export function getPostsByTagSlug(tagSlug: string): { tag: string; posts: Post[] } | undefined {
  const tag = getAllPostTags().find((t) => slugify(t) === tagSlug);
  if (!tag) return undefined;
  return { tag, posts: getSortedPosts().filter((p) => p.tags.includes(tag)) };
}

/** Related posts ranked by shared tags, then recency. */
export function getRelatedPosts(slug: string, limit = 3): Post[] {
  const current = getPost(slug);
  if (!current) return [];
  return getSortedPosts()
    .filter((p) => p.slug !== slug)
    .map((p) => ({ post: p, score: p.tags.filter((t) => current.tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.post);
}

/** Number of posts per tag. */
export function getTagCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const post of normalized) {
    for (const tag of post.tags) counts[tag] = (counts[tag] ?? 0) + 1;
  }
  return counts;
}
