import type { Post } from "@/types";

/**
 * Additional blog posts. Same shape and markdown subset as `@/data/posts`
 * (headings, paragraphs, lists, quotes, code fences, **bold**, *italic*,
 * `code` and [links](url)).
 *
 * Backticks inside template literals are escaped as \` and template
 * placeholders inside code samples as \${ so they stay literal text.
 */
export const extraPosts: Post[] = [
  /* ------------------------------------------------------------------ 1 */
  {
    slug: "nextjs-caching-layers-explained",
    title: "The Four Caches of the Next.js App Router, Explained",
    excerpt:
      "Request memoization, the Data Cache, the Full Route Cache and the Router Cache each solve a different problem. Knowing which one is serving stale data is most of the battle.",
    date: "2026-08-27",
    tags: ["Next.js", "Performance", "Architecture"],
    featured: true,
    content: `
"Why is my page showing old data?" is the most common App Router question I get, and the answer is almost always "because one of four caches did exactly what it was designed to do." The caches aren't magic. They're layered, each has a clear scope, and each has a clear way to opt out or invalidate. Once you can name the layer, the fix is usually one line.

This post describes the model as it works in Next.js 15. Defaults changed meaningfully between 14 and 15, so if you're reading older advice, check the version.

## Layer 1: Request memoization

**Scope:** a single server render. **Lifetime:** until that render finishes.

During one request, React deduplicates identical \`fetch\` GET calls. If your layout, your page and three components all call \`getUser()\` which fetches the same URL, only one network request goes out. This is what makes "fetch where you render" practical — you don't need to hoist data to the top of the tree just to avoid duplicate calls.

Memoization only applies to \`fetch\`. For a database client or SDK, wrap the function with React's \`cache\`:

\`\`\`ts
import { cache } from "react";
import { db } from "@/lib/db";

export const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } });
});
\`\`\`

You never need to invalidate this layer. It's thrown away when the response is done.

## Layer 2: The Data Cache

**Scope:** the server, across requests and users. **Lifetime:** until revalidated — it survives deployments on most hosts.

This is the persistent store for fetch results. In Next.js 15, **fetch is not cached by default**. You opt in per request:

\`\`\`ts
// Cache indefinitely until explicitly invalidated
await fetch("https://api.example.com/products", { cache: "force-cache" });

// Cache, but treat as stale after 5 minutes
await fetch("https://api.example.com/rates", { next: { revalidate: 300 } });

// Tag it so a mutation can invalidate it precisely
await fetch("https://api.example.com/posts", { next: { tags: ["posts"] } });
\`\`\`

Time-based revalidation is *stale-while-revalidate*: the first request after the window expires still gets the old value, and triggers a background refresh for the next visitor. If that's unacceptable for a piece of data, don't cache it on a timer — invalidate it on write instead.

For non-fetch data sources, \`unstable_cache\` wraps a function with the same semantics:

\`\`\`ts
import { unstable_cache } from "next/cache";

export const getProducts = unstable_cache(
  async () => db.product.findMany({ where: { published: true } }),
  ["products"],
  { tags: ["products"], revalidate: 3600 },
);
\`\`\`

## Layer 3: The Full Route Cache

**Scope:** the server. **Lifetime:** until the route is revalidated or redeployed.

When a route has no dynamic inputs, Next.js renders it once at build time and stores the result — both the HTML and the RSC payload. Every visitor gets the stored copy. This is *static rendering*, and it's the fastest thing the framework can do.

A route becomes dynamic, and skips this cache, when it uses a request-time API:

- \`cookies()\` or \`headers()\`
- \`searchParams\` in a page
- \`connection()\`, or a fetch with \`cache: "no-store"\`
- \`export const dynamic = "force-dynamic"\`

The build output tells you which routes ended up static and which are dynamic. Read it after every significant change; one stray \`cookies()\` call in a shared layout can make every page beneath it dynamic.

> If you only remember one thing: a route is static unless something forces it to be dynamic, and the build log tells you what did.

## Layer 4: The Router Cache

**Scope:** the browser, per tab. **Lifetime:** the session, subject to stale times.

The client keeps RSC payloads for routes the user has visited or that \`<Link>\` has prefetched, so back/forward navigation and repeat visits are instant. In Next.js 15 the default stale time for page segments is zero, which means navigating to a page re-fetches it; layouts and loading states are still reused.

This is the layer behind "I called the mutation, but the list on the previous page is stale when I go back." The fix is to invalidate from the mutation itself.

## Invalidation: one call per layer

Server Actions and Route Handlers can invalidate the server-side caches, and doing so from a Server Action also refreshes the Router Cache for the current user:

\`\`\`ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function publishPost(id: string) {
  await db.post.update({ where: { id }, data: { published: true } });

  revalidateTag("posts"); // every fetch/unstable_cache entry tagged "posts"
  revalidatePath("/blog"); // the rendered /blog route
}
\`\`\`

Prefer tags. A tag describes *the data* that changed, and every route that used that data is refreshed — including routes you forgot existed. Paths describe *the pages*, and you have to remember all of them.

For a purely client-side refresh — say, a polling dashboard — \`router.refresh()\` re-requests the current route from the server without losing client state.

## A debugging checklist

When something is stale, walk the layers from the outside in:

1. **Hard reload the page.** If the data is now correct, it was the Router Cache. Add invalidation to the mutation.
2. **Check the build output.** If the route is marked static, it was the Full Route Cache. Either add revalidation or make the route dynamic.
3. **Check the fetch options.** A \`force-cache\` or long \`revalidate\` in a shared helper is the usual culprit for the Data Cache.
4. **Log inside the data function.** If it doesn't run on every request, something above it is caching.

## Where this is heading

Newer Next.js versions move toward an explicit \`"use cache"\` directive, where nothing is cached unless you say so and caching is declared at the function or component level. The vocabulary changes, but the layers don't: there will always be a per-request memo, a persistent data store, a stored render and a client-side copy. Learn to name them, and caching stops being a mystery and becomes a set of decisions.
`,
  },

  /* ------------------------------------------------------------------ 2 */
  {
    slug: "css-container-queries-in-practice",
    title: "Container Queries in Practice: Components That Fit Anywhere",
    excerpt:
      "Media queries ask how big the screen is. Container queries ask how much room the component actually has — which is the question you wanted to ask all along.",
    date: "2026-07-09",
    tags: ["CSS", "UI", "Design Systems"],
    content: `
Here's a bug every design system eventually ships. A product card looks great in the three-column grid on the homepage. Someone drops the same card into a narrow sidebar, and on a wide desktop screen it renders its "desktop" layout — image beside text — inside a 280px column. Everything is crushed.

The card wasn't wrong. It was asking the wrong question. Media queries ask about the **viewport**; the card needed to know about **its own available space**. That's exactly what container queries answer, and they've been supported in every major browser since early 2023.

## The two-step setup

Container queries need two things: an element that declares itself a container, and rules that query it.

\`\`\`css
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

.card {
  display: grid;
  gap: 1rem;
}

@container card (min-width: 28rem) {
  .card {
    grid-template-columns: 10rem 1fr;
  }
}
\`\`\`

The shorthand \`container: card / inline-size\` does both declarations in one line. The name is optional — an unnamed \`@container\` query matches the nearest ancestor container — but naming them prevents surprises when containers nest.

## Why you query the parent, not the element

A container cannot query its own size. If it could, a rule that changed its width based on its width would loop forever. So the pattern is always: **the wrapper is the container, the children respond to it.**

In practice I give every reusable component an outer element that does nothing but establish containment, and put all the layout on an inner element. It's one extra \`div\`, and it makes the component portable to any slot in any layout.

## What \`inline-size\` actually means

\`container-type: inline-size\` applies *size containment* on the inline axis (width, in horizontal writing modes). The container's width no longer depends on its contents — which is what makes querying it safe.

That has one consequence that bites everyone once: a container in a context that sizes to content will collapse. A container that is a flex item with no explicit basis, an inline-block, or an absolutely positioned element with no width will shrink toward zero, because its children are no longer allowed to push it wider.

The fixes are straightforward:

- Give the container a width from its parent: a grid track, \`flex: 1\`, or \`width: 100%\`.
- Use \`container-type: size\` only when the container also has a definite height. Most of the time you want \`inline-size\`.

## Container query units

Inside a container, you get units relative to its size. \`cqi\` is 1% of the container's inline size, \`cqb\` 1% of its block size, plus \`cqw\`, \`cqh\`, \`cqmin\` and \`cqmax\`.

They're excellent for fluid typography that scales with the component rather than the screen:

\`\`\`css
.card__title {
  font-size: clamp(1rem, 0.75rem + 2.5cqi, 1.5rem);
}
\`\`\`

The \`clamp()\` keeps the size within sensible bounds; the \`cqi\` term makes it grow smoothly as the card gets wider. Always mix in a \`rem\` term so the text still responds to the user's font-size preference — pure container units ignore it.

## Media queries still have a job

Container queries don't replace media queries; they split the work:

- **Media queries** for page-level layout: how many columns the grid has, whether the sidebar is visible, navigation patterns.
- **Container queries** for component-level layout: how a card, a table row or a form arranges its own pieces.
- **User preference queries** like \`prefers-reduced-motion\` and \`prefers-color-scheme\` stay media queries, because they're about the user, not about space.

> Layout decides how much room each component gets. The component decides what to do with that room.

## Style queries

Container queries can also match custom property values on the container:

\`\`\`css
.card-wrapper {
  --variant: compact;
}

@container style(--variant: compact) {
  .card__meta {
    display: none;
  }
}
\`\`\`

This is a neat way to pass a "variant" down without adding classes to every child. Support for style queries is newer and less uniform than size queries, so treat it as a progressive enhancement and check current browser support before relying on it for anything essential.

## Using them with Tailwind

Tailwind CSS v4 ships container queries in the core. Mark the wrapper with \`@container\` and prefix utilities with a container breakpoint:

\`\`\`html
<div class="@container">
  <article class="grid gap-4 @md:grid-cols-[10rem_1fr]">
    <img class="aspect-video w-full rounded-lg object-cover @md:aspect-square" src="..." alt="" />
    <div>...</div>
  </article>
</div>
\`\`\`

Named containers work too: \`@container/card\` on the wrapper and \`@md/card:grid-cols-2\` on the child.

## A migration approach

You don't need to rewrite your CSS. Start with the components that appear in more than one layout context — cards, media objects, stat tiles, form rows — and convert their internal breakpoints from \`@media\` to \`@container\`. Leave page layout alone.

The test is simple: drop the component into the narrowest and widest slots it'll ever occupy, at a single viewport width. If it looks right in both, it's done. That's the promise of container queries — components that are correct by construction, wherever they're placed.
`,
  },

  /* ------------------------------------------------------------------ 3 */
  {
    slug: "git-commits-that-tell-a-story",
    title: "Git Commits That Tell a Story",
    excerpt:
      "Your commit history is documentation that never goes out of date. A few habits — atomic commits, honest messages, and a tidy branch before merge — make it worth reading.",
    date: "2026-05-14",
    tags: ["Git", "Tooling", "Writing"],
    content: `
Six months from now, someone will run \`git blame\` on a confusing line of your code. Maybe it's a teammate, maybe it's you. What they find there is either a message that explains why the line exists, or "fix stuff." One of those saves an afternoon.

Commit history is the only documentation that is guaranteed to be attached to the exact code it describes. It's worth a little care.

## One logical change per commit

An **atomic commit** contains one coherent change: it builds, its tests pass, and it can be described in one sentence without the word "and." Renaming a function across the codebase is one commit. Fixing a bug is another. Reformatting a file is a third.

Atomic commits pay off in three ways:

- **Review** gets easier, because each commit can be read on its own.
- **\`git revert\`** can undo one change without dragging unrelated work out with it.
- **\`git bisect\`** can pinpoint the commit that introduced a bug — and the answer is useful only if that commit is small.

The tool that makes this practical is interactive staging. You rarely write code in neat, separable chunks, but you can stage it that way:

\`\`\`bash
# Review each hunk and choose what goes into this commit
git add -p

# See exactly what you're about to commit
git diff --staged
\`\`\`

## The anatomy of a good message

The long-standing conventions exist because tools depend on them:

1. A **subject line** of about 50 characters, in the imperative mood: "Add rate limiting to login endpoint", not "Added" or "Adds."
2. A **blank line**.
3. A **body**, wrapped at about 72 characters, explaining *why* the change was made and anything surprising about *how*.

The imperative mood reads naturally if you complete the sentence "If applied, this commit will..." It also matches the messages Git itself generates, like "Merge branch" and "Revert".

\`\`\`text
Retry webhook delivery with exponential backoff

Partners reported missed order events during their deploys, when
their endpoint returns 503 for 30-60 seconds. We previously gave up
after a single failure.

Deliveries are now retried up to 6 times with jittered exponential
backoff (max ~5 minutes total). After the final attempt the event is
moved to the dead-letter table and surfaced in the admin dashboard.

Refs: OPS-1182
\`\`\`

Notice what the body contains: the problem, the observed behavior that motivated the change, the decision, and its limits. The diff already says *what* changed line by line. The message is for everything the diff can't say.

> The diff shows what. The message explains why. Nothing else in the repository will.

## Conventional Commits, if you want them

Many teams adopt the [Conventional Commits](https://www.conventionalcommits.org/) format: a type prefix like \`feat:\`, \`fix:\`, \`refactor:\` or \`docs:\`, an optional scope, and the subject.

\`\`\`text
feat(auth): add passkey sign-in
fix(cart): prevent negative quantities on rapid clicks
refactor(api): extract pagination helper
\`\`\`

The structure enables generated changelogs and automatic semantic versioning. It doesn't replace a good body — \`fix: bug\` is still a bad message with a prefix on it.

## Clean up before you merge

Your working history and your published history don't have to be the same. While working, commit as often as you like: "wip", "try again", "actually fix it." Before the branch is merged, tidy it into the story a reviewer wants to read.

Fixup commits make this painless. When you notice a mistake in an earlier commit on your branch, commit the correction as a fixup targeted at it:

\`\`\`bash
# Find the commit you want to amend
git log --oneline main..HEAD

# Record the correction as a fixup of that commit
git commit --fixup=3f2a91c

# Later, fold every fixup into its target automatically
git rebase -i --autosquash main
\`\`\`

Setting \`git config --global rebase.autoSquash true\` makes \`--autosquash\` the default.

One rule keeps this safe: **only rewrite history that nobody else has built on.** Rebasing your own feature branch before merge is fine. Rewriting \`main\` is not.

## Squash or merge?

Squash merging turns a whole pull request into one commit on \`main\`. It's a reasonable default when branches are small and their internal history is messy. It's the wrong choice when a branch contains several genuinely separate commits — a refactor followed by the feature that needed it — because squashing destroys the boundary that \`bisect\` and \`revert\` rely on.

My rule of thumb: if the branch history is clean and each commit stands alone, keep it. If it isn't, squash it, and make sure the squashed message is written as carefully as any other.

## Make history searchable

A few commands that turn good history into answers:

\`\`\`bash
# Which commits mention a ticket or keyword?
git log --oneline --grep="OPS-1182"

# When was this string added or removed?
git log -S "MAX_RETRIES" --oneline

# Who last changed each line, ignoring whitespace-only commits
git blame -w src/lib/webhooks.ts
\`\`\`

Add mass-reformatting commits to a \`.git-blame-ignore-revs\` file so that \`blame\` skips them; GitHub honors that file automatically.

## The habit, not the rules

None of this is about following a style guide perfectly. It's about a small habit: before you commit, ask what the person reading this in a year will need to know. Write that down. Your future self will thank you during the next incident — usually at the exact moment they're running \`git blame\`.
`,
  },

  /* ------------------------------------------------------------------ 4 */
  {
    slug: "debounce-vs-throttle",
    title: "Debounce vs. Throttle: Choosing the Right Rate Limiter",
    excerpt:
      "Both functions tame noisy events, but they answer different questions. Debounce waits for quiet; throttle keeps a steady beat. Here's how to tell which one you need — and how to write both.",
    date: "2026-03-26",
    tags: ["JavaScript", "Performance", "React"],
    content: `
Browsers fire some events relentlessly. A user typing fires \`input\` on every keystroke. Scrolling fires \`scroll\` dozens of times per second. Resizing a window fires \`resize\` continuously while the edge is dragged. If each event triggers a network request or an expensive layout calculation, the page stutters and your API gets hammered.

Debounce and throttle both limit how often a function runs. They're often mentioned together, but they behave very differently.

## Debounce: wait for quiet

A **debounced** function runs only after events have *stopped* arriving for a given delay. Every new event resets the timer.

Think of an elevator door: it closes only after people stop walking through it for a few seconds.

Use debounce when you care about the **final value**:

- search-as-you-type, where you only want to query for what the user settled on
- validating a field after the user pauses typing
- saving a draft after editing stops
- recalculating layout after a resize finishes

\`\`\`ts
export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };

  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}
\`\`\`

The \`cancel\` method matters more than it looks. If a component unmounts while a call is pending, you want to drop it rather than run it against a component that no longer exists.

## Throttle: keep a steady beat

A **throttled** function runs at most once per interval, no matter how many events arrive. Events in between are dropped (or the last one is saved for the end of the interval).

Think of a metronome: it ticks at a fixed rate regardless of how fast you tap.

Use throttle when you need **regular updates during** continuous activity:

- updating a scroll progress indicator
- tracking pointer position for a drag interaction
- sending analytics for continuous events like video playback position
- rate-limiting a "load more" trigger

\`\`\`ts
export function throttle<A extends unknown[]>(fn: (...args: A) => void, interval: number) {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: A | undefined;

  const run = (args: A) => {
    last = Date.now();
    pending = undefined;
    fn(...args);
  };

  const throttled = (...args: A) => {
    const remaining = interval - (Date.now() - last);
    if (remaining <= 0) {
      clearTimeout(timer);
      timer = undefined;
      run(args);
    } else {
      // Remember the latest call and run it when the interval ends (trailing edge)
      pending = args;
      timer ??= setTimeout(() => {
        timer = undefined;
        if (pending) run(pending);
      }, remaining);
    }
  };

  throttled.cancel = () => {
    clearTimeout(timer);
    timer = undefined;
    pending = undefined;
  };
  return throttled;
}
\`\`\`

The trailing call is the detail people forget. Without it, a throttled scroll handler can miss the final position, leaving your progress bar stuck at 97%.

## The quick decision

Ask one question: **do I need intermediate values, or only the last one?**

- Only the last one: **debounce**.
- A steady stream while it's happening: **throttle**.

> Debounce answers "what did they end up with?" Throttle answers "what's happening right now?"

## Leading versus trailing edges

Both techniques can fire on the **leading** edge (immediately on the first event) or the **trailing** edge (after the delay). Leading-edge debounce is useful for buttons: the first click submits immediately, and repeated clicks within the window are ignored. That's an easy way to stop double submissions — though disabling the button while the request is in flight is clearer for the user.

## In React, stabilize the function

A debounced function holds its timer in a closure. If you create it inside a component body, every render creates a new one with a fresh timer, and nothing is ever debounced. Debouncing the *value* is usually the cleaner approach:

\`\`\`tsx
import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const results = useSearch(debouncedQuery); // only refetches when typing pauses

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
\`\`\`

The input stays perfectly responsive because \`query\` updates on every keystroke; only the expensive work waits. The effect cleanup doubles as cancellation on unmount.

If you're debouncing to keep rendering responsive rather than to save network requests, also look at React's \`useDeferredValue\`. It doesn't use a fixed delay; it lets React render the urgent update first and the expensive one when there's time.

## Sometimes neither is right

Rate limiting is a workaround for listening to events you don't actually need. Before reaching for throttle, check whether the platform has a better primitive:

- **\`requestAnimationFrame\`** for visual updates. Throttling to the display's frame rate is exactly what you want for animations, and the browser pauses it in background tabs.
- **IntersectionObserver** for "is this element visible?" instead of computing positions on every scroll event.
- **ResizeObserver** for element size changes instead of listening to window \`resize\`.
- **CSS** for anything purely presentational. Scroll-driven animations and container queries remove whole categories of JavaScript listeners.

## Don't forget the network

Debouncing a search input reduces requests but doesn't make them arrive in order. If the user types "rea", pauses, then types "react", the response for "rea" might land last and overwrite the correct results. Pair debouncing with request cancellation — an \`AbortController\` per query — or ignore responses for anything other than the latest query.

Rate limiters are small functions with outsized effects. Pick the one that matches the question you're asking, cancel on cleanup, and you'll rarely need to think about them again.
`,
  },

  /* ------------------------------------------------------------------ 5 */
  {
    slug: "testing-custom-react-hooks",
    title: "Testing Custom React Hooks Without Testing Implementation Details",
    excerpt:
      "renderHook, fake timers, providers and async updates: a practical guide to testing hooks through their public contract so refactors don't break your suite.",
    date: "2026-01-20",
    tags: ["Testing", "React", "TypeScript"],
    content: `
Custom hooks are where a lot of a React app's real logic lives: data fetching, form state, subscriptions, timers. They deserve tests. But hooks are functions that can only run inside a component, so testing them directly takes a little setup — and it's easy to end up asserting on internals rather than behavior.

The examples here use Vitest and React Testing Library, but the ideas carry over to Jest unchanged.

## First, ask whether to test the hook at all

If a hook is used by exactly one component, test the component. Rendering the real UI and interacting with it covers the hook *and* how it's wired up, and the test survives if you later inline the hook or split it in two.

Test a hook directly when:

- it's shared across several components, so it has its own contract
- it has many edge cases that would be tedious to reach through UI
- it's part of a library or design system with no single owning component

## The basic shape: renderHook

\`renderHook\` from \`@testing-library/react\` mounts a tiny test component that calls your hook and exposes its latest return value on \`result.current\`.

\`\`\`ts
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCounter } from "./use-counter";

describe("useCounter", () => {
  it("starts at the initial value and increments", () => {
    const { result } = renderHook(() => useCounter(5));

    expect(result.current.count).toBe(5);

    act(() => result.current.increment());

    expect(result.current.count).toBe(6);
  });
});
\`\`\`

Two details matter:

1. **Read \`result.current\` after acting**, never destructure it up front. \`const { count } = result.current\` captures a stale snapshot.
2. **Wrap state updates in \`act\`**, so React applies them and flushes effects before your assertion runs.

## Changing props with rerender

Hooks often respond to changing arguments. Pass them through \`initialProps\` and change them with \`rerender\`:

\`\`\`ts
it("resets when the key changes", () => {
  const { result, rerender } = renderHook(({ key }) => useDraft(key), {
    initialProps: { key: "post-1" },
  });

  act(() => result.current.setText("Hello"));
  expect(result.current.text).toBe("Hello");

  rerender({ key: "post-2" });
  expect(result.current.text).toBe("");
});
\`\`\`

This is the hook equivalent of a parent component re-rendering with new props, and it's how you catch stale-closure and missing-dependency bugs.

## Hooks that need context

If a hook reads from context — a theme, a query client, a router — supply providers with the \`wrapper\` option:

\`\`\`tsx
import type { ReactNode } from "react";

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

const { result } = renderHook(() => useProject("p1"), { wrapper: createWrapper() });
\`\`\`

Create a fresh client per test. A shared one leaks cached data between tests and produces the worst kind of flakiness: tests that pass alone and fail together. Turning off retries keeps error-path tests from waiting through backoff delays.

## Async hooks: wait for outcomes

For hooks that fetch, assert on the eventual state with \`waitFor\`, which retries an assertion until it passes or times out:

\`\`\`ts
import { waitFor } from "@testing-library/react";

it("loads the project", async () => {
  const { result } = renderHook(() => useProject("p1"), { wrapper: createWrapper() });

  expect(result.current.status).toBe("pending");

  await waitFor(() => expect(result.current.status).toBe("success"));
  expect(result.current.data?.name).toBe("Atlas");
});
\`\`\`

Mock the network rather than the hook's dependencies. Intercepting HTTP with a tool like MSW keeps your real fetch wrapper, error handling and parsing under test; mocking the API module tests only that you called it.

> If your test mocks the thing the hook does, the test can't fail for the reasons the hook can.

## Timers: take control of the clock

Hooks built on \`setTimeout\` or \`setInterval\` — debouncing, polling, toasts that auto-dismiss — become fast and deterministic with fake timers:

\`\`\`ts
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useDebouncedValue } from "./use-debounced-value";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it("only updates after the delay", () => {
  const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
    initialProps: { value: "a" },
  });

  rerender({ value: "ab" });
  act(() => vi.advanceTimersByTime(299));
  expect(result.current).toBe("a");

  act(() => vi.advanceTimersByTime(1));
  expect(result.current).toBe("ab");
});
\`\`\`

Advancing time inside \`act\` matters: the timer callback sets state, and React needs to process that update before you assert. Always restore real timers afterwards, or later tests that rely on real async behavior will hang.

## Don't forget cleanup

Many hook bugs only appear on unmount: listeners that aren't removed, intervals that keep firing, requests that resolve into an unmounted component. \`renderHook\` returns \`unmount\`, so test it:

\`\`\`ts
it("removes its listener on unmount", () => {
  const remove = vi.spyOn(window, "removeEventListener");
  const { unmount } = renderHook(() => useWindowSize());

  unmount();

  expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
});
\`\`\`

This is one of the few places where spying on a call is reasonable: the observable behavior *is* that the listener goes away, and there's no UI to assert on.

## What not to assert

Avoid tests that would break under a refactor with identical behavior:

- how many times the hook rendered
- which internal \`useState\` or \`useRef\` holds a value
- that a specific internal helper was called

Test the contract: given these inputs and these events, the hook returns these values and causes these side effects. If you can swap \`useState\` for \`useReducer\` without touching a test, your suite is testing the right thing.
`,
  },
];
